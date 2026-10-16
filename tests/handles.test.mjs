import test from 'node:test';import assert from 'node:assert/strict';import {validateHandle,normalizeHandle,safeExternalUrl,shortSlug} from '../src/lib/handles.mjs';
test('normalizes handles',()=>assert.equal(normalizeHandle('  PiYush_01  '),'piyush_01'));
test('rejects reserved and malformed handles',()=>{for(const h of ['dashboard','Api','ab','bad/name','name.','-abc','a'.repeat(21),'signup'])assert.equal(validateHandle(h).valid,false,h);});
test('accepts valid handle',()=>assert.deepEqual(validateHandle('awesome_dev'),{valid:true,handle:'awesome_dev'}));
test('rejects dangerous and credentialed URLs',()=>{for(const u of ['javascript:alert(1)','data:text/html,abc','file:///etc/passwd','https://u:p@example.com','not a url'])assert.equal(safeExternalUrl(u),null,u);});
test('allows http(s) URLs',()=>assert.equal(safeExternalUrl('https://example.com/x'),'https://example.com/x'));
test('stable unique block short slug',()=>assert.equal(shortSlug('jane','12345678-9012-4444-5555'),'jane-123456789012'));
test('blocks loopback and private redirect destinations',()=>{for(const url of ['http://localhost:3000/admin','http://127.0.0.1/','http://10.0.0.1/','http://192.168.1.3/','http://169.254.1.2/','http://[::1]/','https://printer.local'])assert.equal(safeExternalUrl(url),null,url)});
test('allows normal public domains and http or https',()=>{assert.equal(safeExternalUrl('https://example.org/a?q=1'),'https://example.org/a?q=1');assert.equal(safeExternalUrl('http://docs.example.org/'),'http://docs.example.org/');});
