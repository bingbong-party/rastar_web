/* =====================================================================
   Rabyeol Comms — interactions
   nav scroll · mobile menu · project carousel · capability + faq accordions
   · consultation modal (open/close + validation + success)
   ===================================================================== */
(function () {
  "use strict";

  /* ---- nav: solid on scroll ---- */
  var nav = document.querySelector(".nav");
  var solidNav = document.body.getAttribute("data-nav") === "solid";
  function onScroll() {
    if (!nav) return;
    if (solidNav || window.scrollY > 40) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- mobile menu ---- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.querySelector(".mobile-menu");
  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle("open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (toggle) toggle.addEventListener("click", function () {
    setMenu(!menu.classList.contains("open"));
  });
  if (menu) menu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { setMenu(false); });
  });

  /* ---- project carousel ---- */
  var carousel = document.querySelector("[data-carousel]");
  if (carousel) {
    var prev = document.querySelector("[data-carousel-prev]");
    var next = document.querySelector("[data-carousel-next]");
    function cardStep() {
      var card = carousel.querySelector(".project-card");
      if (!card) return 360;
      var gap = parseFloat(getComputedStyle(carousel).columnGap || "20") || 20;
      return card.getBoundingClientRect().width + gap;
    }
    function updateArrows() {
      if (!prev || !next) return;
      prev.disabled = carousel.scrollLeft <= 4;
      next.disabled = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 4;
    }
    if (prev) prev.addEventListener("click", function () {
      carousel.scrollBy({ left: -cardStep(), behavior: "smooth" });
    });
    if (next) next.addEventListener("click", function () {
      carousel.scrollBy({ left: cardStep(), behavior: "smooth" });
    });
    carousel.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    updateArrows();

    /* drag to scroll (pointer) */
    var down = false, moved = false, startX = 0, startScroll = 0;
    carousel.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      down = true; moved = false;
      startX = e.clientX;
      startScroll = carousel.scrollLeft;
      carousel.classList.add("dragging");
    });
    carousel.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) {
        moved = true;
        try { carousel.setPointerCapture(e.pointerId); } catch (err) {}
      }
      if (moved) { carousel.scrollLeft = startScroll - dx; e.preventDefault(); }
    });
    function endDrag() {
      if (!down) return;
      down = false;
      carousel.classList.remove("dragging");
    }
    carousel.addEventListener("pointerup", endDrag);
    carousel.addEventListener("pointercancel", endDrag);
    carousel.addEventListener("pointerleave", endDrag);
    // suppress the click that follows a drag (so filled slots don't react)
    carousel.addEventListener("click", function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);
    // native image drag would hijack the gesture
    carousel.addEventListener("dragstart", function (e) { e.preventDefault(); });
  }

  /* ---- generic accordions (capabilities + faq) ---- */
  function bindAccordion(rowSel, headSel, openClass, exclusive) {
    var rows = Array.prototype.slice.call(document.querySelectorAll(rowSel));
    rows.forEach(function (row) {
      var head = row.querySelector(headSel);
      if (!head) return;
      head.addEventListener("click", function () {
        var isOpen = row.classList.contains(openClass);
        if (exclusive) rows.forEach(function (r) { r.classList.remove(openClass); });
        row.classList.toggle(openClass, !isOpen);
      });
    });
  }
  /* FAQ opens on hover (see .faq-item:hover in styles.css) */

  /* ---- consultation form (Contact.html) ---- */
  var form = document.querySelector("[data-consult-form]");

  /* close mobile menu on Escape */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { setMenu(false); }
  });

  /* event-type chips + validation + inline success */
  if (form) {
    var chips = form.querySelectorAll(".chip-opt");
    var typeField = form.querySelector("[name=eventType]");
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.classList.remove("active"); });
        chip.classList.add("active");
        if (typeField) typeField.value = chip.dataset.value;
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      ["name", "company", "contact"].forEach(function (n) {
        var f = form.querySelector("[name=" + n + "]");
        if (f && !f.value.trim()) { f.classList.add("invalid"); ok = false; }
      });
      if (!ok) {
        var firstInvalid = form.querySelector(".invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      var success = document.querySelector(".form-success");
      form.style.display = "none";
      if (success) success.hidden = false;
    });

    form.querySelectorAll("input, textarea").forEach(function (f) {
      f.addEventListener("input", function () { f.classList.remove("invalid"); });
    });
  }
})();
