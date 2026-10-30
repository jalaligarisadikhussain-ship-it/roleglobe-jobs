/*
 * RoleGlobe Jobs ad configuration (SITE SPECIFIC).
 * AdSense site review is pending. No ad SDK/script should be loaded.
 * Adsterra approved website #6162187; ad unit codes need per-format verification.
 * Native Banner #32000718, 300x250 #32000719, 728x90 #32000720, and mobile 320x50 #32000721 codes supplied by owner.
 * Activation REQUIRES: AdSense decision + network coexistence checks,
 * actual privacy/cookie disclosures, applicable consent gating,
 * and explicit owner approval for live advertising.
 */
window.RG_ADS = Object.freeze({
  adsense: Object.freeze({
    enabled: false,
    reviewStatus: "requested",
    publisherId: "ca-pub-8073443569494348",
    slotId: ""
  }),
  adsterra: Object.freeze({
    enabled: false,
    websiteApproved: true,
    websiteId: "6162187",
    nativeBanner: Object.freeze({
      unitId: "32000718",
      enabled: false,
      scriptUrl: "https://bauval.org/21/db9986460be31be0bad5b7387ff7c743",
      containerId: "container-db9986460be31be0bad5b7387ff7c743",
      placementId: "role-globe-native-ad"
    }),
    banners: Object.freeze({
      rectangle300x250: Object.freeze({
        unitId: "32000719",
        enabled: false,
        codeReceived: true,
        key: "047af0bf3bc3ecc33e421219245a9969",
        format: "iframe",
        width: 300,
        height: 250,
        params: Object.freeze({}),
        scriptUrl: "https://bauval.org/22/047af0bf3bc3ecc33e421219245a9969",
        placementId: "role-globe-rectangle-300x250"
      }),
      leaderboard728x90: Object.freeze({
        unitId: "32000720",
        enabled: false,
        codeReceived: true,
        key: "4b4f22e1f0270355d8ba5559e12e81c7",
        format: "iframe",
        height: 90,
        width: 728,
        params: Object.freeze({}),
        scriptUrl: "https://bauval.org/22/4b4f22e1f0270355d8ba5559e12e81c7",
        placementId: "role-globe-leaderboard-728x90"
      }),
      mobile320x50: Object.freeze({
        unitId: "32000721",
        enabled: false,
        codeReceived: true,
        key: "85d1f99506c4c05c0aed8eed8fe65ba7",
        format: "iframe",
        height: 50,
        width: 320,
        params: Object.freeze({}),
        scriptUrl: "https://bauval.org/22/85d1f99506c4c05c0aed8eed8fe65ba7",
        placementId: "role-globe-mobile-320x50"
      })
    })
  }),
  consentProviderReady: false
});
