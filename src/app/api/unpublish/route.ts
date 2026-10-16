import {NextResponse} from 'next/server';
import {serverSupabase,serviceSupabase} from '@/lib/supabase';
import {errorResponse} from '@/lib/http';
export async function POST(){
 const sb=await serverSupabase();
 const {data:{user}}=await sb.auth.getUser();
 if(!user)return errorResponse('Sign in required',401);
 const {error}=await serviceSupabase().rpc('unpublish_page_atomic',{p_owner_id:user.id});
 if(error)return errorResponse('Could not unpublish page. Confirm the atomic publication migration is applied.',500);
 return NextResponse.json({published:false},{headers:{'Cache-Control':'no-store'}});
}
