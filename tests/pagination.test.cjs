const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const script=fs.readFileSync('site/app.js','utf8');
function makeElement(value=''){return {value,innerHTML:'',textContent:'',hidden:true,events:{},options:[],addEventListener(name,fn){this.events[name]=fn},appendChild(node){this.options.push(node)}}}
test('load a large job feed, reveal all items in pages, reset pagination when filtering',async()=>{
 const els=new Map(['q','cat','country','work','exp','hero-form','hero-q','job-results','show-more-jobs','result-count','last-update'].map(x=>[x,makeElement()]));
 const drawing=new Proxy({}, {get:(_obj,prop)=>prop==='createRadialGradient'?()=>({addColorStop(){}}):()=>{}});
 els.set('globe',{getContext:()=>drawing});
 const jobs=Array.from({length:100},(_,i)=>({id:'job-'+i,title:'Role '+i,company:'Employer',location:'Remote',country:'India',category:i%2?'IT':'Non-IT',workplace:'Remote',experience:'Entry-level',apply_url:'https://boards.greenhouse.io/test/jobs/'+i,source_name:'Employer board'}));
 const document={getElementById:id=>els.get(id),createElement:()=>makeElement(),querySelectorAll:()=>[]};
 const data={jobs,last_updated:'2026-10-31T00:00:00Z'};
 const context={document,localStorage:{getItem:()=>null,setItem(){}},matchMedia:()=>({matches:true}),fetch:async()=>({ok:true,json:async()=>data}),location:{hash:''},console};
 vm.runInNewContext(script,context);
 for(let i=0;i<4;i++)await new Promise(resolve=>setImmediate(resolve));
 const result=els.get('job-results'),button=els.get('show-more-jobs'),counter=els.get('result-count');
 const cards=()=>Array.from(result.innerHTML.matchAll(/<article class="card">/g)).length;
 assert.equal(cards(),36);assert.equal(button.hidden,false);assert.match(counter.textContent,/Showing 36 of 100/);
 button.onclick();assert.equal(cards(),72);button.onclick();assert.equal(cards(),100);assert.equal(button.hidden,true);
 els.get('cat').value='IT';els.get('cat').events.input();assert.equal(cards(),36);assert.match(counter.textContent,/Showing 36 of 50/);
 button.onclick();assert.equal(cards(),50);
 assert.match(els.get('last-update').textContent,/last source sync/);assert.doesNotMatch(els.get('last-update').textContent,/last verified sync/);
});
