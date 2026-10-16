// Source-level checks only; a live PostgreSQL integration test is still required.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const sql=fs.readFileSync(new URL('../supabase/migrations/20261016193000_atomic_publication.sql',import.meta.url),'utf8').toLowerCase();
const publish=fs.readFileSync(new URL('../src/app/api/publish/route.ts',import.meta.url),'utf8');
const unpublish=fs.readFileSync(new URL('../src/app/api/unpublish/route.ts',import.meta.url),'utf8');
test('publication is one RPC, not partial independent table updates',()=>{
 assert.match(publish,/\.rpc\('publish_page_atomic'/);
 assert.doesNotMatch(publish,/\.from\('short_links'\)\.update/);
 assert.doesNotMatch(publish,/\.from\('published_pages'\)\.upsert/);
 assert.match(unpublish,/\.rpc\('unpublish_page_atomic'/);
});
test('atomic DB functions are restricted to server role',()=>{
 assert.match(sql,/security invoker/);
 assert.match(sql,/for update/);
 assert.match(sql,/revoke all on function public\.publish_page_atomic\(uuid,integer,jsonb,jsonb\) from public,anon,authenticated/);
 assert.match(sql,/grant execute on function public\.publish_page_atomic\(uuid,integer,jsonb,jsonb\) to service_role/);
 assert.match(sql,/grant execute on function public\.unpublish_page_atomic\(uuid\) to service_role/);
});
test('publish function checks saved revision and page snapshot before writing',()=>{
 assert.match(sql,/owner_profile\.revision is distinct from p_revision/);
 assert.match(sql,/p_page is distinct from expected_page/);
 assert.match(sql,/redirect_count <> jsonb_array_length\(p_redirects\)/);
});
