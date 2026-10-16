import {NextRequest,NextResponse} from 'next/server';import {serviceSupabase} from '@/lib/supabase';import {safeExternalUrl} from '@/lib/handles.mjs';import {createHash} from 'node:crypto';
export async function GET(req:NextRequest,{params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;if(!/^[a-z0-9_-]{3,90}$/.test(slug))return new Response('Not found',{status:404});
 const service=serviceSupabase();const {data,error}=await service.from('short_links').select('id,owner_id,destination,is_active').eq('slug',slug).maybeSingle();
 if(error||!data?.is_active)return new Response('Not found',{status:404});const destination=safeExternalUrl(data.destination);if(!destination)return new Response('Not found',{status:404});
 const agent=req.headers.get('user-agent')??'';const isBot=/bot|crawler|spider|preview|facebookexternalhit|slackbot/i.test(agent);
 if(!isBot){let host:null|string=null;try{const ref=req.headers.get('referer');if(ref)host=new URL(ref).hostname.slice(0,150);}catch{}
 // No raw IP is saved. Optional secret-keyed hash for approximate unique visitors.
 const rawIp=req.headers.get('x-vercel-forwarded-for')??'';const secret=process.env.ANALYTICS_HASH_KEY;const hash=secret&&rawIp?createHash('sha256').update(`${secret}:${new Date().toISOString().slice(0,10)}:${rawIp}:${agent}`).digest('hex'):null;
 await service.from('click_events').insert({short_link_id:data.id,owner_id:data.owner_id,referrer_host:host,visitor_hash:hash});}
 return NextResponse.redirect(destination,{status:307,headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
}
