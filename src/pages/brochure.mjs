/* 서비스 소개서 뷰어: PDF.js 로 페이지를 캔버스에 그린다. 실패 시 다운로드 링크를 안내한다. */
const PDF = "/assets/docs/rastar-service-introduction.pdf";

export default {
  file: "brochure.html",
  path: "/brochure.html",
  title: "서비스 소개서 | 라별",
  description: "라별커뮤니케이션즈 서비스 소개서. BTL·페스티벌·MICE 행사 기획과 운영, 주요 프로젝트를 한눈에 확인하세요.",
  bareBody: true,
  htmlClass: "brochure-page",
  body: () => `<div class="viewer">
  <div class="viewer-bar">
    <div class="title"><a href="/" aria-label="라별 홈">← rastar</a><span>라별커뮤니케이션즈 서비스소개서</span></div>
    <a class="dl" href="${PDF}" download="라별커뮤니케이션즈 서비스소개서.pdf">PDF 다운로드</a>
  </div>
  <div class="viewer-scroll">
    <div class="viewer-status" data-status>소개서를 불러오는 중…</div>
    <div class="viewer-pages" data-pages></div>
  </div>
</div>
<script type="module">
const host = document.querySelector("[data-pages]");
const status = document.querySelector("[data-status]");
let doc, token = 0;
async function renderAll() {
  const my = ++token;
  const maxW = Math.min(host.clientWidth - 32, 1600);
  const dpr = window.devicePixelRatio || 1;
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    if (my !== token) return;
    const base = page.getViewport({ scale: 1 });
    const scale = maxW / base.width;
    const vp = page.getViewport({ scale: scale * dpr });
    const c = document.createElement("canvas");
    c.width = vp.width; c.height = vp.height;
    c.style.width = base.width * scale + "px";
    c.style.height = base.height * scale + "px";
    if (i === 1) host.replaceChildren();
    host.appendChild(c);
    await page.render({ canvasContext: c.getContext("2d"), viewport: vp }).promise;
    if (i === 1) status.hidden = true;
  }
}
try {
  const pdfjs = await import("https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.min.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs";
  doc = await pdfjs.getDocument("${PDF}").promise;
  await renderAll();
  let t;
  let lastW = host.clientWidth;
  window.addEventListener("resize", () => {
    clearTimeout(t);
    t = setTimeout(() => { if (host.clientWidth !== lastW) { lastW = host.clientWidth; renderAll(); } }, 200);
  });
} catch (e) {
  console.error(e);
  status.innerHTML = '소개서를 불러오지 못했습니다. <a href="${PDF}" download>PDF 다운로드</a>를 이용해 주세요.';
}
</script>`,
};
