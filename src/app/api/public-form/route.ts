import {NextRequest,NextResponse} from 'next/server';import {serviceSupabase} from '@/lib/supabase';import {formSchema,explainZod} from '@/lib/validators';import {jsonBody,errorResponse} from '@/lib/http';
export async function POST(req:NextRequest){try{const raw=await jsonBody(req,7000);const parsed=formSchema.safeParse(raw);if(!parsed.success)return errorResponse(explainZod(parsed.error),422);const input=parsed.data;
 if(input.website)return NextResponse.json({ok:true}); // honeypot
 if(input.started_at && (Date.now()-input.started_at)<1300)return errorResponse('Please try again',429);
 if(process.env.TURNSTILE_SECRET_KEY){if(!input.captcha)return errorResponse('Verification required',403);const response=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:process.env.TURNSTILE_SECRET_KEY,response:input.captcha})});const check=await response.json() as {success:boolean};if(!check.success)return errorResponse('Verification failed',403);}
 else if(process.env.NODE_ENV==='production')return errorResponse('Public forms are temporarily unavailable until spam protection is configured',503);
 const service=serviceSupabase();const {data:page}=await service.from('published_pages').select('page').eq('owner_id',input.owner_id).maybeSingle();
 const blocks=(page?.page as {blocks?:{id:string;type:string}[]}|null)?.blocks??[];if(!blocks.some(b=>b.id===input.block_id&&b.type===input.type))return errorResponse('Form is no longer available',404);
 if(input.type==='newsletter'){const {error}=await service.from('newsletter_subscribers').upsert({owner_id:input.owner_id,email:input.email.trim().toLowerCase()},{onConflict:'owner_id,email',ignoreDuplicates:true});if(error)return errorResponse('Could not subscribe',500);}
 else{const {error}=await service.from('contact_messages').insert({owner_id:input.owner_id,name:input.name,email:input.email.trim().toLowerCase(),message:input.message});if(error)return errorResponse('Could not send your message',500);}
 return NextResponse.json({ok:true});}catch{return errorResponse('Invalid request');}}
