# RoleGlobe professional in-page video — approval-gated integration

Status (2026-10-31): **prepared only**, NOT live. The GitHub branch is separate from `main`. Existing Adsterra display units are unchanged.

The optional `site/video-ads-config.js` and `site/video-ads-loader.js` are wired to the homepage in a non-invasive, fail-closed way. They insert no slot, iframe, tracking code, or video unless **all** approvals and checks pass.

## Activation prerequisites

1. Publisher applies to a legitimate video monetization service (initial candidate: VDO.AI), describing `https://roleglobe-jobs.pages.dev/`, actual traffic, content and ownership accurately. Approval is not confirmed.
2. Verify the provider supports **outstream in-page video** for the domain and provides a permitted **iframe embed URL**. This adapter does **not** support VAST URLs or scripts; adapt only to the exact vendor-issued integration if needed.
3. In the provider dashboard or via support, confirm exclusion controls for gambling/betting/casino, adult/dating, misleading job/download ads. Do not set `categoryExclusionsConfirmed` to true based on guesses.
4. Verify **muted playback**, in-player pause/close and mobile behavior using real test inventory; check that the provided embed honors iframe sandbox requirements. Site wrapper has an independent Close button.
5. Complete consent/CMP review. RoleGlobe explicitly requires a prior **accepted** advertising choice for video; existing default banner behavior is not sufficient consent.
6. Only after verified steps, set `status:'approved'`, relevant safety gates to true, real vendor-provided `embedUrl`, exact `embedHost`, `provider` and `enabled:true`.
7. Run `node --test tests/*.test.cjs`, deploy and test with browser protections and real user interactions without generating artificial paid impressions/clicks.

**Never** invent publisher credentials, video tags, video inventory, or revenue; do not enable video solely to show an empty player. An additional video placement raises page ad density above the original two-display-slot guideline and should be re-reviewed after provider approval.

Files **not changed**: `site/ads-config.js`, `site/ads-loader.js`, `site/ad-units/`, `site/app.js`, other websites.
