/* KiDD 장문 리뷰 페이지 공통 읽기 도구 (OECD 보고서 리뷰 연재용)
   - 읽기 진행 막대, 떠 있는 '차례' 버튼(현재 절 표시), 예상 읽기 시간
   - 모바일: table.cards → 카드형, table.scroll → 가로 스크롤 */
(function () {
  "use strict";
  var css = `
  #rv-progress{position:fixed;top:0;left:0;height:4px;width:0;background:linear-gradient(90deg,#2f4f93,#9b4a64);z-index:1100;transition:width .1s linear}
  #rv-toc-btn{position:fixed;left:calc(12px + env(safe-area-inset-left,0px));bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:1000;display:flex;align-items:center;gap:8px;max-width:calc(100vw - 100px);padding:10px 14px;border:1px solid #ced5df;border-radius:99px;background:#1f2f52;color:#fff;box-shadow:0 4px 14px #15243b40;font:600 14px/1.3 system-ui,"Apple SD Gothic Neo",sans-serif;cursor:pointer}
  #rv-toc-btn span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500;opacity:.85}
  #rv-sheet{position:fixed;inset:0;z-index:1200;display:none;background:#0d1626a6}
  #rv-sheet.open{display:block}
  #rv-sheet nav{position:absolute;left:0;right:0;bottom:0;max-height:78vh;overflow:auto;background:#fff;border-radius:18px 18px 0 0;padding:18px 18px calc(18px + env(safe-area-inset-bottom,0px));box-shadow:0 -6px 24px #0003}
  #rv-sheet h4{margin:0 0 10px;color:#1f2f52;font-size:16px;display:flex;justify-content:space-between;align-items:center}
  #rv-sheet h4 button{border:0;background:#eef0f5;border-radius:99px;width:34px;height:34px;font-size:18px;cursor:pointer}
  #rv-sheet a{display:block;padding:11px 12px;border-radius:10px;text-decoration:none;color:#1f2f52;font-size:16px;line-height:1.45}
  #rv-sheet a.on{background:#fff0f4;color:#9b4a64;font-weight:700}
  @media(min-width:1100px){#rv-sheet nav{left:auto;right:24px;bottom:80px;width:340px;border-radius:16px}}
  .rv-meta{display:inline-block;margin:4px 0 0;font-size:13px;color:#9b4a64;font-weight:700}
  .rv-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:12px 0}
  .rv-scroll table{min-width:620px;margin:0}
  .rv-hint{display:none;font-size:12px;color:#5d636d;margin:4px 0 0}
  .rv-next{display:grid;gap:10px;margin:28px 0}
  .rv-next a{display:block;padding:14px 18px;border:1px solid #dfe3e9;border-radius:12px;text-decoration:none;color:#1f2f52;background:#fbfcfe}
  .rv-next a small{display:block;color:#5d636d;font-size:12px}
  @media(max-width:640px){
    .rv-hint{display:block}
    table.cards,table.cards tbody,table.cards tr,table.cards td{display:block;width:100%}
    table.cards tr:first-child{display:none}
    table.cards tr{border:1px solid #e1e4ea;border-radius:12px;margin:0 0 12px;padding:6px 12px;background:#fff}
    table.cards td{border:0;border-bottom:1px dashed #e6e8ee;padding:8px 0}
    table.cards td:last-child{border-bottom:0}
    table.cards td::before{content:attr(data-label);display:block;font-size:12px;font-weight:700;color:#9b4a64;margin-bottom:2px}
    table.cards td.no::before{display:none}
  }`;
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  var main = document.querySelector("main"); if (!main) return;

  /* 예상 읽기 시간 (한국어 분당 약 500자 기준) */
  var chars = main.innerText.replace(/\s/g, "").length;
  var mins = Math.max(1, Math.round(chars / 500));
  var lead = main.querySelector(".lead");
  if (lead) { var m = document.createElement("span"); m.className = "rv-meta"; m.textContent = "읽는 시간 약 " + mins + "분 · 아래 ‘차례’ 버튼으로 원하는 절로 바로 이동"; lead.insertAdjacentElement("afterend", m); }

  /* 모바일 표: 카드형 라벨 붙이기, 가로 스크롤 감싸기 */
  main.querySelectorAll("table.cards").forEach(function (t) {
    var heads = Array.prototype.map.call(t.rows[0].cells, function (c) { return c.innerText.trim(); });
    Array.prototype.slice.call(t.rows, 1).forEach(function (r) {
      Array.prototype.forEach.call(r.cells, function (c, i) { c.setAttribute("data-label", heads[i] || ""); });
    });
  });
  main.querySelectorAll("table.scroll").forEach(function (t) {
    var w = document.createElement("div"); w.className = "rv-scroll"; t.parentNode.insertBefore(w, t); w.appendChild(t);
    var h = document.createElement("p"); h.className = "rv-hint"; h.textContent = "← 표를 옆으로 밀어 보세요 →"; w.insertAdjacentElement("beforebegin", h);
  });

  /* 차례 시트 */
  var heads = Array.prototype.filter.call(main.querySelectorAll("h2[id]"), function (h) { return h.id; });
  if (!heads.length) return;
  var bar = document.createElement("div"); bar.id = "rv-progress"; document.body.appendChild(bar);
  var btn = document.createElement("button"); btn.id = "rv-toc-btn"; btn.type = "button";
  btn.innerHTML = '☰ 차례 <span></span>'; btn.setAttribute("aria-haspopup", "dialog"); document.body.appendChild(btn);
  var sheet = document.createElement("div"); sheet.id = "rv-sheet"; sheet.setAttribute("role", "dialog"); sheet.setAttribute("aria-label", "차례");
  var nav = document.createElement("nav");
  nav.innerHTML = '<h4>차례 <button type="button" aria-label="닫기">×</button></h4>' +
    heads.map(function (h) { return '<a href="#' + h.id + '">' + h.textContent.replace(/</g, "&lt;") + "</a>"; }).join("");
  sheet.appendChild(nav); document.body.appendChild(sheet);
  function close() { sheet.classList.remove("open"); btn.focus(); }
  btn.onclick = function () { sheet.classList.add("open"); var on = nav.querySelector("a.on") || nav.querySelector("a"); on && on.focus(); };
  sheet.onclick = function (e) { if (e.target === sheet || e.target.closest("h4 button")) close(); else if (e.target.closest("a")) sheet.classList.remove("open"); };
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && sheet.classList.contains("open")) close(); });

  var label = btn.querySelector("span"), links = nav.querySelectorAll("a");
  function update() {
    var d = document.documentElement, max = d.scrollHeight - d.clientHeight;
    bar.style.width = (max > 0 ? (d.scrollTop / max) * 100 : 0) + "%";
    var cur = -1;
    heads.forEach(function (h, i) { if (h.getBoundingClientRect().top < 120) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle("on", i === cur); });
    label.textContent = cur >= 0 ? heads[cur].textContent.replace(/^(\d+)\.\s*/, "$1. ").slice(0, 22) : "";
  }
  window.addEventListener("scroll", update, { passive: true }); update();
})();
