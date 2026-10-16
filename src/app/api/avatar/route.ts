import {isSupportedImage} from '@/lib/image-magic.mjs';
import {NextRequest,NextResponse} from 'next/server';
import {serverSupabase} from '@/lib/supabase';
import {errorResponse} from '@/lib/http';
export async function POST(req:NextRequest){
 const sb=await serverSupabase();
 const {data:{user}}=await sb.auth.getUser();
 if(!user)return errorResponse('Sign in required',401);
 try{
  const form=await req.formData();
  const f=form.get('avatar');
  if(!(f instanceof File))return errorResponse('Upload a file');
  if(!['image/jpeg','image/png','image/webp'].includes(f.type)||f.size>2*1024*1024||f.size===0)return errorResponse('Use JPEG, PNG or WebP up to 2MB',422);
  const bytes=new Uint8Array(await f.arrayBuffer());
  if(!isSupportedImage(bytes,f.type))return errorResponse('Image bytes do not match the selected file type',422);
  const extension={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[f.type];
  const path=user.id+'/'+crypto.randomUUID()+'.'+extension;
  const {error}=await sb.storage.from('avatars').upload(path,f,{contentType:f.type,upsert:false});
  if(error)return errorResponse('Upload failed',500);
  const {data}=sb.storage.from('avatars').getPublicUrl(path);
  return NextResponse.json({url:data.publicUrl});
 }catch{return errorResponse('Upload failed');}
}
