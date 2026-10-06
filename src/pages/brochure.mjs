/* 서비스 소개서: 사이트의 소개서 버튼은 PDF 를 새 탭에서 바로 연다(브라우저 기본 뷰어).
   이 페이지는 예전 링크(/brochure.html)로 들어온 경우 PDF 로 넘겨주는 용도만 남긴다. */
export const BROCHURE_PDF = "/assets/docs/rastar-service-introduction.pdf";

export default {
  file: "brochure.html",
  path: "/brochure",
  title: "서비스 소개서 | 라별",
  description: "라별커뮤니케이션즈 서비스 소개서",
  bareBody: true,
  noindex: true,
  extraHead: `<meta name="robots" content="noindex">\n<meta http-equiv="refresh" content="0; url=${BROCHURE_PDF}">\n`,
  body: () => `<script>location.replace("${BROCHURE_PDF}");</script>
<p style="padding:40px 20px;text-align:center"><a href="${BROCHURE_PDF}">서비스 소개서 열기</a></p>`,
};
