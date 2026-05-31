/* ============================================================
   서울이도치과 (YIDO) — Pinned scroll storytelling
   sangguk-meat의 AnatomyScroll(GSAP pin+scrub+canvas) 패턴을
   무의존 vanilla로 구현. sticky로 핀, 스크롤 진행도 0→1을
   (1) 모먼트 카드 크로스페이드 (2) <canvas> 절차적 렌더에 매핑.
   추후 Nano Banana+Kling WEBP 프레임시퀀스로 교체 가능
   (renderFrame을 프레임 drawImage로 바꾸면 됨).
   prefers-reduced-motion: 정적(모든 모먼트 표시, 핀 해제).
   ============================================================ */
(function () {
  "use strict";

  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* 모바일/데이터절약: 저니 영상 재생 안 함 → poster만(크로스페이드는 유지) */
  var _c = navigator.connection || {};
  var LITE = (window.matchMedia && window.matchMedia("(max-width: 768px)").matches) ||
    _c.saveData === true || /(^|-)2g$/.test(_c.effectiveType || "");

  function css(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name);
    return (v && v.trim()) || fallback;
  }
  var C = {
    paper: css("--paper", "#F5EFE6"),
    wood: css("--wood-300", "#D8C7AE"),
    accent: css("--accent-600", "#D98A2B"),
    ink300: css("--ink-300", "#A39B90"),
    line: css("--line", "rgba(26,23,20,.12)")
  };

  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

  function setup(section) {
    var stage = section.querySelector(".pinscroll__stage");
    var canvas = section.querySelector(".pinscroll__canvas");
    var moments = Array.prototype.slice.call(section.querySelectorAll(".pmoment"));
    var dots = Array.prototype.slice.call(section.querySelectorAll(".pinscroll__dots li"));
    var imgs = Array.prototype.slice.call(section.querySelectorAll(".pinscroll__img"));
    var n = moments.length;
    if (!stage || !n) return;

    /* reduced-motion: 정적 표시 */
    if (reduce) {
      section.classList.add("is-static");
      moments.forEach(function (m) { m.classList.add("is-active"); });
      return;
    }

    var ctx = canvas ? canvas.getContext("2d") : null;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cw = 0, ch = 0;

    function resize() {
      if (!canvas) return;
      cw = stage.clientWidth; ch = stage.clientHeight;
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      canvas.style.width = cw + "px";
      canvas.style.height = ch + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function renderFrame(progress, idx) {
      if (!ctx) return;
      ctx.clearRect(0, 0, cw, ch); /* 투명 — 뒤의 사진이 보이도록 */

      /* 큰 세리프 숫자 워터마크(우측, 사진 위 화이트 저알파) */
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.font = "700 " + Math.round(Math.min(cw, ch) * 0.62) + 'px "Cormorant Garamond", Georgia, serif';
      ctx.fillText(("0" + (idx + 1)).slice(-2), cw - Math.max(24, cw * 0.05), ch * 0.5);
      ctx.restore();

      /* 좌측 세로 진행 트랙 + 노드 (화이트 오버레이) */
      var x = Math.max(34, cw * 0.08);
      var top = ch * 0.22, bot = ch * 0.78, span = bot - top;
      ctx.strokeStyle = "rgba(255,255,255,.22)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bot); ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,.92)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, top + span * progress); ctx.stroke();
      for (var i = 0; i < n; i++) {
        var y = top + span * (n === 1 ? 0 : i / (n - 1));
        var active = i === idx;
        ctx.beginPath();
        ctx.arc(x, y, active ? 7 : 4, 0, Math.PI * 2);
        if (active) { ctx.shadowColor = "rgba(255,255,255,.65)"; ctx.shadowBlur = 16; }
        ctx.fillStyle = i <= idx ? "#FFFFFF" : "rgba(255,255,255,.30)";
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    var lastIdx = -1;
    function update() {
      var rect = section.getBoundingClientRect();
      var total = section.offsetHeight - stage.offsetHeight;
      var progress = total > 0 ? clamp(-rect.top / total, 0, 1) : 0;
      var idx = clamp(Math.floor(progress * n), 0, n - 1);

      if (idx !== lastIdx) {
        moments.forEach(function (m, i) { m.classList.toggle("is-active", i === idx); });
        imgs.forEach(function (im, i) {
          var on = i === idx;
          im.classList.toggle("is-active", on);
          if (im.tagName === "VIDEO") {
            if (on && !LITE) {
              if (im.preload === "none") im.preload = "auto";
              var pp = im.play(); if (pp && pp.catch) pp.catch(function () {});
            } else { try { im.pause(); } catch (e) {} }
          }
        });
        dots.forEach(function (d, i) {
          d.classList.toggle("is-active", i === idx);
          d.classList.toggle("is-done", i < idx);
        });
        lastIdx = idx;
      }
      renderFrame(progress, idx);
    }

    var ticking = false;
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(function () { update(); ticking = false; }); } }

    resize();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function () { resize(); update(); }, { passive: true });
    window.addEventListener("load", function () { resize(); update(); });
  }

  document.querySelectorAll("[data-pinscroll]").forEach(setup);
})();
