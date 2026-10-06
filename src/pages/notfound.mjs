/* 404 페이지. Cloudflare Pages 는 404.html 이 있으면 없는 주소에 이 페이지를 404 상태로 돌려준다.
   (없으면 모든 주소에 메인 페이지를 200 으로 돌려줘 검색엔진이 중복 페이지로 볼 수 있다) */
export default {
  file: "404.html",
  path: "/404",
  title: "페이지를 찾을 수 없어요 | 라별",
  description: "요청하신 페이지를 찾을 수 없습니다.",
  noindex: true,
  extraHead: `<meta name="robots" content="noindex">\n`,
  body: () => `<section class="wrap page-head notfound">
  <div class="row solo">
    <h1><span>page not found</span></h1>
  </div>
  <p class="notfound-text">요청하신 페이지를 찾을 수 없어요.<br>주소가 바뀌었거나 삭제된 페이지일 수 있어요.</p>
  <div class="notfound-links">
    <a class="btn-cta" href="/">메인으로</a>
    <a class="notfound-sub" href="/Projects">프로젝트 보기 ↗</a>
  </div>
</section>`,
};
