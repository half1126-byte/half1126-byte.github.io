<?php
/* ============================================================
   서울이도치과 (YIDO) — PHP(MPA) 진입점 / 라우터
   URL = /{lang?}/{pageKey}/   (lang ∈ en|ja|zh, ko는 프리픽스 없음)
   pageKey 는 config/pages.php 화이트리스트로 매핑(임의 경로 차단).
   조립: partials/head.php + partials/header.php + pages/<template> + partials/footer.php
   본문 프래그먼트의 data-i18n 는 서버에서 해석(yido_apply_i18n).
   .htaccess(Apache) 또는 router.php(로컬)가 모든 경로를 이 파일로 위임.
   ============================================================ */
require __DIR__ . '/lib/i18n.php';

$SUPPORTED = ['ko', 'en', 'ja', 'zh'];
$PAGES = require __DIR__ . '/config/pages.php';

/* ---- 경로·언어·페이지 파싱 ---- */
$reqPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/';
$parts = ($p = trim($reqPath, '/')) === '' ? [] : explode('/', $p);

$lang = 'ko';
if (isset($_GET['lang']) && in_array($_GET['lang'], $SUPPORTED, true)) {
  $lang = $_GET['lang'];
} elseif (!empty($parts) && in_array($parts[0], ['en', 'ja', 'zh'], true)) {
  $lang = array_shift($parts);
}

$pageKey = empty($parts) ? 'home' : implode('/', $parts);

yido_load_lang($lang);
$GLOBALS['YIDO_PFX'] = $lang === 'ko' ? '' : $lang . '/';   // 내부 링크(~/) 언어 프리픽스

/* ---- 404: 화이트리스트에 없는 페이지 ---- */
if (!isset($PAGES[$pageKey])) {
  http_response_code(404);
  header('Content-Type: text/html; charset=utf-8');
  if (is_file(__DIR__ . '/404.html')) {
    echo yido_rewrite_assets(file_get_contents(__DIR__ . '/404.html'));
  } else {
    echo '404 Not Found';
  }
  exit;
}
$page = $PAGES[$pageKey];

/* ---- 본문 조립(프래그먼트) → i18n 해석 → 자산 절대경로화 ---- */
ob_start();
require __DIR__ . '/partials/header.php';
require __DIR__ . '/pages/' . $page['template'];
require __DIR__ . '/partials/footer.php';
$body = ob_get_clean();
$body = yido_apply_i18n($body, $lang);
$body = yido_rewrite_assets($body);
$body = str_replace('"~/', '"/' . $GLOBALS['YIDO_PFX'], $body);   // 내부 링크 마커 → 언어 경로

/* ---- <head>(이미 t()로 지역화) ---- */
ob_start();
require __DIR__ . '/partials/head.php';
$head = ob_get_clean();

header('Content-Type: text/html; charset=utf-8');
header('Content-Language: ' . $lang);
echo $head . "\n" . $body;
