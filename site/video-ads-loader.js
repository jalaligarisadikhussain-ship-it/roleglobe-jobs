/* Optional RoleGlobe professional video ad: fail closed and preserve banners. */
(function(){
  'use strict';
  const cfg=window.RG_VIDEO_AD;
  if (!cfg || cfg.enabled!==true || cfg.status!=='approved' ||
      !['vdo.ai','ex.co','primis','direct-sponsor'].includes(cfg.provider) ||
      cfg.mode!=='provider-iframe' || cfg.publisherApproved!==true ||
      cfg.categoryExclusionsConfirmed!==true || cfg.mutedPlaybackVerified!==true ||
      cfg.closeControlVerified!==true || cfg.explicitConsentRequired!==true ||
      !cfg.embedHost || !cfg.embedUrl) return;
  if (window.location?.hostname!=='roleglobe-jobs.pages.dev' ||
      window.navigator?.globalPrivacyControl===true) return;
  // A publisher-default banner display is NOT consent for video advertising.
  // Only an explicitly accepted advertising preference authorizes video load.
  let consent=false;
  try {
    const cookie=document.cookie.split(';').map(x=>x.trim()).find(x=>x.startsWith('rg_ad_choice='));
    consent=cookie==='rg_ad_choice=accepted';
    if (!cookie) consent=localStorage.getItem('roleglobe-ad-choice-v1')==='accepted';
  } catch (_) { return; }
  if (!consent) return;
  try {
    const u=new URL(cfg.embedUrl);
    if(u.protocol!=='https:' || u.username || u.password ||
       u.hostname!==cfg.embedHost || u.hostname.endsWith('.pages.dev') ||
       u.hostname==='localhost') return;
  } catch (_) { return; }
  const guides=document.getElementById('guides');
  if(!guides || document.getElementById('rg-professional-video'))return;
  const aside=document.createElement('aside');
  aside.id='rg-professional-video';
  aside.setAttribute('aria-label','Video advertisement');
  aside.style.cssText='width:min(620px,calc(100% - 32px));margin:26px auto;padding:14px;border:1px solid #304860;border-radius:14px;background:#0e2135;color:#e8f2ff';
  const bar=document.createElement('div');
  bar.style.cssText='display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:9px';
  const label=document.createElement('strong');label.textContent='Video Advertisement';
  const close=document.createElement('button');close.type='button';close.textContent='Close video ad';
  close.setAttribute('aria-label','Close video advertisement');
  close.style.cssText='padding:6px 10px;border:1px solid #6d8496;border-radius:8px;background:transparent;color:inherit;cursor:pointer';
  close.addEventListener('click',()=>aside.remove());
  bar.append(label,close);
  const frame=document.createElement('iframe');
  frame.src=cfg.embedUrl;
  frame.title='Sponsored video advertisement';
  frame.loading='lazy';
  frame.referrerPolicy='strict-origin-when-cross-origin';
  frame.setAttribute('allow','autoplay');
  frame.setAttribute('sandbox','allow-scripts allow-same-origin');
  frame.style.cssText='display:block;border:0;width:100%;aspect-ratio:16/9;max-height:350px';
  aside.append(bar,frame);
  guides.insertAdjacentElement('beforebegin',aside);
})();
