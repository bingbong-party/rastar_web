import { cta, esc } from "../layout.mjs";

export default {
  file: "Projects.html",
  path: "/Projects",
  title: "Projects · 라별이 만든 현장 | 라별",
  description: "라별이 진행한 컨퍼런스, 대학 축제·OT, 기업 행사, 송년회, 워크숍, 세미나, 기념식, 팝업스토어 등 다양한 행사 프로젝트 사례를 확인해보세요.",
  body: (ctx) => `<section class="wrap page-head">
  <div class="row solo">
    <h1><span>projects we made</span></h1>
  </div>
</section>

<section class="wrap projects-list">
  <div class="project-grid" data-project-grid data-per-page="6">
${ctx.projects.map((p) => `    <article class="project-card">
      <a class="pc" href="${p.url}">
        <div class="pc-img">${ctx.thumbImg(p)}</div>
        <div class="pc-cap">
          <h2 class="pc-title">${esc(p.title)}</h2>
          <span class="pc-meta">${esc([p.client, p.year].filter(Boolean).join(" · "))}</span>
        </div>
      </a>
    </article>`).join("\n")}
  </div>
  <nav class="pager" data-pager aria-label="페이지"></nav>
</section>

${cta({ title: "ready to activate your brand?", text: "사람들의 참여를 이끌어 브랜드의 가치를 선명하게 각인시켜보세요" })}`,
};
