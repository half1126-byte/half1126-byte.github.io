/* ============================================================
   서울이도치과 (YIDO) — Reveal-on-scroll
   [data-reveal] 요소를 뷰포트 진입 시 노출.
   prefers-reduced-motion: reduce 이면 즉시 전부 노출(애니메이션 없음).
   ============================================================ */
(function () {
  "use strict";

  var items = Array.prototype.slice.call(document.querySelectorAll("[data-reveal], [data-stagger]"));
  if (!items.length) return;

  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }

  var io = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-visible");
          obs.unobserve(en.target);
        }
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
  );

  items.forEach(function (el) { io.observe(el); });
})();
