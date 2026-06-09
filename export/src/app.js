/* =====================================================================
   Rabyeol Comms — interactions
   nav scroll · mobile menu · project carousel · capability + faq accordions
   · consultation modal (open/close + validation + success)
   ===================================================================== */
(function () {
  "use strict";

  /* ---- nav: solid on scroll ---- */
  var nav = document.querySelector(".nav");
  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 40) nav.classList.add("scrolled");
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
  bindAccordion(".cap-row", ".cap-head", "open", true);
  bindAccordion(".faq-item", ".faq-q", "open", false);

  /* ---- consultation modal ---- */
  var overlay = document.querySelector("[data-modal]");
  var form = overlay ? overlay.querySelector("form") : null;
  function openModal() {
    if (!overlay) return;
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    var first = overlay.querySelector("input");
    if (first) setTimeout(function () { first.focus(); }, 320);
  }
  function closeModal() {
    if (!overlay) return;
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }
  document.querySelectorAll("[data-open-modal]").forEach(function (b) {
    b.addEventListener("click", function (e) { e.preventDefault(); setMenu(false); openModal(); });
  });
  if (overlay) {
    overlay.addEventListener("click", function (e) { if (e.target === overlay) closeModal(); });
    overlay.querySelectorAll("[data-close-modal]").forEach(function (b) {
      b.addEventListener("click", closeModal);
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeModal(); setMenu(false); }
  });

  /* event-type chips */
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
      if (!ok) return;
      var body = overlay.querySelector(".modal-body");
      var success = overlay.querySelector(".modal-success");
      if (body && success) { body.style.display = "none"; success.style.display = "block"; }
    });

    form.querySelectorAll("input, textarea").forEach(function (f) {
      f.addEventListener("input", function () { f.classList.remove("invalid"); });
    });
  }
})();
