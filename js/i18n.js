/* ============================================================
   서울이도치과 (YIDO) — i18n engine
   - data-i18n="key"            → textContent 치환
   - data-i18n-html="key"       → innerHTML 치환 (신뢰된 인라인 마크업)
   - data-i18n-attr="attr:key;attr2:key2" → 속성 치환
   폴백 체인: 선택 언어 값(비어있지 않음) → 한국어 → 기존 HTML 유지
   JSON fetch 없이 window.YIDO_I18N 전역 객체 사용 → file:// 에서 동작
   ============================================================ */
(function () {
  "use strict";

  var SUPPORTED = ["ko", "en", "ja", "zh"];
  var STORAGE_KEY = "yido_lang";
  var DICT = window.YIDO_I18N || {};

  function getStored() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      return SUPPORTED.indexOf(v) !== -1 ? v : null;
    } catch (e) { return null; }
  }
  function setStored(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  /* 폴백 체인으로 문구 조회 */
  function resolve(lang, key) {
    var v = DICT[lang] && DICT[lang][key];
    if (v !== undefined && v !== null && v !== "") return v;
    var ko = DICT.ko && DICT.ko[key];
    if (ko !== undefined && ko !== null && ko !== "") return ko;
    return null; // 유지
  }

  function applyLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) lang = "ko";
    document.documentElement.setAttribute("lang", lang);

    // textContent
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var val = resolve(lang, el.getAttribute("data-i18n"));
      if (val !== null) el.textContent = val;
    });

    // innerHTML (trusted)
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var val = resolve(lang, el.getAttribute("data-i18n-html"));
      if (val !== null) el.innerHTML = val;
    });

    // attributes  (format: "aria-label:nav.menu;title:nav.menu")
    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        var parts = pair.split(":");
        if (parts.length !== 2) return;
        var attr = parts[0].trim(), key = parts[1].trim();
        var val = resolve(lang, key);
        if (val !== null) el.setAttribute(attr, val);
      });
    });

    // switcher 상태
    document.querySelectorAll(".lang-switcher button[data-lang]").forEach(function (btn) {
      var active = btn.getAttribute("data-lang") === lang;
      btn.setAttribute("aria-current", active ? "true" : "false");
    });

    setStored(lang);
  }

  function init() {
    var initial = getStored() || "ko";
    applyLang(initial);

    // 스위처 클릭 위임
    document.querySelectorAll(".lang-switcher").forEach(function (sw) {
      sw.addEventListener("click", function (e) {
        var btn = e.target.closest("button[data-lang]");
        if (!btn) return;
        applyLang(btn.getAttribute("data-lang"));
      });
    });

    // 외부에서 호출 가능하도록 노출
    window.YIDO_setLang = applyLang;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
