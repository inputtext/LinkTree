-- LinkSpace 0.1: run against a NEW, dedicated Supabase project only.
create extension if not exists pgcrypto;

create table public.profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 handle text unique check (handle is null or (handle ~ '^[a-z0-9][a-z0-9_-]{1,18}[a-z0-9]$' and lower(handle)=handle and handle not in ('api','auth','admin','dashboard','editor','analytics','settings','r','login','logout','signup','onboarding','privacy','terms','about','contact','pricing','features','faq','www','app','static','assets','help','support'))),
 display_name text not null default 'New creator' check(char_length(display_name) between 1 and 80),
 bio text not null default '' check(char_length(bio)<=300),
 avatar_url text,
 theme text not null default 'paper' check (theme in ('paper','midnight','lavender','citrus','ocean','blush')),
 draft_blocks jsonb not null default '[]'::jsonb check (jsonb_typeof(draft_blocks)='array'),
 revision integer not null default 0 check(revision>=0),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index profiles_handle_idx on public.profiles(handle) where handle is not null;

create table public.published_pages (
 owner_id uuid primary key references auth.users(id) on delete cascade,
 handle text not null unique,
 page jsonb not null check (jsonb_typeof(page)='object'),
 published_at timestamptz not null default now()
);
create index published_pages_handle_idx on public.published_pages(handle);

create table public.short_links (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 block_id uuid not null,
 slug text not null unique check (char_length(slug) between 3 and 90),
 destination text not null check (char_length(destination)<=2048),
 is_active boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(owner_id,block_id)
);
create index short_links_owner_idx on public.short_links(owner_id);

create table public.click_events (
 id bigint generated always as identity primary key,
 owner_id uuid not null references auth.users(id) on delete cascade,
 short_link_id uuid not null references public.short_links(id) on delete cascade,
 referrer_host text,
 visitor_hash text,
 clicked_at timestamptz not null default now()
);
create index click_events_owner_time_idx on public.click_events(owner_id,clicked_at desc);
create index click_events_link_time_idx on public.click_events(short_link_id,clicked_at desc);

create table public.newsletter_subscribers (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 email text not null check (char_length(email)<=254),
 created_at timestamptz not null default now(),
 unique(owner_id,email)
);
create index newsletter_subscribers_owner_idx on public.newsletter_subscribers(owner_id);

create table public.contact_messages (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 name text not null check(char_length(name)<=90),
 email text not null check(char_length(email)<=254),
 message text not null check(char_length(message)<=2000),
 created_at timestamptz not null default now()
);
create index contact_messages_owner_time_idx on public.contact_messages(owner_id,created_at desc);

create function public.set_profile_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at=now();return new;end;
$$;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_profile_updated_at();

alter table public.profiles enable row level security;
alter table public.published_pages enable row level security;
alter table public.short_links enable row level security;
alter table public.click_events enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages enable row level security;

create policy "profile owner select" on public.profiles for select to authenticated using ((select auth.uid())=user_id);
create policy "profile owner insert" on public.profiles for insert to authenticated with check ((select auth.uid())=user_id);
create policy "profile owner update" on public.profiles for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "profile owner delete" on public.profiles for delete to authenticated using ((select auth.uid())=user_id);
create policy "published pages public read" on public.published_pages for select to anon,authenticated using (true);
create policy "owner short links read" on public.short_links for select to authenticated using ((select auth.uid())=owner_id);
create policy "owner click events read" on public.click_events for select to authenticated using ((select auth.uid())=owner_id);
create policy "owner subscribers read" on public.newsletter_subscribers for select to authenticated using ((select auth.uid())=owner_id);
create policy "owner subscribers delete" on public.newsletter_subscribers for delete to authenticated using ((select auth.uid())=owner_id);
create policy "owner contact read" on public.contact_messages for select to authenticated using ((select auth.uid())=owner_id);
create policy "owner contact delete" on public.contact_messages for delete to authenticated using ((select auth.uid())=owner_id);

-- Publish/write of public data is ONLY performed by trusted server endpoints using a server-only key.
-- Public visitors cannot INSERT into click_events, subscribers or messages directly.

grant usage on schema public to anon,authenticated;
grant select,insert,update,delete on public.profiles to authenticated;
grant select on public.published_pages to anon,authenticated;
grant select on public.short_links, public.click_events, public.newsletter_subscribers, public.contact_messages to authenticated;
grant delete on public.newsletter_subscribers,public.contact_messages to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values ('avatars','avatars',true,2097152,array['image/jpeg','image/png','image/webp'])
 on conflict (id) do nothing;
create policy "avatar owner uploads" on storage.objects for insert to authenticated
 with check (bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "avatar owner edits" on storage.objects for update to authenticated
 using (bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid())::text)
 with check (bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "avatar owner deletes" on storage.objects for delete to authenticated
 using (bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "public avatar read" on storage.objects for select to anon,authenticated using (bucket_id='avatars');
