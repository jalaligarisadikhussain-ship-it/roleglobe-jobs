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

test('homepage offers consistent share metadata while preserving ad safety',()=>{
  for(const tag of ['twitter:card','twitter:title','twitter:description','og:site_name']) assert(html.includes(tag));
  assert(html.includes('https://roleglobe-jobs.pages.dev/'));
  assert.match(ads, /enabled: false,\s*reviewStatus: "requested"/);
  assert.match(ads, /unitId: "32000718",\s*enabled: true/);
});
