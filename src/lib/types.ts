export type BlockType='link'|'heading'|'text'|'image'|'video'|'divider'|'newsletter'|'contact'|'booking'|'support'|'social';
export type ThemeName='paper'|'midnight'|'lavender'|'citrus'|'ocean'|'blush';
export type Block={id:string;type:BlockType;title:string;body:string;url:string;visible:boolean;width:'full'|'half';settings?:{imageUrl?:string;provider?:string;caption?:string};};
export type Profile={user_id:string;handle:string|null;display_name:string;bio:string;avatar_url:string|null;theme:ThemeName;draft_blocks:Block[];revision:number;created_at?:string;updated_at?:string};
export type PublicPage={owner_id:string;handle:string;page:{display_name:string;bio:string;avatar_url:string|null;theme:ThemeName;blocks:Block[]};published_at:string};
export const THEMES: {id:ThemeName;label:string;description:string}[]=[
{id:'paper',label:'Paper',description:'Warm ivory'}, {id:'midnight',label:'Midnight',description:'Ink & cream'}, {id:'lavender',label:'Lavender',description:'Soft purple'},
{id:'citrus',label:'Citrus',description:'Playful yellow'}, {id:'ocean',label:'Ocean',description:'Sea glass'}, {id:'blush',label:'Blush',description:'Muted rose'}
];
export const BLOCK_OPTIONS:{type:BlockType;label:string;hint:string}[]=[
{type:'link',label:'Link',hint:'A clickable destination'}, {type:'heading',label:'Heading',hint:'A section title'},
{type:'text',label:'Text',hint:'A short note'}, {type:'image',label:'Image',hint:'Add an image via URL'},
{type:'video',label:'Video',hint:'YouTube or Vimeo video'}, {type:'divider',label:'Divider',hint:'A visual break'},
{type:'newsletter',label:'Newsletter',hint:'Collect subscriber emails'}, {type:'contact',label:'Contact',hint:'Get enquiries'},
{type:'booking',label:'Booking',hint:'Link to your scheduling page'}, {type:'support',label:'Support',hint:'Link to support or tips'},
{type:'social',label:'Social',hint:'A social account link'}
];
