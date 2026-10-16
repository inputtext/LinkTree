import {redirect} from 'next/navigation';
import type {Metadata} from 'next';
export const metadata:Metadata={robots:{index:false,follow:false}};
import {requireUser} from '@/lib/auth';
import {DashboardShell} from '@/components/dashboard-shell';
export const dynamic='force-dynamic';
export default async function DashboardLayout({children}:{children:React.ReactNode}){
 const {sb,user}=await requireUser();
 const {data:profile,error}=await sb.from('profiles').select('handle').eq('user_id',user.id).maybeSingle();
 if(error)throw new Error('Could not load your account.');
 if(!profile?.handle)redirect('/onboarding/handle');
 return <DashboardShell handle={profile.handle}>{children}</DashboardShell>;
}
