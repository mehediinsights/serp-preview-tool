import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {extname,resolve,sep} from 'node:path';
const root=process.cwd();
const headers=Object.fromEntries((await readFile('_headers','utf8')).split('\n').filter(x=>/^  [A-Za-z]/.test(x)).map(x=>{const i=x.indexOf(':');return [x.slice(0,i).trim(),x.slice(i+1).trim()]}));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.xml':'application/xml','.txt':'text/plain'};
http.createServer(async(req,res)=>{
 let path;
 try {path=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname)}catch{res.writeHead(400);return res.end()}
 if(path==='/')path='/index.html';
 const file=resolve(root,'.'+path);
 const allowed=path.startsWith('/assets/')||['/index.html','/404.html','/robots.txt','/sitemap.xml','/google89a2099889f25c35.html'].includes(path);
 try{
  if(!allowed||!file.startsWith(root+sep))throw new Error();
  const bytes=await readFile(file);res.writeHead(200,{...headers,'Content-Type':mime[extname(file)]||'application/octet-stream'});res.end(bytes);
 }catch{res.writeHead(404,{...headers,'Content-Type':mime['.html']});res.end(await readFile('404.html'))}
}).listen(49387,'127.0.0.1');

