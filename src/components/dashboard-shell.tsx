'use client';
import Link from 'next/link';
import {usePathname,useRouter} from 'next/navigation';
import {BarChart3,ExternalLink,LayoutDashboard,LogOut,PanelsTopLeft,Settings2} from 'lucide-react';
import {browserSupabase} from '@/lib/supabase';
import {Logo} from './site-nav';

const items=[{href:'/dashboard',label:'Overview',icon:LayoutDashboard},{href:'/dashboard/editor',label:'Page editor',icon:PanelsTopLeft},{href:'/dashboard/analytics',label:'Analytics',icon:BarChart3},{href:'/dashboard/settings',label:'Settings',icon:Settings2}];
export function DashboardShell({children,handle}:{children:React.ReactNode;handle:string}){
 const pathname=usePathname(),router=useRouter();
 async function signOut(){try{await browserSupabase().auth.signOut();router.replace('/login');router.refresh();}catch{router.replace('/login');}}
 return <div className="dashboard-layout"><aside className="sidebar"><Logo/><nav className="side-links" aria-label="Dashboard">{items.map(item=>{const Icon=item.icon;return <Link key={item.href} href={item.href} aria-current={pathname===item.href?'page':undefined}><Icon size={17}/>{item.label}</Link>})}{handle&&<Link href={`/${handle}`} target="_blank" rel="noopener noreferrer"><ExternalLink size={17}/>View live page</Link>}</nav><div className="side-bottom"><p className="muted" style={{fontSize:11,paddingLeft:14,overflowWrap:'anywhere'}}>{handle?`@${handle}`:'Your space'}</p><button className="side-signout" type="button" onClick={signOut}><LogOut size={16}/> Sign out</button></div></aside><main className="main">{children}</main></div>
}
