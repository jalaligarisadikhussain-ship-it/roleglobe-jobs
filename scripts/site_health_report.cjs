#!/usr/bin/env node
/** Weekly publisher-source health summary; never mistakes feed data for verified hiring. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const data=JSON.parse(fs.readFileSync(path.join(__dirname,'../site/data/jobs.json'),'utf8'));
const now=Date.now(),last=Date.parse(data.last_updated);
const hours=Number.isFinite(last)?Math.max(0,(now-last)/3600000):Infinity;
const jobs=Array.isArray(data.jobs)?data.jobs:[];
const sources=Array.isArray(data.source_results)?data.source_results:[];
const good=sources.filter(s=>s.status==='ok');
const failed=sources.filter(s=>s.status==='failed');
const stats=(key)=>Object.entries(jobs.reduce((a,j)=>{const k=String(j[key]||'Unspecified').replace(/[|\r\n]/g,' ').slice(0,70);a[k]=(a[k]||0)+1;return a;},{})).sort((a,b)=>b[1]-a[1]);
const checked=jobs.filter(j=>Number.isFinite(Date.parse(j.last_verified))).length;
const old=jobs.filter(j=>!Number.isFinite(Date.parse(j.last_verified))||now-Date.parse(j.last_verified)>72*3600000).length;
const warnings=[];
if(!Number.isFinite(last)||hours>72)warnings.push('Feed has not refreshed in over 72 hours.');
if(!good.length)warnings.push('No employer-source board completed successfully in the latest sync.');
if(!jobs.length)warnings.push('No employer-source jobs currently published.');
if(old)warnings.push(old+' individual records have not been checked in the last 72 hours.');
if(failed.length)warnings.push(failed.length+' employer-source boards failed in the last sync.');
const report=[
'# RoleGlobe Jobs — publisher feed health',
'',
'Generated: '+new Date(now).toISOString(),
'Last employer-board sync: '+(Number.isFinite(last)?new Date(last).toISOString():'unavailable'),
'Elapsed since sync: '+(Number.isFinite(hours)?hours.toFixed(1)+' hours':'unknown'),
'',
'| Check | Value |','| --- | ---: |',
'| Employer-source listings | '+jobs.length+' |',
'| Listings with parseable check time | '+checked+' |',
'| Listings older than 72 hours | '+old+' |',
'| Successful source boards | '+good.length+' |',
'| Failed source boards | '+failed.length+' |',
'',
'## Categories',...stats('category').map(([k,v])=>'- '+k+': '+v),
'',
'## Top countries',...stats('country').slice(0,12).map(([k,v])=>'- '+k+': '+v),
'',
'## Status',...(warnings.length?warnings.map(w=>'- WARNING: '+w):['- Checks healthy based on stored source metadata.']),
'',
'These numbers describe imported publisher feeds, not independently verified vacancies or GA4 visitor traffic.',
''
].join('\n');
console.log(report);
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,report+'\n');
if(process.argv.includes('--strict')&&warnings.some(w=>/has not refreshed|No employer-source board|No employer-source jobs|individual records have not/.test(w)))process.exitCode=1;
