import {test} from 'node:test';
import assert from 'node:assert/strict';
import {charCount,sanitizeUrl,metaTags,parseDraft} from '../assets/core.js';
test('grapheme and Unicode',()=>{assert.equal(charCount('👨‍👩‍👧‍👦'),1);assert.equal(charCount('e\u0301'),1);assert.equal(charCount('বাংলা')>0,true)});
test('valid URL and query',()=>{assert.equal(sanitizeUrl('https://example.com:8443/a?q=1#x').display,'example.com:8443/a?q=1');assert.equal(sanitizeUrl('').valid,true)});
test('reject unsafe and credential URLs',()=>{for(const u of ['javascript:alert(1)','data:text/html,hi','https://user:pass@example.com','not a URL'])assert.equal(sanitizeUrl(u).valid,false)});
test('HTML escaping prevents injection',()=>{assert.equal(metaTags('</title><script>','" & < >'),'<title>&lt;/title&gt;&lt;script&gt;</title>\n<meta name="description" content="&quot; &amp; &lt; &gt;">')});
test('draft validation',()=>{const d={version:2,title:'a',description:'b',url:'https://example.com',site:'c',view:'mobile'};assert.deepEqual(parseDraft(JSON.stringify(d)),d);for(const v of ['{',null,JSON.stringify({...d,view:'x'}),JSON.stringify({...d,title:'x'.repeat(301)})])assert.equal(parseDraft(v),null)});

