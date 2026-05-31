/* ============================================================
   서울이도치과 (YIDO) — Scroll FX (parallax)
   애플식 스크롤 인터랙션. 외부 라이브러리 없음, rAF 스로틀.
   prefers-reduced-motion: reduce 이면 비활성(정적 표시).

   [data-parallax="강도px"] : 스크롤에 따라 미디어가 느리게 이동(깊이감)
   (영상 프레임 스크럽은 js/scroll-video.js 의 [data-scrub-video] 담당)
   ============================================================ */
(function () {
  "use strict";

  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  if (!parallaxEls.length) return;

  var ticking = false;

  function update() {
    var vh = window.innerHeight || document.documentElement.clientHeight;

    for (var i = 0; i < parallaxEls.length; i++) {
      var el = parallaxEls[i];
      var r = el.getBoundingClientRect();
      if (r.bottom < -120 || r.top > vh + 120) continue; // 화면 밖이면 스킵
      var strength = parseFloat(el.getAttribute("data-parallax")) || 24;
      var center = r.top + r.height / 2;
      var prog = (center - vh / 2) / vh;          // 대략 -1 ~ 1
      var shift = (prog * strength * -1).toFixed(1);
      el.style.transform = "translate3d(0," + shift + "px,0)";
    }

    ticking = false;
  }

  function onScroll() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  window.addEventListener("load", update);
  update();
})();
