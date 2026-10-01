import { SITE_ORIGIN, cta, esc } from "../layout.mjs";

const FAQS = [
  { q: "행사 규모가 작아도 의뢰할 수 있나요?", a: "물론입니다. 30명 규모의 소규모 세미나부터 수만 명 페스티벌까지 모두 진행합니다. 규모와 예산에 맞춰 꼭 필요한 단위만 선택해 의뢰하실 수 있습니다." },
  { q: "기획만, 또는 운영만 따로 맡길 수 있나요?", a: "네. 기획·운영·제작 및 시공·영상 및 중계 5개 패키지 중 필요한 부분만 선택하실 수 있습니다. 이미 진행 중인 행사의 특정 영역만 지원하는 형태도 가능합니다." },
  { q: "견적은 어떻게 산정되나요?", a: "행사 목적·규모·기간·필요 단위를 바탕으로 맞춤 견적을 드립니다. 무료 상담 시 예산 범위를 알려주시면, 그 안에서 최적의 구성안을 제안해 드립니다." },
  { q: "행사 준비 기간은 보통 얼마나 걸리나요?", a: "규모에 따라 다르지만 일반적으로 4~8주를 권장합니다. 다만 급한 일정의 긴급 행사도 전담팀을 즉시 투입해 대응한 경험이 많으니 먼저 문의해 주세요." },
  { q: "지방이나 해외 행사도 진행 가능한가요?", a: "가능합니다. 전국 단위 행사는 물론 해외 출장 행사도 진행하고 있으며, 현지 협력사 네트워크를 통해 안정적으로 운영합니다." },
  { q: "상담 후 바로 계약해야 하나요?", a: "전혀 아닙니다. 상담과 제안서, 견적까지는 모두 무료이며 부담 없이 비교 검토하실 수 있습니다. 계약 여부는 충분히 검토하신 뒤 결정하시면 됩니다." },
];

export default {
  file: "faq.html",
  path: "/faq.html",
  title: "FAQ · 자주 묻는 질문 | 라별",
  description: "행사 규모, 부분 의뢰, 견적 산정, 준비 기간, 지방·해외 행사 등 라별에 자주 묻는 질문을 모았습니다.",
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: `${SITE_ORIGIN}/faq.html`,
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  },
  body: () => `<section class="wrap page-head">
  <div class="row solo">
    <h1><span>rastar faq</span></h1>
  </div>
</section>

<section class="wrap faq">
${FAQS.map((f, i) => `  <div class="faq-item">
    <div class="q"><span class="no">Q${i + 1}</span><h2>${esc(f.q)}</h2></div>
    <p>${esc(f.a)}</p>
  </div>`).join("\n")}
</section>

${cta({ title: "still have questions?", text: "기획 단계의 작은 고민부터 함께 검토합니다.", button: "문의하기" })}`,
};
