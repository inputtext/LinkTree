// A lightweight file-signature check, not a replacement for image decoding or scanning.
export function isSupportedImage(bytes,type){
 if(!(bytes instanceof Uint8Array)||bytes.length<12)return false;
 if(type==='image/png')return [137,80,78,71,13,10,26,10].every((value,index)=>bytes[index]===value);
 if(type==='image/jpeg')return bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
 if(type==='image/webp')return ascii(bytes,0,4)==='RIFF'&&ascii(bytes,8,12)==='WEBP';
 return false;
}
function ascii(bytes,start,end){return String.fromCharCode(...bytes.slice(start,end));}
