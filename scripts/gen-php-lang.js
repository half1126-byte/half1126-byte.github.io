/* ============================================================
   서울이도치과 (YIDO) — i18n/*.js → lang/*.php 변환기 (의존성 0)
   바닐라 JS 딕셔너리(window.YIDO_I18N.<lang>)를 PHP 연관배열로 1:1 이관.
   퍼블리셔 PHP(MPA) 전환용. 콘텐츠 수정은 i18n/ko.js를 기준으로 하고
   이 스크립트를 재실행하면 lang/*.php가 갱신됩니다.

   실행:  node scripts/gen-php-lang.js
   ============================================================ */
"use strict";
var fs = require("fs");
var path = require("path");

var ROOT = path.resolve(__dirname, "..");
var LANGS = ["ko", "en", "ja", "zh"];

/* i18n/*.js 를 window 섀도잉으로 로드 (gen-lang-pages.js 와 동일 방식) */
var win = {};
LANGS.forEach(function (l) {
  var code = fs.readFileSync(path.join(ROOT, "i18n", l + ".js"), "utf8");
  new Function("window", code)(win);
});
var DICT = win.YIDO_I18N || {};

function phpStr(s) {
  // PHP single-quoted: 백슬래시와 작은따옴표만 이스케이프 → 값 그대로 보존(HTML 포함)
  return "'" + String(s).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
}

var outDir = path.join(ROOT, "lang");
fs.mkdirSync(outDir, { recursive: true });

LANGS.forEach(function (lang) {
  var dict = DICT[lang] || {};
  var keys = Object.keys(dict);
  var lines = [];
  lines.push("<?php");
  lines.push("/* 자동 생성: scripts/gen-php-lang.js  (원본: i18n/" + lang + ".js)");
  lines.push("   ⚠️ 직접 수정 금지 — i18n/" + lang + ".js 를 고치고 재생성하세요. */");
  lines.push("return [");
  keys.forEach(function (k) {
    lines.push("  " + phpStr(k) + " => " + phpStr(dict[k]) + ",");
  });
  lines.push("];");
  lines.push("");
  fs.writeFileSync(path.join(outDir, lang + ".php"), lines.join("\n"), "utf8");
  console.log("lang/" + lang + ".php  ←  " + keys.length + " keys");
});
console.log("done.");
