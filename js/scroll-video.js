/* 서울이도치과 — Scroll-scrub video (vanilla, GSAP 없음)
   sangguk AnatomyScroll: pin + scrub progress 0→1 → video.currentTime.
   rVFC(requestVideoFrameCallback) lerp 추격으로 시킹 부드럽게.
   모바일/시킹 불가 → 정적 폴백. reduced-motion → 핀 해제.
   [C1] 핀 가시 구간 동안 히어로 배경 영상(同 자산) pause → 동시 디코딩 회피. */
(function () {
  "use strict";
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* 모바일/데이터절약: 스크럽(시킹) 비활성 → poster 정적 표시(렉 방지) */
  var _c = navigator.connection || {};
  var LITE = matchMedia("(max-width: 768px)").matches ||
    _c.saveData === true || /(^|-)2g$/.test(_c.effectiveType || "");
  var sections = [].slice.call(document.querySelectorAll("[data-scrub-video]"));
  if (!sections.length) return;

  var coarse = matchMedia("(pointer: coarse)").matches;
  var hasRVFC = "requestVideoFrameCallback" in HTMLVideoElement.prototype;

  // [C1] 히어로 배경 영상(라미네이트 동일 자산) — 스크럽 핀 동안 정지시켜 동시 디코딩 방지
  var heroVideo = document.querySelector(".hero__bg video");

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  sections.forEach(function (sec) {
    var video = sec.querySelector("video");
    var pin = sec.querySelector(".scrubfilm__pin");
    var caps = [].slice.call(sec.querySelectorAll(".scrubcap"));
    if (!video || !pin) return;

    function goStatic() {
      sec.classList.add("is-static");
      try {
        video.removeAttribute("loop");
        video.pause();
        video.currentTime = (video.duration * 0.45) || 0;
      } catch (e) {}
    }
    if (reduce) { goStatic(); return; }
    if (LITE) { sec.classList.add("is-static"); try { video.removeAttribute("loop"); video.pause(); } catch (e) {} return; } // poster 유지, 시킹 없음

    var duration = 0, targetT = 0, currentT = 0, rafId = 0, running = false;
    var heroPaused = false;

    function progress() {
      var rect = sec.getBoundingClientRect();
      var total = sec.offsetHeight - pin.offsetHeight; // 핀이 머무는 스크롤 거리
      return total > 0 ? clamp(-rect.top / total, 0, 1) : 0;
    }

    function updateCaps(p) {
      caps.forEach(function (c) {
        var inP = parseFloat(c.dataset.in), outP = parseFloat(c.dataset.out);
        c.classList.toggle("is-on", p >= inP && p <= outP);
      });
    }

    // [C1] 핀 가시 여부에 따라 히어로 영상 일시정지/재개
    function manageHero(visible) {
      if (!heroVideo) return;
      if (visible && !heroPaused) { try { heroVideo.pause(); } catch (e) {} heroPaused = true; }
      else if (!visible && heroPaused) { try { heroVideo.play(); } catch (e) {} heroPaused = false; }
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var p = progress();
        var rect = sec.getBoundingClientRect();
        var visible = rect.bottom > 0 && rect.top < innerHeight;
        manageHero(visible);
        if (visible && duration) { targetT = p * duration; updateCaps(p); start(); }
        ticking = false;
      });
    }

    function seekTo(t) {
      if (Math.abs(video.currentTime - t) < 0.012) return; // 1프레임 미만 skip
      try {
        if (typeof video.fastSeek === "function" && coarse) video.fastSeek(t);
        else video.currentTime = t;
      } catch (e) {}
    }
    function tick() {
      currentT += (targetT - currentT) * 0.18; // lerp 계수
      seekTo(currentT);
      if (Math.abs(targetT - currentT) > 0.01) { schedule(); }
      else { running = false; } // 도달 시 휴면(배터리)
    }
    function schedule() {
      if (hasRVFC) video.requestVideoFrameCallback(tick);
      else rafId = requestAnimationFrame(tick);
    }
    function start() { if (!running) { running = true; schedule(); } }

    function ready() {
      duration = video.duration;
      if (!duration || isNaN(duration)) { goStatic(); return; }
      try { video.pause(); } catch (e) {}
      video.currentTime = 0; currentT = 0; targetT = 0;
      var probed = false;
      var probe = setTimeout(function () { if (!probed) goStatic(); }, 1500);
      video.addEventListener("seeked", function once() {
        probed = true; clearTimeout(probe);
        video.removeEventListener("seeked", once);
      });
      try { video.currentTime = 0.1; } catch (e) { clearTimeout(probe); goStatic(); }
      addEventListener("scroll", onScroll, { passive: true });
      addEventListener("resize", onScroll, { passive: true });
      onScroll();
    }

    if (video.readyState >= 1) ready();
    else video.addEventListener("loadedmetadata", ready, { once: true });
  });
})();
