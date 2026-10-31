const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const config=fs.readFileSync('site/ads-config.js','utf8');
const loader=fs.readFileSync('site/ads-loader.js','utf8');
const html=fs.readFileSync('site/index.html','utf8');
function fixture({hostname='roleglobe-jobs.pages.dev',choice=null,gpc=false}={}){
 const store=new Map(choice?[['roleglobe-ad-choice-v1',choice]]:[]),cookies=new Map(),scripts=[];
 function node(tag){return {tagName:tag.toUpperCase(),children:[],dataset:{},style:{},events:{},attrs:{},textContent:'',parentNode:null,setAttribute(k,v){this.attrs[k]=v},addEventListener(k,fn){this.events[k]=fn},appendChild(x){x.parentNode=this;this.children.push(x);if(x.tagName==='SCRIPT')scripts.push(x);return x},append(...xs){xs.forEach(x=>this.appendChild(x))},remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(x=>x!==this)},querySelector(s){return s==='script[src]'?this.children.find(x=>x.tagName==='SCRIPT'&&x.src)||null:null}}}
 const ad=node('section'),settings=node('button'),body=node('body'),map=new Map([['role-globe-native-ad',ad],['ad-settings',settings]]);
 const document={body,get cookie(){return [...cookies].map(([k,v])=>k+'='+v).join('; ')},set cookie(raw){let [kv]=raw.split(';'),[k,v]=kv.split('=');cookies.set(k,v)},getElementById(id){if(id==='ad-consent')return body.children.find(x=>x.id==='ad-consent')||null;return map.get(id)||null},createElement:node};
 let reloads=0;const window={location:{hostname,reload(){reloads++}},navigator:{globalPrivacyControl:gpc}};
 const storage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
 const context={window,document,localStorage:storage,sessionStorage:storage,console};vm.runInNewContext(config,context);vm.runInNewContext(loader,context);
 return {ad,scripts,settings,store,document,window,get reloads(){return reloads},findButton(label){const find=n=>{if(n.tagName==='BUTTON'&&n.textContent===label)return n;for(const c of n.children){const z=find(c);if(z)return z}return null};return find(document.getElementById('ad-consent'))}};
}
test('Cloudflare direct tag uses one Native Banner script and container, without custom iframes',()=>{let f=fixture();assert.equal(f.scripts.length,1);assert.equal(f.scripts[0].src,'https://bauval.org/21/db9986460be31be0bad5b7387ff7c743');assert.equal(f.scripts[0].attrs['data-cfasync'],'false');assert.equal(f.ad.children.filter(n=>n.tagName==='DIV').length,1);assert.equal(f.ad.children.filter(n=>n.tagName==='IFRAME').length,0);assert.equal(f.ad.dataset.visible,'true');});
test('Refusals and GPC block all ad requests',()=>{assert.equal(fixture({choice:'declined'}).scripts.length,0);assert.equal(fixture({gpc:true}).scripts.length,0);});
test('Wrong host and spoofed subdomains block ad requests',()=>{for(const hostname of ['localhost','example.org','roleglobe-jobs.pages.dev.evil.invalid','preview.roleglobe-jobs.pages.dev'])assert.equal(fixture({hostname}).scripts.length,0);});
test('Ad preference opt-out reloads and still offers opt-in control',()=>{const f=fixture();f.settings.events.click();assert.ok(f.findButton('Turn ads off'));f.findButton('Turn ads off').events.click();assert.equal(f.reloads,1);assert.equal(f.store.get('roleglobe-ad-choice-v1'),'declined');});
test('Previously refused visitor can opt in',()=>{const f=fixture({choice:'declined'});f.settings.events.click();f.findButton('Turn ads on').events.click();assert.equal(f.scripts.length,1);});
test('Only one direct unit, AdSense off and no legacy banner integration',()=>{assert.match(config,/adsense:\s*Object\.freeze\(\{\s*enabled:\s*false/);assert.match(config,/nativeBanner:\s*Object\.freeze\(\{[\s\S]*?enabled:\s*true/);assert.doesNotMatch(loader,/createElement\(["']iframe/);assert.doesNotMatch(html,/role-globe-mobile-320x50|role-globe-leaderboard-728x90|role-globe-rectangle-300x250/);assert.match(html,/id="role-globe-native-ad"/);});

// Adsterra support prohibits publisher-created ad-code iframes and unsupported origins.
test('Cloudflare headers block framing of this publisher page and scripts bind to the approved hostname only',()=>{
 const headers=fs.readFileSync('site/_headers','utf8');
 assert.match(headers,/X-Frame-Options: DENY/);
 assert.match(headers,/frame-ancestors 'none'/);
 assert.doesNotMatch(loader,/createElement\(["']iframe["']\)/);
 const preview=fixture({hostname:'branch.roleglobe-jobs.pages.dev'});
 assert.equal(preview.scripts.length,0);
});
