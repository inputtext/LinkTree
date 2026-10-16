// Smoke checks for a deployed staging instance. This is NOT an authenticated E2E suite.
const base=process.env.BASE_URL;
if(!base||!/^https?:\/\//.test(base)){console.error('Set BASE_URL to your staging origin');process.exit(2);}
let failed=0;
async function check(name,path,status,verify,method='GET'){
 try{
  const res=await fetch(new URL(path,base),{method,redirect:'manual',headers:{'User-Agent':'LinkSpace-smoke/1'}});
  const ok=res.status===status&&(!verify||await verify(res));
  console.log((ok?'PASS ':'FAIL ')+name+' — HTTP '+res.status);
  if(!ok)failed++;
 }catch(e){console.error('FAIL '+name+' — '+e);failed++;}
}
await check('Homepage','/',200,async r=>(await r.text()).toLowerCase().includes('linkspace'));
await check('Health','/api/health',200,async r=>(await r.json()).status==='ok');
await check('Unknown handle','/this-handle-should-not-exist-77777',404);
await check('Reserved handle','/api/handle?handle=dashboard',200,async r=>(await r.json()).available===false);
await check('Unauthenticated profile','/api/profile',401);
await check('Unauthenticated publish','/api/publish',401,undefined,'POST');
if(failed){console.error(failed+' smoke checks failed');process.exit(1);}
console.log('Smoke checks passed; authenticated E2E testing remains necessary.');
