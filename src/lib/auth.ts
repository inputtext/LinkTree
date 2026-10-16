import {redirect} from 'next/navigation';
import {serverSupabase} from './supabase';
export async function requireUser(){const sb=await serverSupabase();const {data:{user}}=await sb.auth.getUser();if(!user)redirect('/login');return {sb,user};}
