import {containsPhrase,readCompetitors,frequencies,canonicalCheck,robotsCheck} from './studio-core.js';
const $=id=>document.getElementById(id);
const ids=['studioKeyword','studioLocale','studioH1','studioCanonical','studioRobots','studioIntent','studioType','studioCsv'];
const title=$('pageTitle'),desc=$('metaDescription');
let current={rows:[],excluded:0};
const elem=(tag,txt,cls)=>{const e=document.createElement(tag);e.textContent=txt;if(cls)e.className=cls;return e};
function chips(id,field,value){
  const box=$(id);box.replaceChildren();
  const list=frequencies(current.rows,field,$('studioLocale').value);
  if(!list.length){box.append(elem('p','No repeated terms available in the supplied sample.','field-help'));return}
  for(const x of list){const match=containsPhrase(value,x.term,$('studioLocale').value);box.append(elem('span',(match?'Used: ':'Not used: ')+x.term+' · '+x.count+'/'+x.total+' ('+x.percent+'%)','studio-chip '+(match?'studio-match':'')))}
}
function render(){
  const k=$('studioKeyword').value.trim(),loc=$('studioLocale').value,h1=$('studioH1').value.trim(),out=$('studioChecks');out.replaceChildren();
  const messages=[
    ['Title',title.value.trim()?'Present; confirm it describes the page.':'Missing title.'],
    ['Description',desc.value.trim()?'Present; confirm it accurately summarizes the page.':'Missing description.'],
    ['Focus phrase',k?'Title: '+(containsPhrase(title.value,k,loc)?'present':'not found')+'; description: '+(containsPhrase(desc.value,k,loc)?'present':'not found')+'. Exact phrase matching, not a ranking requirement.':'Not supplied.'],
    ['H1',h1?(k?(containsPhrase(h1,k,loc)?'Focus phrase present in supplied H1.':'Focus phrase not found in supplied H1; review meaning manually.'):'Review H1 and title for consistent meaning.'):'Not supplied; page consistency not verified.'],
    ['Intent','Review whether wording matches '+$('studioIntent').value+' intent for a '+$('studioType').value+' page. Cannot infer intent from metadata alone.'],
    ['Canonical',canonicalCheck($('studioCanonical').value)],
    ['Robots',robotsCheck($('studioRobots').value)],
    ['AI search','No AI citation or ranking prediction. Indexing, content and live eligibility require separate verification.']
  ];
  for(const [label,msg] of messages){const li=elem('li','');li.append(elem('strong',label+': '),document.createTextNode(msg));out.append(li)}
  chips('studioTitleTerms','title',title.value);chips('studioDescTerms','description',desc.value);
}
function analyze(){
  try{current=readCompetitors($('studioCsv').value);$('studioStatus').textContent=current.rows.length+' accepted · '+current.excluded+' excluded. Frequencies use only nonempty metadata for each field. Supplied data is not a live SERP.'}
  catch(e){current={rows:[],excluded:0};$('studioStatus').textContent=e.message}
  const list=$('studioResults');list.replaceChildren();
  for(const x of current.rows){const article=elem('article','','studio-result');article.append(elem('div',x.url,'field-help'),elem('h4',x.title||'(Title not supplied)'),elem('p',x.description||'(Description not supplied)'));list.append(article)}
  render();
}
for(const id of ids.filter(x=>x!=='studioCsv'))$(id).addEventListener('input',render);
for(const el of [title,desc])el.addEventListener('input',render);
$('studioAnalyze').addEventListener('click',analyze);
$('studioCsv').addEventListener('input',()=>{$('studioStatus').textContent='Data changed. Select Analyze competitors to refresh.';current={rows:[],excluded:0};$('studioResults').replaceChildren();render()});
$('studioFile').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;if(f.size>500000){$('studioStatus').textContent='File exceeds 500 KB.';return}try{$('studioCsv').value=await f.text();analyze()}catch{$('studioStatus').textContent='Could not read file.'}finally{e.target.value=''}});
$('clearBtn').addEventListener('click',()=>{for(const id of ids)if($(id).tagName!=='SELECT')$(id).value='';for(const id of ['studioLocale','studioIntent','studioType'])$(id).selectedIndex=0;analyze()});
$('sampleBtn').addEventListener('click',render);
$('studioExport').addEventListener('click',()=>{const data={version:1,source:'User-supplied metadata; not live search data',title:title.value,description:desc.value,focusKeyword:$('studioKeyword').value,locale:$('studioLocale').value,h1:$('studioH1').value,canonical:$('studioCanonical').value,robots:$('studioRobots').value,intent:$('studioIntent').value,pageType:$('studioType').value,competitors:current.rows,excluded:current.excluded,titleTerms:frequencies(current.rows,'title',$('studioLocale').value),descriptionTerms:frequencies(current.rows,'description',$('studioLocale').value)};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='metadata-analysis.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
render();
