import {requireUser} from '@/lib/auth';
import Link from 'next/link';
import {BarChart3,MousePointerClick,Users} from 'lucide-react';
export const dynamic='force-dynamic';
export default async function AnalyticsPage(){
 const {sb,user}=await requireUser();const since=new Date(Date.now()-30*86400_000).toISOString();
 const [{data:links},{data:events,error},{count:subscribers}]=await Promise.all([
 sb.from('short_links').select('id,block_id,slug,destination,is_active').eq('owner_id',user.id),
 sb.from('click_events').select('short_link_id,clicked_at,visitor_hash,referrer_host').eq('owner_id',user.id).gte('clicked_at',since).order('clicked_at',{ascending:false}).limit(10000),
 sb.from('newsletter_subscribers').select('*',{count:'exact',head:true}).eq('owner_id',user.id)
 ]);
 if(error)throw new Error('Could not load analytics');
 const items=links??[],clicks=events??[];const totals=new Map<string,number>();for(const event of clicks)totals.set(event.short_link_id,(totals.get(event.short_link_id)??0)+1);
 const uniques=new Set(clicks.map(x=>x.visitor_hash).filter(Boolean)).size;const top=[...items].map(x=>({...x,count:totals.get(x.id)??0})).sort((a,b)=>b.count-a.count);const max=Math.max(1,...top.map(x=>x.count));
 const days=Array.from({length:14},(_,i)=>{const day=new Date();day.setUTCDate(day.getUTCDate()-13+i);return day.toISOString().slice(0,10)});const counts=new Map<string,number>();for(const event of clicks)counts.set(event.clicked_at.slice(0,10),(counts.get(event.clicked_at.slice(0,10))??0)+1);const maxDaily=Math.max(1,...days.map(d=>counts.get(d)??0));
 return <><div className="dashboard-head"><div><span className="eyebrow">Signals, not noise</span><h1 className="serif">Your impact.</h1><p>Tracked link activity from the last 30 days.</p></div><Link href="/dashboard/editor" className="btn btn-light">Back to editor</Link></div>
 <div className="dashboard-grid"><div className="metric"><label><MousePointerClick size={15}/> Link clicks</label><strong>{clicks.length}{clicks.length===10000?'+':''}</strong><span className="muted">Last 30 days</span></div><div className="metric"><label><Users size={15}/> Approx. unique visitors</label><strong>{uniques||'—'}</strong><span className="muted">Requires an analytics hash key</span></div><div className="metric"><label><BarChart3 size={15}/> Subscribers</label><strong>{subscribers??0}</strong><span className="muted">Across all published forms</span></div></div>
 <section className="panel"><h2>Clicks over the last 14 days</h2><div className="analytics-chart" role="img" aria-label={`Daily clicks: ${days.map(d=>`${d}: ${counts.get(d)??0}`).join(', ')}`}>{days.map(d=><div className="chart-column" key={d}><div style={{height:`${Math.max(3,((counts.get(d)??0)/maxDaily)*100)}%`}} title={`${d}: ${counts.get(d)??0} clicks`}/></div>)}</div><div className="chart-endpoints"><span>{days[0]}</span><span>{days[days.length-1]}</span></div></section>
 <section className="panel"><h2>Top destinations</h2>{!top.length?<p className="muted">Once you publish links, their clicks will appear here.</p>:top.map(l=><div className="bar-row" key={l.id}><strong title={l.destination}>{new URL(l.destination).hostname}</strong><div className="bar-track"><span style={{width:`${100*l.count/max}%`}}/></div><b>{l.count}</b></div>)}{clicks.length===10000&&<p className="fineprint">Large dataset: results are capped at 10,000 clicks for now.</p>}</section>
 </>;
}
