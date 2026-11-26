// Local-only, descriptive metadata statistics; never a ranking model.
const stop = new Set('a an the and or of to for in on by with is are be from as at it its this that your you our we can will'.split(' '));
export function tokens(value, locale='en') {
  const normalized=String(value).normalize('NFKC').toLocaleLowerCase(locale);
  return typeof Intl.Segmenter==='function'
    ? Array.from(new Intl.Segmenter(locale,{granularity:'word'}).segment(normalized)).filter(x=>x.isWordLike).map(x=>x.segment)
    : normalized.match(/[\p{L}\p{M}\p{N}]+/gu)||[];
}
export function containsPhrase(value, phrase, locale='en') {
  const a=tokens(value,locale), b=tokens(phrase,locale);
  return b.length>0 && a.some((_,i)=>b.every((word,j)=>a[i+j]===word));
}
export function parseCSV(text) {
  if(typeof text!=='string'||text.length>500000) throw Error('Input exceeds 500 KB.');
  const rows=[];let row=[],cell='',quoted=false,closed=false;
  const push=()=>{row.push(cell);cell='';closed=false};
  const end=()=>{push();if(row.some(x=>x.trim()))rows.push(row);row=[];if(rows.length>101)throw Error('Maximum 100 competitor rows plus header.');};
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(quoted){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++}else{quoted=false;closed=true}}else cell+=c;continue}
    if(c===','){push();continue}
    if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;end();continue}
    if(closed)throw Error('Unexpected character after quoted field.');
    if(c==='"'){if(cell!=='')throw Error('Invalid CSV quoting.');quoted=true}else cell+=c;
  }
  if(quoted)throw Error('Unclosed quoted field.');
  if(cell||row.length||closed)end();
  return rows;
}
export function readCompetitors(text){
  const rows=parseCSV(text.replace(/^\uFEFF/,''));
  if(!rows.length)return {rows:[],excluded:0};
  const head=rows.shift().map(s=>s.trim().toLowerCase());
  const u=head.indexOf('url'),t=head.indexOf('title'),d=head.indexOf('description');
  if(new Set(head).size!==head.length||[u,t,d].some(x=>x<0))throw Error('CSV header must contain url,title,description.');
  const seen=new Set(),valid=[];let excluded=0;
  for(const r of rows){
    const title=(r[t]||'').trim(),description=(r[d]||'').trim();
    try{
      if(r.length!==head.length||(!title&&!description)||title.length>1000||description.length>3000||/^(?:404\b|403\b|500\b|page not found\b|access denied\b)/i.test(title))throw Error();
      const url=new URL((r[u]||'').trim());
      if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw Error();
      url.hash='';const key=url.href;
      if(seen.has(key))throw Error();seen.add(key);valid.push({url:key,title,description});
    }catch{excluded++}
  }
  return {rows:valid,excluded};
}
export function frequencies(rows,field,locale='en'){
  const docs=rows.map(x=>x[field]).filter(x=>x.trim());
  const counts=new Map();
  for(const doc of docs){
    const words=tokens(doc,locale).slice(0,500),seen=new Set();
    for(let i=0;i<words.length;i++)for(let n=1;n<=3&&i+n<=words.length;n++){
      const part=words.slice(i,i+n);
      if(part.every(x=>stop.has(x)||/^\p{N}+$/u.test(x))||stop.has(part[0])||stop.has(part.at(-1)))continue;
      seen.add(part.join(' '));
    }
    for(const term of seen)counts.set(term,(counts.get(term)||0)+1);
  }
  return [...counts].filter(([,n])=>n>=Math.min(2,docs.length)).sort((a,b)=>b[1]-a[1]||b[0].split(' ').length-a[0].split(' ').length||a[0].localeCompare(b[0],locale)).slice(0,24).map(([term,count])=>({term,count,total:docs.length,percent:Math.round(count*100/docs.length)}));
}
export function canonicalCheck(value){
  if(!value.trim())return 'Not supplied; live canonical not verified.';
  try{const u=new URL(value);if(!['https:','http:'].includes(u.protocol)||u.username||u.password||u.hash)return 'Review: use an absolute HTTP(S) URL without credentials or fragment.';return 'URL syntax valid; canonical target and indexing not verified.'}catch{return 'Review: invalid absolute URL.'}
}
export function robotsCheck(value){
  const parts=value.toLowerCase().split(',').map(x=>x.trim());
  if(parts.includes('none')||parts.includes('noindex'))return 'Provided directives request no indexing; actual indexing not verified.';
  if(parts.includes('nosnippet')||parts.some(x=>/^max-snippet\s*:\s*0$/.test(x)))return 'Provided directives restrict text snippets; actual eligibility not verified.';
  return value.trim()?'No obvious noindex or nosnippet in supplied meta robots; HTTP headers and crawling not checked.':'Not supplied; snippet eligibility not verified.';
}
