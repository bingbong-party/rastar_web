/* =====================================================================
   공통 레이아웃 / 파셜 (헤더, 전체 메뉴, CTA, 푸터)
   scripts/build-pages.mjs 가 src/pages/*.mjs 의 본문을 이 레이아웃에 끼워
   루트에 정적 HTML 로 써낸다. 모든 자산 경로는 루트 절대경로(/...)를 쓴다.
   ===================================================================== */

export const SITE_ORIGIN = "https://rastarcomms.com";
export const SITE_NAME = "라별";
export const DEFAULT_DESCRIPTION =
  "라별은 브랜드 액티베이션·페스티벌·MICE 행사를 기획부터 공간 연출, 현장 운영까지 하나의 흐름으로 설계하는 전문 행사 솔루션 에이전시입니다.";
export const DEFAULT_IMAGE = `${SITE_ORIGIN}/assets/img/og.jpg`;
export const ASSET_VERSION = "20261002-2";

export function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])
  );
}

function head({ title, description, canonical, image, jsonLd, extraHead = "" }) {
  const ld = (jsonLd ? [].concat(jsonLd) : [])
    .map((d) => `<script type="application/ld+json">\n${JSON.stringify(d, null, 2)}\n</script>`)
    .join("\n");
  return `<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/assets/img/favicon-16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/assets/img/apple-touch-icon.png">
<meta property="og:type" content="website">
<meta property="og:locale" content="ko_KR">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(image)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(image)}">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="/assets/css/site.css?v=${ASSET_VERSION}">
${extraHead}${ld}`;
}

export function header({ home = false } = {}) {
  return `<header class="site-header${home ? " is-home" : ""}">
  <div class="bar">
    <a class="logo" href="/" aria-label="라별 홈"><img class="logo-dark" src="/assets/img/rastar-logo-blue.png" alt="rastar" width="481" height="104"><img class="logo-light" src="/assets/img/rastar-logo-light.png" alt="" width="481" height="104"></a>
    <div class="header-actions">
      <button type="button" class="btn-pill" data-contact>contact<span class="arr" aria-hidden="true">↗</span></button>
      <button type="button" class="burger" data-menu-open aria-label="메뉴 열기" aria-controls="site-menu"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>`;
}

export function menu() {
  return `<div class="menu" id="site-menu" hidden>
  <div class="menu-top">
    <a class="logo" href="/" aria-label="라별 홈"><img src="/assets/img/rastar-logo-light.png" alt="rastar" width="481" height="104"></a>
    <div class="header-actions">
      <button type="button" class="btn-pill" data-contact>contact<span class="arr" aria-hidden="true">↗</span></button>
      <button type="button" class="menu-close" data-menu-close aria-label="메뉴 닫기"><span></span><span></span></button>
    </div>
  </div>
  <nav class="menu-body" aria-label="전체 메뉴">
    <div class="menu-cols">
      <div class="menu-col">
        <div class="menu-label">what we do</div>
        <div class="menu-links main">
          <a href="/btl.html">btl</a>
          <a href="/festival.html">festival</a>
          <a href="/mice.html">mice</a>
        </div>
      </div>
      <div class="menu-col right">
        <div class="menu-links sub">
          <a href="/about.html">about</a>
          <a href="/Projects.html">projects</a>
          <a href="/faq.html">faq</a>
        </div>
      </div>
    </div>
    <div class="menu-foot">
      <img class="menu-symbol" src="/assets/img/rastar-symbol-light.png" alt="" aria-hidden="true" width="180" height="180">
      <div class="menu-actions">
        <a class="menu-brochure" href="/assets/docs/rastar-service-introduction.pdf" target="_blank" rel="noopener">서비스 소개서 다운로드</a>
      </div>
    </div>
  </nav>
</div>`;
}

export function cta({ title, text, button = "프로젝트 문의하기", light = false }) {
  return `<section class="cta${light ? " cta-light" : ""}"${light ? "" : " data-dark-head"}>
  <div class="wrap">
    <h2>${esc(title)}</h2>
    <p>${esc(text)}</p>
    <div class="actions">
      <button type="button" class="btn-cta" data-contact>${esc(button)}</button>
    </div>
  </div>
</section>`;
}

export function footer({ bordered = false } = {}) {
  return `<footer class="site-footer${bordered ? " bordered" : ""}">
  <div class="wrap">
    <div class="grid">
      <div>
        <img class="footer-logo" src="/assets/img/rastar-logo-blue.png" alt="rastar" width="481" height="104">
        <p class="tagline">행사의 모든 순간을 한 단계 위로.<br>기획부터 현장 운영까지, 라별이 처음부터 끝까지 함께합니다.</p>
      </div>
      <address class="info">
        <div class="line"><span>주식회사 라별커뮤니케이션즈</span><span class="sep">|</span><span>이원석</span><span class="sep">|</span><span>130-86-30508</span></div>
        <div class="line"><a href="tel:032-262-2164">032-262-2164</a><span class="sep">|</span><a href="mailto:ws@rastarcomms.com">ws@rastarcomms.com</a></div>
        <div>인천광역시 서구 중봉대로 490, 893호 (청라더리브티아모)</div>
      </address>
    </div>
    <div class="copy">© 2026 Rastar Comms. All rights reserved.</div>
  </div>
</footer>`;
}

/* 페이지 전체 HTML */
export function layout({
  path, // "/" 또는 "/about.html" 처럼 루트 기준 URL 경로
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  jsonLd,
  body,
  home = false,
  bareBody = false, // 헤더/메뉴/푸터 없이 본문만 (브로슈어 뷰어 등)
  htmlClass = "",
  extraHead = "",
  footerBordered = false,
}) {
  const canonical = `${SITE_ORIGIN}${path}`;
  const inner = bareBody
    ? body
    : `${header({ home })}
<main>
${body}
</main>
${footer({ bordered: footerBordered })}
${menu()}`;
  return `<!DOCTYPE html>
<html lang="ko"${htmlClass ? ` class="${htmlClass}"` : ""}>
<head>
${head({ title, description, canonical, image, jsonLd, extraHead })}
</head>
<body>
${inner}
<script src="/assets/js/site.js?v=${ASSET_VERSION}" defer></script>
</body>
</html>
`;
}
