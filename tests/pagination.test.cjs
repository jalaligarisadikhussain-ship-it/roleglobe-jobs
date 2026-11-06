const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const script=fs.readFileSync('site/app.js','utf8');
function makeElement(value=''){return {value,innerHTML:'',textContent:'',hidden:true,events:{},options:[],addEventListener(name,fn){this.events[name]=fn},appendChild(node){this.options.push(node)}}}
test('load a large job feed, reveal all items in pages, reset pagination when filtering',async()=>{
 const els=new Map(['q','cat','country','work','exp','hero-form','hero-q','job-results','show-more-jobs','result-count','last-update','sort','saved-only','clear-filters'].map(x=>[x,makeElement()]));
 const drawing=new Proxy({}, {get:(_obj,prop)=>prop==='createRadialGradient'?()=>({addColorStop(){}}):()=>{}});
 els.set('globe',{getContext:()=>drawing});
 const now=new Date().toISOString();
 const jobs=Array.from({length:100},(_,i)=>({id:'job-'+i,title:'Role '+i,company:'Employer',location:'Remote',country:'India',category:i%2?'IT':'Non-IT',workplace:'Remote',experience:'Entry-level',apply_url:'https://boards.greenhouse.io/test/jobs/'+i,source_name:'Employer board',last_verified:now}));
 jobs.push({id:'unsafe',title:'Malicious redirect',company:'Bad source',location:'Remote',country:'Other',category:'IT',workplace:'Remote',experience:'Entry-level',apply_url:'javascript:alert(1)',source_name:'Spoofed'});
 jobs.push({id:'lookalike',title:'Spoofed employer link',company:'Bad source',location:'Remote',country:'Other',category:'IT',workplace:'Remote',experience:'Entry-level',apply_url:'https://boards.greenhouse.io@evil.invalid/fake',source_name:'Spoofed'});
 jobs.push({id:'closed',title:'Expired opening',company:'Employer',location:'Remote',country:'India',category:'IT',workplace:'Remote',experience:'Entry-level',apply_url:'https://boards.greenhouse.io/test/jobs/closed',last_verified:now,deadline:'2020-01-01'});
 jobs.push({id:'stale',title:'Stale opening',company:'Employer',location:'Remote',country:'India',category:'IT',workplace:'Remote',experience:'Entry-level',apply_url:'https://boards.greenhouse.io/test/jobs/stale',last_verified:'2020-01-01T00:00:00Z'});
 const document={getElementById:id=>id==='globe'?null:els.get(id),createElement:()=>makeElement(),querySelectorAll:()=>[]};
 const data={jobs,last_updated:now};
 const context={document,localStorage:{getItem:()=>null,setItem(){}},matchMedia:()=>({matches:true}),fetch:async()=>({ok:true,json:async()=>data}),location:{hash:''},console};
 vm.runInNewContext(script,context);
 for(let i=0;i<4;i++)await new Promise(resolve=>setImmediate(resolve));
 const result=els.get('job-results'),button=els.get('show-more-jobs'),counter=els.get('result-count');
 const cards=()=>Array.from(result.innerHTML.matchAll(/<article class="card">/g)).length;
 assert.equal(cards(),36);assert.equal(button.hidden,false);assert.doesNotMatch(result.innerHTML,/Malicious redirect|Spoofed employer link|Expired opening|Stale opening/);assert.match(counter.textContent,/Showing 36 of 100/);
 button.onclick();assert.equal(cards(),72);button.onclick();assert.equal(cards(),100);assert.equal(button.hidden,true);
 els.get('cat').value='IT';els.get('cat').events.input();assert.equal(cards(),36);assert.match(counter.textContent,/Showing 36 of 50/);
 button.onclick();assert.equal(cards(),50);
 assert.match(els.get('last-update').textContent,/source sync/);assert.doesNotMatch(els.get('last-update').textContent,/last verified sync/);
 assert.match(result.innerHTML,/Employer listing checked:/);
 assert.match(result.innerHTML,/Job details, qualifications & dates/);
 els.get('saved-only').checked=true;els.get('saved-only').events.input();assert.equal(cards(),0);
 els.get('clear-filters').events.click();assert.equal(cards(),36);assert.equal(els.get('cat').value,'');assert.equal(els.get('saved-only').checked,false);
 els.get('sort').value='title';els.get('sort').events.input();assert.equal(cards(),36);

});
