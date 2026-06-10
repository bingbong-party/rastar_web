/* =====================================================================
   Rabyeol Comms — Consultation Modal
   Multi-step "one thing per page" flow.
   Trigger: any [data-open-consult] element or any <a href="...Contact.html">.
   Desktop: centered modal · Mobile: fullscreen slide-up.
   No persistence — re-entry always starts fresh.
   ===================================================================== */
(function () {
  "use strict";

  /* Suppress the benign "Transition was skipped" unhandledrejection from the
     site's cross-document @view-transition (this popup page doesn't load
     site-nav.js, which normally handles it). */
  window.addEventListener("unhandledrejection", function (e) {
    var m = e && e.reason && (e.reason.message != null ? e.reason.message : e.reason);
    if (typeof m === "string" && m.indexOf("Transition was skipped") >= 0) e.preventDefault();
  });

  /* >>> Replace with the real KakaoTalk channel URL <<< */
  var KAKAO_URL = "http://pf.kakao.com/_CdFxan/chat";

  var STORE_KEY = "rabyeolConsultV1"; // sessionStorage key for cross-page persistence

  /* ---------- inline icons ---------- */
  var IC = {
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    arrow: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 12h12"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    tick: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4C6.9 4 3 7.3 3 11.4c0 2.5 1.6 4.7 4 6-.2 1-.7 2.3-1.3 3.1-.2.3 0 .7.4.6 1.9-.4 3.4-1.2 4.4-1.9.8.1 1.7.2 2.5.2 5.1 0 9-3.3 9-7.4S17.1 4 12 4Z"/></svg>',
    form: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M9 13h6M9 17h4"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.7 2.34a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.74.34 1.53.57 2.34.7A2 2 0 0 1 22 16.92Z"/></svg>'
  };

  /* ---------- step config ---------- */
  var STEPS = [
    { key: "eventName", kr: "행사명", type: "text",
      q: "어떤 행사를 준비하고 계신가요?",
      sub: "행사 이름이나 가제를 적어주세요.",
      placeholder: "예) 2026 브랜드 런칭 페스티벌",
      skip: "아직 행사명은 미정이에요" },
    { key: "date", kr: "희망 시기", type: "chips",
      q: "언제쯤 진행할 예정인가요?",
      options: ["2026 상반기", "2026 하반기", "2027 이후"],
      custom: "직접 입력", customPh: "예) 2026년 5월 중",
      skip: "아직 시기는 미정이에요" },
    { key: "headcount", kr: "참여 인원", type: "chips",
      q: "예상 참여 인원은 어느 정도인가요?",
      options: ["50명 미만", "50~100명", "100~300명", "300명 이상"],
      custom: "직접 입력", customPh: "예) 약 500명",
      skip: "아직 인원은 미정이에요" },
    { key: "place", kr: "장소", type: "text",
      q: "행사 장소가 정해졌나요?",
      sub: "확정 전이라면 희망 지역이나 장소를 적어주세요.",
      placeholder: "예) 서울 성수동 일대 / 코엑스 그랜드볼룸",
      skip: "아직 장소는 미정이에요" },
    { key: "budget", kr: "예산", type: "chips",
      q: "예산은 어느 정도로 생각하고 계신가요?",
      options: ["1천만원 미만", "1천~3천만원", "3천~5천만원", "5천만원~1억", "1억 이상"],
      custom: "직접 입력", customPh: "예) 약 7천만원",
      skip: "아직 예산은 미정이에요" },
    { key: "scope", kr: "맡길 영역", type: "cards",
      q: "어떤 부분을 맡기고 싶으신가요?",
      sub: "필요한 영역을 모두 선택하세요. (중복 선택 가능)",
      cards: [
        { v: "올인원", d: "기획부터 운영·제작까지 전 과정 통합 대행", span: true },
        { v: "기획", d: "컨셉 · 시나리오 · 예산 설계" },
        { v: "운영", d: "현장 PM · 인력 · 진행" },
        { v: "제작 및 시공", d: "무대 · 부스 · 조명 · 음향" },
        { v: "영상·실시간 중계", d: "스케치 영상 · 라이브 송출" },
        { v: "커스텀", d: "필요한 부분만 골라서", custom: true }
      ] },
    { key: "note", kr: "기타 요청", type: "textarea",
      q: "더 전하고 싶은 내용이 있나요?",
      sub: "선택 항목이에요. 없으면 건너뛰어도 좋아요.",
      placeholder: "행사 컨셉, 참고 레퍼런스, 특별히 신경 쓰는 부분 등을 자유롭게 적어주세요.",
      optional: true },
    { key: "contact", kr: "연락처", type: "contact",
      q: "어디로 답변드리면 될까요?",
      sub: "상담 내용 검토 후 이메일로 답변드립니다." }
  ];

  var SUM_LABEL = {
    eventName: "행사명", date: "시기", headcount: "인원",
    place: "장소", budget: "예산", scope: "맡길 영역",
    note: "기타", contact: "이메일"
  };

  /* ---------- state ---------- */
  var answers = {};
  var cur = "choice"; // 'choice' | 0..7 | 'done'
  var built = false;
  var collapsed = false;
  var lastFocus = null;
  var els = {};
  var stepNodes = []; // built lazily

  function h(tag, cls, html) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (html != null) el.innerHTML = html;
    return el;
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* ---------- build shell (right-docked, non-blocking panel) ---------- */
  function build() {
    var panel = h("div", "cm-panel");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "무료 상담 신청");

    var bar = h("div", "cm-bar");
    var title = h("span", "cm-bar-title",
      '<span class="cm-bar-dot"></span>무료 상담 신청');
    var actions = h("div", "cm-bar-actions");
    var minBtn = h("button", "cm-iconbtn", IC.minus);
    minBtn.setAttribute("aria-label", "접어두기");
    minBtn.title = "접어두기";
    minBtn.addEventListener("click", collapse);
    var xBtn = h("button", "cm-iconbtn", IC.close);
    xBtn.setAttribute("aria-label", "닫기");
    xBtn.title = "닫기";
    xBtn.addEventListener("click", closePanel);
    actions.appendChild(minBtn);
    actions.appendChild(xBtn);
    bar.appendChild(title);
    bar.appendChild(actions);

    var top = h("div", "cm-top");
    var dots = h("div", "cm-dots");
    for (var i = 0; i < STEPS.length; i++) dots.appendChild(h("span", "cm-dot"));
    var count = h("span", "cm-step-count", "");
    top.appendChild(dots);
    top.appendChild(count);

    var scroll = h("div", "cm-scroll");

    var foot = h("div", "cm-foot");
    var back = h("button", "cm-back", IC.back + "<span>뒤로</span>");
    back.addEventListener("click", goBack);
    var next = h("button", "cm-next btn btn-primary");
    next.innerHTML = '다음 <span class="arrow" aria-hidden="true">' + IC.arrow + "</span>";
    next.addEventListener("click", goNext);
    foot.appendChild(back);
    foot.appendChild(next);

    panel.appendChild(bar);
    panel.appendChild(top);
    panel.appendChild(scroll);
    panel.appendChild(foot);
    document.body.appendChild(panel);

    /* collapsed-state launcher pill (re-expands the panel) */
    var launcher = h("button", "cm-launcher");
    launcher.innerHTML =
      '<span class="cm-launcher-ico">' + IC.chat + "</span>" +
      '<span class="cm-launcher-txt"><b>상담 이어가기</b>' +
        '<span class="cm-launcher-sub"></span></span>';
    launcher.addEventListener("click", expand);
    document.body.appendChild(launcher);

    els = { panel: panel, bar: bar, top: top, dots: dots, count: count,
            scroll: scroll, foot: foot, back: back, next: next, minBtn: minBtn,
            launcher: launcher, launcherSub: launcher.querySelector(".cm-launcher-sub") };
    built = true;
  }

  /* ---------- choice screen ---------- */
  function choiceNode() {
    var wrap = h("div", "cm-screen");
    wrap.innerHTML =
      '<div class="cm-choice-intro">' +
        '<span class="cm-eyebrow">Free Consulting</span>' +
        '<p class="cm-choice-lead">행사를 구상 중이신가요? 편한 방법으로 문의해 주세요.<br>상담 · 제안 · 견적까지 모두 무료입니다.</p>' +
      "</div>" +
      '<div class="cm-choice-body">' +
        '<button type="button" class="cm-opt is-kakao" data-go="kakao">' +
          '<span class="cm-opt-ico">' + IC.chat + "</span>" +
          '<span class="cm-opt-txt"><b>카카오톡으로 문의하기</b><span>채널로 연결해 바로 대화를 시작해요</span></span>' +
          '<span class="cm-opt-arrow">' + IC.back.replace("15 18l-6-6 6-6", "9 18l6-6-6-6") + "</span>" +
        "</button>" +
        '<button type="button" class="cm-opt is-form" data-go="form">' +
          '<span class="cm-opt-ico">' + IC.form + "</span>" +
          '<span class="cm-opt-txt"><b>상담 폼 작성하기</b><span>맞춤 제안을 받아보세요</span></span>' +
          '<span class="cm-opt-arrow">' + IC.back.replace("15 18l-6-6 6-6", "9 18l6-6-6-6") + "</span>" +
        "</button>" +
      "</div>" +
      '<div class="cm-choice-contact">' +
        '<span class="cm-contact-item">' + IC.phone + "032-262-2164</span>" +
        '<span class="cm-contact-sep"></span>' +
        '<span class="cm-contact-item">' + IC.mail + "ejkoon@rastarcomms.com</span>" +
      "</div>";
    wrap.querySelector('[data-go="kakao"]').addEventListener("click", function () {
      window.open(KAKAO_URL, "_blank", "noopener");
    });
    wrap.querySelector('[data-go="form"]').addEventListener("click", function () {
      goStep(0);
    });
    return wrap;
  }

  /* ---------- step builders ---------- */
  function skipRow(cfg) {
    if (!cfg.skip) return null;
    var row = h("div", "cm-skip-row");
    var btn = h("button", "cm-skip",
      '<span class="cm-skip-box">' + IC.tick + "</span><span>" + esc(cfg.skip) + "</span>");
    btn.type = "button";
    btn.dataset.skip = "1";
    row.appendChild(btn);
    return row;
  }

  function buildStep(idx) {
    var cfg = STEPS[idx];
    var node = h("div", "cm-screen");
    var head =
      '<span class="cm-eyebrow">Step ' + (idx + 1) + " / 8 · " + esc(cfg.kr) + "</span>" +
      '<h2 class="cm-q">' + esc(cfg.q) + "</h2>" +
      (cfg.sub ? '<p class="cm-sub">' + esc(cfg.sub) + "</p>" : "");
    node.innerHTML = head;
    var field = h("div", "cm-field");

    if (cfg.type === "text") {
      var inp = h("input", "cm-input");
      inp.type = "text";
      inp.placeholder = cfg.placeholder || "";
      inp.addEventListener("input", function () { clearSkip(node); updateNext(); });
      field.appendChild(inp);
      node.appendChild(field);
      var sr = skipRow(cfg);
      if (sr) { node.appendChild(sr); bindSkip(node, [inp]); }
    }

    else if (cfg.type === "textarea") {
      var ta = h("textarea", "cm-textarea");
      ta.placeholder = cfg.placeholder || "";
      ta.addEventListener("input", updateNext);
      field.appendChild(ta);
      node.appendChild(field);
    }

    else if (cfg.type === "chips") {
      var chips = h("div", "cm-chips");
      cfg.options.forEach(function (opt) {
        var c = h("button", "cm-chip", esc(opt));
        c.type = "button";
        c.dataset.val = opt;
        c.addEventListener("click", function () { selectChip(node, c, false); });
        chips.appendChild(c);
      });
      if (cfg.custom) {
        var cc = h("button", "cm-chip", esc(cfg.custom));
        cc.type = "button";
        cc.dataset.custom = "1";
        cc.addEventListener("click", function () { selectChip(node, cc, true); });
        chips.appendChild(cc);
      }
      field.appendChild(chips);
      var cwrap = h("div", "cm-custom-wrap");
      cwrap.hidden = true;
      var cin = h("input", "cm-input");
      cin.type = "text";
      cin.placeholder = cfg.customPh || "";
      cin.addEventListener("input", updateNext);
      cwrap.appendChild(cin);
      field.appendChild(cwrap);
      node.appendChild(field);
      var sr2 = skipRow(cfg);
      if (sr2) { node.appendChild(sr2); bindSkip(node, []); }
    }

    else if (cfg.type === "cards") {
      var grid = h("div", "cm-cards");
      var ccwrap = h("div", "cm-custom-wrap");
      ccwrap.hidden = true;
      var ccin = h("input", "cm-input");
      ccin.type = "text";
      ccin.placeholder = "예) 사회자 섭외 · 케이터링 · 굿즈 제작 등";
      ccin.addEventListener("input", updateNext);
      ccwrap.appendChild(ccin);
      cfg.cards.forEach(function (cd) {
        var card = h("button", "cm-card" + (cd.span ? " span-2" : ""));
        card.type = "button";
        card.dataset.val = cd.v;
        if (cd.custom) card.dataset.custom = "1";
        card.innerHTML =
          '<span class="cm-tick">' + IC.tick + "</span>" +
          '<span class="cm-card-ttl">' + esc(cd.v) + "</span>" +
          '<span class="cm-card-desc">' + esc(cd.d) + "</span>";
        card.addEventListener("click", function () {
          card.classList.toggle("active");
          if (cd.custom) {
            var on = card.classList.contains("active");
            ccwrap.hidden = !on;
            if (on) setTimeout(function () { ccin.focus(); }, 30);
            else ccin.value = "";
          }
          updateNext();
        });
        grid.appendChild(card);
      });
      field.appendChild(grid);
      field.appendChild(ccwrap);
      node.appendChild(field);
    }

    else if (cfg.type === "contact") {
      var stack = h("div", "cm-field cm-stack");
      stack.innerHTML =
        '<div><label class="cm-label">이메일 <span class="req">*</span></label>' +
          '<input class="cm-input" data-c="email" type="email" placeholder="you@email.com" autocomplete="email"></div>' +
        '<div><label class="cm-label">이름 <span class="opt">(선택)</span></label>' +
          '<input class="cm-input" data-c="name" type="text" placeholder="홍길동" autocomplete="name"></div>' +
        '<div><label class="cm-label">전화번호 <span class="opt">(선택)</span></label>' +
          '<input class="cm-input" data-c="phone" type="tel" placeholder="010-1234-5678" autocomplete="tel"></div>';
      var hint = h("div", "cm-note-hint", IC.mail + "<span>상담 내용을 검토한 뒤 입력하신 이메일로 답변드립니다.</span>");
      stack.appendChild(hint);
      stack.querySelector('[data-c="email"]').addEventListener("input", updateNext);
      node.appendChild(stack);
    }

    return node;
  }

  /* chips: single-select within a step */
  function selectChip(node, chip, isCustom) {
    node.querySelectorAll(".cm-chip").forEach(function (c) { c.classList.remove("active"); });
    chip.classList.add("active");
    clearSkip(node);
    var cwrap = node.querySelector(".cm-custom-wrap");
    if (cwrap) {
      cwrap.hidden = !isCustom;
      if (isCustom) { var ci = cwrap.querySelector("input"); if (ci) setTimeout(function () { ci.focus(); }, 30); }
    }
    updateNext();
  }

  /* skip ("미정") toggle */
  function bindSkip(node, inputsToClear) {
    var btn = node.querySelector(".cm-skip");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var on = !btn.classList.contains("active");
      btn.classList.toggle("active", on);
      if (on) {
        node.querySelectorAll(".cm-chip").forEach(function (c) { c.classList.remove("active"); });
        var cw = node.querySelector(".cm-custom-wrap");
        if (cw) { cw.hidden = true; cw.querySelector("input").value = ""; }
        inputsToClear.forEach(function (i) { i.value = ""; });
      }
      updateNext();
    });
  }
  function clearSkip(node) {
    var btn = node.querySelector(".cm-skip");
    if (btn) btn.classList.remove("active");
  }

  /* ---------- validity ---------- */
  function stepValid(idx) {
    var node = stepNodes[idx];
    var cfg = STEPS[idx];
    if (!node) return false;
    var skip = node.querySelector(".cm-skip.active");
    if (cfg.type === "text") {
      if (skip) return true;
      return node.querySelector(".cm-input").value.trim() !== "";
    }
    if (cfg.type === "textarea") return true; // optional
    if (cfg.type === "chips") {
      if (skip) return true;
      var active = node.querySelector(".cm-chip.active");
      if (!active) return false;
      if (active.dataset.custom) {
        var ci = node.querySelector(".cm-custom-wrap input");
        return ci && ci.value.trim() !== "";
      }
      return true;
    }
    if (cfg.type === "cards") {
      if (node.querySelectorAll(".cm-card.active").length === 0) return false;
      var cc = node.querySelector(".cm-card.active[data-custom]");
      if (cc) {
        var ci = node.querySelector(".cm-custom-wrap input");
        if (!ci || ci.value.trim() === "") return false;
      }
      return true;
    }
    if (cfg.type === "contact") {
      var em = node.querySelector('[data-c="email"]');
      return em && EMAIL_RE.test(em.value.trim());
    }
    return false;
  }

  function updateNext() {
    if (typeof cur !== "number") return;
    var ok = stepValid(cur);
    els.next.disabled = !ok;
    var cfg = STEPS[cur];
    var label = "다음";
    if (cfg.type === "contact") label = "상담 신청 완료";
    else if (cfg.optional) {
      var ta = stepNodes[cur].querySelector(".cm-textarea");
      label = (ta && ta.value.trim() !== "") ? "다음" : "건너뛰기";
    }
    els.next.innerHTML = label + ' <span class="arrow" aria-hidden="true">' + IC.arrow + "</span>";
  }

  /* ---------- save answer ---------- */
  /* soft=true: snapshot in-progress input without forcing an empty step to "미정" */
  function saveStep(idx, soft) {
    var node = stepNodes[idx];
    var cfg = STEPS[idx];
    var skip = node.querySelector(".cm-skip.active");
    if (skip) { answers[cfg.key] = "미정"; return; }
    if (cfg.type === "text") {
      var tv = node.querySelector(".cm-input").value.trim();
      if (tv) answers[cfg.key] = tv;
      else if (soft) delete answers[cfg.key];
      else answers[cfg.key] = "미정";
    } else if (cfg.type === "textarea") {
      var v = node.querySelector(".cm-textarea").value.trim();
      answers[cfg.key] = v || "";
    } else if (cfg.type === "chips") {
      var active = node.querySelector(".cm-chip.active");
      if (active && active.dataset.custom) {
        answers[cfg.key] = node.querySelector(".cm-custom-wrap input").value.trim();
      } else if (active) {
        answers[cfg.key] = active.dataset.val;
      } else if (soft) {
        delete answers[cfg.key];
      } else {
        answers[cfg.key] = "미정";
      }
    } else if (cfg.type === "cards") {
      var ccin = node.querySelector(".cm-custom-wrap input");
      var ctext = ccin ? ccin.value.trim() : "";
      var picked = Array.prototype.map.call(
        node.querySelectorAll(".cm-card.active"), function (c) {
          if (c.dataset.custom && ctext) return "커스텀: " + ctext;
          return c.dataset.val;
        });
      if (picked.length || !soft) answers[cfg.key] = picked;
    } else if (cfg.type === "contact") {
      answers.contact = {
        email: node.querySelector('[data-c="email"]').value.trim(),
        name: node.querySelector('[data-c="name"]').value.trim(),
        phone: node.querySelector('[data-c="phone"]').value.trim()
      };
    }
  }

  /* ---------- navigation ---------- */
  function showScreen(domNode) {
    els.scroll.innerHTML = "";
    domNode.classList.add("cm-anim");
    els.scroll.appendChild(domNode);
    els.scroll.scrollTop = 0;
    void domNode.offsetWidth; // retrigger entrance animation
  }

  function goChoice() {
    cur = "choice";
    els.top.classList.add("is-hidden");
    els.foot.classList.add("is-hidden");
    els.minBtn.hidden = true;
    showScreen(choiceNode());
    persist();
  }

  function goStep(idx) {
    cur = idx;
    if (!stepNodes[idx]) stepNodes[idx] = buildStep(idx);
    repopulate(idx);
    els.top.classList.remove("is-hidden");
    els.foot.classList.remove("is-hidden");
    els.minBtn.hidden = false;
    els.back.hidden = false; // back always available (step 0 -> choice)
    updateDots(idx);
    showScreen(stepNodes[idx]);
    updateNext();
    persist();
    var first = stepNodes[idx].querySelector(".cm-input, .cm-textarea");
    if (first && STEPS[idx].type !== "chips") setTimeout(function () { first.focus(); }, 80);
  }

  /* restore a step's controls from saved answers (back-nav & cross-page resume) */
  function repopulate(idx) {
    var node = stepNodes[idx], cfg = STEPS[idx], v = answers[cfg.key];
    if (v === undefined) return;
    if (cfg.type === "text") {
      if (v === "미정") { var sb = node.querySelector(".cm-skip"); if (sb) sb.classList.add("active"); }
      else node.querySelector(".cm-input").value = v;
    } else if (cfg.type === "textarea") {
      node.querySelector(".cm-textarea").value = v || "";
    } else if (cfg.type === "chips") {
      if (v === "미정") { var s = node.querySelector(".cm-skip"); if (s) s.classList.add("active"); }
      else {
        var matched = false;
        node.querySelectorAll(".cm-chip").forEach(function (c) {
          if (!c.dataset.custom && c.dataset.val === v) { c.classList.add("active"); matched = true; }
        });
        if (!matched) {
          var cc = node.querySelector(".cm-chip[data-custom]");
          if (cc) {
            cc.classList.add("active");
            var cw = node.querySelector(".cm-custom-wrap");
            cw.hidden = false; cw.querySelector("input").value = v;
          }
        }
      }
    } else if (cfg.type === "cards") {
      (v || []).forEach(function (val) {
        if (typeof val === "string" && val.indexOf("커스텀") === 0) {
          var cc = node.querySelector(".cm-card[data-custom]");
          if (cc) {
            cc.classList.add("active");
            var cw = node.querySelector(".cm-custom-wrap");
            if (cw) {
              cw.hidden = false;
              cw.querySelector("input").value = val.replace(/^커스텀:\s*/, "");
            }
          }
          return;
        }
        node.querySelectorAll(".cm-card").forEach(function (c) {
          if (c.dataset.val === val) c.classList.add("active");
        });
      });
    } else if (cfg.type === "contact") {
      var c = answers.contact || {};
      if (c.email) node.querySelector('[data-c="email"]').value = c.email;
      if (c.name) node.querySelector('[data-c="name"]').value = c.name;
      if (c.phone) node.querySelector('[data-c="phone"]').value = c.phone;
    }
  }

  function updateDots(idx) {
    var dots = els.dots.children;
    for (var i = 0; i < dots.length; i++) {
      dots[i].className = "cm-dot" + (i < idx ? " done" : i === idx ? " current" : "");
    }
    els.count.textContent = (idx + 1) + " / 8";
  }

  function goNext() {
    if (typeof cur !== "number") return;
    if (!stepValid(cur)) return;
    saveStep(cur);
    if (cur < STEPS.length - 1) goStep(cur + 1);
    else finish();
  }

  function goBack() {
    if (typeof cur !== "number") return;
    if (cur === 0) goChoice();
    else goStep(cur - 1);
  }

  /* ---------- EmailJS ---------- */
  var EMAILJS_PUBLIC_KEY = "mqLLueKGy2aYF-YBR";
  var EMAILJS_SERVICE_ID = "service_qzdcnz4";
  var EMAILJS_TEMPLATE_ID = "template_32zpy6s";

  function loadEmailJS(cb) {
    if (window.emailjs) { emailjs.init(EMAILJS_PUBLIC_KEY); cb(); return; }
    var s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    s.onload = function () { emailjs.init(EMAILJS_PUBLIC_KEY); cb(); };
    s.onerror = function () { console.error("EmailJS SDK 로드 실패"); };
    document.head.appendChild(s);
  }

  function sendConsultEmail() {
    var c = answers.contact || {};
    var sc = answers.scope && answers.scope.length ? answers.scope.join(" · ") : "미정";
    var params = {
      event_name:    answers.eventName || "미정",
      date:          answers.date      || "미정",
      headcount:     answers.headcount || "미정",
      place:         answers.place     || "미정",
      budget:        answers.budget    || "미정",
      scope:         sc,
      note:          answers.note      || "없음",
      contact_name:  c.name  || "미입력",
      contact_email: c.email || "",
      contact_phone: c.phone || "미입력"
    };
    loadEmailJS(function () {
      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params)
        .catch(function (err) { console.error("EmailJS 전송 오류:", err); });
    });
  }

  /* ---------- finish ---------- */
  function finish() {
    cur = "done";
    els.top.classList.add("is-hidden");
    els.foot.classList.add("is-hidden");

    var rows = "";
    function row(label, val, muted) {
      rows += '<div class="cm-summary-row"><dt>' + esc(label) + "</dt>" +
              '<dd' + (muted ? ' class="muted"' : "") + ">" + esc(val) + "</dd></div>";
    }
    ["eventName", "date", "headcount", "place", "budget"].forEach(function (k) {
      var v = answers[k];
      row(SUM_LABEL[k], v || "미정", !v || v === "미정");
    });
    var sc = answers.scope && answers.scope.length ? answers.scope.join(" · ") : "미정";
    row(SUM_LABEL.scope, sc, !(answers.scope && answers.scope.length));
    if (answers.note) row(SUM_LABEL.note, answers.note, false);
    var c = answers.contact || {};
    row(SUM_LABEL.contact, c.email || "—", false);

    var done = h("div", "cm-screen cm-done");
    done.innerHTML =
      '<div class="cm-check">' + IC.check + "</div>" +
      "<h3>상담 신청이 완료됐어요</h3>" +
      "<p>1~2 영업일 내에 입력하신 이메일로<br>담당 PM이 직접 연락드리겠습니다.</p>" +
      '<dl class="cm-summary">' + rows + "</dl>";
    var closeBtn = h("button", "cm-next btn btn-primary");
    closeBtn.innerHTML = "확인 <span class=\"arrow\" aria-hidden=\"true\">" + IC.check.replace('stroke-width="2.6"', 'stroke-width="2.4"') + "</span>";
    closeBtn.addEventListener("click", closePanel);
    done.appendChild(closeBtn);
    showScreen(done);
    persist();
    sendConsultEmail();
  }

  /* ---------- persistence (sessionStorage, survives page navigation) ---------- */
  function persist() {
    try {
      if (typeof cur === "number" && stepNodes[cur]) saveStep(cur, true);
    } catch (e) {}
    var open = built && (els.panel.classList.contains("open") || collapsed);
    if (!open) { return; }
    var state = { phase: collapsed ? "collapsed" : "open", cur: cur, answers: answers };
    try { sessionStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
  }
  function clearPersist() {
    try { sessionStorage.removeItem(STORE_KEY); } catch (e) {}
  }

  /* ---------- open / collapse / expand / close ---------- */
  function openPanel(fresh) {
    if (!built) build();
    if (fresh !== false) { answers = {}; stepNodes = []; }
    collapsed = false;
    document.body.classList.add("cm-has-panel");
    els.launcher.classList.remove("show");
    els.panel.classList.remove("collapsed");
    void els.panel.offsetWidth;
    els.panel.classList.add("open");
    if (fresh !== false) goChoice();
    persist();
  }

  function collapse() {
    if (!built) return;
    collapsed = true;
    els.panel.classList.remove("open");
    els.panel.classList.add("collapsed");
    updateLauncher();
    els.launcher.classList.add("show");
    persist();
  }

  function expand() {
    if (!built) return;
    collapsed = false;
    els.launcher.classList.remove("show");
    els.panel.classList.remove("collapsed");
    void els.panel.offsetWidth;
    els.panel.classList.add("open");
    persist();
  }

  function closePanel() {
    if (!built) return;
    collapsed = false;
    els.panel.classList.remove("open", "collapsed");
    els.launcher.classList.remove("show");
    document.body.classList.remove("cm-has-panel");
    answers = {}; stepNodes = []; cur = "choice";
    clearPersist();
  }

  function updateLauncher() {
    if (!els.launcherSub) return;
    var txt;
    if (cur === "done") txt = "작성 완료 · 확인하기";
    else if (typeof cur === "number") txt = "작성 중 · " + (cur + 1) + " / 8 단계";
    else txt = "여기서 이어서 작성하세요";
    els.launcherSub.textContent = txt;
  }

  /* ---------- restore on page load (cross-page resume) ---------- */
  function restore() {
    var raw;
    try { raw = sessionStorage.getItem(STORE_KEY); } catch (e) { return; }
    if (!raw) return;
    var st;
    try { st = JSON.parse(raw); } catch (e) { return; }
    if (!st || (st.phase !== "open" && st.phase !== "collapsed")) return;
    if (!built) build();
    answers = st.answers || {};
    stepNodes = [];
    if (st.cur === "done") finish();
    else if (typeof st.cur === "number") goStep(st.cur);
    else goChoice();
    document.body.classList.add("cm-has-panel");
    if (st.phase === "collapsed") {
      collapsed = true;
      updateLauncher();
      els.launcher.classList.add("show");
    } else {
      void els.panel.offsetWidth;
      els.panel.classList.add("open");
    }
  }

  /* ---------- triggers ---------- */
  function isTrigger(el) {
    return el.closest("[data-open-consult]") ||
           el.closest('a[href$="Contact.html"], a[href="Contact.html"]');
  }

  document.addEventListener("click", function (e) {
    var t = isTrigger(e.target);
    if (!t) return;
    e.preventDefault();
    if (built && collapsed) { expand(); }
    else if (built && els.panel.classList.contains("open")) { /* already open */ }
    else { openPanel(true); }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && built && els.panel.classList.contains("open")) collapse();
  });

  window.addEventListener("beforeunload", function () {
    if (built && document.body.classList.contains("cm-has-panel")) persist();
  });

  /* resume an in-progress session on this page */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", restore);
  } else {
    restore();
  }

  window.RabyeolConsult = { open: function () { openPanel(true); }, collapse: collapse, close: closePanel };
})();
