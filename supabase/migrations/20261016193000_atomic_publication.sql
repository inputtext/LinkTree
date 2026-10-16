-- LinkSpace v0.2: publish and redirect activation in one PostgreSQL transaction.
-- Apply to a dedicated LinkSpace database AFTER the initial migration.
-- Execute permissions are limited to the service_role; the API authenticates users first.

create or replace function public.publish_page_atomic(
  p_owner_id uuid,
  p_revision integer,
  p_page jsonb,
  p_redirects jsonb
)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  owner_profile public.profiles%rowtype;
  visible_blocks jsonb;
  expected_page jsonb;
  redirect_count integer;
  redirect_item jsonb;
  source_block jsonb;
  block_id text;
  expected_slug text;
begin
  select * into owner_profile from public.profiles
    where user_id = p_owner_id for update;
  if not found or owner_profile.handle is null then
    raise exception 'Profile is not ready for publishing' using errcode='22023';
  end if;
  if owner_profile.revision is distinct from p_revision then
    raise exception 'Draft has changed. Reload and publish again.' using errcode='40001';
  end if;

  select coalesce(jsonb_agg(item order by ord), '[]'::jsonb)
    into visible_blocks
    from jsonb_array_elements(owner_profile.draft_blocks) with ordinality as b(item,ord)
    where item->>'visible' = 'true';

  expected_page := jsonb_build_object(
    'display_name',owner_profile.display_name,
    'bio',owner_profile.bio,
    'avatar_url',owner_profile.avatar_url,
    'theme',owner_profile.theme,
    'blocks',visible_blocks
  );
  if p_page is distinct from expected_page then
    raise exception 'Draft has changed. Reload and publish again.' using errcode='40001';
  end if;
  if jsonb_typeof(p_redirects) is distinct from 'array' then
    raise exception 'Invalid redirect list' using errcode='22023';
  end if;

  select count(*) into redirect_count
    from jsonb_array_elements(visible_blocks) as b(item)
    where item->>'type' in ('link','booking','support','social');
  if redirect_count <> jsonb_array_length(p_redirects) then
    raise exception 'Redirect list does not match visible blocks' using errcode='22023';
  end if;
  if (select count(distinct item->>'block_id') from jsonb_array_elements(p_redirects) as r(item)) <> redirect_count then
    raise exception 'Duplicate redirect identifiers' using errcode='22023';
  end if;

  for redirect_item in select value from jsonb_array_elements(p_redirects) as r(value) loop
    block_id := redirect_item->>'block_id';
    select item into source_block
      from jsonb_array_elements(visible_blocks) as b(item)
      where item->>'id' = block_id and item->>'type' in ('link','booking','support','social');
    if not found then
      raise exception 'Redirect references a missing link block' using errcode='22023';
    end if;
    expected_slug := owner_profile.handle || '-' || left(replace(block_id,'-',''),12);
    if redirect_item->>'slug' is distinct from expected_slug
       or redirect_item->>'destination' is distinct from source_block->>'url'
       or redirect_item->>'destination' !~* '^https?://' then
      raise exception 'Redirect metadata is inconsistent' using errcode='22023';
    end if;
  end loop;

  -- Any failure rolls back both redirects and the published page.
  update public.short_links set is_active = false, updated_at = now()
    where owner_id = p_owner_id;
  insert into public.short_links(owner_id,block_id,slug,destination,is_active)
    select p_owner_id,(r.item->>'block_id')::uuid,r.item->>'slug',r.item->>'destination',true
      from jsonb_array_elements(p_redirects) as r(item)
    on conflict (owner_id,block_id) do update set
      slug=excluded.slug,destination=excluded.destination,is_active=true,updated_at=now();

  insert into public.published_pages(owner_id,handle,page,published_at)
    values(p_owner_id,owner_profile.handle,p_page,now())
    on conflict (owner_id) do update set
      handle=excluded.handle,page=excluded.page,published_at=excluded.published_at;
  return owner_profile.handle;
end;
$$;

create or replace function public.unpublish_page_atomic(p_owner_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  perform 1 from public.profiles where user_id = p_owner_id for update;
  if not found then
    raise exception 'Profile not found' using errcode='22023';
  end if;
  delete from public.published_pages where owner_id = p_owner_id;
  update public.short_links set is_active=false, updated_at=now()
    where owner_id = p_owner_id;
  return true;
end;
$$;

revoke all on function public.publish_page_atomic(uuid,integer,jsonb,jsonb) from public,anon,authenticated;
revoke all on function public.unpublish_page_atomic(uuid) from public,anon,authenticated;
grant execute on function public.publish_page_atomic(uuid,integer,jsonb,jsonb) to service_role;
grant execute on function public.unpublish_page_atomic(uuid) to service_role;
