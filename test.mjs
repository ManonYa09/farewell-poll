import assert from 'node:assert/strict';
import worker from './dist/server/index.js';
const map=new Map();const env={BUCKET:{put:async(k,v,o)=>map.set(k,{value:v,...o}),list:async()=>({objects:[...map].map(([key,v])=>({key,customMetadata:v.customMetadata})),truncated:false})}};
const token=crypto.randomUUID();const post=(answer,name='Manon',origin='https://poll.test')=>worker.fetch(new Request('https://poll.test/api/rsvp',{method:'POST',headers:{origin},body:JSON.stringify({token,name,answer})}),env);
assert.equal((await post('yes')).status,200);assert.equal((await post('maybe')).status,200);assert.equal(map.size,1);
const counts=await(await worker.fetch(new Request('https://poll.test/api/results'),env)).json();assert.deepEqual(counts,{yes:0,maybe:1,no:0});
assert.equal((await post('invalid')).status,400);assert.equal((await post('yes',' ')).status,400);assert.equal((await post('yes','Name','https://other.test')).status,403);
assert.equal((await worker.fetch(new Request('https://poll.test/'),env)).status,200);
console.log('Passed: save, update without duplication, shared totals, input validation, origin checks, page response.');
