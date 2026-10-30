/* RoleGlobe: Adsterra-only ad placements. AdSense scripts are intentionally absent. */
(function () {
  "use strict";
  const cfg=window.RG_ADS;
  if(!cfg||!cfg.adsterra||!cfg.adsterra.enabled)return;
  const choiceKey="roleglobe-ad-choice-v1";
  const getChoice=()=>{try{return localStorage.getItem(choiceKey)}catch(_){return null}};
  const setChoice=value=>{try{localStorage.setItem(choiceKey,value)}catch(_){}};
  const consentText="RoleGlobe uses optional Adsterra advertisements, which may use cookies, IP addresses and similar data for ad delivery and measurement. You can accept or decline. No advertising scripts load before you accept.";
  let adShown=false;
  function makeIframe(slot,unit){
    if(!slot||!unit||!unit.enabled||!unit.scriptUrl||!unit.key)return;
    const w=unit.width,h=unit.height;
    const f=document.createElement("iframe");
    f.title="Advertisement";
    f.loading="lazy";
    f.setAttribute("sandbox","allow-scripts allow-popups allow-popups-to-escape-sandbox");
    f.referrerPolicy="strict-origin-when-cross-origin";
    f.width=String(w);f.height=String(h);
    f.style.width=w+"px";f.style.height=h+"px";
    const options={key:unit.key,format:"iframe",height:h,width:w,params:{}};
    f.srcdoc='<!doctype html><html><head><meta charset="utf-8"><meta name="referrer" content="strict-origin-when-cross-origin"><style>html,body{margin:0;padding:0;overflow:hidden}</style></head><body><script>var atOptions='+JSON.stringify(options)+';<\/script><script src="'+unit.scriptUrl+'"><\/script></body></html>';
    slot.appendChild(f);slot.dataset.visible="true";
  }
  function makeNative(slot,unit){
    if(!slot||!unit||!unit.enabled||!unit.scriptUrl)return;
    const f=document.createElement("iframe");
    f.title="Sponsored advertisements";
    f.loading="lazy";
    f.setAttribute("sandbox","allow-scripts allow-popups allow-popups-to-escape-sandbox");
    f.referrerPolicy="strict-origin-when-cross-origin";
    f.style.width="100%";f.style.maxWidth="760px";f.style.height="290px";
    f.srcdoc='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;padding:0;background:transparent;overflow:auto}</style></head><body><script async="async" data-cfasync="false" src="'+unit.scriptUrl+'"><\/script><div id="'+unit.containerId+'"></div></body></html>';
    slot.appendChild(f);slot.dataset.visible="true";
  }
  function showAds(){
    if(adShown||getChoice()!=="accepted")return;
    adShown=true;
    const a=cfg.adsterra,b=a.banners;
    if(matchMedia("(max-width:720px)").matches){
      makeIframe(document.getElementById(b.mobile320x50.placementId),b.mobile320x50);
    } else {
      makeIframe(document.getElementById(b.leaderboard728x90.placementId),b.leaderboard728x90);
      makeIframe(document.getElementById(b.rectangle300x250.placementId),b.rectangle300x250);
    }
    makeNative(document.getElementById(a.nativeBanner.placementId),a.nativeBanner);
  }
  function dismiss(){const x=document.getElementById("ad-consent");if(x)x.remove()}
  function select(value){setChoice(value);dismiss();if(value==="accepted")showAds();else if(adShown)location.reload()}
  function openPreferences(){
    dismiss();
    const x=document.createElement("section");x.id="ad-consent";x.setAttribute("role","dialog");x.setAttribute("aria-label","Advertising preferences");
    const heading=document.createElement("strong");heading.textContent="Optional advertising";x.appendChild(heading);
    const p=document.createElement("p");p.textContent=consentText;x.appendChild(p);
    const link=document.createElement("a");link.href="/privacy.html";link.textContent="Privacy policy";x.appendChild(link);
    const buttons=document.createElement("div");buttons.className="ad-consent-actions";
    const accept=document.createElement("button");accept.type="button";accept.textContent="Accept ads";accept.className="accept";accept.onclick=()=>select("accepted");
    const decline=document.createElement("button");decline.type="button";decline.textContent="Decline ads";decline.onclick=()=>select("declined");
    buttons.append(accept,decline);x.appendChild(buttons);document.body.appendChild(x);
  }
  const settingsButton=document.getElementById("ad-settings");
  if(settingsButton)settingsButton.addEventListener("click",openPreferences);
  if(getChoice()==="accepted")showAds();
  else if(getChoice()!=="declined")openPreferences();
})();