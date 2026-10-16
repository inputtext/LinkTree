import {NextResponse} from 'next/server';
import {serverSupabase,serviceSupabase} from '@/lib/supabase';
import {draftSchema} from '@/lib/validators';
import {shortSlug,safeExternalUrl} from '@/lib/handles.mjs';
import {errorResponse} from '@/lib/http';

export async function POST(){
 const sb=await serverSupabase();
 const {data:{user}}=await sb.auth.getUser();
 if(!user)return errorResponse('Sign in required',401);
 const {data:profile,error}=await sb.from('profiles').select('*').eq('user_id',user.id).single();
 if(error||!profile?.handle)return errorResponse('Claim a handle first',422);
 const parsed=draftSchema.safeParse({display_name:profile.display_name,bio:profile.bio,avatar_url:profile.avatar_url,theme:profile.theme,blocks:profile.draft_blocks,revision:profile.revision});
 if(!parsed.success)return errorResponse('Please fix invalid blocks before publishing',422);
 const blocks=parsed.data.blocks.filter(b=>b.visible);
 for(const block of blocks){
  if(['link','booking','support','social'].includes(block.type)&&(!block.title.trim()||!safeExternalUrl(block.url)))return errorResponse('Add a title and valid URL to all visible links before publishing',422);
  if(block.type==='video'&&!block.url)return errorResponse('Add a video URL or hide the video block before publishing',422);
  if(block.type==='image'&&!safeExternalUrl(block.settings?.imageUrl))return errorResponse('Add a valid image URL or hide the image block before publishing',422);
 }
 const redirectable=blocks.filter(b=>['link','booking','support','social'].includes(b.type));
 // Keep the exact validated stored URL so it matches the atomic SQL snapshot check.
 const redirects=redirectable.map(b=>({block_id:b.id,slug:shortSlug(profile.handle,b.id),destination:b.url}));
 const page={display_name:parsed.data.display_name,bio:parsed.data.bio,avatar_url:parsed.data.avatar_url||null,theme:parsed.data.theme,blocks};
 const {data:handle,error:publishError}=await serviceSupabase().rpc('publish_page_atomic',{
  p_owner_id:user.id,p_revision:parsed.data.revision,p_page:page,p_redirects:redirects
 });
 if(publishError){
  if(publishError.code==='40001')return errorResponse('Draft changed elsewhere. Reload before publishing.',409);
  return errorResponse('Could not publish page. Confirm the atomic publication migration is applied.',500);
 }
 return NextResponse.json({url:'/'+handle,published:true},{headers:{'Cache-Control':'no-store'}});
}
