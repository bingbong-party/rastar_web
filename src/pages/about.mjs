import { cta, esc } from "../layout.mjs";

const PARTS = [
  { badge: "기획", work: "행사 컨셉·시나리오 설계, 예산 설계·견적, 큐시트·운영안 작성, 리스크점검", scope: "단독 컨설팅부터 통합 기획까지", when: "운영 인력은 있지만 초기 컨셉과 전체 설계, 제안서·예산안 정리가 필요한 경우" },
  { badge: "운영", work: "현장 PM·진행, 등록·안내 인력 운용, 의전·안전 관리", scope: "소규모 행사부터 대형 컨벤션까지", when: "기획·제작은 마쳤고, 당일 현장과 등록·의전·안전을 한 팀에 맡기고 싶은 경우" },
  { badge: "디자인·제작·시공", work: "키비주얼 디자인·바리에이션, 부스·조형물 시공, 인쇄물·사이니지 제작", scope: "키비주얼 디자인 및 바리에이션, 소형 부스부터 대형 조형물까지", when: "기획·운영은 정해졌고, 디자인과 제작물만 전문적으로 맡기고 싶은 경우" },
  { badge: "무대·시스템·중계", work: "무대 장치, 조명·음향, 영상, 실시간 라이브 중계, 하이브리드 송출", scope: "기본 음향·조명부터 대형 무대 시스템과 실시간 중계까지", when: "무대·음향·조명 세팅이 필요하거나, 온라인 중계·송출만 맡기고 싶은 경우" },
];

const STEPS = [
  { title: "상담", kicker: "고객의 요구를 정확히 파악합니다", text: "문의를 접수하고 사전 미팅을 통해 행사의 목적과 요구사항을 파악합니다. 논의된 내용은 미팅록으로 정리해, 요구사항이 빠짐없이 반영되도록 합니다.", docs: ["미팅록"] },
  { title: "구상", kicker: "행사를 단계적으로 구체화합니다", text: "현장 답사를 거쳐 견적서와 제안서를 발송하고, 확정될 때까지 함께 조율합니다. 방향이 확정되면 키비주얼을 제작하고 협력사를 섭외하며, 필요한 만큼 추가 답사를 진행합니다.", docs: ["견적서", "제안서", "행사장 레이아웃", "키비주얼"] },
  { title: "준비", kicker: "빠짐없이 챙깁니다", text: "체크리스트와 큐시트, 준비물 목록을 작성하고 리허설과 최종 미팅으로 행사 전, 모든 요소를 반복 점검합니다.", docs: ["체크리스트", "큐시트", "준비물 목록"] },
  { title: "운영", kicker: "안정적으로 완성합니다", text: "큐시트를 기준으로 현장을 분 단위로 통제하고, 영상·음향·조명 시스템을 직접 디렉팅합니다. 시스템 운영에 직접 관여하는 만큼 돌발 변수를 빠르게 잡아내며, 행사의 안정성을 높입니다.", docs: ["현장 실행"], solid: true },
];

const NUMBERS = [
  { value: "1,200+", label: "누적 행사 운영", note: "" },
  { value: "98%", label: "고객 재의뢰율", note: "최근 3년 기준" },
  { value: "12년", label: "업계 경험", note: "" },
];

export default {
  file: "about.html",
  path: "/about.html",
  footerDark: true,
  title: "About · 라별커뮤니케이션즈 | 라별",
  description: "라별커뮤니케이션즈는 기획부터 디자인, 무대 시스템 운영, 전시부스, 섭외까지 행사에 필요한 모든 과정을 다루는 전문 행사 솔루션 에이전시입니다. 전체를 맡기셔도, 필요한 파트만 맡기셔도 됩니다.",
  body: () => `<section class="wrap page-head">
  <div class="row">
    <div class="label">about</div>
    <h1><span>meet rastar</span></h1>
  </div>
</section>

<section class="wrap block" style="padding-bottom:clamp(72px,8vw,130px)">
  <div class="about-intro">
    <p>라별커뮤니케이션즈는 전문 행사 솔루션 에이전시입니다.<br>기획부터 디자인, 무대 시스템 운영, 전시부스, 섭외 등 행사에 필요한 모든 과정을 다룹니다.</p>
    <p>문의에는 빠르게 답하고, 판단의 기준은 언제나 고객에 둡니다.<br>절차는 체계적으로 지키되, 조율은 상황에 맞게 유연하게 합니다.<br>그래서 전체를 맡기셔도, 필요한 파트만 맡기셔도 됩니다.</p>
    <p class="closing">이렇게 쌓아온 방식으로, 저희 라별은 고객이 다시 찾는 에이전시로 성장했습니다.<img src="/assets/img/rastar-symbol-blue.png" alt="" aria-hidden="true"></p>
  </div>
</section>

<div class="band-dark" data-dark-head>
<section class="wrap band">
  <h2 class="lead-h2">필요한 만큼만, 정확하게</h2>
  <p class="lead-p">라별에게는 <strong>행사 전체</strong>를 맡기셔도, <strong>필요한 파트</strong>만 맡기셔도 됩니다.</p>
  <div class="parts">
${PARTS.map((p) => `    <div class="part">
      <span class="badge">${esc(p.badge)}</span>
      <div><h3>세부 업무</h3><p>${esc(p.work)}</p></div>
      <div><h3>커버 범위</h3><p>${esc(p.scope)}</p></div>
      <div class="when"><strong>단독 의뢰가 유용한 경우</strong><p>${esc(p.when)}</p></div>
    </div>`).join("\n")}
  </div>
</section>
</div>

<section class="wrap band">
  <h2 class="lead-h2">보이는 과정, 확실한 결과</h2>
  <p class="lead-p">라별은 네 단계의 절차로 행사의 완성도를 끌어올립니다. 체계적인 문서 관리를 통해 <strong>지금 무엇이 준비되고 있는지</strong> 언제든 확인하실 수 있습니다.</p>
  <ol class="process" style="list-style:none;padding:0;margin-bottom:0">
${STEPS.map((s, i) => `    <li class="step">
      <span class="num" aria-hidden="true">${i + 1}</span>
      <h3>${esc(s.title)}</h3>
      <div class="kicker">${esc(s.kicker)}</div>
      <p>${esc(s.text)}</p>
      <div class="docs">${s.docs.map((d) => `<span${s.solid ? ' class="solid"' : ""}>${esc(d)}</span>`).join("")}</div>
    </li>`).join("\n")}
  </ol>
</section>

<section class="numbers" data-dark-head>
  <div class="wrap">
    <h2>숫자로 증명해온 시간</h2>
    <div class="grid">
${NUMBERS.map((n) => `      <div class="item"><div class="value">${esc(n.value)}</div><div class="lbl">${esc(n.label)}</div><div class="note">${esc(n.note)}</div></div>`).join("\n")}
    </div>
  </div>
</section>

${cta({ title: "ready to make it happen together?", text: "아이디어를 실제 현장으로 완성할 파트너를 찾고 계신가요? 라별과 다음 프로젝트를 시작해보세요.", light: true })}`,
};
