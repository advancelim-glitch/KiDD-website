/* Shared page controls: keep outside the SPA's replaceable main content. */
(function () {
  "use strict";
  if (document.getElementById("kidd-page-controls")) return;
  var english = document.documentElement.lang.indexOf("en") === 0;
  var style = document.createElement("style");
  style.textContent = `
    body { padding-bottom: calc(136px + env(safe-area-inset-bottom, 0px)); }
    #kidd-page-controls { position:fixed; right:calc(12px + env(safe-area-inset-right, 0px)); bottom:calc(14px + env(safe-area-inset-bottom, 0px)); z-index:1000; display:flex; flex-direction:column; gap:8px; }
    #kidd-page-controls .kidd-page-control { box-sizing:border-box; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; width:52px; min-height:52px; padding:6px 3px; border:1px solid #ced5df; border-radius:12px; background:#fff; color:#1f2f52; box-shadow:0 2px 10px #15243b20; font:600 11px/1.3 system-ui,-apple-system,"Apple SD Gothic Neo",sans-serif; text-decoration:none; cursor:pointer; -webkit-tap-highlight-color:transparent; }
    #kidd-page-controls .kidd-page-control:hover { background:#eef2f8; border-color:#8194b0; }
    #kidd-page-controls .kidd-page-control:focus-visible { outline:3px solid #2f4f93; outline-offset:3px; }
    #kidd-page-controls .kidd-page-control[hidden] { display:none; }
    #kidd-page-controls svg { width:21px; height:21px; flex:none; }
    #kidd-page-controls { transition:opacity .25s ease, transform .25s ease; }
    #kidd-page-controls.is-hidden { opacity:0; transform:translateY(12px); pointer-events:none; }
    @media(max-width:640px) {
      #kidd-page-controls { gap:6px; right:calc(8px + env(safe-area-inset-right, 0px)); }
      #kidd-page-controls .kidd-page-control { width:44px; min-height:44px; padding:4px 2px; font-size:10px; background:rgba(255,255,255,.88); -webkit-backdrop-filter:blur(4px); backdrop-filter:blur(4px); }
      #kidd-page-controls svg { width:18px; height:18px; }
    }
    @media(min-width:1000px) { #kidd-page-controls { right:24px; bottom:24px; } }
    @media print { #kidd-page-controls { display:none; } body { padding-bottom:0; } }
  `;
  document.head.appendChild(style);
  var nav = document.createElement("nav");
  nav.id = "kidd-page-controls";
  nav.setAttribute("aria-label", english ? "Page navigation" : "빠른 페이지 이동");
  var top = document.createElement("button");
  top.type = "button";
  top.className = "kidd-page-control";
  top.setAttribute("aria-label", english ? "Back to top" : "페이지 맨 위로");
  top.title = english ? "Back to top" : "맨 위로";
  top.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h14M12 20V8M6 14l6-6 6 6"/></svg><span>' + (english ? "Top" : "맨 위로") + '</span>';
  top.addEventListener("click", function () {
    window.scrollTo({top:0, left:0, behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"});
  });
  var home = document.createElement("a");
  home.className = "kidd-page-control";
  home.href = english ? "/about-en.html" : "/#home";
  home.setAttribute("aria-label", english ? "KiDD home" : "KiDD 홈으로");
  home.title = english ? "Home" : "홈으로";
  home.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10l9-7 9 7M5 9v12h5v-7h4v7h5V9"/></svg><span>' + (english ? "Home" : "홈으로") + '</span>';
  home.addEventListener("click", function (event) {
    if ((location.pathname.endsWith("/") || location.pathname.endsWith("/index.html")) && location.hash === "#home") {
      event.preventDefault();
      top.click();
    }
  });
  // 목차가 있는 페이지(토론방 등)에서는 '목차' 버튼을 함께 보여 줍니다.
  var toc = document.createElement("button");
  toc.type = "button";
  toc.className = "kidd-page-control";
  toc.hidden = true;
  toc.setAttribute("aria-label", english ? "Back to contents" : "목차로 이동");
  toc.title = english ? "Contents" : "목차로";
  toc.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg><span>' + (english ? "Contents" : "목차") + '</span>';
  var visibleToc = function () {
    var list = document.querySelectorAll("[data-kidd-toc]");
    for (var i = 0; i < list.length; i++) { if (list[i].offsetParent !== null) return list[i]; }
    return null;
  };
  toc.addEventListener("click", function () {
    var t = visibleToc(); if (!t) return;
    t.scrollIntoView({block:"start", behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"});
  });
  nav.appendChild(toc);
  nav.appendChild(top);
  nav.appendChild(home);
  // Shared attribution and rights notice, including future pages that load this script.
  if (!document.getElementById("kidd-rights-notice")) {
    var rights = document.createElement("aside");
    rights.id = "kidd-rights-notice";
    rights.setAttribute("aria-label", english ? "Image and material rights notice" : "사진 및 자료 이용 안내");
    rights.style.cssText = "max-width:900px;margin:32px auto 120px;padding:18px 22px;border-top:1px solid #dfe3ea;color:#626b78;font-size:.83rem;line-height:1.8;box-sizing:border-box";
    if (english) {
      rights.innerHTML = '<strong>Image and material rights notice</strong><p>KiDD presents images and materials for nonprofit academic research and public information. Copyright remains with the respective rights holders. Sources and credits are provided where identifiable. Rights holders may contact KiDD to request review or removal; we will review the request and take appropriate action promptly. This notice does not itself grant permission to reuse copyrighted works.</p>';
    } else {
      rights.innerHTML = '<strong>사진 및 자료 이용 안내</strong><p>한국숙의민주주의연구소(KiDD)는 비영리 학술연구와 공익적 정보 제공을 목적으로 사진 및 자료를 소개합니다. 저작권은 원저작자와 해당 권리자에게 있으며, 확인 가능한 출처와 제공기관을 명시합니다. 권리자가 이용에 이의를 제기하거나 삭제를 요청하면 내용을 확인하고 필요한 조치를 신속하게 취하겠습니다. 이 안내는 저작물의 이용 허락을 대신하지 않습니다.</p>';
    }
    var footer = document.querySelector("footer");
    if (footer) footer.parentNode.insertBefore(rights, footer);
    else document.body.appendChild(rights);
  }
  document.body.appendChild(nav);
  // 첫 화면 꼭대기에서는 숨기고, 조금 내려가면 나타나게 합니다.
  var sync = function () {
    var hasToc = !!visibleToc();
    toc.hidden = !hasToc;
    // 토론방처럼 목차가 있는 화면은 들어서자마자 보이게 하고, 그 밖에는 조금 내려가면 나타납니다.
    // 짧은 페이지에서도 나타나도록, 숨김 기준을 페이지 길이에 맞춰 줄입니다.
    var maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    var threshold = Math.min(320, maxScroll * 0.4);
    var charterPage = /\/(?:charter|charter-en|charter-deliberation)\.html$/.test(window.location.pathname);
    nav.classList.toggle("is-hidden", !charterPage && !hasToc && window.scrollY < threshold);
  };
  window.addEventListener("scroll", sync, {passive:true});
  window.addEventListener("hashchange", function () { setTimeout(sync, 60); });
  window.addEventListener("resize", sync);
  sync();
})();
