import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
const html=readFileSync('public/poll.html','utf8');
const code=`const html=${JSON.stringify(html)};
const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export default {async fetch(request,env){
 const url=new URL(request.url);
 if(url.pathname==='/'&&request.method==='GET')return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin'}});
 if(!url.pathname.startsWith('/api/'))return new Response('Not found',{status:404});
 if(!env.BUCKET)return json({error:'Storage unavailable'},503);
 try{
 if(url.pathname==='/api/rsvp'&&request.method==='POST'){
  if(request.headers.get('origin')!==url.origin)return json({error:'Invalid origin'},403);
  const raw=await request.text();if(raw.length>2048)return json({error:'Too large'},413);
  let d;try{d=JSON.parse(raw)}catch{return json({error:'Invalid JSON'},400)}
  if(!d||typeof d.token!=='string'||! /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(d.token)||typeof d.name!=='string'||!d.name.trim()||d.name.trim().length>80||!['yes','maybe','no'].includes(d.answer))return json({error:'Invalid response'},400);
  await env.BUCKET.put('farewell/'+d.token,JSON.stringify({name:d.name.trim(),answer:d.answer}),{customMetadata:{answer:d.answer}});
  return json({saved:true});
 }
 if(url.pathname==='/api/results'&&request.method==='GET'){
  const totals={yes:0,maybe:0,no:0};let cursor;
  do{const page=await env.BUCKET.list({prefix:'farewell/',include:['customMetadata'],limit:1000,...(cursor?{cursor}:{})});for(const o of page.objects){const a=o.customMetadata?.answer;if(Object.hasOwn(totals,a))totals[a]++}cursor=page.truncated?page.cursor:undefined}while(cursor);
  return json(totals);
 }
 return json({error:'Not found'},404);
 }catch{return json({error:'Storage unavailable'},503)}
}};`;
mkdirSync('dist/server',{recursive:true});writeFileSync('dist/server/index.js',code);
