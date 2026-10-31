# RoleGlobe Jobs

Independent global IT + Non-IT career portal with interactive rotating 3D globe, official-source job cards, filters, saved jobs, and daily automatic GitHub Actions refresh.

## New website, separate projects

This repository is independent of JobPath India, ByteBright, and all game repositories. No existing projects were modified.

## Free Cloudflare Pages publishing

In Cloudflare **Workers & Pages > Create > Pages > Connect to Git**, connect **this repository**. Select **None** for Framework preset, **site** as output directory and leave build command blank. Cloudflare Pages deploys this static site from the default branch. Its GitHub integration normally redeploys on daily job-data commits.

## Automated job updating

The workflow `.github/workflows/daily-jobs.yml` runs daily at 02:17 UTC (best effort; GitHub may delay cron) and can be triggered manually from GitHub Actions. The Python standard-library-only importer reads `sources.json` to retrieve employer ATS public board entries (Greenhouse, Lever, Ashby), validates source and application domains, strips untrusted HTML and avoids duplicates. If all sources fail, it fails without wiping published jobs. If a source fails, jobs sourced there may remain up to 48 hours before removal.

**IMPORTANT:** These source board names are candidate identifiers and were not live-verified or approved for commercial reuse. Review employer/provider terms and any syndication permissions before using their content commercially; disable feeds that do not permit this use. Do not invent vacancies or assert 100% live availability. Until a successful sync, the job database is intentionally empty.

## Ads and monetization

**Publisher iframe warning (31 October 2026):** Adsterra support explicitly stated that placing ad codes inside custom publisher iframes is not permitted and could result in suspension. The Cloudflare site now uses **one direct account-supplied Native Banner tag** (unit 32000718) in the normal webpage DOM. Previous display-unit IDs are retained as **disabled** configuration only; no legacy ad-unit HTML is embedded.

Existing footer ad preferences, visitor opt-out and Global Privacy Control behavior remain. Adsterra video-only inventory is not activated: it requires a specific supported unit and written provider instructions. Category filtering for gambling/adult/scams is **not verified** and should be requested in the publisher dashboard. Account approval does not imply ad creative approval or exemption from consent requirements.


## Before public launch

Add a genuine contact email and amend `site/contact.html`, confirm actual Pages URL and canonical URLs in robots/sitemap, test feed permissions and availability, submit Google Search Console verification, and configure advertising only after approvals. No payment required for this code or Cloudflare Pages free-tier usage, subject to quota policies.

## Google Search Console indexing

- Site URL: `https://roleglobe-jobs.pages.dev/`
- Sitemap: `https://roleglobe-jobs.pages.dev/sitemap.xml`
- Robots: `https://roleglobe-jobs.pages.dev/robots.txt`
- To claim property in Search Console select **URL prefix** and enter `https://roleglobe-jobs.pages.dev/`. DNS domain property verification cannot be performed over a Cloudflare-owned `pages.dev` subdomain.
- Verify via Google-provided HTML meta tag or downloadable verification file; the user must provide the verification token or complete the Google OAuth flow. The AdSense meta tag is **not** automatically Search Console verification.
- After property verification, open **Indexing → Sitemaps**, submit `sitemap.xml`; optionally use URL inspection on homepage and career guide URL to request indexing.
- Submission does not guarantee indexing or rankings. Job cards use dynamically loaded JSON and do not currently have individual indexable URLs; add distinct permitted job detail pages only after content/redistribution permissions are reviewed.

## Adsterra — compliance update (31 October 2026)

Adsterra support warned that embedding publisher ad codes inside a custom iframe violates its terms and may result in account suspension. The site now requests only **one direct Native Banner ad (unit 32000718)** using the provided ad tag and container in the main page DOM. The former desktop/mobile/rectangle banner units remain **disabled** and their old iframe wrapper HTML files have been removed from the repository. The direct Native Banner is not a video-only format.

Prior advertising refusals, Global Privacy Control and the visitor's footer preferences continue to be honored. Google AdSense remains disabled. Ad content category exclusions and jurisdiction-dependent consent compliance have **not been confirmed** by the provider. Live Cloudflare deployment and creative rendering must be verified separately.


## 31 October 2026 — previous ad-format implementation

Earlier two-display-banner plans are superseded by the Adsterra compliance update above. Do not restore custom iframe wrappers or two display units per page without explicit written publisher guidance.

