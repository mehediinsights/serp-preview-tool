import {cp,mkdir,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});
await mkdir('dist');
for(const path of ['index.html','404.html','robots.txt','sitemap.xml','_headers','google89a2099889f25c35.html','assets'])await cp(path,'dist/'+path,{recursive:true});
console.log('Static deployable files written to dist/');
