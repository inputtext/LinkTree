'use client';
import {useState} from 'react';
import {ArrowUpRight,ExternalLink} from 'lucide-react';
import Script from 'next/script';
import type {Block,ThemeName} from '@/lib/types';
import {shortSlug,safeExternalUrl} from '@/lib/handles.mjs';

type VisiblePage={display_name:string;bio:string;avatar_url:string|null;theme:ThemeName;blocks:Block[]};
function videoEmbed(input:string){try{const u=new URL(input);if(['youtube.com','www.youtube.com'].includes(u.hostname)){const id=u.searchParams.get('v')??(u.pathname.startsWith('/shorts/')?u.pathname.split('/')[2]:null);if(id&&/^[\w-]{11}$/.test(id))return `https://www.youtube-nocookie.com/embed/${id}`;}if(u.hostname==='youtu.be'){const id=u.pathname.slice(1);if(/^[\w-]{11}$/.test(id))return `https://www.youtube-nocookie.com/embed/${id}`;}if(['vimeo.com','www.vimeo.com'].includes(u.hostname)){const id=u.pathname.split('/').filter(Boolean)[0];if(/^\d+$/.test(id))return `https://player.vimeo.com/video/${id}`;}}catch{}return null;}
function VisitorForm({block,ownerId,preview}:{block:Block;ownerId?:string;preview:boolean}){
 const [busy,setBusy]=useState(false),[feedback,setFeedback]=useState(''),[started]=useState(()=>Date.now());
 const sitekey=process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();if(preview||!ownerId)return;
 const el=e.currentTarget;const data=new FormData(el);setBusy(true);setFeedback('');
 try{const payload=block.type==='newsletter'?{type:'newsletter',email:data.get('email')}:{type:'contact',name:data.get('name'),email:data.get('email'),message:data.get('message')};
 const response=await fetch('/api/public-form',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,owner_id:ownerId,block_id:block.id,website:data.get('website'),started_at:started,captcha:data.get('cf-turnstile-response')??undefined})});const body=await response.json();if(!response.ok)throw Error(body.error??'Unable to send');setFeedback(block.type==='newsletter'?'You’re subscribed. Thank you!':'Message delivered. Thank you!');el.reset();}
 catch(err){setFeedback(err instanceof Error?err.message:'Something went wrong');}finally{setBusy(false);}}
 return <form className="public-form" onSubmit={submit}><h3>{block.title|| (block.type==='newsletter'?'Stay in the loop':'Get in touch')}</h3>{block.body&&<p>{block.body}</p>}{block.type==='contact'&&<input aria-label="Your name" name="name" placeholder="Your name" minLength={1} maxLength={90} required disabled={preview}/>}<input aria-label="Your email" name="email" placeholder="Your email address" type="email" maxLength={254} required disabled={preview}/>{block.type==='contact'&&<textarea aria-label="Your message" name="message" placeholder="What’s on your mind?" minLength={5} maxLength={2000} required disabled={preview}/>}
 <input name="website" aria-hidden="true" tabIndex={-1} autoComplete="off" style={{position:'absolute',left:'-9999px',width:1,height:1}}/>
 {sitekey&&!preview&&<><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive"/><div className="cf-turnstile" data-sitekey={sitekey}/></>}
 <button disabled={busy||preview} type="submit">{busy?'Sending…':block.type==='newsletter'?'Subscribe':'Send message'}</button>{preview&&<span className="preview-hint">Forms are inactive in preview.</span>}{feedback&&<p role="status" style={{marginTop:10}}>{feedback}</p>}</form>
}
export function ProfileRenderer({page,handle,ownerId,preview=false}:{page:VisiblePage;handle?:string;ownerId?:string;preview?:boolean}){
 return <div className={`profile-page theme-${page.theme} ${preview?'width-preview':''}`}><div className="profile-inner"><header className="profile-header"><div className="profile-avatar">{page.avatar_url&&safeExternalUrl(page.avatar_url)?<img alt={`${page.display_name} avatar`} src={page.avatar_url}/>:page.display_name.trim().charAt(0).toUpperCase()||'✳'}</div><h1>{page.display_name||'Your name'}</h1>{page.bio&&<p>{page.bio}</p>}{handle&&<small>@{handle}</small>}</header>
 <div className="profile-blocks">{page.blocks.filter(b=>b.visible).map(block=>{
 const width=block.width==='half'?'half':'';
 if(['link','social','booking','support'].includes(block.type)){
 const destination=safeExternalUrl(block.url);const tracking=handle&&destination&&!preview?`/r/${shortSlug(handle,block.id)}`:destination??'#';
 return <a key={block.id} href={tracking} onClick={preview?e=>e.preventDefault():undefined} rel={!preview?'nofollow noopener noreferrer':undefined} target={!preview?'_blank':undefined} className={`public-link ${width}`}><span>{block.title||'Untitled link'}{block.body&&<small className="public-link-note">{block.body}</small>}</span><ArrowUpRight size={19}/></a>;
 }
 if(block.type==='heading')return <h2 className={`public-heading ${width}`} key={block.id}>{block.title}</h2>;
 if(block.type==='text')return <div key={block.id} className={`public-text ${width}`}>{block.body||block.title}</div>;
 if(block.type==='divider')return <div key={block.id} className={`public-divider ${width}`} role="separator"/>;
 if(block.type==='image')return <figure key={block.id} className={`public-figure ${width}`}>{block.settings?.imageUrl&&safeExternalUrl(block.settings.imageUrl)?<img className="public-image" src={block.settings.imageUrl} alt={block.title||'Creator image'} loading="lazy"/>:<div className="public-image-fallback">Image coming soon</div>}{block.title&&<figcaption>{block.title}</figcaption>}</figure>;
 if(block.type==='video'){const embed=videoEmbed(block.url);return <div key={block.id} className={`public-video ${width}`}>{block.title&&<h3>{block.title}</h3>}{embed?<iframe src={embed} title={block.title||'Video'} loading="lazy" allow="encrypted-media; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/>:<p>Video link required</p>}</div>}
 if(block.type==='newsletter'||block.type==='contact')return <div key={block.id} className={width}><VisitorForm block={block} ownerId={ownerId} preview={preview}/></div>;
 return null;
 })}</div>
 {page.blocks.filter(b=>b.visible).length===0&&<div className="profile-empty">{preview?'Add blocks in the editor to see your page.':'This creator is putting their page together.'}</div>}
 <footer className="public-foot"><span>Made with </span>{preview?<span>linkspace ✳</span>:<a href="/">linkspace ✳ <ExternalLink size={10}/></a>}</footer></div></div>
}
