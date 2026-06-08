/* ============================================================
   서울이도치과 (YIDO) — 언어별 정적 페이지 생성기 (의존성 0)
   단일 소스 index.html(ko) + i18n/*.js 딕셔너리 → /en /ja /zh 프리렌더.
   data-i18n(텍스트) · data-i18n-html(인라인HTML) · data-i18n-attr(속성)를
   빌드 타임에 해석하고, 메타(title/description/og)·canonical·자산경로를
   언어/절대경로로 치환. 검색엔진이 4개 언어를 각각 색인하도록 hreflang 동반.

   실행:  node scripts/gen-lang-pages.js
   콘텐츠/문구 수정 후 재실행 → 산출물(en/ja/zh/index.html) 갱신·커밋.
   ============================================================ */
"use strict";
var fs = require("fs");
var path = require("path");

var ROOT = path.resolve(__dirname, "..");
var SRC = path.join(ROOT, "index.html");
var ORIGIN = "https://half1126-byte.github.io";
var LANGS = ["en", "ja", "zh"]; // ko = 소스(root) 그대로

/* ---- i18n 딕셔너리 로드 (window 섀도잉) ---- */
var win = {};
["ko", "en", "ja", "zh"].forEach(function (l) {
  var code = fs.readFileSync(path.join(ROOT, "i18n", l + ".js"), "utf8");
  new Function("window", code)(win);
});
var DICT = win.YIDO_I18N || {};
function resolve(lang, key) {
  var v = DICT[lang] && DICT[lang][key];
  if (v !== undefined && v !== null && v !== "") return v;
  var ko = DICT.ko && DICT.ko[key];
  if (ko !== undefined && ko !== null && ko !== "") return ko;
  return null;
}

function escHtml(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function escAttr(s) { return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;"); }

/* ---- 매칭 닫힘태그 인덱스(같은 이름 중첩 카운트) ---- */
function findClose(html, fromIdx, tag) {
  var re = new RegExp("<" + tag + "(?:\\s|>|/)|</" + tag + "\\s*>", "gi");
  re.lastIndex = fromIdx;
  var depth = 1, m;
  while ((m = re.exec(html)) !== null) {
    if (m[0].charAt(1) === "/") { depth--; if (depth === 0) return m.index; }
    else { depth++; }
  }
  return -1;
}

/* ---- 여는 태그의 data-i18n-attr 스펙으로 속성값 치환 ---- */
function applyAttrSpec(openTag, spec, lang) {
  spec.split(";").forEach(function (pair) {
    var p = pair.split(":");
    if (p.length !== 2) return;
    var attr = p[0].trim(), key = p[1].trim();
    var val = resolve(lang, key);
    if (val == null) return;
    val = escAttr(val);
    var re = new RegExp("(\\s" + attr + "\\s*=\\s*\")[^\"]*(\")");
    if (re.test(openTag)) openTag = openTag.replace(re, "$1" + val + "$2");
    else openTag = openTag.replace(/\s*\/?>$/, function (end) { return ' ' + attr + '="' + val + '"' + end; });
  });
  return openTag;
}

/* ---- data-i18n / -html / -attr 일괄 해석 ---- */
function applyI18n(html, lang) {
  var tagRe = /<([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g;
  var jobs = [], m;
  while ((m = tagRe.exec(html)) !== null) {
    var full = m[0];
    if (full.indexOf("data-i18n") === -1) continue;
    jobs.push({ tag: m[1], attrs: m[2], openStart: m.index, openEnd: m.index + full.length, full: full });
  }
  var stats = { text: 0, html: 0, attr: 0 };
  // 끝→앞 순으로 적용(인덱스 보존)
  for (var i = jobs.length - 1; i >= 0; i--) {
    var j = jobs[i];
    var htmlKey = (/\sdata-i18n-html\s*=\s*"([^"]*)"/.exec(j.full) || [])[1];
    var attrKey = (/\sdata-i18n-attr\s*=\s*"([^"]*)"/.exec(j.full) || [])[1];
    var textKey = (/\sdata-i18n\s*=\s*"([^"]*)"/.exec(j.full) || [])[1]; // data-i18n="..." (정확)

    var newOpen = j.full;
    if (attrKey) { newOpen = applyAttrSpec(newOpen, attrKey, lang); stats.attr++; }

    if (htmlKey || textKey) {
      var closeStart = findClose(html, j.openEnd, j.tag);
      if (closeStart === -1) { html = html.slice(0, j.openStart) + newOpen + html.slice(j.openEnd); continue; }
      var val, inner;
      if (htmlKey) { val = resolve(lang, htmlKey); inner = (val == null) ? html.slice(j.openEnd, closeStart) : val; if (val != null) stats.html++; }
      else { val = resolve(lang, textKey); inner = (val == null) ? html.slice(j.openEnd, closeStart) : escHtml(val); if (val != null) stats.text++; }
      html = html.slice(0, j.openStart) + newOpen + inner + html.slice(closeStart);
    } else {
      html = html.slice(0, j.openStart) + newOpen + html.slice(j.openEnd);
    }
  }
  return { html: html, stats: stats };
}

/* ---- 헤드 메타·canonical·자산경로 ---- */
function replaceMeta(html, lang) {
  function set(re, repl) { html = html.replace(re, repl); }
  var title = escHtml(resolve(lang, "meta.title") || "");
  set(/<title>[\s\S]*?<\/title>/, "<title>" + title + "</title>");
  set(/(<meta name="description" content=")[^"]*(")/, "$1" + escAttr(resolve(lang, "meta.desc") || "") + "$2");
  set(/(<meta property="og:title" content=")[^"]*(")/, "$1" + escAttr(resolve(lang, "meta.ogtitle") || "") + "$2");
  set(/(<meta property="og:description" content=")[^"]*(")/, "$1" + escAttr(resolve(lang, "meta.ogdesc") || "") + "$2");
  set(/(<meta property="og:locale" content=")[^"]*(")/, "$1" + escAttr(resolve(lang, "meta.locale") || "") + "$2");
  set(/(<meta name="twitter:title" content=")[^"]*(")/, "$1" + escAttr(resolve(lang, "meta.ogtitle") || "") + "$2");
  set(/(<meta name="twitter:description" content=")[^"]*(")/, "$1" + escAttr(resolve(lang, "meta.ogdesc") || "") + "$2");
  // canonical · og:url → 언어 경로
  var langUrl = ORIGIN + "/" + lang + "/";
  set(/(<link rel="canonical" href=")https:\/\/half1126-byte\.github\.io\/(")/, "$1" + langUrl + "$2");
  set(/(<meta property="og:url" content=")https:\/\/half1126-byte\.github\.io\/(")/, "$1" + langUrl + "$2");
  return html;
}

function rewriteAssets(html) {
  // 상대경로 자산(css/js/assets/video/i18n) → 루트 절대경로 (서브디렉터리에서 해석되도록)
  return html.replace(/(\s(?:href|src)=")(css\/|js\/|assets\/|video\/|i18n\/)/g, "$1/$2");
}

/* ---- 빌드 ---- */
var src = fs.readFileSync(SRC, "utf8");
LANGS.forEach(function (lang) {
  var html = src.replace(/<html lang="ko">/, '<html lang="' + lang + '">');
  var r = applyI18n(html, lang);
  html = r.html;
  html = replaceMeta(html, lang);
  html = rewriteAssets(html);
  var dir = path.join(ROOT, lang);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
  console.log(lang + "/index.html  ←  text:" + r.stats.text + " html:" + r.stats.html + " attr:" + r.stats.attr);
});
console.log("done. langs: " + LANGS.join(", "));
