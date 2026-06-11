/* =====================================================================
   Rabyeol Comms — SHARED FOOTER (single source of truth)
   ---------------------------------------------------------------------
   One place to edit the site footer. Each page drops a
   <script src="site-footer.js"></script> where the footer should appear
   and the markup below is injected in that exact spot. Change it here
   once → it updates on every page.

   Same SEO/SSG note as site-nav.js: when you move to a static-site
   generator this block becomes a build-time partial inlined into HTML.
   ===================================================================== */
(function () {
  "use strict";

  var html =
    '<footer class="footer" data-screen-label="Footer">\n' +
    '  <div class="container">\n' +
    '    <div class="footer-top">\n' +
    '      <div class="footer-brand-col">\n' +
    '        <span class="brand"><img class="logo logo-white" src="images/logo-white.png" alt="Rabyeol Comms"></span>\n' +
    '        <p class="footer-about">행사의 모든 순간을 한 단계 위로.<br>기획부터 현장 운영까지, 라별이 처음부터 끝까지 함께합니다.</p>\n' +
    '      </div>\n' +
    '      <div class="footer-legal">\n' +
    '        <p>주식회사 라별커뮤니케이션즈<span class="sep">|</span>이원석<span class="sep">|</span>130-86-30508</p>\n' +
    '        <p><a href="tel:0322622164">032-262-2164</a><span class="sep">|</span><a href="mailto:ws@rastarcomms.com">ws@rastarcomms.com</a></p>\n' +
    '        <p>인천광역시 서구 중봉대로 490, 893호 (청라더리브티아모)</p>\n' +
    '      </div>\n' +
    '    </div>\n' +
    '    <div class="footer-bottom">\n' +
    '      <span>© 2026 Rastar Comms. All rights reserved.</span>\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</footer>';

  /* inject the footer exactly where this <script> tag sits, so it keeps
     its place in document flow (after main content, before the modal). */
  var mount = document.currentScript;
  if (mount) {
    mount.insertAdjacentHTML("afterend", html);
  } else {
    document.body.insertAdjacentHTML("beforeend", html);
  }
})();
