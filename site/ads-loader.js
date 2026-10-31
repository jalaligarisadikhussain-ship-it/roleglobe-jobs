/* RoleGlobe Jobs: automatic Cloudflare-only Adsterra display with visitor opt-out. AdSense stays off. */
(function () {
  "use strict";
  const config = window.RG_ADS;
  if (!config?.adsterra?.enabled || config.adsterra.automaticDisplay !== true) return;

  const HOSTNAME = "roleglobe-jobs.pages.dev";
  const STORAGE_KEY = "roleglobe-ad-choice-v1";
  const COOKIE_KEY = "rg_ad_choice";
  const MAX_AGE = 60 * 60 * 24 * 180;
  let adsMounted = false;

  function validHost() {
    const hostname = window.location?.hostname || "";
    return hostname === HOSTNAME || hostname.endsWith("." + HOSTNAME);
  }
  function privacyBlocked() {
    return window.navigator?.globalPrivacyControl === true;
  }
  function cookieChoice() {
    try {
      const entry = document.cookie.split(";").map(x => x.trim()).find(x => x.startsWith(COOKIE_KEY + "="));
      const choice = entry ? decodeURIComponent(entry.substring(COOKIE_KEY.length + 1)) : null;
      return choice === "accepted" || choice === "declined" ? choice : null;
    } catch (_) { return null; }
  }
  function savedChoice() {
    const cookie = cookieChoice();
    if (cookie) return cookie;
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === "accepted" || v === "declined") return v;
    } catch (_) {}
    try {
      const v = sessionStorage.getItem(STORAGE_KEY);
      if (v === "accepted" || v === "declined") return v;
    } catch (_) {}
    return null;
  }
  function persistChoice(value) {
    const base = COOKIE_KEY + "=" + encodeURIComponent(value) +
      "; Max-Age=" + MAX_AGE + "; Path=/; SameSite=Lax; Secure";
    try {
      document.cookie = base + "; Domain=" + HOSTNAME;
      if (cookieChoice() !== value) document.cookie = base;
    } catch (_) {}
    try { localStorage.setItem(STORAGE_KEY, value); } catch (_) {}
    try { sessionStorage.setItem(STORAGE_KEY, value); } catch (_) {}
  }
  function adsAllowed() {
    // Prior refusals and Global Privacy Control override the owner's default.
    return validHost() && !privacyBlocked() && savedChoice() !== "declined";
  }
  function mountUnit(placementId, url, width, height, label) {
    const slot = document.getElementById(placementId);
    if (!slot || slot.querySelector("iframe")) return;
    const frame = document.createElement("iframe");
    frame.src = url;
    frame.title = label;
    frame.loading = "eager";
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    frame.width = String(width);
    frame.height = String(height);
    frame.style.cssText = "width:100%;max-width:" + width + "px;height:" +
      height + "px;border:0;display:block;background:transparent";
    frame.setAttribute("allow", "autoplay=()");
    // Same-origin ad-unit pages contain the original provider script tags.
    // Never use a sandboxed srcdoc frame or load AdSense in this integration.
    slot.appendChild(frame);
    slot.dataset.visible = "true";
  }
  function showAds() {
    if (adsMounted || !adsAllowed()) return;
    adsMounted = true;
    const b = config.adsterra.banners;
    const mobile = window.matchMedia("(max-width:720px)").matches;
    if (mobile) {
      if (b.mobile320x50.enabled)
        mountUnit(b.mobile320x50.placementId, "/ad-units/mobile-320x50.html?v=instagram-eager-20261031", 320, 50, "Mobile advertisement");
    } else if (b.leaderboard728x90.enabled) {
      mountUnit(b.leaderboard728x90.placementId, "/ad-units/leaderboard-728x90.html?v=instagram-eager-20261031", 728, 90, "Leaderboard advertisement");
    }
    if (b.rectangle300x250.enabled)
      mountUnit(b.rectangle300x250.placementId, "/ad-units/rectangle-300x250.html?v=instagram-eager-20261031", 300, 250, "Advertisement");
  }
  function dismissDialog() {
    document.getElementById("ad-consent")?.remove();
  }
  function choose(value) {
    if (value === "accepted" && privacyBlocked()) return;
    persistChoice(value);
    dismissDialog();
    if (value === "declined") {
      // Reload clears any provider JavaScript already running in ad iframes.
      if (adsMounted) window.location.reload();
      return;
    }
    showAds();
  }
  function openPreferences() {
    // This panel is never displayed automatically. Users open it from the footer.
    dismissDialog();
    const dialog = document.createElement("section");
    dialog.id = "ad-consent";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-label", "Advertising preferences");
    const title = document.createElement("strong");
    title.textContent = "Advertising preferences";
    dialog.append(title);
    const desc = document.createElement("p");
    desc.textContent = "RoleGlobe may show Adsterra ads by default. Advertising partners may use cookies and device data. You can turn ads off and still browse all jobs.";
    dialog.append(desc);
    const privacy = document.createElement("a");
    privacy.href = "/privacy.html";
    privacy.textContent = "Privacy policy";
    dialog.append(privacy);
    const actions = document.createElement("div");
    actions.className = "ad-consent-actions";
    const enable = document.createElement("button");
    enable.type = "button";
    enable.className = "accept";
    enable.textContent = "Turn ads on";
    enable.disabled = privacyBlocked();
    enable.addEventListener("click", () => choose("accepted"));
    const disable = document.createElement("button");
    disable.type = "button";
    disable.textContent = "Turn ads off";
    disable.addEventListener("click", () => choose("declined"));
    actions.append(enable, disable);
    dialog.append(actions);
    const close = document.createElement("button");
    close.type = "button";
    close.textContent = "Close";
    close.addEventListener("click", dismissDialog);
    dialog.append(close);
    document.body.appendChild(dialog);
  }

  document.getElementById("ad-settings")?.addEventListener("click", openPreferences);
  // No first-visit permission modal; the two display units request inventory
  // on the approved Cloudflare site unless opted out or GPC is set.
  showAds();
})();
