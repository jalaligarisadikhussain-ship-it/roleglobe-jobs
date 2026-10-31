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

RoleGlobe uses a professional **two-slot maximum per page/device** layout, rather than four competing placements:

- After the categories, Adsterra **728×90 desktop** or **320×50 mobile** banner (one, depending on viewport).
- After the job listing section, one **300×250** unit (desktop and mobile).
- The experimental **native ad unit is disabled** to keep the interface uncluttered.

Advertising containers are mounted automatically on the RoleGlobe Cloudflare Pages host for visitors who have not opted out and whose browsers do not send Global Privacy Control. No first-visit Accept ads popup is shown. No blank boxes, no popups or forced redirects are authored by RoleGlobe. Ads use clearly marked **Advertisement** labels and do not interrupt job cards or apply controls. Individual ad creative and potential third-party behavior are controlled by the ad provider, not by our CSS; configure unwanted categories in the Adsterra publisher dashboard and contact Adsterra if a unit is intrusive.

The Adsterra site-specific format keys are already configured; the site-owner must verify that all ad units are active and meet content/consent policies. **Google AdSense remains disabled** pending independent site approval. Never run AdSense and Adsterra in the same container; add separate approved units only after Google authorizes the site. Advertising results and revenue are not guaranteed.

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

## Adsterra

RoleGlobe automatically requests one responsive banner plus one 300×250 display banner on the Cloudflare Pages host; native ads remain disabled. Visitors can turn ads off via the footer Ad preferences control, and GPC/saved refusals block loading. Google AdSense remains disabled pending approval. Publisher remains responsible for consent and ad policy checks in the jurisdictions served.

## 31 October 2026 — automatic ad requests (owner instruction)

The previous first-visit “Accept ads” popup was removed. Adsterra's two existing display placements now request ads directly from the RoleGlobe Cloudflare Pages hostname when no prior opt-out or GPC signal is present. The preference panel is only opened manually from the footer. This implements owner-requested site behavior, **not an assurance of live Adsterra fill** or permission to track visitors in regions requiring prior consent. Review a regional CMP and provider policies before advertising to markets where explicit consent is required. Other websites remain untouched.
