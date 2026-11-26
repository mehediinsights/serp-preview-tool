import {test} from 'node:test';
import assert from 'node:assert/strict';
import {charCount,sanitizeUrl,metaTags,parseDraft} from '../assets/core.js';
test('grapheme and Unicode',()=>{assert.equal(charCount('👨‍👩‍👧‍👦'),1);assert.equal(charCount('e\u0301'),1);assert.equal(charCount('বাংলা')>0,true)});
test('valid URL and query',()=>{assert.equal(sanitizeUrl('https://example.com:8443/a?q=1#x').display,'example.com:8443/a?q=1');assert.equal(sanitizeUrl('').valid,true)});
test('reject unsafe and credential URLs',()=>{for(const u of ['javascript:alert(1)','data:text/html,hi','https://user:pass@example.com','not a URL'])assert.equal(sanitizeUrl(u).valid,false)});
test('HTML escaping prevents injection',()=>{assert.equal(metaTags('</title><script>','" & < >'),'<title>&lt;/title&gt;&lt;script&gt;</title>\n<meta name="description" content="&quot; &amp; &lt; &gt;">')});
test('draft validation',()=>{const d={version:2,title:'a',description:'b',url:'https://example.com',site:'c',view:'mobile'};assert.deepEqual(parseDraft(JSON.stringify(d)),d);for(const v of ['{',null,JSON.stringify({...d,view:'x'}),JSON.stringify({...d,title:'x'.repeat(301)})])assert.equal(parseDraft(v),null)});


import {tokens,containsPhrase,parseCSV,readCompetitors,frequencies,canonicalCheck,robotsCheck} from '../assets/studio-core.js';
test('studio exact phrase matching and Unicode',()=>{assert.equal(containsPhrase('cat food','cat'),true);assert.equal(containsPhrase('catalog','cat'),false);assert.equal(containsPhrase('বাংলা খাবার','বাংলা','bn'),true);assert.equal(containsPhrase('CAFE\u0301','café'),true)});
test('studio CSV quotes and newlines',()=>{assert.deepEqual(parseCSV('a,b\r\n"x,y","z""q"\r\n'),[['a','b'],['x,y','z"q']]);assert.throws(()=>parseCSV('"unclosed'));assert.throws(()=>parseCSV('"x"z'));assert.deepEqual(parseCSV('a,b\n"x\nz",y'),[['a','b'],['x\nz','y']])});
test('studio deduplication and error filtering',()=>{const r=readCompetitors('url,title,description\nhttps://a.test/,Cat food,Healthy cat\nhttps://a.test/#x,Duplicate,Test\nhttps://b.test,404 Error,Oops\njavascript:alert(1),Bad,Bad\nhttps://c.test,Cat food,\n');assert.equal(r.rows.length,2);assert.equal(r.excluded,3);assert.equal(frequencies(r.rows,'title').find(x=>x.term==='cat food').percent,100);assert.equal(frequencies(r.rows,'description').find(x=>x.term==='healthy cat').total,1)});
test('studio prevalence counts documents not repetition',()=>{const r=[{title:'cat cat cat food'},{title:'cat food'},{title:'dog'}];assert.equal(frequencies(r,'title').find(x=>x.term==='cat').count,2);assert.equal(frequencies(r,'title').find(x=>x.term==='cat').percent,67)});
test('studio technical checks distinguish supplied values from verification',()=>{assert.match(canonicalCheck('javascript:alert(1)'),/Review/);assert.match(canonicalCheck('https://example.com/'),/not verified/);assert.match(robotsCheck('index, nosnippet'),/restrict/);assert.match(robotsCheck('none'),/no indexing/)});
