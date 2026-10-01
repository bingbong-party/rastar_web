import { SITE_ORIGIN, DEFAULT_DESCRIPTION, DEFAULT_IMAGE, esc } from "../layout.mjs";

const SERVICES = [
  {
    name: "btl", href: "/btl.html", en: "brand activation", tag: "브랜드가 사람을 만나는 가장 생생한 방식",
    body: ["팝업스토어, 프로모션, 론칭 이벤트와 로드쇼까지.", "브랜드의 메시지를 일방적인 노출이 아닌 사람들의 참여와 행동으로 이어지는 경험으로 만듭니다."],
  },
  {
    name: "festival", href: "/festival.html", en: "culture & live experience", tag: "수많은 에너지가 하나의 장면이 되는 순간",
    body: ["음악·문화·스포츠·지역 축제 등 다양한 사람들이 함께 즐기는 현장을 만듭니다.", "프로그램 기획부터 공간 연출, 관객 동선과 운영까지 축제의 모든 순간을 설계합니다."],
  },
  {
    name: "mice", href: "/mice.html", en: "meeting & business event", tag: "비즈니스의 다음을 연결하는 자리",
    body: ["컨퍼런스, 포럼, 전시, 시상식과 기업행사를 기획합니다.", "메시지는 정확하게 전달되고 새로운 관계와 가능성은 자연스럽게 이어지는 비즈니스 경험을 만듭니다."],
  },
];

export default {
  file: "index.html",
  path: "/",
  title: "라별 | 행사를 넘어, 브랜드의 다음으로",
  description: DEFAULT_DESCRIPTION,
  home: true,
  footerBordered: true,
  extraHead: `<link rel="preload" as="image" href="/assets/img/hero.jpg">\n`,
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "라별",
    alternateName: ["라별커뮤니케이션즈", "Rastar Comms"],
    url: `${SITE_ORIGIN}/`,
    logo: `${SITE_ORIGIN}/assets/img/icon-512.png`,
    image: DEFAULT_IMAGE,
    description: DEFAULT_DESCRIPTION,
    telephone: "+82-32-262-2164",
    email: "ws@rastarcomms.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "중봉대로 490, 893호 (청라더리브티아모)",
      addressLocality: "인천광역시 서구",
      addressCountry: "KR",
    },
  },
  body: () => `<section class="hero">
  <div class="wrap intro">
    <h1>행사를 넘어, 브랜드의 <em>다음</em>으로</h1>
    <p>라별은 브랜드 액티베이션·페스티벌·비즈니스 이벤트를 통해 <br>브랜드와 사람이 만나는 순간을 만들고 <br>기획·공간 연출·현장 운영까지 하나의 흐름으로 설계합니다.</p>
  </div>
  <div class="hero-visual"><div style="background-image:url('/assets/img/hero.jpg')" role="img" aria-label="라별이 만든 행사 현장"></div></div>
</section>

<section class="services" id="what" aria-label="what we do">
  <div class="wrap">
${SERVICES.map((s) => `    <a class="svc" href="${s.href}" data-reveal>
      <div class="name"><span>${esc(s.name)}</span><span class="arrow" aria-hidden="true">↗</span></div>
      <div>
        <div class="en">${esc(s.en)}</div>
        <div class="tag">${esc(s.tag)}</div>
        <p class="body">${s.body.map(esc).join(" <br>")}</p>
      </div>
    </a>`).join("\n")}
  </div>
</section>

<section class="cta" data-dark-head>
  <div class="wrap">
    <h2>ready to upgrade your moment?</h2>
    <p>다음 행사, 라별과 함께 한 단계 끌어올려보세요</p>
    <div class="actions">
      <button type="button" class="btn-cta" data-contact>문의하기</button>
      <a class="btn-line" href="/assets/docs/rastar-service-introduction.pdf" target="_blank" rel="noopener">서비스소개서 다운로드</a>
    </div>
  </div>
</section>`,
};
