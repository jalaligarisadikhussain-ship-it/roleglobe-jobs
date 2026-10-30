# RoleGlobe Ads Integration Status

## Adsterra: approved website #6162187

- Native Banner unit #32000718: provided by owner and stored in `site/ads-config.js`.
- Script source (DO NOT LOAD UNTIL CLEARED): `https://bauval.org/21/db9986460be31be0bad5b7387ff7c743`
- HTML container ID: `container-db9986460be31be0bad5b7387ff7c743`
- 300x250 banner #32000719: **code received**, stored in `site/ads-config.js` (key `047af0bf3bc3ecc33e421219245a9969`; iframe 300×250; `https://bauval.org/22/047af0bf3bc3ecc33e421219245a9969`). Hidden, inactive placement `role-globe-rectangle-300x250` reserved in `site/index.html`.
- 728x90 banner #32000720: **code received**, stored in `site/ads-config.js` (key `4b4f22e1f0270355d8ba5559e12e81c7`; iframe 728×90; `https://bauval.org/22/4b4f22e1f0270355d8ba5559e12e81c7`). Hidden, inactive homepage placement `role-globe-leaderboard-728x90` reserved.
- 320x50 banner #32000721: **code received**, stored in `site/ads-config.js` (key `85d1f99506c4c05c0aed8eed8fe65ba7`; iframe 320×50; `https://bauval.org/22/85d1f99506c4c05c0aed8eed8fe65ba7`). Hidden, inactive mobile placement `role-globe-mobile-320x50` reserved.

## Google AdSense

Publisher ID: `pub-8073443569494348`. Site ownership verification has succeeded and site review was requested. **Approval has not yet been confirmed.** Existing meta verification tag remains on site pages. AdSense script is not installed.

## Live activation status

- On 30 October 2026 the owner explicitly requested Adsterra activation for **RoleGlobe only**.
- All four Adsterra units are enabled in `site/ads-config.js` and loaded responsively through `site/ads-loader.js` **only after the visitor chooses Accept ads**. Native banner plus 728×90 and 300×250 desktop placements; native plus 320×50 on mobile.
- The homepage displays a small advertising preference notice. A visitor can decline or withdraw. Third-party scripts are isolated inside advertising iframes. Third-party network rendering still needs browser testing; Adblock, geographic targeting and inventory may suppress creatives.
- The privacy policy now discloses optional Adsterra processing. A legal/region-specific privacy and consent review remains necessary; this simple preference UI is **not a certified consent management platform**.
- AdSense scripts remain **disabled** while site review is pending; ownership meta remains present.
- Existing JobPath India, ByteBright and game sites were not modified.

## 30 October 2026: rendering repair

- Replaced sandboxed `srcdoc` ad frames with dedicated same-origin HTML ad-unit documents containing original Adsterra tags. The former sandbox configuration could prevent network creatives from displaying.
- Changed `X-Frame-Options` from `DENY` to `SAMEORIGIN` so the new on-site ad-unit frames can load while preventing cross-site framing.
- Added a 180-day first-party choice cookie that can be shared between the main Pages domain and its preview subdomains, with local/session storage fallback, to reduce repeated Accept ads prompts. Initial consent is still required and can be changed using Ad preferences.
- Ad rendering and third-party availability have **not** been verified live; network fill, ad blockers, geo-targeting, cookie settings and policy restrictions may still prevent ads. Google AdSense remains disabled pending review.
