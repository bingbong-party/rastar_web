/* btl / festival / mice 서비스 페이지.
   featured projects 는 Notion 의 Featured_Category 값이 일치하는 프로젝트로 채운다. */
import { cta, esc } from "../layout.mjs";

const PAGES = [
  {
    key: "btl",
    title: "BTL · 브랜드 액티베이션 | 라별",
    description: "팝업스토어, 신제품 론칭, 소비자 참여 이벤트와 샘플링 프로모션까지. 라별은 브랜드를 보는 것에서 직접 경험하는 것으로 바꾸는 BTL 행사를 기획·운영합니다.",
    en: "brand activation",
    kr: "브랜드를 보는 것에서, 직접 경험하는 것으로",
    create: [
      ["팝업스토어 및 브랜드 공간 체험", "신제품 론칭 및 제품 체험 행사"],
      ["소비자 참여 및 고객 초청 이벤트", "축제·스포츠·공연 연계 브랜드 프로모션"],
      ["샘플링 및 온사이트 판촉 프로모션"],
    ],
    elementsLabel: "engagement elements",
    h2: "보는 브랜드에서, 참여하는 브랜드로",
    lead: ["다양한 참여를 통해 브랜드를 직접 경험하게 하고, 그 가치를 선명하게 각인시킵니다.", "현장에서 만들어진 경험이 브랜드 인지도와 호감도를 높이고,", "자발적인 콘텐츠 확산과 구매 전환 등 실질적인 마케팅 성과로 이어지도록 설계합니다."],
    elements: [
      ["01", "제품 체험", "샘플링 · 시연 · 테스트 · 체험존", "제품을 직접 사용하고, 감각적으로 이해할 수 있는 경험을 만듭니다."],
      ["02", "참여 프로그램", "게임 · 미션 · 퀴즈 · 인터랙티브 콘텐츠", "관람객이 수동적인 방문자가 아닌 경험의 주인공이 되도록 참여를 이끕니다."],
      ["03", "콘텐츠 생성", "포토 · 영상 · 커스터마이징 · SNS 공유", "현장에서 만든 경험이 참가자의 콘텐츠가 되어 자연스럽게 확산되도록 합니다."],
      ["04", "행동 전환", "리워드 · 쿠폰 · 구매 · 회원가입", "현장에서 시작된 관심과 참여가 구매와 가입 등 다음 행동으로 이어지도록 연결합니다."],
    ],
    cta: { title: "ready to activate your brand?", text: "사람들의 참여를 이끌어 브랜드의 가치를 선명하게 각인시켜보세요" },
  },
  {
    key: "festival",
    title: "Festival · 축제 기획 및 운영 | 라별",
    description: "대학 축제, 지역·관광 연계 축제, 문화·공연 페스티벌까지. 라별은 콘셉트와 프로그램, 아티스트 섭외, 무대 연출과 관람객 운영을 하나의 흐름으로 설계합니다.",
    en: "festival planning & production",
    kr: "사람들이 모이는 순간을, 오래 기억되는 축제로",
    create: [
      ["대학 축제·캠퍼스 페스티벌", "지역·도시·관광 연계 축제"],
      ["문화·예술·공연 중심 페스티벌", "기업·브랜드 연계 대형 축제 및 이벤트"],
      ["시민·가족·커뮤니티 참여형 행사", "야외 공연·시즌 이벤트·테마 페스티벌"],
    ],
    elementsLabel: "festival elements",
    h2: "하루의 행사를 넘어, 하나의 장면으로 기억되도록",
    lead: ["축제의 목적과 지역·브랜드의 특성을 바탕으로 전체 콘셉트와 프로그램을 설계합니다.", "아티스트와 출연진 섭외부터 무대와 공간 연출, 관람객 동선과 현장 운영까지 하나의 흐름으로 연결해", "사람들이 자연스럽게 머물고 참여하며 오래 기억할 수 있는 축제 경험을 만듭니다."],
    elements: [
      ["01", "콘셉트·프로그램", "테마 · 스토리 · 공연 · 체험 · 부대 프로그램", "축제의 목적과 대상에 맞는 콘셉트를 설정하고, 메인 콘텐츠부터 부대 프로그램까지 전체 경험의 흐름을 설계합니다."],
      ["02", "아티스트·출연진 섭외", "연예인 · 뮤지션 · 퍼포머 · MC · 크리에이터", "축제의 콘셉트와 타깃에 맞는 연예인과 아티스트, 다양한 출연진을 섭외하고 프로그램과 유기적으로 연결합니다."],
      ["03", "공간·무대 연출", "무대 · LED · 부스 · 포토존 · 사인 · 동선", "축제의 분위기와 콘텐츠가 공간 전체에서 효과적으로 전달되도록 무대와 현장을 입체적으로 구성합니다."],
      ["04", "관람객·현장 운영", "입장 · 안내 · 인력 · 안전 · 협력사 · 현장 대응", "많은 관람객이 함께하는 현장에서도 안전하고 매끄러운 경험이 이어지도록 운영 전반을 세밀하게 관리합니다."],
    ],
    cta: { title: "ready to create a festival?", text: "콘텐츠와 아티스트, 공간과 관객이 하나로 연결되는 축제를 만들어보세요" },
  },
  {
    key: "mice",
    title: "MICE · 컨퍼런스·기업행사 | 라별",
    description: "컨퍼런스·포럼, 대학 오리엔테이션, 기업 워크숍과 인센티브 투어, 시상식까지. 라별은 프로그램부터 이동·체류, 의전과 현장 운영까지 목적에 맞는 MICE 경험을 완성합니다.",
    en: "meeting · incentive · convention · exhibition",
    kr: "목적이 분명한 만남을, 완성도 높은 비즈니스 경험으로",
    create: [
      ["컨퍼런스·포럼·세미나", "대학 오리엔테이션·신입생 캠프"],
      ["기업회의·워크숍·성과공유회", "인센티브 투어·기업 초청 여행"],
      ["국내외 참가자 숙박·수송·관광 프로그램", "시상식·갈라디너·네트워킹·공식행사"],
    ],
    elementsLabel: "mice elements",
    h2: "원활한 진행을 넘어, 목적이 성과로 이어지도록",
    lead: ["행사의 목적과 참가자 특성을 바탕으로 프로그램부터 이동과 체류, 공간과 현장 운영까지 체계적으로 설계합니다.", "초청과 등록, 숙박과 수송, 관광, VIP 및 연사 의전 등 참가자가 경험하는 모든 접점을 세심하게 연결해", "주최자에게는 안정적인 운영을, 참가자에게는 완성도 높은 비즈니스 경험을 제공합니다."],
    elements: [
      ["01", "프로그램 기획", "아젠다 · 세션 · 연사 · 네트워킹 · 공식행사", "행사 목적과 참가자 특성에 맞춰 전체 프로그램과 세션을 구성하고, 비즈니스와 교류가 자연스럽게 이어지도록 설계합니다."],
      ["02", "트래블·호스피탈리티", "호텔 · 항공 · 차량 · 관광 · 식음 · 인센티브 투어", "국내외 참가자의 이동부터 숙박, 식음, 관광 프로그램까지 일정 전반을 유기적으로 구성해 편리하고 완성도 높은 체류 경험을 제공합니다."],
      ["03", "참가자·의전 운영", "초청 · 등록 · VIP · 연사 · 안내 · 통역", "행사 전 안내부터 등록, VIP 및 연사 의전, 현장 안내까지 참가자와 주요 관계자의 모든 접점을 세심하게 관리합니다."],
      ["04", "공간·통합 운영", "무대 · 전시 · 시스템 · 인력 · 협력사 · 현장 대응", "행사 성격과 규모에 맞춰 공간을 구성하고, 다양한 협력사와 실행 요소를 하나의 운영 체계로 연결해 안정적으로 행사를 완성합니다."],
    ],
    cta: { title: "ready to make your event work?", text: "프로그램부터 이동과 체류, 현장 운영까지 목적에 맞는 MICE 경험을 완성해보세요" },
  },
];

function featuredSection(projects, ctx) {
  if (!projects.length) return "";
  return `<section class="wrap block">
  <div class="split">
    <h2 class="label" style="margin:0">featured projects</h2>
    <div class="featured-grid">
${projects.map((p) => `      <article class="featured-card">
        <a class="thumb" href="${p.url}" aria-label="${esc(p.title)}">${ctx.thumbImg(p)}</a>
        <a class="meta" href="${p.url}"><span class="t">${esc(p.title)}</span>${p.client || p.venue ? `<span class="sub">${esc([p.client, p.venue].filter(Boolean).join(" · "))}</span>` : ""}</a>
        <div class="more"><a href="${p.url}"><span>view project</span><span aria-hidden="true">↗</span></a></div>
      </article>`).join("\n")}
    </div>
  </div>
</section>`;
}

// 서비스 페이지: 상단 타이틀·elements 섹션을 블루로, CTA 는 밝은 띠로
const BLUE_HERO_TEST = new Set(["btl", "festival", "mice"]);

export default PAGES.map((pg) => ({
  file: `${pg.key}.html`,
  path: `/${pg.key}.html`,
  footerBordered: BLUE_HERO_TEST.has(pg.key),
  title: pg.title,
  description: pg.description,
  body: (ctx) => `${BLUE_HERO_TEST.has(pg.key) ? '<div class="svc-hero" data-dark-head>' : ""}<section class="wrap svc-head">
  <div class="row">
    <h1><span>${esc(pg.key)}</span></h1>
    <div class="sub">
      <div class="en">${esc(pg.en)}</div>
      <div class="kr">${esc(pg.kr)}</div>
    </div>
  </div>
</section>${BLUE_HERO_TEST.has(pg.key) ? "</div>" : ""}

<section class="wrap block">
  <div class="split">
    <h2 class="label" style="margin:0">what we create</h2>
    <div class="create-grid">
${pg.create.map((c) => `      <div>${c.map(esc).join("<br>")}</div>`).join("\n")}
    </div>
  </div>
</section>

${featuredSection(ctx.featured(pg.key, 3), ctx)}

${BLUE_HERO_TEST.has(pg.key)
  ? '<div class="svc-dark" data-dark-head>'
  : '<div class="wrap" style="margin-top:clamp(40px,5vw,85px)"><div class="divider" aria-hidden="true"></div></div>'}
<section class="wrap elements-intro">
  <div class="split">
    <div class="label">${esc(pg.elementsLabel)}</div>
    <div>
      <h2 class="lead-h2">${esc(pg.h2)}</h2>
      <p class="lead-p">${pg.lead.map(esc).join(" <br>")}</p>
    </div>
  </div>
</section>
<section class="wrap elements-list">
  <div class="split">
    <div></div>
    <div class="elements">
${pg.elements.map(([no, title, tags, desc]) => `      <div class="element">
        <div class="head"><span class="no">${no}</span><h3 class="title" style="margin:0;font-size:inherit">${esc(title)}</h3></div>
        <div class="tags">${tags.split(" · ").map((t) => `<span>${esc(t)}</span>`).join("")}</div>
        <p class="desc" style="margin-bottom:0">${esc(desc)}</p>
      </div>`).join("\n")}
    </div>
  </div>
</section>${BLUE_HERO_TEST.has(pg.key) ? "</div>" : ""}

${cta({ ...pg.cta, light: BLUE_HERO_TEST.has(pg.key) })}`,
}));
