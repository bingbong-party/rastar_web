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

  var TYPES = ["프로모션", "팝업스토어", "론칭·쇼케이스", "페스티벌", "스포츠 행사", "공공·지역행사", "기업행사", "컨퍼런스", "전시·박람회", "온라인·하이브리드", "기타"];
  var TYPE_UNDECIDED = "아직 고민중이에요";
  var BUDGETS = ["1천만원 미만", "1~5천만원", "5천만원~1억", "1억 이상", "직접 입력"];
  var STEPS = [
    { badge: "STEP 1 / 3 · 의뢰 유형", title: "어떤 행사를 준비하고 계신가요?" },
    { badge: "STEP 2 / 3 · 예산", title: "예산은 어느 정도로 생각하고 계신가요?" },
    { badge: "STEP 3 / 3 · 문의자 정보", title: "연락받을 정보를 알려주세요." }
  ];
  var DETAIL_HINT = [
    "행사 개요와 맡기고 싶은 범위를 자유롭게 적어주세요.",
    "예) 참여 인원 약 300명 · 서울 OO호텔 연회장",
    "    희망 일정 11월 중순",
    "    기획부터 현장 운영까지 전체 대행 / 무대·음향만 필요"
  ].join("\n");
  var FIELDS = [
    { key: "company", label: "회사명 *", ph: "회사 또는 단체명", type: "text", auto: "organization" },
    { key: "name", label: "담당자명 *", ph: "성함", type: "text", auto: "name" },
    { key: "email", label: "이메일 *", ph: "name@company.com", type: "email", auto: "email" },
    { key: "phone", label: "연락처 (선택)", ph: "010-0000-0000", type: "tel", auto: "tel" }
  ];

  var st, overlay, lastFocus;
  function reset() {
    st = { step: 1, type: null, budget: null, budgetText: "", undecided: false,
           form: { company: "", name: "", email: "", phone: "", detail: "" }, agreed: false, sending: false, error: "" };
  }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }
  function canNext() {
    if (st.step === 1) return !!st.type;
    if (st.step === 2) return !!(st.undecided || (st.budget && (st.budget !== "직접 입력" || st.budgetText.trim())));
    if (st.step === 3) return !!(st.form.company.trim() && st.form.name.trim() && validEmail(st.form.email) && st.agreed && !st.sending);
    return true;
  }

  function openModal() {
    reset();
    lastFocus = document.activeElement;
    overlay = el("div", { class: "cm-overlay", role: "dialog", "aria-modal": "true", "aria-label": "상담 신청" });
    overlay.addEventListener("click", function (e) { if (e.target === overlay) closeModal(); });
    document.body.appendChild(overlay);
    document.body.classList.add("no-scroll");
    render();
  }
  function closeModal() {
    if (!overlay) return;
    overlay.remove();
    overlay = null;
    if (!(menu && menu.classList.contains("open"))) document.body.classList.remove("no-scroll");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
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
    head.appendChild(el("button", { type: "button", class: "cm-x", "aria-label": "닫기", onclick: closeModal }, "×"));
    box.appendChild(head);

    var body = el("div", { class: "cm-body" });
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
      var bchips = el("div", { class: "cm-chips" });
      BUDGETS.forEach(function (b) {
        bchips.appendChild(chip(b, !st.undecided && st.budget === b, function () { st.budget = b; st.undecided = false; render(); }));
      });
      body.appendChild(bchips);
      if (st.budget === "직접 입력" && !st.undecided) {
        var inp = el("input", { class: "cm-input accent", placeholder: "예상 예산을 입력해주세요", "aria-label": "예상 예산" });
        inp.value = st.budgetText;
        inp.addEventListener("input", function () { st.budgetText = inp.value; updateNext(); });
        body.appendChild(inp);
        setTimeout(function () { inp.focus(); }, 0);
      }
      var alt2 = el("div", { class: "cm-alt" });
      alt2.appendChild(radio("아직 예산은 미정이에요", st.undecided, function () {
        st.undecided = !st.undecided; st.budget = null; render();
      }));
      body.appendChild(alt2);
    }

    if (st.step === 3) {
      var fields = el("div", { class: "cm-fields" });
      FIELDS.forEach(function (f) {
        var lab = el("label");
        lab.appendChild(el("span", null, esc(f.label)));
        var i = el("input", { class: "cm-input", type: f.type, placeholder: f.ph, autocomplete: f.auto });
        i.value = st.form[f.key];
        i.addEventListener("input", function () { st.form[f.key] = i.value; updateNext(); });
        lab.appendChild(i);
        fields.appendChild(lab);
      });
      // 행사 개요·대행 범위 등 자유 입력 (선택)
      var detailLab = el("label");
      detailLab.appendChild(el("span", null, "행사 내용 (선택)"));
      var detail = el("textarea", { class: "cm-input cm-textarea", rows: "5", placeholder: DETAIL_HINT });
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
    if (st.step > 1 && st.step < 4) {
      left.appendChild(el("button", { type: "button", class: "cm-back", onclick: function () { st.step -= 1; st.error = ""; render(); } }, "‹&nbsp;&nbsp;뒤로"));
    }
    foot.appendChild(left);
    var label = st.step === 4 ? "닫기" : st.step === 3 ? (st.sending ? "보내는 중…" : "문의 보내기") : "다음&nbsp;&nbsp;›";
    var next = el("button", { type: "button", class: "cm-next", onclick: onNext }, label);
    next.disabled = !canNext();
    foot.appendChild(next);
    box.appendChild(foot);

    if (!box.parentNode) overlay.appendChild(box);
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
    var budget = st.undecided ? "미정" : st.budget === "직접 입력" ? st.budgetText.trim() : st.budget;
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
        st.error = "전송에 실패했습니다. 잠시 후 다시 시도하시거나 " + PHONE + " / ws@rastarcomms.com 으로 연락 주세요.";
        render();
      });
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("[data-contact]");
    if (t) { e.preventDefault(); openModal(); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (overlay) closeModal();
    else if (menu && menu.classList.contains("open")) closeMenu();
  });
  if (location.hash === "#contact") {
    history.replaceState(null, "", location.pathname + location.search);
    openModal();
  }

  /* ---------------- 프로젝트 목록 페이지네이션 ---------------- */
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
      if (overlay || (menu && menu.classList.contains("open"))) return;
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
