/* ============================================================
   서울이도치과 (YIDO) — autovideo
   [data-autovideo]: 뷰포트에 들어올 때만 재생, 나가면 일시정지(성능).
   PNG poster + preload="none" → 화면 밖에선 로드·디코드 안 함(첫 노출 시 로드).
   prefers-reduced-motion: 재생하지 않음 → poster 정지화면 유지.
   (핀드 저니의 .pinscroll__img 영상은 scrollyframes.js가 따로 제어 → 여기서 제외)
   ============================================================ */
(function () {
  "use strict";

  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* 모바일/데이터절약: 영상 재생 안 함 → 가벼운 webp poster만(렉 방지) */
  var conn = navigator.connection || {};
  /* 데이터 절약/2G에서만 재생 생략(포스터). 일반 모바일은 AV1(경량)으로 재생 — IO가 화면 밖은 일시정지 */
  var saveData = conn.saveData === true || /(^|-)2g$/.test(conn.effectiveType || "");

  var vids = Array.prototype.slice.call(
    document.querySelectorAll("video[data-autovideo]")
  );
  if (!vids.length || reduce || saveData) return; // reduce/데이터절약: poster 유지

  function play(v) {
    if (v.preload === "none") v.preload = "auto"; // 첫 노출 시 로드 허용
    var p = v.play();
    if (p && p.catch) p.catch(function () {}); /* autoplay 거부 무시(poster 유지) */
  }

  if (!("IntersectionObserver" in window)) { vids.forEach(play); return; }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) play(en.target);
      else { try { en.target.pause(); } catch (e) {} }
    });
  }, { rootMargin: "200px 0px", threshold: 0.1 });

  vids.forEach(function (v) { io.observe(v); });
})();
