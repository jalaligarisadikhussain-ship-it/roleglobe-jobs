# RoleGlobe Jobs — Six-Month Expert Upgrade Plan
**Window:** 2 November 2026–30 April 2027  
**Production:** https://roleglobe-jobs.pages.dev/  
**Budget:** ₹0; Cloudflare Pages and existing provider-approved advertising configuration remain separate from JobPath India.

## Delivered foundations (2 November 2026)
- Searchable employer-source feed, official ATS links, country/workplace/category filters and browser-local bookmarks.
- Responsive mobile navigation, accessibility improvements, saved-job count, source-feed age warning and cross-field/multiword job search.
- Privacy-safe **Share search** links (filters only, no saved personal items or browsing history).
- Two original career guides and indexable sitemap coverage; no fabricated hiring claims.
- Daily scheduled importer `.github/workflows/daily-jobs.yml`; an emergency guard prevents a near-total accidental employer-feed wipe.
- Scheduled Monday source-health report `.github/workflows/weekly-source-health.yml`, plus UI/source regression testing.

## Upcoming monthly milestones
| Month | Delivery focus | Exit criterion |
| --- | --- | --- |
| Nov 2026 | Test live mobile navigation, search/share, ATS apply links and ad creative behavior | Phones work, jobs resolve to allowed ATS hostnames, unsafe creatives are investigated |
| Dec 2026 | Faster results browsing, clearer country/work authorization guidance and additional useful original guides | Responsive performance measured; no remote=worldwide hiring claim |
| Jan 2027 | Better career-category intent, ethical source/provider reuse checks, and resilient feed updates | Each automated listing traces to an accepted publisher feed; failures cannot quietly clear the site |
| Feb 2027 | SEO improvements and permitted job landing pages only if source rights are established | Search Console errors assessed; avoid duplicate or unlicensed job page text |
| Mar 2027 | Monetization testing with professional brand-safe inventory and regionally appropriate consent | Written provider category exclusions verified; no misleading or forced ad click flows |
| Apr 2027 | Accessibility, security and performance regression review | Six months of source-health reports reviewed and actual user feedback informs next release |

These are **planned deliverables**, not already implemented features or promises of automatic development. Live publisher permission audits, visual browser QA and future design work require separate execution.

## Monthly scorecard — no invented numbers
- Employer-source jobs in database; successful/failed feeds; job-age distribution; location/classification error samples.
- Google Search Console clicks, impressions, indexed pages and actual search queries.
- Optional GA4 engagement and observed search-to-apply click events, using privacy-appropriate setup.
- Mobile Core Web Vitals, keyboard navigation and page-loading checks.
- Inappropriate ad incidents and response time to provider reports; real ad revenue only after verified by the account dashboard.

## Publishing rules
- Source-board API data signals discovery only, not an independently confirmed opening.
- Do not sell/reuse job descriptions without the employer or ATS provider's permissions.
- Do not pretend that remote job listings guarantee sponsorship, country eligibility or availability.
- Do not add popunders, gambling ads, forced ad countdowns or custom advertising iframes; keep the existing direct allowed unit unless provider rules change.
- Account credentials, users' saved jobs and browsing preferences must never be included in shared search URLs.
- Be explicit when ads cannot be filtered by the site; category blocks must come from the advertising network.

## Operating cadence
GitHub scheduled importer and weekly data-health reports run while the repository's workflows are enabled and service quotas allow. Provider outreach, manual verification, compliance checks and release-by-release QA remain human-reviewed.
