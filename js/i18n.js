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

  function setMeta(sel, val) {
    if (val == null) return;
    var el = document.querySelector(sel);
    if (el) el.setAttribute("content", val);
  }
  function urlFor(lang) { return lang === "ko" ? "/" : "/" + lang + "/"; }

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

    // 메타·타이틀(파일:// 미리보기·JS스왑 시 반영. 프리렌더 페이지는 동일값 재적용 → 무해)
    var t = resolve(lang, "meta.title"); if (t) document.title = t;
    setMeta('meta[name="description"]', resolve(lang, "meta.desc"));
    setMeta('meta[property="og:title"]', resolve(lang, "meta.ogtitle"));
    setMeta('meta[property="og:description"]', resolve(lang, "meta.ogdesc"));
    setMeta('meta[property="og:locale"]', resolve(lang, "meta.locale"));

    setStored(lang);
  }

  /* 언어 전환: 배포(http/https)에선 언어별 정적 URL 로 실제 이동(색인 분리),
     로컬 file:// 미리보기에선 JS 스왑. 단일 소스 → 생성 페이지로 다리 역할. */
  function switchLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) return;
    var cur = document.documentElement.getAttribute("lang");
    if (lang === cur) return;
    if (location.protocol === "http:" || location.protocol === "https:") {
      setStored(lang);
      window.location.assign(urlFor(lang));
    } else {
      applyLang(lang);
    }
  }

  function init() {
    // 프리렌더 페이지는 <html lang> 이 자기 언어 → 그대로 적용(딴 언어로 덮어쓰기 방지).
    var htmlLang = document.documentElement.getAttribute("lang");
    var initial = SUPPORTED.indexOf(htmlLang) !== -1 ? htmlLang : (getStored() || "ko");
    applyLang(initial);

    // 스위처 클릭 위임
    document.querySelectorAll(".lang-switcher").forEach(function (sw) {
      sw.addEventListener("click", function (e) {
        var btn = e.target.closest("button[data-lang]");
        if (!btn) return;
        switchLang(btn.getAttribute("data-lang"));
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
