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
  home.href = english ? "about-en.html" : "./#home";
  home.setAttribute("aria-label", english ? "KiDD home" : "KiDD 홈으로");
  home.title = english ? "Home" : "홈으로";
  home.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10l9-7 9 7M5 9v12h5v-7h4v7h5V9"/></svg><span>' + (english ? "Home" : "홈으로") + '</span>';
  home.addEventListener("click", function (event) {
    if ((location.pathname.endsWith("/") || location.pathname.endsWith("/index.html")) && location.hash === "#home") {
      event.preventDefault();
      top.click();
    }
  });
  nav.appendChild(top);
  nav.appendChild(home);
  document.body.appendChild(nav);
  // 첫 화면 꼭대기에서는 숨기고, 조금 내려가면 나타나게 합니다.
  var sync = function () { nav.classList.toggle("is-hidden", window.scrollY < 320); };
  window.addEventListener("scroll", sync, {passive:true});
  window.addEventListener("hashchange", function () { setTimeout(sync, 60); });
  sync();
})();
