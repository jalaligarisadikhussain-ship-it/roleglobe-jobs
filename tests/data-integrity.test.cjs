const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const data=JSON.parse(fs.readFileSync('site/data/jobs.json','utf8'));
const hosts=new Set(['boards.greenhouse.io','job-boards.greenhouse.io','jobs.ashbyhq.com','jobs.lever.co']);

test('published job feed has non-duplicated employer-source records and valid dates',()=>{
 assert(Array.isArray(data.jobs));
 assert(data.jobs.length<=1200);
 assert(Number.isFinite(Date.parse(data.last_updated)));
 const seen=new Set();
 for(const job of data.jobs){
  assert.equal(typeof job.id,'string');
  assert(!seen.has(job.id),'Repeated employer-source identifier: '+job.id);
  seen.add(job.id);
  for(const k of ['title','company','location','country','source_name','source_key'])assert(typeof job[k]==='string'&&job[k].length>0,'Missing '+k);
  assert(['IT','Non-IT'].includes(job.category));
  assert(['Remote','Hybrid','On-site'].includes(job.workplace));
  assert(['Entry-level','Senior','Unspecified'].includes(job.experience));
  assert(/^[a-f0-9]{12}$/.test(job.slug));
  const url=new URL(job.apply_url);
  assert.equal(url.protocol,'https:');
  assert(hosts.has(url.hostname), 'Non-ATS apply URL: '+job.apply_url);
  assert.equal(url.username,'');
  assert.equal(url.password,'');
  assert(Number.isFinite(Date.parse(job.last_verified)));
  assert(Date.parse(job.last_verified)<=Date.parse(data.last_updated)+1000);
 }
});

test('feed does not claim that all source boards succeeded',()=>{
 assert(Array.isArray(data.source_results));
 for(const source of data.source_results){
  assert(typeof source.source==='string'&&source.source.includes(':'));
  assert(['ok','failed'].includes(source.status));
  if(source.status==='ok')assert(Number.isInteger(source.jobs)&&source.jobs>=0);
 }
});
