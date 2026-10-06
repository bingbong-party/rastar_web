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
  const [startDate, endDate] = String(p.date || "").split(" ~ ");
  const agency = { "@type": "Organization", name: "라별커뮤니케이션즈", alternateName: "Rastar Comms", url: `${SITE_ORIGIN}/` };

  const stage = first
    ? `<div class="stage" data-stage>
        <img src="${first.full}" alt="${esc(first.alt || p.title)}" fetchpriority="high">
        ${gallery.length > 1 ? `<span class="count" data-counter>01 / ${pad(gallery.length)}</span>
        <button type="button" class="nav prev" data-prev aria-label="이전 사진"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M10 3.5L5.5 8L10 12.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <button type="button" class="nav next" data-next aria-label="다음 사진"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 3.5L10.5 8L6 12.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>` : ""}
      </div>
      ${gallery.length > 1 ? `<div class="thumbs-wrap">
        <div class="thumbs" data-thumbs>
${gallery.map((g, i) => `          <button type="button" data-full="${g.full}" data-alt="${esc(g.alt || p.title)}" aria-label="사진 ${i + 1}" aria-current="${i === 0}"><img src="${g.thumb}" alt="" loading="lazy"></button>`).join("\n")}
        </div>
      </div>` : ""}`
    : `<div class="stage"><span class="ph">IMAGE</span></div>`;

  return {
    file: `projects/${p.id}.html`, // 배포 시 /projects/<id> 로 서비스됨
    path: p.url,
    title: `${p.title} | 라별`,
    description: p.summary || p.desc || "",
    image,
    // GEO: AI·검색 크롤러용 본문 전체 텍스트 버전 (화면에는 보이지 않음)
    extraHead: `<link rel="alternate" type="text/markdown" href="${p.url}.md" title="${esc(p.title)} (텍스트)">\n`,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: p.title,
        description: p.summary || "",
        ...(image ? { image } : {}),
        ...(p.client ? { sourceOrganization: { "@type": "Organization", name: p.client } } : {}),
        ...(startDate ? { dateCreated: startDate } : {}),
        ...(p.category ? { genre: p.category } : {}),
        creator: agency,
        url,
      },
      // GEO: 어떤 행사를 언제·어디서·누구를 위해 했는지 (행사 대행 실적)
      ...(startDate ? [{
        "@context": "https://schema.org",
        "@type": "Event",
        name: p.title,
        description: p.desc || p.summary || "",
        startDate,
        ...(endDate ? { endDate } : {}),
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        ...(p.venue || p.location ? { location: { "@type": "Place", name: p.venue || p.location, ...(p.location ? { address: p.location } : {}) } } : {}),
        ...(image ? { image } : {}),
        ...(p.client ? { organizer: { "@type": "Organization", name: p.client } } : {}),
        contributor: agency,
        url,
      }] : []),
    ],
    body: () => `<section class="wrap page-head">
  <div class="row solo">
    <div class="h1-like" aria-hidden="true"><span>detail</span></div>
  </div>
</section>

<div class="wrap detail-back"><a class="back" href="/Projects"><span aria-hidden="true">‹</span>back to projects</a></div>
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
  </div>
</div>

${cta({ title: "ready to make yours next?", text: "다음 현장, 라별이 함께 만들겠습니다." })}`,
  };
}
