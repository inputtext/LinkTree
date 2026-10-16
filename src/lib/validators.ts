import {z} from 'zod';
import {safeExternalUrl,validateHandle} from './handles.mjs';
export const BLOCK_TYPES=['link','heading','text','image','video','divider','newsletter','contact','booking','support','social'] as const;
export const THEMES=['paper','midnight','lavender','citrus','ocean','blush'] as const;
export const blockSchema=z.object({id:z.uuid(),type:z.enum(BLOCK_TYPES),title:z.string().trim().max(100),body:z.string().trim().max(800),url:z.string().trim().max(2048),visible:z.boolean(),width:z.enum(['full','half']),settings:z.object({imageUrl:z.string().max(2048).optional(),provider:z.string().max(40).optional(),caption:z.string().max(200).optional()}).optional()}).strict().superRefine((b,ctx)=>{
 if(['link','booking','support','social'].includes(b.type)&&b.url&&!safeExternalUrl(b.url))ctx.addIssue({code:'custom',message:'Use an http(s) URL',path:['url']});
 if(b.type==='image'&&b.settings?.imageUrl&&!safeExternalUrl(b.settings.imageUrl))ctx.addIssue({code:'custom',message:'Invalid image URL',path:['settings','imageUrl']});
 if(b.type==='video'&&b.url){const u=safeExternalUrl(b.url);if(!u||!['youtube.com','www.youtube.com','youtu.be','vimeo.com','www.vimeo.com'].includes(new URL(u).hostname))ctx.addIssue({code:'custom',message:'Only YouTube and Vimeo URLs are supported',path:['url']});}
});
export const draftSchema=z.object({display_name:z.string().trim().min(1).max(80),bio:z.string().max(300),avatar_url:z.union([z.string().max(2048).refine(v=>!!safeExternalUrl(v),'Avatar must be a valid http(s) URL'),z.literal(''),z.null()]),theme:z.enum(THEMES),blocks:z.array(blockSchema).max(80).superRefine((blocks,ctx)=>{const ids=new Set(blocks.map(b=>b.id));if(ids.size!==blocks.length)ctx.addIssue({code:'custom',message:'Duplicate block identifiers'});}),revision:z.number().int().nonnegative()}).strict();
export const handleSchema=z.object({handle:z.string()}).superRefine((input,ctx)=>{const check=validateHandle(input.handle);if(!check.valid)ctx.addIssue({code:'custom',message:check.reason??'Invalid handle'});});
export const formSchema=z.discriminatedUnion('type',[
 z.object({type:z.literal('newsletter'),owner_id:z.uuid(),block_id:z.uuid(),email:z.email().max(254),website:z.string().max(200).optional(),started_at:z.number().optional(),captcha:z.string().optional()}),
 z.object({type:z.literal('contact'),owner_id:z.uuid(),block_id:z.uuid(),name:z.string().trim().min(1).max(90),email:z.email().max(254),message:z.string().trim().min(5).max(2000),website:z.string().max(200).optional(),started_at:z.number().optional(),captcha:z.string().optional()})
]);
export function explainZod(err:z.ZodError){return err.issues[0]?.message??'Invalid request';}
