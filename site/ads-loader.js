/* RoleGlobe Jobs: responsive, consent-gated Adsterra integration. No AdSense script is loaded. */
(function () {
  "use strict";
  const config = window.RG_ADS;
  if (!config || !config.adsterra || !config.adsterra.enabled) return;

  const STORAGE_KEY = "roleglobe-ad-choice-v1";
  const COOKIE_KEY = "rg_ad_choice";
  const MAX_AGE = 60 * 60 * 24 * 180;
  let adsMounted = false;

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
    // Prefer a shared first-party cookie: it also covers Cloudflare preview subdomains.
    const base = COOKIE_KEY + "=" + encodeURIComponent(value) + "; Max-Age=" + MAX_AGE + "; Path=/; SameSite=Lax; Secure";
    try {
      document.cookie = base + "; Domain=roleglobe-jobs.pages.dev";
      if (cookieChoice() !== value) document.cookie = base;
    } catch (_) {}
    try { localStorage.setItem(STORAGE_KEY, value); } catch (_) {}
    try { sessionStorage.setItem(STORAGE_KEY, value); } catch (_) {}
  }
  function mountUnit(placementId, url, width, height, label) {
    const slot = document.getElementById(placementId);
    if (!slot || slot.querySelector("iframe")) return;
    const frame = document.createElement("iframe");
    frame.src = url;
    frame.title = label;
    frame.loading = "lazy";
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    frame.width = String(width);
    frame.height = String(height);
    frame.style.cssText = "width:100%;max-width:" + width + "px;height:" + height + "px;border:0;display:block;background:transparent";
    frame.setAttribute("allow", "autoplay=()");
    // Use a normal same-origin HTML page containing the network's original synchronous
    // embed code. Do NOT use sandboxed srcdoc: it can prevent ad rendering.
    slot.appendChild(frame);
    slot.dataset.visible = "true";
  }
  function showAds() {
    if (adsMounted || savedChoice() !== "accepted") return;
    adsMounted = true;
    const a = config.adsterra, b = a.banners;
    const mobile = window.matchMedia("(max-width:720px)").matches;
    if (mobile) {
      if (b.mobile320x50.enabled) mountUnit(b.mobile320x50.placementId, "/ad-units/mobile-320x50.html", 320, 60, "Mobile advertisement");
    } else if (b.leaderboard728x90.enabled) {
      mountUnit(b.leaderboard728x90.placementId, "/ad-units/leaderboard-728x90.html", 728, 100, "Leaderboard advertisement");
    }
    if (b.rectangle300x250.enabled) mountUnit(b.rectangle300x250.placementId, "/ad-units/rectangle-300x250.html", 300, 260, "Advertisement");
  }
  function dismissDialog() {
    const dialog = document.getElementById("ad-consent");
    if (dialog) dialog.remove();
  }
  function choose(value) {
    const previous = savedChoice();
    persistChoice(value);
    dismissDialog();
    if (value === "accepted") showAds();
    else if (adsMounted || previous === "accepted") location.reload();
  }
  function openDialog() {
    dismissDialog();
    const dialog = document.createElement("section");
    dialog.id = "ad-consent";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-label", "Optional advertising preferences");
    const title = document.createElement("strong");
    title.textContent = "Advertising choices";
    dialog.append(title);
    const desc = document.createElement("p");
    desc.textContent = "With your permission, we show ads from Adsterra, which may use cookies and device data. You can browse jobs without ads. Your choice is remembered on this site.";
    dialog.append(desc);
    const privacyLink = document.createElement("a");
    privacyLink.href = "/privacy.html";
    privacyLink.textContent = "Privacy details";
    dialog.append(privacyLink);
    const actions = document.createElement("div");
    actions.className = "ad-consent-actions";
    const accept = document.createElement("button");
    accept.type = "button";
    accept.className = "accept";
    accept.textContent = "Accept ads";
    accept.addEventListener("click", () => choose("accepted"));
    const decline = document.createElement("button");
    decline.type = "button";
    decline.textContent = "Decline ads";
    decline.addEventListener("click", () => choose("declined"));
    actions.append(accept, decline);
    dialog.append(actions);
    document.body.appendChild(dialog);
  }
  document.getElementById("ad-settings")?.addEventListener("click", openDialog);
  const currentChoice = savedChoice();
  if (currentChoice === "accepted") showAds();
  else if (currentChoice !== "declined") openDialog();
})();
