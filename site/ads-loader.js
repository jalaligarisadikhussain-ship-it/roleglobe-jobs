/* Direct original Adsterra Native Banner tag. Never embed publisher ad tags in iframes. */
(function(){
"use strict";
const config=window.RG_ADS;
if(!config?.adsterra?.enabled||config.adsterra.automaticDisplay!==true)return;
const HOSTNAME="roleglobe-jobs.pages.dev",STORAGE_KEY="roleglobe-ad-choice-v1",COOKIE_KEY="rg_ad_choice",MAX_AGE=60*60*24*180;
let adsMounted=false;
function validHost(){const hostname=window.location?.hostname||"";return hostname===HOSTNAME||hostname.endsWith("."+HOSTNAME)}
function privacyBlocked(){return window.navigator?.globalPrivacyControl===true}
function cookieChoice(){try{const e=document.cookie.split(";").map(x=>x.trim()).find(x=>x.startsWith(COOKIE_KEY+"="));const c=e?decodeURIComponent(e.slice(COOKIE_KEY.length+1)):null;return c==="accepted"||c==="declined"?c:null}catch{return null}}
function savedChoice(){const cookie=cookieChoice();if(cookie)return cookie;for(const store of [globalThis.localStorage,globalThis.sessionStorage]){try{const v=store?.getItem(STORAGE_KEY);if(v==="accepted"||v==="declined")return v}catch{}}return null}
function persistChoice(value){const base=COOKIE_KEY+"="+encodeURIComponent(value)+"; Max-Age="+MAX_AGE+"; Path=/; SameSite=Lax; Secure";try{document.cookie=base+"; Domain="+HOSTNAME;if(cookieChoice()!==value)document.cookie=base}catch{}for(const store of [globalThis.localStorage,globalThis.sessionStorage]){try{store?.setItem(STORAGE_KEY,value)}catch{}}}
function adsAllowed(){return validHost()&&!privacyBlocked()&&savedChoice()!=="declined"}
function showAds(){
 if(adsMounted||!adsAllowed())return;
 const unit=config.adsterra.nativeBanner;
 if(!unit?.enabled||unit.unitId!=="32000718"||unit.scriptUrl!=="https://bauval.org/21/db9986460be31be0bad5b7387ff7c743"||unit.containerId!=="container-db9986460be31be0bad5b7387ff7c743")return;
 const slot=document.getElementById(unit.placementId);if(!slot||slot.querySelector("script[src]"))return;
 const container=document.createElement("div");container.id=unit.containerId;
 const script=document.createElement("script");script.async=true;script.setAttribute("data-cfasync","false");script.src=unit.scriptUrl;
 script.addEventListener("error",()=>{slot.dataset.visible="false";slot.dataset.adState="unavailable"},{once:true});
 slot.dataset.visible="true";slot.dataset.adState="requested";
 // The exact account-supplied script and container are placed in the main document, never a custom iframe.
 slot.appendChild(script);slot.appendChild(container);adsMounted=true;
}
function dismissDialog(){document.getElementById("ad-consent")?.remove()}
function choose(value){if(value==="accepted"&&privacyBlocked())return;persistChoice(value);dismissDialog();if(value==="declined"){if(adsMounted)window.location.reload();return}showAds()}
function openPreferences(){
 dismissDialog();const panel=document.createElement("section");panel.id="ad-consent";panel.setAttribute("role","dialog");panel.setAttribute("aria-label","Advertising preferences");
 const title=document.createElement("strong");title.textContent="Advertising preferences";panel.appendChild(title);
 const desc=document.createElement("p");desc.textContent="RoleGlobe may display Adsterra Native Banner advertising directly on this page. Ads may use cookies and device data; you can turn them off and still browse all jobs.";panel.appendChild(desc);
 const privacy=document.createElement("a");privacy.href="/privacy.html";privacy.textContent="Privacy policy";panel.appendChild(privacy);
 const actions=document.createElement("div");actions.className="ad-consent-actions";
 for(const [label,value] of [["Turn ads on","accepted"],["Turn ads off","declined"]]){const button=document.createElement("button");button.type="button";button.textContent=label;button.disabled=value==="accepted"&&privacyBlocked();button.addEventListener("click",()=>choose(value));actions.appendChild(button)}
 panel.appendChild(actions);const close=document.createElement("button");close.type="button";close.textContent="Close";close.addEventListener("click",dismissDialog);panel.appendChild(close);document.body.appendChild(panel);
}
document.getElementById("ad-settings")?.addEventListener("click",openPreferences);
showAds();
})();