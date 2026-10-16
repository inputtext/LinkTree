import {requireUser} from '@/lib/auth';
import {Editor} from '@/components/editor';
import type {Profile} from '@/lib/types';
export const dynamic='force-dynamic';
export default async function EditorPage(){const {sb,user}=await requireUser();const [{data:profile,error},{data:page}]=await Promise.all([sb.from('profiles').select('*').eq('user_id',user.id).single(),sb.from('published_pages').select('published_at').eq('owner_id',user.id).maybeSingle()]);if(error||!profile)throw new Error('Profile not found');return <Editor initial={profile as Profile} initiallyPublished={!!page}/>}
