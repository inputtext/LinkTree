export const RESERVED = Object.freeze(['api','auth','admin','dashboard','editor','analytics','settings','r','login','logout','signup','sign-up','onboarding','privacy','terms','about','contact','pricing','features','faq','www','app','static','assets','help','support','robots.txt','sitemap.xml']);
export function normalizeHandle(value){return String(value ?? '').trim().toLowerCase();}
export function validateHandle(value){const handle=normalizeHandle(value);if(!/^[a-z0-9](?:[a-z0-9_-]{1,18}[a-z0-9])?$/.test(handle)) return {valid:false,reason:'Use 3–20 lowercase letters, numbers, _ or -; start and end with a letter or number.'};if(RESERVED.includes(handle))return {valid:false,reason:'This handle is reserved.'};return {valid:true,handle};}
export function safeExternalUrl(value){try{const u=new URL(value);const host=u.hostname.toLowerCase();
 if(!['http:','https:'].includes(u.protocol)||!host||u.username||u.password)return null;
 // Redirect destinations must not point to common loopback/private network hosts.
 if(host==='localhost'||host.endsWith('.localhost')||host.endsWith('.local')||host==='[::1]'||host==='[::]'||host==='0.0.0.0')return null;
 if(/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)){
  const [a,b]=host.split('.').map(Number);
  if(a===0||a===10||a===127||a>=224||(a===172&&b>=16&&b<=31)||(a===192&&b===168)||(a===169&&b===254)||(a===100&&b>=64&&b<=127))return null;
 }
 return u.toString();}catch{return null;}}
export function shortSlug(handle,id){return `${handle}-${id.replaceAll('-','').slice(0,12)}`;}
