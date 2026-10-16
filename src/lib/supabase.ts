import {createBrowserClient,createServerClient} from '@supabase/ssr';
import {createClient} from '@supabase/supabase-js';
import {cookies} from 'next/headers';
const url=()=>{const u=process.env.NEXT_PUBLIC_SUPABASE_URL;if(!u)throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');return u;};
const publicKey=()=>{const k=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;if(!k)throw new Error('Missing publishable key');return k;};
export function browserSupabase(){return createBrowserClient(url(),publicKey());}
export async function serverSupabase(){const jar=await cookies();return createServerClient(url(),publicKey(),{cookies:{getAll(){return jar.getAll();},setAll(changes){try{changes.forEach(({name,value,options})=>jar.set(name,value,options));}catch{/* RSC pages cannot write cookies; proxy refreshes them. */}}}});}
export function serviceSupabase(){const key=process.env.SUPABASE_SECRET_KEY??process.env.SUPABASE_SERVICE_ROLE_KEY;if(!key)throw new Error('Missing server-side Supabase secret key');return createClient(url(),key,{auth:{persistSession:false,autoRefreshToken:false}});}
