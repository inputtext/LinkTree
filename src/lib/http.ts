import {NextResponse} from 'next/server';
export function errorResponse(message:string,status=400){return NextResponse.json({error:message},{status,headers:{'Cache-Control':'no-store'}});}
export async function jsonBody(req:Request,maxBytes=100_000):Promise<unknown>{const len=Number(req.headers.get('content-length')??0);if(len>maxBytes)throw Error('Request too large');const text=await req.text();if(text.length>maxBytes)throw Error('Request too large');return JSON.parse(text);}
