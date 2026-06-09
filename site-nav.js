/* =====================================================================
   Rabyeol Comms — SHARED NAVIGATION (single source of truth)
   ---------------------------------------------------------------------
   This file is the ONE place to edit the site navigation. Every page
   loads it (before app.js) and the nav + mobile drawer are injected
   identically everywhere. Change a label or link here once → it updates
   on the landing page, Projects, and Blog at the same time.

   The current page's link is marked with aria-current="page" so it can
   be highlighted.

   NOTE on SEO/SSG: page CONTENT (headings, articles, footer links) stays
   in static HTML on every page. Only the repeated nav chrome is shared
   here. When you move to a static-site generator, this same block becomes
   a build-time partial that inlines into the HTML — identical structure.
   ===================================================================== */
(function () {
  "use strict";

  /* ---- 페이지 전환(@view-transition) promise 처리 ----
     크로스도큐먼트 전환이 빠른 이동 등으로 건너뛰어지면 viewTransition 의
     promise 들이 "Transition was skipped" 로 reject 된다. 여기서 .catch 로
     받아 주어 무해한 unhandledrejection 이 콘솔에 남지 않도록 한다. */
  function calmTransition(e) {
    var vt = e && e.viewTransition;
    if (!vt) return;
    if (vt.ready && vt.ready.catch) vt.ready.catch(function () {});
    if (vt.finished && vt.finished.catch) vt.finished.catch(function () {});
    if (vt.updateCallbackDone && vt.updateCallbackDone.catch) vt.updateCallbackDone.catch(function () {});
  }
  window.addEventListener("pagereveal", calmTransition);
  window.addEventListener("pageswap", calmTransition);
  window.addEventListener("unhandledrejection", function (e) {
    var m = e && e.reason && (e.reason.message != null ? e.reason.message : e.reason);
    if (typeof m === "string" && m.indexOf("Transition was skipped") >= 0) e.preventDefault();
  });

  /* ---- edit your menu items here ---- */
  var LINKS = [
    { href: "Projects.html", label: "projects", kr: "프로젝트" },
    { href: "Blog.html",     label: "insights", kr: "인사이트" }
  ];

  var HOME = "index.html";
  var current = (location.pathname.split("/").pop() || HOME);
  current = decodeURIComponent(current);
  if (current === "") current = HOME;

  function isActive(href) {
    return decodeURIComponent(href) === current;
  }

  var arrowSm = '<span class="arrow" aria-hidden="true"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg></span>';
  var arrowMd = '<span class="arrow" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg></span>';

  /* pages with no dark hero (e.g. article pages) declare
     <body data-nav="solid"> so the nav starts in its solid state. */
  var solid = document.body.getAttribute("data-nav") === "solid";

  var deskLinks = LINKS.map(function (l) {
    return '<a class="nav-link" href="' + l.href + '"' + (isActive(l.href) ? ' aria-current="page"' : '') + '>' + l.label + '</a>';
  }).join("\n      ");

  var drawerLinks = LINKS.map(function (l) {
    return '<a href="' + l.href + '"' + (isActive(l.href) ? ' aria-current="page"' : '') + '>' + l.label + '<span class="mm-kr">' + l.kr + '</span></a>';
  }).join("\n  ");

  var html =
    '<header class="nav' + (solid ? ' scrolled' : '') + '">\n' +
    '  <div class="container">\n' +
    '    <a class="brand" href="' + HOME + '" aria-label="Rabyeol Comms 홈">\n' +
    '      <img class="logo logo-white" src="images/logo-white.png" alt="Rabyeol Comms"><img class="logo logo-red" src="images/logo-red.png" alt="Rabyeol Comms">\n' +
    '    </a>\n' +
    '    <nav class="nav-links">\n      ' + deskLinks + '\n    </nav>\n' +
    '    <div class="nav-actions">\n' +
    '      <a class="btn btn-nav-cta" href="Contact.html">무료 상담하기 ' + arrowSm + '</a>\n' +
    '      <button class="nav-toggle" aria-label="메뉴 열기">\n' +
    '        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>\n' +
    '      </button>\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</header>\n' +
    '<div class="mobile-menu">\n  ' + drawerLinks + '\n' +
    '  <a class="btn btn-light" href="Contact.html">무료 상담하기 ' + arrowMd + '</a>\n' +
    '</div>';

  /* inject at the very top of <body> (nav is position:fixed, so DOM
     order doesn't affect layout — it always sits at the top visually) */
  var mount = document.currentScript;
  if (mount && mount.parentNode === document.body) {
    mount.insertAdjacentHTML("afterend", html);
  } else {
    document.body.insertAdjacentHTML("afterbegin", html);
  }
})();
