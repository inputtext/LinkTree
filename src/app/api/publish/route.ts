import {NextResponse} from 'next/server';import {serverSupabase,serviceSupabase} from '@/lib/supabase';
import {draftSchema} from '@/lib/validators';import {shortSlug,safeExternalUrl} from '@/lib/handles.mjs';import {errorResponse} from '@/lib/http';
export async function POST(){const sb=await serverSupabase();const {data:{user}}=await sb.auth.getUser();if(!user)return errorResponse('Sign in required',401);
 const {data:profile,error}=await sb.from('profiles').select('*').eq('user_id',user.id).single();if(error||!profile?.handle)return errorResponse('Claim a handle first',422);
 const parsed=draftSchema.safeParse({display_name:profile.display_name,bio:profile.bio,avatar_url:profile.avatar_url,theme:profile.theme,blocks:profile.draft_blocks,revision:profile.revision});if(!parsed.success)return errorResponse('Please fix invalid blocks before publishing',422);
 const blocks=parsed.data.blocks.filter(b=>b.visible);
 for(const block of blocks){
  if(['link','booking','support','social'].includes(block.type)&&(!block.title.trim()||!safeExternalUrl(block.url)))return errorResponse('Add a title and valid URL to all visible links before publishing',422);
  if(block.type==='video'&&!block.url)return errorResponse('Add a video URL or hide the video block before publishing',422);
  if(block.type==='image'&&!safeExternalUrl(block.settings?.imageUrl))return errorResponse('Add a valid image URL or hide the image block before publishing',422);
 }
 const service=serviceSupabase();
 // All block links are validated again at publish time, and only visible ones go live.
 const redirectable=blocks.filter(b=>['link','booking','support','social'].includes(b.type)&&safeExternalUrl(b.url));
 const records=redirectable.map(b=>({owner_id:user.id,block_id:b.id,slug:shortSlug(profile.handle,b.id),destination:safeExternalUrl(b.url)!,is_active:true}));
 const {error:deactivateError}=await service.from('short_links').update({is_active:false}).eq('owner_id',user.id);if(deactivateError)return errorResponse('Could not update redirects',500);
 if(records.length){const {error:linksError}=await service.from('short_links').upsert(records,{onConflict:'owner_id,block_id'});if(linksError)return errorResponse('Could not publish links',500);}
 const {error:pageError}=await service.from('published_pages').upsert({owner_id:user.id,handle:profile.handle,page:{display_name:profile.display_name,bio:profile.bio,avatar_url:profile.avatar_url,theme:profile.theme,blocks},published_at:new Date().toISOString()},{onConflict:'owner_id'});
 if(pageError)return errorResponse('Could not publish page',500);
 return NextResponse.json({url:`/${profile.handle}`,published:true},{headers:{'Cache-Control':'no-store'}});
}
