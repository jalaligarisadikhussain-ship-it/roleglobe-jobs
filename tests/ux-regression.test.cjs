const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const html = fs.readFileSync('site/index.html','utf8');
const js = fs.readFileSync('site/app.js','utf8');
const ads = fs.readFileSync('site/ads-config.js','utf8');

test('mobile visitors can access the essential site navigation',()=>{
  assert.match(html, /<details class="mobile-nav">/);
  assert.match(html, /<summary>☰ Menu<\/summary>/);
  for(const link of ['/career-guides','/about','/contact']) {
    assert(html.includes('href="'+link+'"'));
  }
  assert.match(html, /@media\(max-width:700px\)\{\.mobile-nav\{display:block/);
});

test('job search and filters provide multi-term and explicit IT category matching',()=>{
  assert.match(js, /const terms=q\.split\(\/\\s\+\/\)\.filter\(Boolean\)/);
  assert.match(js, /terms\.every\(term=>searchable\.includes\(term\)\)/);
  assert.match(js, /queryCategory\?j\.category===queryCategory/);
  assert.match(html, /<option value="recent">Recently checked<\/option>/);
  assert.match(js, /sort==="recent"/);
  assert.match(html, /id="saved-count"/);
  assert.match(js, /const savedCount=\$\("saved-count"\)/);
});

test('job search is accessible and feed age is not disguised as fresh',()=>{
  assert.match(html, /id="q" type="search"/);
  assert.match(html, /id="result-count" class="sub" aria-live="polite"/);
  assert.match(js, /aria-label="'\+\(saved\.has\(j\.id\)/);
  assert.match(js, /72\*60\*60\*1000/);
});


test('sitemap URLs resolve to real local pages, including original career guides',()=>{
  const xml=fs.readFileSync('site/sitemap.xml','utf8');
  const paths=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>new URL(match[1]));
  assert(paths.length>=12);
  const seen=new Set();
  for(const url of paths){
    assert.equal(url.hostname,'roleglobe-jobs.pages.dev');
    assert(!seen.has(url.pathname),'Repeated sitemap URL: '+url.pathname);
    seen.add(url.pathname);
    const file=url.pathname==='/'?'site/index.html':'site'+url.pathname+'.html';
    assert(fs.existsSync(file),'Broken sitemap page: '+file);
  }
  for(const slug of ['entry-level-job-search-plan','it-vs-non-it-career-paths']){
    const page=fs.readFileSync('site/guides/'+slug+'.html','utf8');
    assert(page.length>5000);
    assert(page.includes('"@type":"Article"'));
    assert(html.includes('href="/guides/'+slug+'"'));
  }
});

test('homepage offers consistent share metadata while preserving ad safety',()=>{
  for(const tag of ['twitter:card','twitter:title','twitter:description','og:site_name']) assert(html.includes(tag));
  assert(html.includes('https://roleglobe-jobs.pages.dev/'));
  assert.match(ads, /enabled: false,\s*reviewStatus: "requested"/);
  assert.match(ads, /unitId: "32000718",\s*enabled: true/);
});

test('premium quick filters are accessible, wired to select filters, and do not add user tracking',()=>{
 for(const choice of ['all','IT','Non-IT','Remote','Entry-level']){
  assert(html.includes('data-quick="'+choice+'"'));
 }
 assert.match(html, /role="group" aria-label="Quick job filters"/);
 assert.match(html, /\.quick-filter\[aria-pressed="true"\]/);
 assert.match(js, /document\.querySelectorAll\("\.quick-filter"\)\.forEach/);
 assert.match(js, /btn\.setAttribute\("aria-pressed",String\(active\)\)/);
 assert.match(js, /if\(kind==="Remote"\)\$\("work"\)\.value="Remote"/);
 assert.match(js, /visibleCount=PAGE_SIZE;draw\(\)/);
});

test('public ad-quality reports exist without switching provider or disabling user choices',()=>{
 const report=fs.readFileSync('.github/ISSUE_TEMPLATE/ad-quality.yml','utf8');
 assert.match(report,/Gambling, casino or betting/);
 assert.match(report,/do not include/i);
 assert.match(html,/issues\/new\?template=ad-quality\.yml/);
 assert.match(ads,/automaticDisplay: true/);
});
