const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const loader = fs.readFileSync('site/ads-loader.js','utf8');
const config = fs.readFileSync('site/ads-config.js','utf8');
const html = fs.readFileSync('site/index.html','utf8');

function fixture({ mobile=false, hostname='roleglobe-jobs.pages.dev',
                  choice=null, gpc=false }={}) {
  const storageMap = new Map(choice ? [['roleglobe-ad-choice-v1',choice]] : []);
  const cookies = new Map();
  const makeNode = (tag) => ({
    tagName: tag.toUpperCase(), children: [], dataset: {}, style:{},
    events:{}, textContent:'', attributes:{}, parentNode:null,
    setAttribute(key,val){this.attributes[key]=val},
    addEventListener(key,fn){this.events[key]=fn},
    appendChild(child){child.parentNode=this;this.children.push(child);return child},
    append(...children){children.forEach(child=>this.appendChild(child))},
    remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(x=>x!==this)},
    querySelector(sel){return sel==='iframe'?this.children.find(x=>x.tagName==='IFRAME')||null:null}
  });
  const nodes = new Map();
  for (const id of ['role-globe-mobile-320x50','role-globe-leaderboard-728x90',
    'role-globe-rectangle-300x250','ad-settings']) {
    nodes.set(id,makeNode(id==='ad-settings'?'button':'section'));
  }
  const body=makeNode('body');
  const document={
    body,
    get cookie(){return [...cookies.entries()].map(([k,v])=>k+'='+v).join('; ')},
    set cookie(raw){const [first]=raw.split(';');const [k,v]=first.split('=');cookies.set(k,v)},
    getElementById(id){
      if(id==='ad-consent')return body.children.find(x=>x.id==='ad-consent')||null;
      return nodes.get(id)||null;
    },
    createElement:makeNode
  };
  let reloads=0;
  const window={
    location:{hostname,reload(){reloads++}},
    navigator:{globalPrivacyControl:gpc},
    matchMedia(query){assert.equal(query,'(max-width:720px)');return {matches:mobile}},
    RG_ADS:null
  };
  const store={
    getItem:key=>storageMap.get(key)??null,
    setItem:(key,val)=>storageMap.set(key,val)
  };
  const context={window,document,localStorage:store,sessionStorage:store,console};
  vm.runInNewContext(config,context);
  vm.runInNewContext(loader,context);
  return {
    document,nodes,store,window,
    get reloads(){return reloads},
    get dialog(){return document.getElementById('ad-consent')},
    get count(){return [...nodes.values()].reduce((s,x)=>s+x.children.filter(y=>y.tagName==='IFRAME').length,0)},
    triggerPrefs(){nodes.get('ad-settings').events.click()},
    findButton(label){
      const find=node=>{
        if(node.tagName==='BUTTON'&&node.textContent===label)return node;
        for(const child of node.children){const r=find(child);if(r)return r;}
        return null;
      };
      return find(this.dialog);
    }
  };
}

test('fresh desktop visitors request two display units immediately; no popup',()=>{
  const f=fixture();
  assert.equal(f.count,2);
  assert.equal(f.dialog,null);
  assert.equal(f.nodes.get('role-globe-mobile-320x50').children.length,0);
  const leader=f.nodes.get('role-globe-leaderboard-728x90').children[0];
  const rectangle=f.nodes.get('role-globe-rectangle-300x250').children[0];
  assert.equal(leader.src,'/ad-units/leaderboard-728x90.html');
  assert.equal(leader.height,'90');
  assert.equal(rectangle.src,'/ad-units/rectangle-300x250.html');
  assert.equal(rectangle.height,'250');
});
test('fresh mobile visitors load only mobile 320x50 plus 300x250, no popup',()=>{
  const f=fixture({mobile:true});
  assert.equal(f.count,2);
  assert.equal(f.nodes.get('role-globe-leaderboard-728x90').children.length,0);
  const mobile=f.nodes.get('role-globe-mobile-320x50').children[0];
  assert.equal(mobile.src,'/ad-units/mobile-320x50.html');
  assert.equal(mobile.height,'50');
  assert.equal(f.dialog,null);
});
test('previously declined choice prevents automatic ads, and can be changed in footer',()=>{
  const f=fixture({choice:'declined'});
  assert.equal(f.count,0);
  assert.equal(f.dialog,null);
  f.triggerPrefs();
  assert.ok(f.dialog);
  f.findButton('Turn ads on').events.click();
  assert.equal(f.count,2);
  assert.equal(f.dialog,null);
});
test('opt-out from footer reloads to stop existing third-party frames',()=>{
  const f=fixture();
  f.triggerPrefs();
  assert.ok(f.dialog);
  f.findButton('Turn ads off').events.click();
  assert.equal(f.reloads,1);
  assert.equal(f.store.getItem('roleglobe-ad-choice-v1'),'declined');
  assert.equal(f.dialog,null);
});
test('GPC blocks automatic ads and disables manual enable',()=>{
  const f=fixture({gpc:true});
  assert.equal(f.count,0);
  f.triggerPrefs();
  assert.equal(f.findButton('Turn ads on').disabled,true);
});
test('other domains cannot automatically request the RoleGlobe advertising units',()=>{
  for(const hostname of ['localhost','example.com','jobpath-india.pages.dev',
                         'fake-roleglobe-jobs.pages.dev.example.com']){
    const f=fixture({hostname});
    assert.equal(f.count,0,hostname);
  }
  assert.equal(fixture({hostname:'preview.roleglobe-jobs.pages.dev'}).count,2);
});
test('existing format keys, AdSense off, Native off and correct public cache bust',()=>{
  assert.match(config,/automaticDisplay:\s*true/);
  assert.match(config,/nativeBanner:\s*Object\.freeze\(\{[\s\S]*?enabled:\s*false/);
  assert.match(config,/adsense:\s*Object\.freeze\(\{\s*enabled:\s*false/);
  for(const key of ['047af0bf3bc3ecc33e421219245a9969',
                    '4b4f22e1f0270355d8ba5559e12e81c7',
                    '85d1f99506c4c05c0aed8eed8fe65ba7'])assert.ok(config.includes(key));
  assert.match(html,/ads-loader\.js\?v=auto-ads-20261031/);
  assert.doesNotMatch(loader,/\.textContent\s*=\s*['\"](?:Accept ads|Decline ads)['\"]/);
});
