import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import {serverSupabase} from '@/lib/supabase';
import {ProfileRenderer} from '@/components/profile-renderer';
import type {Block,PublicPage,ThemeName} from '@/lib/types';
import {validateHandle} from '@/lib/handles.mjs';
export const dynamic='force-dynamic';
type Params={params:Promise<{handle:string}>};
async function findPage(handle:string){if(!validateHandle(handle).valid||handle!==handle.toLowerCase())return null;const sb=await serverSupabase();const {data,error}=await sb.from('published_pages').select('owner_id,handle,page,published_at').eq('handle',handle).maybeSingle();if(error||!data)return null;return data as PublicPage;}
export async function generateMetadata({params}:Params):Promise<Metadata>{const {handle}=await params;const record=await findPage(handle);if(!record)return {title:'Page not found',robots:{index:false}};const title=record.page.display_name,description=(record.page.bio||`See ${title} on LinkSpace`).slice(0,160),url=`/${handle}`;return {title,description,alternates:{canonical:url},openGraph:{type:'profile',title,description,url,images:record.page.avatar_url?[{url:record.page.avatar_url}]:undefined},twitter:{card:'summary',title,description}};}
export default async function PublicProfile({params}:Params){const {handle}=await params;const record=await findPage(handle);if(!record)notFound();const page=record.page;return <ProfileRenderer handle={record.handle} ownerId={record.owner_id} page={{display_name:page.display_name,bio:page.bio,avatar_url:page.avatar_url,theme:page.theme as ThemeName,blocks:page.blocks as Block[]}}/>}
