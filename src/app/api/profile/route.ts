import {NextRequest,NextResponse} from 'next/server';
import {serverSupabase} from '@/lib/supabase';import {draftSchema,explainZod} from '@/lib/validators';import {jsonBody,errorResponse} from '@/lib/http';
export async function GET(){const sb=await serverSupabase();const {data:{user}}=await sb.auth.getUser();if(!user)return errorResponse('Sign in required',401);const {data,error}=await sb.from('profiles').select('*').eq('user_id',user.id).maybeSingle();if(error)return errorResponse('Could not load profile',500);return NextResponse.json({profile:data},{headers:{'Cache-Control':'no-store'}});}
export async function PUT(req:NextRequest){try{const raw=await jsonBody(req,150_000);const result=draftSchema.safeParse(raw);if(!result.success)return errorResponse(explainZod(result.error),422);const sb=await serverSupabase();const {data:{user}}=await sb.auth.getUser();if(!user)return errorResponse('Sign in required',401);
 const {display_name,bio,avatar_url,theme,blocks,revision}=result.data;
 const {data,error}=await sb.from('profiles').update({display_name,bio,avatar_url:avatar_url||null,theme,draft_blocks:blocks,revision:revision+1}).eq('user_id',user.id).eq('revision',revision).select('revision').maybeSingle();
 if(error)return errorResponse('Save failed',500);
 if(!data)return errorResponse('This profile has changed elsewhere. Reload before saving.',409);
 return NextResponse.json({revision:data.revision},{headers:{'Cache-Control':'no-store'}});
 }catch{return errorResponse('Invalid request');}}
