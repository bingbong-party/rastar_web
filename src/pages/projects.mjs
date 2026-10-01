import { cta, esc } from "../layout.mjs";

export default {
  file: "Projects.html",
  path: "/Projects.html",
  title: "Projects · 라별이 만든 현장 | 라별",
  description: "축제, 대학 OT, 컨퍼런스, 기념식, 팝업과 브랜드 이벤트까지. 라별이 기획하고 운영한 프로젝트를 소개합니다.",
  body: (ctx) => `<section class="wrap page-head">
  <div class="row">
    <div class="label">projects</div>
    <h1><span>what we made happen</span></h1>
  </div>
</section>

<section class="wrap projects-list">
  <div class="project-grid" data-project-grid data-per-page="6">
${ctx.projects.map((p) => `    <article class="project-card">
      <a class="thumb" href="${p.url}" aria-label="${esc(p.title)}">${ctx.thumbImg(p)}</a>
      <div class="text">
        <h2 class="title" style="margin:0"><a href="${p.url}">${esc(p.title)}</a></h2>
        <p class="desc">${esc(p.summary)}</p>
        ${p.client ? `<div class="client">client · ${esc(p.client)}</div>` : ""}
      </div>
    </article>`).join("\n")}
  </div>
  <nav class="pager" data-pager aria-label="페이지"></nav>
</section>

${cta({ title: "ready to activate your brand?", text: "사람들의 참여를 이끌어 브랜드의 가치를 선명하게 각인시켜보세요" })}`,
};
