/* 프로젝트 상세 페이지 (projects/<id>.html) */
import { SITE_ORIGIN, cta, esc } from "./layout.mjs";

function paragraphs(text) {
  return String(text || "")
    .split(/\n\s*\n|\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function projectPage(p, ctx) {
  const gallery = p.gallery;
  const first = gallery[0];
  const pad = (n) => String(n).padStart(2, "0");
  const specs = [
    ["client", p.client],
    ["venue", p.venue || p.location],
    ["year", p.year],
  ].filter(([, v]) => v);
  const image = first ? `${SITE_ORIGIN}${first.full}` : undefined;
  const url = `${SITE_ORIGIN}${p.url}`;

  const stage = first
    ? `<div class="stage" data-stage>
        <img src="${first.full}" alt="${esc(p.title)}" fetchpriority="high">
        ${gallery.length > 1 ? `<span class="count" data-counter>01 / ${pad(gallery.length)}</span>
        <button type="button" class="nav prev" data-prev aria-label="이전 사진"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M10 3.5L5.5 8L10 12.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <button type="button" class="nav next" data-next aria-label="다음 사진"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 3.5L10.5 8L6 12.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>` : ""}
      </div>
      ${gallery.length > 1 ? `<div class="thumbs-wrap">
        <div class="thumbs" data-thumbs>
${gallery.map((g, i) => `          <button type="button" data-full="${g.full}" aria-label="사진 ${i + 1}" aria-current="${i === 0}"><img src="${g.thumb}" alt="" loading="lazy"></button>`).join("\n")}
        </div>
      </div>` : ""}`
    : `<div class="stage"><span class="ph">IMAGE</span></div>`;

  return {
    file: `projects/${p.id}.html`,
    path: p.url,
    title: `${p.title} | 라별`,
    description: p.summary || p.desc || "",
    image,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: p.title,
      description: p.summary || "",
      ...(image ? { image } : {}),
      ...(p.client ? { sourceOrganization: { "@type": "Organization", name: p.client } } : {}),
      ...(p.date ? { dateCreated: p.date.split(" ~ ")[0] } : {}),
      creator: { "@type": "Organization", name: "라별커뮤니케이션즈", url: `${SITE_ORIGIN}/` },
      url,
    },
    body: () => `<section class="wrap page-head">
  <div class="row solo">
    <div class="h1-like" aria-hidden="true"><span>rastar projects</span></div>
  </div>
</section>

<div class="wrap detail">
  <div class="gallery">
      ${stage}
  </div>
  <div class="info-col">
    <article class="detail-info">
      <h1>${esc(p.title)}</h1>
      ${p.summary ? `<p class="lead">${esc(p.summary)}</p>` : ""}
      <div class="body">${paragraphs(p.desc).map((t) => `<p>${esc(t)}</p>`).join("")}</div>
      ${specs.length ? `<dl class="specs">${specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>` : ""}
    </article>
    <a class="back" href="/Projects.html"><span aria-hidden="true">‹</span>back to projects</a>
  </div>
</div>

${cta({ title: "ready to make yours next?", text: "다음 현장, 라별이 함께 만들겠습니다." })}`,
  };
}
