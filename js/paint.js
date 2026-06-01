/* ============================================================
   서울이도치과 (YIDO) — 키컬러 페인트인
   섹션 번호·제목이 뷰포트 진입 시 키컬러(주황)로 좌→우 칠해짐(1회).
   prefers-reduced-motion / IO 미지원 → 즉시 칠해진 상태.
   ============================================================ */
(function () {
  "use strict";
  var els = Array.prototype.slice.call(
    document.querySelectorAll(".section__num, .section__title")
  );
  if (!els.length) return;

  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduce || !("IntersectionObserver" in window)) {
    els.forEach(function (e) { e.classList.add("is-painted"); });
    return;
  }

  var io = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add("is-painted");
        obs.unobserve(en.target);
      }
    });
  }, { rootMargin: "0px 0px -18% 0px", threshold: 0.25 });

  els.forEach(function (e) { io.observe(e); });
})();
