/* =====================================================================
   Rastar Comms — 2026 renewal
   전체 메뉴 / 상담 신청 모달 / 프로젝트 목록 페이지네이션 / 프로젝트 상세 갤러리
   ===================================================================== */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "class") n.className = attrs[k];
      else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    });
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  /* ---------------- 헤더: 최상단에선 투명, 스크롤하면 흰 배경 ---------------- */
  var siteHeader = $(".site-header");
  if (siteHeader) {
    // data-dark-head 영역(블루 배경)이 헤더 아래에 있는 동안은 밝은 헤더로 바꾼다.
    var darkAreas = $$("[data-dark-head]");
    var syncHeader = function () {
      siteHeader.classList.toggle("scrolled", window.scrollY > 0);
      var mid = siteHeader.offsetHeight / 2;
      siteHeader.classList.toggle("on-dark", darkAreas.some(function (a) {
        var r = a.getBoundingClientRect();
        return r.top <= mid && r.bottom > mid;
      }));
    };
    window.addEventListener("scroll", syncHeader, { passive: true });
    syncHeader();
  }

  /* ---------------- 스크롤 중에도 즉시 반응하는 호버 ----------------
     브라우저는 마우스가 멈춘 채 스크롤하면 :hover 갱신을 스크롤이 끝날 때까지 미룬다.
     마지막 마우스 위치에서 매 프레임 elementFromPoint 로 다시 판정해 .is-hover 를 붙인다. */
  var hoverItems = $$(".svc");
  if (hoverItems.length) {
    var mouse = null, hoverRaf = 0, hovered = null;
    var syncHover = function () {
      hoverRaf = 0;
      var hit = mouse && document.elementFromPoint(mouse.x, mouse.y);
      var row = hit && hit.closest ? hit.closest(".svc") : null;
      if (row === hovered) return;
      if (hovered) hovered.classList.remove("is-hover");
      if (row) row.classList.add("is-hover");
      hovered = row;
    };
    var queueHover = function () { if (!hoverRaf) hoverRaf = requestAnimationFrame(syncHover); };
    document.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      mouse = { x: e.clientX, y: e.clientY };
      queueHover();
    }, { passive: true });
    document.addEventListener("pointerleave", function () { mouse = null; queueHover(); });
    window.addEventListener("scroll", queueHover, { passive: true });
  }

  /* ---------------- 스크롤 등장 애니메이션 / 숫자 카운트업 ---------------- */
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function countUp(el) {
    // "1,200+" → 접두/숫자/접미로 나눠 0 부터 올린다. 최종 텍스트는 HTML 에 그대로 있어 JS 없이도 보인다.
    var final = el.getAttribute("data-count");
    var m = final.match(/^(\D*)([\d,]+)(.*)$/);
    if (!m || reduceMotion) return;
    var target = Number(m[2].replace(/,/g, "")), useComma = m[2].indexOf(",") >= 0;
    var start = null, dur = 1600;
    function fmt(n) { return useComma ? n.toLocaleString("en-US") : String(n); }
    function step(t) {
      if (start === null) start = t;
      var p = Math.min(1, (t - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = m[1] + fmt(Math.round(target * eased)) + m[3];
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = m[1] + "0" + m[3];
    requestAnimationFrame(step);
  }
  var revealEls = $$("[data-reveal]"), countEls = $$("[data-count]");
  if ("IntersectionObserver" in window && (revealEls.length || countEls.length)) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        if (en.target.hasAttribute("data-count")) countUp(en.target);
        else en.target.classList.add("in");
      });
    }, { threshold: 0.2, rootMargin: "0px 0px -15% 0px" });
    revealEls.concat(countEls).forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------------- 전체 메뉴 ---------------- */
  var menu = $("#site-menu");
  function openMenu() {
    if (!menu) return;
    menu.classList.add("open");
    menu.removeAttribute("hidden");
    document.body.classList.add("no-scroll");
    var close = $(".menu-close", menu);
    if (close) close.focus();
  }
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove("open");
    menu.setAttribute("hidden", "");
    document.body.classList.remove("no-scroll");
  }
  $$("[data-menu-open]").forEach(function (b) { b.addEventListener("click", openMenu); });
  $$("[data-menu-close]").forEach(function (b) { b.addEventListener("click", closeMenu); });

  /* ---------------- 상담 신청 모달 ----------------
     3단계(의뢰 유형 → 예산 → 문의자 정보) 후 EmailJS로 전송한다. */
  var EMAILJS_PUBLIC_KEY = "mqLLueKGy2aYF-YBR";
  var EMAILJS_SERVICE_ID = "service_qzdcnz4";
  var EMAILJS_TEMPLATE_ID = "template_32zpy6s";
  var PHONE = "032-262-2164";
  var EMAIL = "ejkoon@rastarcomms.com"; // 상담 패널 안에서 안내하는 이메일
  var KAKAO_URL = "https://pf.kakao.com/_CdFxan/chat";

  var TYPES = ["프로모션", "팝업스토어", "론칭·쇼케이스", "페스티벌", "스포츠 행사", "공공·지역행사", "기업행사", "컨퍼런스", "전시·박람회", "온라인·하이브리드", "기타"];
  var TYPE_UNDECIDED = "아직 고민중이에요";
  var STEPS = [
    { badge: "STEP 1 / 3 · 의뢰 유형", title: "어떤 행사를 준비하고 계신가요?" },
    { badge: "STEP 2 / 3 · 예산", title: "예산은 어느 정도로 생각하고 계신가요?" },
    { badge: "STEP 3 / 3 · 문의자 정보", title: "연락받을 정보를 알려주세요." }
  ];
  // "행사 내용" 칸 아래에 보여주는 부가설명
  var DETAIL_HINT =
    "참여 인원, 장소, 희망 일정 등 행사 개요와 맡기고 싶은 대행 범위를 자유롭게 적어주세요." +
    '<span class="ex">예) 약 300명 · 서울 OO호텔 연회장 · 11월 중순 / 기획부터 현장 운영까지 전체 대행</span>';
  var FIELDS = [
    { key: "company", label: "회사명 *", ph: "회사 또는 단체명", type: "text", auto: "organization" },
    { key: "name", label: "담당자명 *", ph: "성함", type: "text", auto: "name" },
    { key: "email", label: "이메일 *", ph: "name@company.com", type: "email", auto: "email" },
    { key: "phone", label: "연락처 (선택)", ph: "010-0000-0000", type: "tel", auto: "tel" }
  ];

  // 현재(이전) 사이트와 같은 동작: 화면을 막지 않는 우하단 패널, 접어두기(런처), 페이지를 옮겨도 이어서 작성.
  var STORE_KEY = "rastarConsultV2";
  var st, overlay, launcher, lastFocus, collapsed = false;
  function reset() {
    st = { step: 0, type: null, budgetText: "", undecided: false,
           form: { company: "", name: "", email: "", phone: "", detail: "" }, agreed: false, sending: false, error: "" };
  }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }
  function canNext() {
    if (st.step === 1) return !!st.type;
    if (st.step === 2) return !!(st.undecided || st.budgetText.trim());
    if (st.step === 3) return !!(st.form.company.trim() && st.form.name.trim() && validEmail(st.form.email) && st.agreed && !st.sending);
    return true;
  }

  var CHAT_ICON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4C6.9 4 3 7.3 3 11.4c0 2.5 1.6 4.7 4 6-.2 1-.7 2.3-1.3 3.1-.2.3 0 .7.4.6 1.9-.4 3.4-1.2 4.4-1.9.8.1 1.7.2 2.5.2 5.1 0 9-3.3 9-7.4S17.1 4 12 4Z"/></svg>';

  function persist() {
    if (!overlay || !overlay.isConnected) return;
    var open = collapsed || overlay.classList.contains("open");
    if (!open) return;
    var snap = JSON.parse(JSON.stringify(st));
    snap.sending = false; snap.error = "";
    try { sessionStorage.setItem(STORE_KEY, JSON.stringify({ phase: collapsed ? "collapsed" : "open", st: snap })); } catch (e) {}
  }
  function clearPersist() { try { sessionStorage.removeItem(STORE_KEY); } catch (e) {} }

  function build() {
    overlay = el("div", { class: "cm-panel", role: "dialog", "aria-label": "상담 신청" });
    document.body.appendChild(overlay);
    launcher = el("button", { type: "button", class: "cm-launcher", onclick: expand },
      '<span class="ico">' + CHAT_ICON + '</span><span class="txt"><b>상담 이어가기</b><span class="sub"></span></span>');
    document.body.appendChild(launcher);
  }
  function updateLauncher() {
    var sub = launcher && launcher.querySelector(".sub");
    if (sub) sub.textContent = st.step === 0 ? "여기서 이어서 작성하세요" : st.step === 4 ? "작성 완료 · 확인하기" : "작성 중 · " + st.step + " / 3 단계";
  }
  function openModal() {
    if (overlay && collapsed) { expand(); return; }
    if (overlay && overlay.classList.contains("open")) return;
    reset();
    lastFocus = document.activeElement;
    if (!overlay) build();
    collapsed = false;
    render();
    void overlay.offsetWidth; // 슬라이드 인 트랜지션
    overlay.classList.add("open");
    persist();
  }
  function collapse() {
    if (!overlay) return;
    collapsed = true;
    overlay.classList.remove("open");
    updateLauncher();
    launcher.classList.add("show");
    persist();
  }
  function expand() {
    if (!overlay) return;
    collapsed = false;
    launcher.classList.remove("show");
    overlay.classList.add("open");
    persist();
  }
  function closeModal() {
    if (!overlay) return;
    collapsed = false;
    overlay.classList.remove("open");
    launcher.classList.remove("show");
    clearPersist();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  // 다른 페이지에서 작성 중이던 상담을 이어서 연다 (등장 애니메이션 없이)
  function restore() {
    var saved;
    try { saved = JSON.parse(sessionStorage.getItem(STORE_KEY) || "null"); } catch (e) { saved = null; }
    if (!saved || !saved.st || (saved.phase !== "open" && saved.phase !== "collapsed")) return;
    reset();
    Object.keys(saved.st).forEach(function (k) { st[k] = saved.st[k]; });
    build();
    render();
    if (saved.phase === "collapsed") {
      collapsed = true;
      updateLauncher();
      launcher.style.transition = "none";
      launcher.classList.add("show");
      void launcher.offsetWidth;
      launcher.style.transition = "";
    } else {
      overlay.style.transition = "none";
      overlay.classList.add("open");
      void overlay.offsetWidth;
      overlay.style.transition = "";
    }
  }

  function chip(label, on, onclick) {
    return el("button", { type: "button", class: "cm-chip", "aria-pressed": on ? "true" : "false", onclick: onclick }, esc(label));
  }
  function radio(label, on, onclick, extra) {
    return el("button", { type: "button", role: "checkbox", class: "cm-radio" + (extra ? " " + extra : ""), "aria-checked": on ? "true" : "false", onclick: onclick }, esc(label));
  }
  function updateNext() {
    var n = $(".cm-next", overlay);
    if (n) n.disabled = !canNext();
  }

  function render() {
    if (!overlay) return;
    var stepNo = Math.min(st.step, 3);
    // 단계가 바뀔 때는 상자를 유지하고 내용만 바꾼다 (등장 애니메이션은 처음 열 때 한 번만).
    var box = overlay.querySelector(".cm") || el("div", { class: "cm" });
    box.replaceChildren();

    var head = el("div", { class: "cm-head" });
    head.appendChild(el("span", { class: "t" }, "상담 신청"));
    var acts = el("div", { class: "cm-acts" });
    acts.appendChild(el("button", { type: "button", class: "cm-x cm-min", "aria-label": "접어두기", title: "접어두기", onclick: collapse }, "−"));
    acts.appendChild(el("button", { type: "button", class: "cm-x", "aria-label": "닫기", title: "닫기", onclick: closeModal }, "×"));
    head.appendChild(acts);
    box.appendChild(head);

    var body = el("div", { class: "cm-body" });
    if (st.step === 0) {
      body.appendChild(choiceScreen());
      box.appendChild(body);
      if (!box.parentNode) overlay.appendChild(box);
      persist();
      return;
    }
    var prog = el("div", { class: "cm-progress" });
    var dots = el("div", { class: "cm-dots", "aria-hidden": "true" });
    [1, 2, 3].forEach(function (i) {
      dots.appendChild(el("span", { class: i === stepNo ? "current" : i < stepNo ? "past" : "" }));
    });
    prog.appendChild(dots);
    prog.appendChild(el("span", { class: "cm-count" }, stepNo + " / 3"));
    body.appendChild(prog);

    if (st.step < 4) {
      body.appendChild(el("div", { class: "cm-badge" }, STEPS[stepNo - 1].badge));
      body.appendChild(el("h3", { class: "cm-title" }, STEPS[stepNo - 1].title));
    }

    if (st.step === 1) {
      var chips = el("div", { class: "cm-chips" });
      TYPES.forEach(function (t) {
        chips.appendChild(chip(t, st.type === t, function () { st.type = t; render(); }));
      });
      body.appendChild(chips);
      var alt = el("div", { class: "cm-alt" });
      alt.appendChild(radio(TYPE_UNDECIDED, st.type === TYPE_UNDECIDED, function () {
        st.type = st.type === TYPE_UNDECIDED ? null : TYPE_UNDECIDED; render();
      }));
      body.appendChild(alt);
    }

    if (st.step === 2) {
      // 예산은 직접 입력. 미정이면 입력 없이 다음으로 넘어갈 수 있다.
      var bwrap = el("label", { class: "cm-budget" });
      var inp = el("input", { class: "cm-input", placeholder: "예상 예산을 입력해주세요", "aria-label": "예상 예산", "aria-describedby": "cm-budget-help" });
      inp.value = st.budgetText;
      inp.disabled = st.undecided;
      inp.addEventListener("input", function () { st.budgetText = inp.value; updateNext(); });
      bwrap.appendChild(inp);
      bwrap.appendChild(el("small", { class: "cm-help", id: "cm-budget-help" }, "대략적인 금액이나 범위로 적어주셔도 괜찮아요."));
      body.appendChild(bwrap);
      if (!st.undecided) setTimeout(function () { inp.focus(); }, 0);
      var alt2 = el("div", { class: "cm-alt" });
      alt2.appendChild(radio("아직 예산은 미정이에요", st.undecided, function () {
        st.undecided = !st.undecided; render();
      }));
      body.appendChild(alt2);
    }

    if (st.step === 3) {
      var fields = el("div", { class: "cm-fields" });
      // 두 칸씩 한 줄: 회사명(넓게) + 담당자명 / 이메일 + 연락처
      var rows = [el("div", { class: "cm-row" }), el("div", { class: "cm-row even" })];
      FIELDS.forEach(function (f, idx) {
        var lab = el("label");
        lab.appendChild(el("span", null, esc(f.label)));
        var i = el("input", { class: "cm-input", type: f.type, placeholder: f.ph, autocomplete: f.auto });
        i.value = st.form[f.key];
        i.addEventListener("input", function () { st.form[f.key] = i.value; updateNext(); });
        lab.appendChild(i);
        rows[Math.floor(idx / 2)].appendChild(lab);
      });
      rows.forEach(function (r) { fields.appendChild(r); });
      // 행사 개요·대행 범위 등 자유 입력 (선택)
      var detailLab = el("label");
      detailLab.appendChild(el("span", null, "행사 내용 (선택)"));
      detailLab.appendChild(el("small", { class: "cm-help", id: "cm-detail-help" }, DETAIL_HINT));
      var detail = el("textarea", { class: "cm-input cm-textarea", rows: "3", "aria-describedby": "cm-detail-help" });
      detail.value = st.form.detail;
      detail.addEventListener("input", function () { st.form.detail = detail.value; });
      detailLab.appendChild(detail);
      fields.appendChild(detailLab);
      fields.appendChild(radio("개인정보 수집 및 이용에 동의합니다. 문의 응대 목적으로만 사용되며 처리 후 파기됩니다.", st.agreed, function (e) {
        st.agreed = !st.agreed;
        e.currentTarget.setAttribute("aria-checked", st.agreed ? "true" : "false");
        updateNext();
      }, "small"));
      body.appendChild(fields);
      if (st.error) body.appendChild(el("p", { class: "cm-error", role: "alert" }, esc(st.error)));
    }

    if (st.step === 4) {
      body.appendChild(el("div", { class: "cm-done" },
        '<div class="ok" aria-hidden="true">✓</div>' +
        "<h3>문의가 접수되었습니다</h3>" +
        "<p>담당자가 영업일 기준 1일 내에 연락드립니다.<br>급한 일정이라면 " + PHONE + "로 전화 주세요.</p>"));
    }
    box.appendChild(body);

    var foot = el("div", { class: "cm-foot" });
    var left = el("div");
    if (st.step >= 1 && st.step < 4) {
      left.appendChild(el("button", { type: "button", class: "cm-back", onclick: function () { st.step -= 1; st.error = ""; render(); } }, "‹&nbsp;&nbsp;뒤로"));
    }
    foot.appendChild(left);
    var label = st.step === 4 ? "닫기" : st.step === 3 ? (st.sending ? "보내는 중…" : "문의 보내기") : "다음&nbsp;&nbsp;›";
    var next = el("button", { type: "button", class: "cm-next", onclick: onNext }, label);
    next.disabled = !canNext();
    foot.appendChild(next);
    box.appendChild(foot);

    if (!box.parentNode) overlay.appendChild(box);
    persist();
  }

  // 상담 버튼을 누르면 먼저 보이는 화면: 카카오톡 문의 / 상담 폼 작성 중 선택
  var ARROW = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>';
  var FORM_ICON = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M9 13h6M9 17h4"/></svg>';
  var KAKAO_ICON = '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3C6.48 3 2 6.53 2 10.88c0 2.8 1.86 5.26 4.66 6.65l-.95 3.48c-.08.3.26.54.52.37l4.12-2.73c.54.07 1.09.11 1.65.11 5.52 0 10-3.53 10-7.88S17.52 3 12 3z"/></svg>';
  function choiceScreen() {
    var wrap = el("div", { class: "cm-choice" });
    wrap.appendChild(el("div", { class: "cm-badge" }, "FREE CONSULTING"));
    wrap.appendChild(el("h3", { class: "cm-title" }, "행사를 구상 중이신가요?"));
    wrap.appendChild(el("p", { class: "cm-choice-lead" }, "편한 방법으로 문의해 주세요.<br>상담 · 제안 · 견적까지 모두 무료입니다."));
    var opts = el("div", { class: "cm-opts" });
    opts.appendChild(el("button", { type: "button", class: "cm-opt is-kakao", onclick: function () { window.open(KAKAO_URL, "_blank", "noopener"); } },
      '<span class="ico">' + KAKAO_ICON + '</span><span class="txt"><b>카카오톡으로 문의하기</b><span>채널로 연결해 바로 대화를 시작해요</span></span><span class="go">' + ARROW + "</span>"));
    opts.appendChild(el("button", { type: "button", class: "cm-opt is-form", onclick: function () { st.step = 1; render(); } },
      '<span class="ico">' + FORM_ICON + '</span><span class="txt"><b>상담 폼 작성하기</b><span>몇 가지 질문에 답하고 맞춤 제안을 받아보세요</span></span><span class="go">' + ARROW + "</span>"));
    wrap.appendChild(opts);
    wrap.appendChild(el("div", { class: "cm-choice-contact" },
      '<a href="tel:' + PHONE + '">' + PHONE + '</a><span class="sep" aria-hidden="true"></span><a href="mailto:' + EMAIL + '">' + EMAIL + "</a>"));
    return wrap;
  }

  function onNext() {
    if (st.step === 4) { closeModal(); return; }
    if (!canNext()) return;
    if (st.step === 3) { submit(); return; }
    st.step += 1;
    render();
  }

  function loadEmailJS() {
    return new Promise(function (resolve, reject) {
      if (window.emailjs) { resolve(window.emailjs); return; }
      var s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
      s.onload = function () { window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY }); resolve(window.emailjs); };
      s.onerror = function () { reject(new Error("EmailJS SDK 로드 실패")); };
      document.head.appendChild(s);
    });
  }

  // 기존 EmailJS 템플릿(template_32zpy6s)의 변수 이름에 맞춰 보낸다.
  function submit() {
    st.sending = true;
    st.error = "";
    render();
    var budget = st.undecided ? "미정" : st.budgetText.trim();
    var params = {
      event_name: st.form.company.trim() + " · " + st.type,
      date: "미정",
      headcount: "미정",
      place: "미정",
      budget: budget || "미정",
      scope: st.type,
      note: (st.form.detail.trim() ? st.form.detail.trim() + "\n\n" : "") + "회사명: " + st.form.company.trim() + " / 문의 페이지: " + location.pathname,
      contact_name: st.form.name.trim(),
      contact_email: st.form.email.trim(),
      contact_phone: st.form.phone.trim() || "미입력"
    };
    loadEmailJS()
      .then(function (ejs) { return ejs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params); })
      .then(function () { st.sending = false; st.step = 4; render(); })
      .catch(function (err) {
        console.error("EmailJS 전송 오류:", err);
        st.sending = false;
        st.error = "전송에 실패했습니다. 잠시 후 다시 시도하시거나 " + PHONE + " / " + EMAIL + " 으로 연락 주세요.";
        render();
      });
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("[data-contact]");
    if (t) {
      e.preventDefault();
      if (menu && menu.classList.contains("open")) closeMenu();
      openModal();
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (overlay && overlay.classList.contains("open")) collapse();
    else if (menu && menu.classList.contains("open")) closeMenu();
  });
  window.addEventListener("pagehide", persist);
  restore();
  if (location.hash === "#contact") {
    history.replaceState(null, "", location.pathname + location.search);
    openModal();
  }

  /* ---------------- 프로젝트 목록 페이지네이션 ---------------- */
  var LIST_PAGE_KEY = "rastarProjectsPage"; // 상세에서 돌아갈 목록 페이지
  var grid = $("[data-project-grid]");
  if (grid) {
    var cards = $$(".project-card", grid);
    var per = Number(grid.getAttribute("data-per-page")) || 6;
    var total = Math.max(1, Math.ceil(cards.length / per));
    var pager = $("[data-pager]");
    var params = new URLSearchParams(location.search);
    var page = Math.min(total, Math.max(1, Number(params.get("page")) || 1));

    function show(p, scroll) {
      page = p;
      cards.forEach(function (c, i) { c.hidden = Math.floor(i / per) !== p - 1; });
      renderPager();
      var url = new URL(location.href);
      if (p === 1) url.searchParams.delete("page"); else url.searchParams.set("page", p);
      history.replaceState(null, "", url);
      try { sessionStorage.setItem(LIST_PAGE_KEY, String(p)); } catch (e) {}
      if (scroll) window.scrollTo({ top: 0, behavior: "smooth" });
    }
    function btn(label, opts) {
      var b = el("button", { type: "button", "aria-label": opts.aria || label }, label);
      if (opts.current) b.setAttribute("aria-current", "page");
      if (opts.disabled) b.disabled = true;
      b.addEventListener("click", function () { show(opts.to, true); });
      return b;
    }
    function renderPager() {
      if (!pager) return;
      pager.replaceChildren();
      if (total <= 1) return;
      pager.appendChild(btn("‹", { aria: "이전 페이지", to: page - 1, disabled: page === 1 }));
      for (var i = 1; i <= total; i++) pager.appendChild(btn(String(i), { aria: i + " 페이지", to: i, current: i === page }));
      pager.appendChild(btn("›", { aria: "다음 페이지", to: page + 1, disabled: page === total }));
    }
    show(page, false);
  }

  /* ---------------- 상세 → 목록 돌아가기 ----------------
     목록(?page=N)에서 들어왔다면 브라우저 뒤로가기로 돌아가 보던 페이지·스크롤을 유지한다.
     배포 서버(Cloudflare)는 .html 을 떼므로 /Projects 와 /Projects.html 을 모두 목록으로 본다.
     referrer 가 없더라도 목록에서 마지막으로 보던 페이지 번호(sessionStorage)로 돌아간다. */
  var backLink = $(".back");
  if (backLink) {
    var ref = null;
    try { ref = document.referrer ? new URL(document.referrer) : null; } catch (e) {}
    if (ref && ref.origin === location.origin && /^\/Projects(\.html)?\/?$/i.test(ref.pathname)) {
      backLink.href = ref.pathname + ref.search;
      backLink.addEventListener("click", function (e) {
        if (history.length > 1) { e.preventDefault(); history.back(); }
      });
    } else {
      var lastPage = null;
      try { lastPage = sessionStorage.getItem(LIST_PAGE_KEY); } catch (e) {}
      if (lastPage && lastPage !== "1") backLink.href = "/Projects.html?page=" + encodeURIComponent(lastPage);
    }
  }

  /* ---------------- 프로젝트 상세 갤러리 ---------------- */
  var stage = $("[data-stage]");
  if (stage) {
    var img = $("img", stage);
    var counter = $("[data-counter]", stage);
    var thumbs = $("[data-thumbs]");
    var wrap = thumbs && thumbs.parentElement;
    var items = thumbs ? $$("button", thumbs) : [];
    var cur = 0;
    function pad(n) { return String(n).padStart(2, "0"); }
    function go(n) {
      if (!items.length) return;
      cur = (n + items.length) % items.length;
      img.src = items[cur].getAttribute("data-full");
      items.forEach(function (b, i) { b.setAttribute("aria-current", i === cur ? "true" : "false"); });
      if (counter) counter.textContent = pad(cur + 1) + " / " + pad(items.length);
      var it = items[cur];
      thumbs.scrollTo({ left: Math.max(0, it.offsetLeft - (thumbs.clientWidth - it.offsetWidth) / 2), behavior: "smooth" });
    }
    items.forEach(function (b, i) { b.addEventListener("click", function () { go(i); }); });
    var prev = $("[data-prev]", stage), next = $("[data-next]", stage);
    if (prev) prev.addEventListener("click", function () { go(cur - 1); });
    if (next) next.addEventListener("click", function () { go(cur + 1); });
    document.addEventListener("keydown", function (e) {
      if (menu && menu.classList.contains("open")) return;
      if (e.target.closest && e.target.closest("input, textarea, .cm-panel")) return;
      if (e.key === "ArrowLeft") go(cur - 1);
      if (e.key === "ArrowRight") go(cur + 1);
    });
    // 다음 이미지를 미리 받아둬서 넘길 때 깜빡임을 줄인다.
    img.addEventListener("load", function () {
      if (items.length > 1) (new Image()).src = items[(cur + 1) % items.length].getAttribute("data-full");
    });

    if (thumbs) {
      var syncEnd = function () {
        wrap.classList.toggle("at-end", thumbs.scrollLeft + thumbs.clientWidth >= thumbs.scrollWidth - 2);
      };
      thumbs.addEventListener("scroll", syncEnd, { passive: true });
      window.addEventListener("resize", syncEnd);
      syncEnd();
      // 세로 휠로 썸네일 띠를 가로 스크롤
      thumbs.addEventListener("wheel", function (ev) {
        if (thumbs.scrollWidth <= thumbs.clientWidth) return;
        if (Math.abs(ev.deltaY) <= Math.abs(ev.deltaX)) return;
        var atStart = thumbs.scrollLeft <= 0;
        var atEnd = thumbs.scrollLeft + thumbs.clientWidth >= thumbs.scrollWidth - 1;
        if ((ev.deltaY < 0 && atStart) || (ev.deltaY > 0 && atEnd)) return;
        ev.preventDefault();
        thumbs.scrollLeft += ev.deltaY;
      }, { passive: false });
    }
  }
})();
