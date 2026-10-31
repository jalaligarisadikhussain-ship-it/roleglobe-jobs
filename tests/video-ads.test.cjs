const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const cfgCode=fs.readFileSync('site/video-ads-config.js','utf8');
const loader=fs.readFileSync('site/video-ads-loader.js','utf8');
const html=fs.readFileSync('site/index.html','utf8');
function run(override,opts={}){
 const inserted=[];let browserConsent=opts.consent||null;
 const mk=(tag)=>({
   tagName:tag.toUpperCase(),style:{},events:{},attributes:{},children:[],
   setAttribute(k,v){this.attributes[k]=v},
   addEventListener(k,cb){this.events[k]=cb},
   append(...xs){this.children.push(...xs)},
   remove(){this.removed=true}
 });
 const guides={insertAdjacentElement(location,node){assert.equal(location,'beforebegin');inserted.push(node)}};
 const doc={
   cookie: browserConsent?'rg_ad_choice='+browserConsent:'',
   getElementById(id){return id==='guides'?guides:null},
   createElement:mk
 };
 const window={location:{hostname:opts.host||'roleglobe-jobs.pages.dev'},navigator:{globalPrivacyControl:Boolean(opts.gpc)}};
 const context={window,document:doc,URL,localStorage:{getItem(){return browserConsent}},console};
 vm.runInNewContext(cfgCode,context);
 if (override) window.RG_VIDEO_AD={...window.RG_VIDEO_AD,...override};
 vm.runInNewContext(loader,context);
 return inserted;
}
const approved={
 enabled:true,provider:'vdo.ai',status:'approved',mode:'provider-iframe',
 publisherApproved:true,categoryExclusionsConfirmed:true,
 mutedPlaybackVerified:true,closeControlVerified:true,
 explicitConsentRequired:true,embedHost:'approved-video.example',
 embedUrl:'https://approved-video.example/embed/123'
};
test('default video inventory is off and creates no placeholder',()=>{
 assert.equal(run().length,0);
 assert.match(cfgCode,/enabled:false/);
 assert.match(html,/video-ads-config\.js/);
 assert.match(html,/video-ads-loader\.js/);
});
test('network approval and individual safety gates are mandatory',()=>{
 assert.equal(run(approved,{consent:'accepted'}).length,1);
 for(const key of ['enabled','publisherApproved','categoryExclusionsConfirmed',
   'mutedPlaybackVerified','closeControlVerified','explicitConsentRequired'])
   assert.equal(run({...approved,[key]:false},{consent:'accepted'}).length,0,key);
});
test('explicit opt-in is required and Global Privacy Control wins',()=>{
 assert.equal(run(approved).length,0);
 assert.equal(run(approved,{consent:'declined'}).length,0);
 assert.equal(run(approved,{consent:'accepted',gpc:true}).length,0);
});
test('unknown embeds and non-Cloudflare hosts rejected',()=>{
 assert.equal(run({...approved,embedUrl:'http://approved-video.example/embed/123'},{consent:'accepted'}).length,0);
 assert.equal(run({...approved,embedUrl:'https://attacker.test/embed/123'},{consent:'accepted'}).length,0);
 assert.equal(run(approved,{consent:'accepted',host:'localhost'}).length,0);
});
test('video insertion does not modify Adsterra scripts',()=>{
 const ads=fs.readFileSync('site/ads-config.js','utf8');
 assert.match(ads,/automaticDisplay:\s*true/);
 assert.match(ads,/rectangle300x250/);
});
