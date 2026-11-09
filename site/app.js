(()=>{"use strict";
const canvas=document.getElementById("globe"),ctx=canvas?.getContext?.("2d")||null,C=260,R=194,reduced=typeof matchMedia==="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches;
let angle=.6,lastFrame=0;const point=[];for(let lat=-84;lat<=84;lat+=9)for(let lon=-180;lon<180;lon+=9)point.push([lat*Math.PI/180,lon*Math.PI/180]);
function globe(timestamp=0){if(!ctx)return;
// Limit mobile canvas work to approximately 30fps, while respecting reduced motion.
if(timestamp&&timestamp-lastFrame<32){if(!reduced)requestAnimationFrame(globe);return;}
lastFrame=timestamp;ctx.clearRect(0,0,520,520);let aura=ctx.createRadialGradient(C,C,80,C,C,252);aura.addColorStop(0,"#3cc8f026");aura.addColorStop(1,"#359cdd00");ctx.fillStyle=aura;ctx.beginPath();ctx.arc(C,C,250,0,7);ctx.fill();const g=ctx.createRadialGradient(C-70,C-90,18,C,C,R);g.addColorStop(0,"#327aab");g.addColorStop(.58,"#144a82");g.addColorStop(1,"#081c36");ctx.fillStyle=g;ctx.beginPath();ctx.arc(C,C,R,0,7);ctx.fill();ctx.strokeStyle="#68d5ff99";ctx.lineWidth=1.7;ctx.stroke();ctx.save();ctx.clip();
for(let lat=-70;lat<=70;lat+=20){let t=lat*Math.PI/180;ctx.strokeStyle="#69cbfc17";ctx.beginPath();ctx.ellipse(C,C,R*Math.cos(t),Math.abs(11*Math.sin(t))+1,0,0,7);ctx.stroke()}
for(const [lat,lon] of point){let t=lon+angle,z=Math.cos(lat)*Math.cos(t);if(z<=0)continue;let x=R*Math.cos(lat)*Math.sin(t),y=-R*Math.sin(lat);ctx.fillStyle=z>.55?"#b3faffbb":"#70d3fc80";ctx.beginPath();ctx.arc(C+x,C+y,1.4+z*.5,0,7);ctx.fill()}ctx.restore();ctx.strokeStyle="#7dddf74a";ctx.beginPath();ctx.ellipse(C,C,R+32,69,-.27,0,7);ctx.stroke();if(!reduced){angle+=.0021;requestAnimationFrame(globe)}}globe();
const $=id=>document.getElementById(id),escapeHTML=x=>String(x||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m])),safeApplyUrl=v=>{if(typeof v!=="string"||!v.startsWith("https://")||/[\x00-\x20]/.test(v))return "";const host=v.slice(8).split(/[/?#]/)[0].toLowerCase();return /^(?:boards\.greenhouse\.io|job-boards\.greenhouse\.io|jobs\.ashbyhq\.com|jobs\.lever\.co)$/.test(host)?v:""};let jobs=[],saved,visibleCount=36,newOnly=false;const PAGE_SIZE=36;
// first_seen is the date discovered on RoleGlobe, not the employer publication date.
const addedToday=j=>typeof j?.first_seen==="string"&&j.first_seen.startsWith(new Date().toISOString().slice(0,10));
// Hide stale employer records and listings with explicitly expired closing dates.
function activeListing(j){
 const checked=Date.parse(j?.last_verified||"");
 if(!Number.isFinite(checked)||Date.now()-checked>48*60*60*1000)return false;
 const deadline=j?.deadline;
 if(typeof deadline==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(deadline)&&deadline<new Date().toISOString().slice(0,10))return false;
 return true;
}
try{saved=new Set(JSON.parse(localStorage.getItem("rg-saved")||"[]"))}catch{saved=new Set()}
function filter(){
 const q=$("q").value.toLowerCase().trim(),cat=$("cat").value,country=$("country").value,work=$("work").value,exp=$("exp").value;
 const savedOnly=$("saved-only")?.checked===true,sort=$("sort")?.value||"new";
 // Exact career-field searches should filter the category, not match "it" inside "United States".
 const queryCategory=q==="it"?"IT":(["non-it","non it","nonit"].includes(q)?"Non-IT":"");
 const terms=q.split(/\s+/).filter(Boolean);
 // Every search term may match a different field (e.g. "remote designer Canada").
 const matches=jobs.filter(j=>{const searchable=[j.title,j.company,j.location,j.country,j.category,j.workplace,j.experience,j.department||"",j.employment_type||""].join(" ").toLowerCase();return (!newOnly||addedToday(j))&&(!q||(queryCategory?j.category===queryCategory:terms.every(term=>searchable.includes(term))))&&(!cat||j.category===cat)&&(!country||j.country===country)&&(!work||j.workplace===work)&&(!exp||j.experience===exp)&&(!savedOnly||saved.has(j.id))});
 const rank=j=>terms.reduce((score,word)=>score+
  (String(j.title||"").toLowerCase().includes(word)?8:0)+
  (String(j.company||"").toLowerCase().includes(word)?4:0)+
  (String(j.category||"").toLowerCase().includes(word)?2:0)+
  (String(j.location||"").toLowerCase().includes(word)?1:0),0);
 return matches.sort((a,b)=>{
  if(sort==="relevance"&&terms.length)return rank(b)-rank(a)||a.company.localeCompare(b.company)||a.title.localeCompare(b.title);
  if(sort==="new")return (Date.parse(b.first_seen)||0)-(Date.parse(a.first_seen)||0)||a.company.localeCompare(b.company)||a.title.localeCompare(b.title);
  if(sort==="title")return a.title.localeCompare(b.title)||a.company.localeCompare(b.company);
  if(sort==="country")return a.country.localeCompare(b.country)||a.company.localeCompare(b.company);
  if(sort==="recent")return (Date.parse(b.last_verified)||0)-(Date.parse(a.last_verified)||0)||a.company.localeCompare(b.company);
  return a.company.localeCompare(b.company)||a.title.localeCompare(b.title);
 });
}
function draw(){
 const matching=filter(),arr=matching.slice(0,visibleCount);
 // Buttons mirror current select filters; no extra per-user data is collected.
 document.querySelectorAll(".quick-filter").forEach(btn=>{
  const kind=btn.dataset.quick;
  const active=kind==="all"?(!newOnly&&!$("cat").value&&!$("work").value&&!$("exp").value):
   kind==="new"?newOnly:
   kind==="IT"||kind==="Non-IT"?$("cat").value===kind:
   kind==="Remote"?$("work").value==="Remote":$("exp").value==="Entry-level";
  btn.setAttribute("aria-pressed",String(active));
 });
 $("job-results").innerHTML=arr.length?arr.map(j=>{
  const checked=j.last_verified&&Number.isFinite(Date.parse(j.last_verified))?new Date(j.last_verified).toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"}):"date not available";
  const detailRows=[
   ["Department",j.department||"Not listed"],
   ["Employment type",j.employment_type||"See official listing"],
   ["Experience level",j.experience==="Unspecified"?"See official listing":j.experience],
   ["Closing date",j.deadline||"Not provided by employer"],
   ["Salary / compensation",j.salary||"Not provided by employer"]
  ].map(([key,value])=>'<div class="job-detail-row"><strong>'+escapeHTML(key)+'</strong><span>'+escapeHTML(value)+'</span></div>').join("");
  const overview=j.overview?'<p class="job-summary">'+escapeHTML(j.overview)+'</p>':'<p class="job-summary">The public employer feed does not supply a role summary. Use the original job posting for required qualifications, selection stages and the complete job description.</p>';
  const detailPanel='<details class="job-details"><summary>Job details, qualifications & dates</summary><div class="job-detail-grid">'+detailRows+'</div><strong>Employer description excerpt</strong>'+overview+'<p class="job-disclaimer">This is an employer-source summary, not an official vacancy notification. Verify exact eligibility, salary and closing date on the employer application page.</p></details>';
  return '<article class="card"><div><span class="company">'+escapeHTML(j.company)+'</span><h3>'+escapeHTML(j.title)+'</h3><span class="badge">'+escapeHTML(j.category||"Career")+'</span>'+(addedToday(j)?'<span class="badge" title="First detected on RoleGlobe today; employer posting date may differ">New to RoleGlobe today</span>':'')+'</div><div class="metadata">📍 '+escapeHTML(j.location)+' · '+escapeHTML(j.country)+'<br>💼 '+escapeHTML(j.workplace)+' · '+escapeHTML(j.experience)+'<br>Source: '+escapeHTML(j.source_name||"Employer board")+'<br>Employer listing checked: '+escapeHTML(checked)+'</div>'+detailPanel+'<div class="actions"><button type="button" class="save" aria-pressed="'+saved.has(j.id)+'" aria-label="'+(saved.has(j.id)?"Remove saved job: ":"Save job: ")+escapeHTML(j.title)+'" data-save="'+escapeHTML(j.id)+'">'+(saved.has(j.id)?"♥ Saved":"♡ Save")+'</button><a class="apply" target="_blank" rel="noopener noreferrer" aria-label="View '+escapeHTML(j.title)+' at the employer source" href="'+escapeHTML(safeApplyUrl(j.apply_url))+'">Apply at source ↗</a></div></article>';
 }).join(""):'<div class="empty"><strong>No matching jobs right now</strong>Only successfully checked employer-source listings are displayed. Adjust or clear the filters, or revisit after the next daily update.</div>';
 const more=$("show-more-jobs"),count=$("result-count");
 const savedCount=$("saved-count");if(savedCount)savedCount.textContent=jobs.filter(j=>saved.has(j.id)).length+" saved";
 const exportButton=$("export-saved");if(exportButton)exportButton.disabled=!jobs.some(j=>saved.has(j.id));
 if(count)count.textContent=matching.length?`Showing ${arr.length} of ${matching.length} matching jobs`:"No matching jobs";
 if(more){more.hidden=arr.length>=matching.length;more.textContent=`Show ${Math.min(PAGE_SIZE,matching.length-arr.length)} more jobs`;more.onclick=()=>{visibleCount+=PAGE_SIZE;draw();};}
 document.querySelectorAll("[data-save]").forEach(el=>el.addEventListener("click",()=>{
  saved.has(el.dataset.save)?saved.delete(el.dataset.save):saved.add(el.dataset.save);
  try{localStorage.setItem("rg-saved",JSON.stringify([...saved]))}catch{}
  draw();
 }));
}
["q","cat","country","work","exp","sort","saved-only"].forEach(id=>$(id)?.addEventListener("input",()=>{visibleCount=PAGE_SIZE;draw()}));
document.querySelectorAll(".quick-filter").forEach(btn=>btn.addEventListener("click",()=>{
 const kind=btn.dataset.quick;
 newOnly=kind==="new";
 for(const id of ["cat","work","exp"])$(id).value="";
 if(kind==="IT"||kind==="Non-IT")$("cat").value=kind;
 if(kind==="Remote")$("work").value="Remote";
 if(kind==="Entry-level")$("exp").value="Entry-level";
 visibleCount=PAGE_SIZE;draw();
}));
// Export only explicit browser-local bookmarks, without sending them to a server.
$("export-saved")?.addEventListener("click",()=>{
 const items=jobs.filter(j=>saved.has(j.id));
 if(!items.length)return;
 // Defend spreadsheet users from formula injection in third-party employer fields.
 const cell=value=>{let v=String(value??"").replace(/[\r\n]+/g," ").trim();if(/^[=+@\-]/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"';};
 const columns=["Company","Job title","Country","Location","Workplace","Experience","Official apply URL"];
 const records=items.map(j=>[j.company,j.title,j.country,j.location,j.workplace,j.experience,safeApplyUrl(j.apply_url)]);
 const csv="\uFEFF"+[columns,...records].map(row=>row.map(cell).join(",")).join("\r\n")+"\r\n";
 const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
 const url=URL.createObjectURL(blob),link=document.createElement("a");
 link.href=url;link.download="roleglobe-saved-jobs.csv";link.style.display="none";document.body.appendChild(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),30000);
});
$("clear-filters")?.addEventListener("click",()=>{
 $("q").value="";$("hero-q").value="";
 for(const id of ["cat","country","work","exp"])$(id).value="";
 if($("sort"))$("sort").value="new";
 newOnly=false;
 if($("saved-only"))$("saved-only").checked=false;
 visibleCount=PAGE_SIZE;draw();
});
$("hero-form").addEventListener("submit",e=>{e.preventDefault();$("q").value=$("hero-q").value;visibleCount=PAGE_SIZE;draw();location.hash="jobs"});
// Shared links deliberately omit personal bookmarks and local storage.
function applySharedSearch(){
 // Progressive enhancement: ordinary job browsing works even if URL search APIs are unavailable.
 if(typeof URLSearchParams!=="function"||!location.search)return;
 const params=new URLSearchParams(location.search);
 const query=params.get("q");if(query){$("q").value=query.slice(0,120);$("hero-q").value=$("q").value;}
 for(const id of ["cat","country","work","exp","sort"]){const el=$(id),v=params.get(id);if(el&&v&&[...el.options].some(o=>o.value===v))el.value=v;}
 newOnly=params.get("new")==="1";
}
$("share-search")?.addEventListener("click",async()=>{
 const url=new URL(location.href);url.search="";
 const q=$("q").value.trim().slice(0,120);if(q)url.searchParams.set("q",q);
 for(const id of ["cat","country","work","exp","sort"]){const value=$(id)?.value||"";if(value&&(id!=="sort"||value!=="new"))url.searchParams.set(id,value);}
 if(newOnly)url.searchParams.set("new","1");
 url.hash="jobs";const status=$("share-status");
 try{if(!navigator.clipboard?.writeText)throw Error("Clipboard unavailable");await navigator.clipboard.writeText(url.toString());if(status)status.textContent="Link copied";}
 catch{if(status)status.textContent="Copy the link shown";window.prompt("Copy this job search link",url.toString());}
});
document.querySelectorAll(".category").forEach(el=>el.addEventListener("click",()=>{if(el.dataset.cat)$("cat").value=el.dataset.cat;if(el.dataset.work)$("work").value=el.dataset.work;if(el.dataset.exp)$("exp").value=el.dataset.exp;visibleCount=PAGE_SIZE;draw()}));
fetch("/data/jobs.json",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.json()}).then(d=>{const all=Array.isArray(d.jobs)?d.jobs.filter(j=>j&&safeApplyUrl(j.apply_url)):[];jobs=all.filter(activeListing);const hiddenCount=all.length-jobs.length;const countryPicker=$("country");[...new Set(jobs.map(j=>j.country).filter(Boolean))].sort().forEach(country=>{const opt=document.createElement("option");opt.value=country;opt.textContent=country;countryPicker.appendChild(opt)});applySharedSearch();const lastSync=d.last_updated?Date.parse(d.last_updated):NaN;
 const syncLabel=Number.isFinite(lastSync)?new Date(lastSync).toLocaleDateString():"not yet recorded";
 const stale=Number.isFinite(lastSync)&&(Date.now()-lastSync)>72*60*60*1000;
 $("last-update").textContent=jobs.length+" recently checked employer-source jobs · "+jobs.filter(addedToday).length+" first added to RoleGlobe today (UTC) · source sync "+syncLabel+(hiddenCount?" · "+hiddenCount+" stale / closed listings hidden":"")+(stale?" · Source refresh overdue":"");
 draw()}).catch(()=>{$("last-update").textContent="Job feed is temporarily unavailable";draw()});
})();