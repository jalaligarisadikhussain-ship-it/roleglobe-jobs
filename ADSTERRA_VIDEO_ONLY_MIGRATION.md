# RoleGlobe Jobs — Adsterra video-only migration request
Updated 2026-10-31

**Status: pending Adsterra's site-specific video ad-unit support and content-category filtering confirmation. This file is an operational request, not an active video implementation.**

## Publisher site and existing units
- https://roleglobe-jobs.pages.dev/
- Adsterra website ID: 6162187
- Known display placements: 32000719 (300×250), 32000720 (728×90), 32000721 (mobile 320×50); native unit 32000718 is disabled.
- All presently deployed active Adsterra units are display banners, **not confirmed video ad units**.
- Keep existing working banner integration until approved video-only replacements are confirmed and tested.

## Desired ads
- Type: site-approved, mobile-compatible **video only**, without forced redirect/popunder. Ask whether outstream is offered for a job portal without editorial video content or whether VAST requires a genuine content video player.
- Preferred legitimate relevance: IT employment, professional development, education and skills, technology products, productivity services and reputable consumer brands.
- Request explicit restrictions: gambling, betting, casino, adult, dating, fake-job/recruitment schemes, malware, misleading download buttons, deceptive crypto/finance/get-rich-quick promotions and intrusive scripts.
- **Do not imply these restrictions have been enabled.** Video-only inventory and creative controls are a provider decision. A browser cannot authoritatively classify third-party cross-origin ads.
- Visitor experience: no ad-view countdown on Apply links, no fake employment ads, no video blocking the search results, labeled ad slots, accessible controls, user opt-out and required regional consent.

## Migration acceptance checklist
- [ ] Adsterra support confirms approved video unit for roleglobe-jobs.pages.dev, with zone ID and exact integration tag.
- [ ] Adsterra confirms exclusions and account-side video-only inventory settings in writing.
- [ ] Verify whether a dedicated content player is required, and publish real relevant editorial video only if needed.
- [ ] Implement only the approved video unit, in its permitted position, with muted/accessibly controlled playback and a no-fill fallback.
- [ ] Preserve job search, source links, saved items, pagination and user privacy choices.
- [ ] Test Chrome + Instagram in-app browser on mobile, Desktop, no-fill and opted-out sessions.
- [ ] Replace and disable legacy display units only once the video replacement has been tested and is ready in the same deployment.
- [ ] Confirm Cloudflare live deployment and update Privacy Policy to match measured behavior.

The separate RoleGlobe commercial reuse review for external employer feeds also remains outstanding and must not be implied resolved by ad-format changes.
