/* 서비스 소개서 뷰어: 브라우저 기본 PDF 뷰어(크롬·엣지·파이어폭스·사파리 내장)로 띄운다.
   페이지 안에서 PDF 를 열 수 없는 브라우저(일부 모바일)는 열기/다운로드 안내를 보여준다. */
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
    <div class="viewer-actions">
      <a class="dl" href="${PDF}" target="_blank" rel="noopener">새 창에서 열기</a>
      <a class="dl" href="${PDF}" download="라별커뮤니케이션즈 서비스소개서.pdf">PDF 다운로드</a>
    </div>
  </div>
  <div class="viewer-frame" data-frame>
    <iframe src="${PDF}#view=FitH" title="라별커뮤니케이션즈 서비스소개서"></iframe>
  </div>
  <div class="viewer-status" data-fallback hidden>
    이 브라우저에서는 소개서를 페이지 안에서 바로 열 수 없어요.<br>
    <a href="${PDF}" target="_blank" rel="noopener">PDF 열기</a> 또는 <a href="${PDF}" download="라별커뮤니케이션즈 서비스소개서.pdf">다운로드</a>로 확인해 주세요.
  </div>
</div>
<script>
  // 내장 PDF 뷰어가 없다고 알려주는 브라우저(navigator.pdfViewerEnabled === false)는 안내로 대체
  if (navigator.pdfViewerEnabled === false) {
    document.querySelector("[data-frame]").hidden = true;
    document.querySelector("[data-fallback]").hidden = false;
  }
</script>`,
};
