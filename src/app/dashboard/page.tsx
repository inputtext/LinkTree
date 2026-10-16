import Link from 'next/link';
import {ArrowRight,ArrowUpRight,BarChart3,Eye,Layers3,Link2,Plus} from 'lucide-react';
import {requireUser} from '@/lib/auth';
import {CopyButton} from '@/components/share-tools';
export const dynamic='force-dynamic';
export default async function Dashboard(){
 const {sb,user}=await requireUser();
 const [{data:profile},{data:live},{count:clicks},{count:subscribers},{data:shortLinks}]=await Promise.all([
 sb.from('profiles').select('*').eq('user_id',user.id).single(),
 sb.from('published_pages').select('handle,published_at').eq('owner_id',user.id).maybeSingle(),
 sb.from('click_events').select('*',{count:'exact',head:true}).eq('owner_id',user.id),
 sb.from('newsletter_subscribers').select('*',{count:'exact',head:true}).eq('owner_id',user.id),
 sb.from('short_links').select('id').eq('owner_id',user.id).eq('is_active',true)
 ]);
 const blocks=Array.isArray(profile?.draft_blocks)?profile.draft_blocks:[];const site=process.env.NEXT_PUBLIC_SITE_URL??'http://localhost:3000';
 return <><div className="dashboard-head"><div><span className="eyebrow">Your creator home</span><h1 className="serif">Hello, {String(profile?.display_name??'creator').split(' ')[0]}.</h1><p>Here’s how your little corner is coming along.</p></div><Link href="/dashboard/editor" className="btn btn-accent"><Plus size={16}/> Edit my page</Link></div>
 <div className="dashboard-grid"><div className="metric"><label><Eye size={15}/> Publishing status</label><strong style={{fontSize:29}}>{live?'Live':'Draft'}</strong><span className="muted" style={{fontSize:12}}>{live?'Your page is visible to everyone':'Only you can see your work'}</span></div><div className="metric"><label><Layers3 size={15}/> Your blocks</label><strong>{blocks.length}</strong><span className="muted" style={{fontSize:12}}>{blocks.filter((b:{visible:boolean})=>b.visible).length} visible blocks</span></div><div className="metric"><label><BarChart3 size={15}/> Tracked link clicks</label><strong>{clicks??0}</strong><span className="muted" style={{fontSize:12}}>{subscribers??0} newsletter subscribers</span></div></div>
 <section className="panel"><span className="eyebrow">Your shareable address</span><h2 className="serif" style={{marginTop:12}}>{profile?.handle ? `/${profile.handle}`:'Your link'}</h2><div className="toolbar"><span className="share-url">{site.replace(/\/$/,'')}/{profile?.handle}</span><CopyButton value={`${site.replace(/\/$/,'')}/${profile?.handle}`}/>{live&&<Link href={`/${profile?.handle}`} target="_blank" className="btn btn-small btn-light">Open page <ArrowUpRight size={15}/></Link>}</div></section>
 <div className="overview-cards"><Link className="overview-action" href="/dashboard/editor"><span className="feature-icon"><Layers3/></span><h3 className="serif">Your canvas</h3><p>Build and rearrange links, images, videos, and more.</p><span>Open editor <ArrowRight size={15}/></span></Link><Link className="overview-action" href="/dashboard/analytics"><span className="feature-icon"><Link2/></span><h3 className="serif">Your impact</h3><p>See which links are getting love from your audience.</p><span>{shortLinks?.length??0} tracked links <ArrowRight size={15}/></span></Link></div>
 </>;
}
