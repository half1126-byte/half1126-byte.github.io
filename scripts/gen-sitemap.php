<?php
/* sitemap.xml 생성 — config/pages.php 의 전 페이지 × 4언어 + hreflang 대체링크.
   실행:  php scripts/gen-sitemap.php   (→ sitemap.xml 덮어씀)
   ※ PHP MPA(멀티페이지) 배포용. 페이지 추가 후 재실행. */
$ROOT   = dirname(__DIR__);
$ORIGIN = 'https://half1126-byte.github.io';
$LANGS  = ['ko', 'en', 'ja', 'zh'];
$PAGES  = require $ROOT . '/config/pages.php';

function locFor($origin, $lang, $path) {
  return $origin . '/' . ($lang === 'ko' ? '' : $lang . '/') . $path;
}

$out  = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
$out .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' . "\n";

foreach ($PAGES as $key => $page) {
  $path = $page['path'];
  foreach ($LANGS as $lang) {
    $out .= "  <url>\n";
    $out .= "    <loc>" . htmlspecialchars(locFor($ORIGIN, $lang, $path), ENT_QUOTES) . "</loc>\n";
    foreach ($LANGS as $alt) {
      $out .= '    <xhtml:link rel="alternate" hreflang="' . $alt . '" href="' . htmlspecialchars(locFor($ORIGIN, $alt, $path), ENT_QUOTES) . "\" />\n";
    }
    $out .= '    <xhtml:link rel="alternate" hreflang="x-default" href="' . htmlspecialchars(locFor($ORIGIN, 'ko', $path), ENT_QUOTES) . "\" />\n";
    $out .= "  </url>\n";
  }
}
$out .= "</urlset>\n";

file_put_contents($ROOT . '/sitemap.xml', $out);
echo "sitemap.xml 생성: " . (count($PAGES) * count($LANGS)) . " URL (" . count($PAGES) . " 페이지 × " . count($LANGS) . " 언어)\n";
