/* ============================================================
   서울이도치과 (YIDO) — Navigation
   - sticky 헤더 그림자(스크롤 시), 스크롤 진행바
   - 스크롤스파이(IntersectionObserver) → 활성 nav 표시(aria-current)
   - 모바일 햄버거 드로어(aria-expanded, body lock, focus trap, Esc, 링크 클릭 시 닫힘)
   ============================================================ */
(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var progress = document.querySelector(".scroll-progress");
  var toggle = document.querySelector(".nav-toggle");
  var drawer = document.querySelector(".nav-drawer");
  var primaryLinks = Array.prototype.slice.call(
    document.querySelectorAll('.nav-primary a[href^="#"]')
  );

  /* ---- draft 배너 높이 → --draft-h (헤더·드로어·진행바 오프셋. 언어·폭 변화에 견고) ----
     배너 제거 시 var fallback 0px로 자동 정렬됨 */
  var draftNote = document.querySelector(".draft-note");
  function setDraftH() {
    var h = draftNote ? draftNote.offsetHeight : 0;
    document.documentElement.style.setProperty("--draft-h", h + "px");
  }
  setDraftH();
  if (draftNote && "ResizeObserver" in window) {
    new ResizeObserver(setDraftH).observe(draftNote);
  }
  window.addEventListener("resize", setDraftH, { passive: true });
  window.addEventListener("load", setDraftH);

  /* ---- 스크롤: 헤더 그림자 + 진행바 ---- */
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (progress) {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var pct = max > 0 ? (y / max) * 100 : 0;
      progress.style.width = pct + "%";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- 스크롤스파이 ---- */
  var sections = primaryLinks
    .map(function (a) {
      var id = a.getAttribute("href").slice(1);
      return document.getElementById(id);
    })
    .filter(Boolean);

  function setActive(id) {
    primaryLinks.forEach(function (a) {
      var on = a.getAttribute("href") === "#" + id;
      a.setAttribute("aria-current", on ? "true" : "false");
    });
  }

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) setActive(en.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---- 모바일 드로어 ---- */
  function focusables() {
    if (!drawer) return [];
    return Array.prototype.slice.call(
      drawer.querySelectorAll('a[href], button:not([disabled])')
    );
  }

  function openDrawer() {
    if (!drawer || !toggle) return;
    drawer.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("nav-open");
    var f = focusables();
    if (f.length) f[0].focus();
  }
  function closeDrawer() {
    if (!drawer || !toggle) return;
    drawer.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  }
  function isOpen() { return drawer && drawer.classList.contains("is-open"); }

  if (toggle) {
    toggle.addEventListener("click", function () {
      isOpen() ? closeDrawer() : openDrawer();
    });
  }
  if (drawer) {
    // 링크 클릭 시 닫기
    drawer.addEventListener("click", function (e) {
      if (e.target.closest('a[href^="#"]')) closeDrawer();
    });
  }
  // Esc + focus trap
  document.addEventListener("keydown", function (e) {
    if (!isOpen()) return;
    if (e.key === "Escape") { closeDrawer(); toggle.focus(); return; }
    if (e.key === "Tab") {
      var f = focusables();
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  // 데스크톱 폭으로 리사이즈 시 드로어 정리
  window.addEventListener("resize", function () {
    if (window.innerWidth >= 1200 && isOpen()) closeDrawer();
  });
})();
