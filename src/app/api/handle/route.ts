import {NextRequest,NextResponse} from 'next/server';
import {serverSupabase,serviceSupabase} from '@/lib/supabase';
import {validateHandle,normalizeHandle} from '@/lib/handles.mjs';
import {errorResponse,jsonBody} from '@/lib/http';
export async function GET(req:NextRequest){
 const check=validateHandle(req.nextUrl.searchParams.get('handle'));
 if(!check.valid)return NextResponse.json({available:false,reason:check.reason},{headers:{'Cache-Control':'no-store'}});
 try{
  // Handles are reserved in profiles, including unpublished pages. The final uniqueness check is in Postgres.
  const {data,error}=await serviceSupabase().from('profiles').select('handle').eq('handle',check.handle).maybeSingle();
  if(error)return errorResponse('Unable to check username availability',503);
  return NextResponse.json({available:!data,provisional:true},{headers:{'Cache-Control':'no-store'}});
 }catch{return errorResponse('Username availability is temporarily unavailable',503)}
}
export async function POST(req:NextRequest){
 const sb=await serverSupabase();const {data:{user}}=await sb.auth.getUser();if(!user)return errorResponse('Sign in required',401);
 try{
  const body=await jsonBody(req,4000) as {handle?:string};const check=validateHandle(body?.handle);
  if(!check.valid)return errorResponse(check.reason??'Invalid handle',422);
  const handle=normalizeHandle(body.handle);
  const {data:current,error:queryErr}=await sb.from('profiles').select('handle').eq('user_id',user.id).maybeSingle();
  if(queryErr)return errorResponse('Unable to check account',500);
  if(current?.handle&&current.handle!==handle)return errorResponse('Handle changes are not supported yet',409);
  const displayName=typeof user.user_metadata?.full_name==='string'?user.user_metadata.full_name.slice(0,80):'New creator';
  const {error}=await sb.from('profiles').upsert({user_id:user.id,handle,display_name:displayName||'New creator'},{onConflict:'user_id'});
  if(error){if(error.code==='23505')return errorResponse('That handle is already taken',409);return errorResponse('Unable to claim handle',500)}
  return NextResponse.json({handle});
 }catch{return errorResponse('Invalid request')}
}
