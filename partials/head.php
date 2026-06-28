<?php
/* partials/head.php — 페이지·언어별 <head> 생성 (MPA)
   필요 변수: $page(config 배열), 전역 YIDO_LANG.
   - 번역 메타: t() (언어별)
   - canonical·hreflang·og:url: 페이지 경로 + 언어로 계산
   - JSON-LD: 페이지별 schema_file 을 그대로 포함
   - 자산 경로는 절대(/css /assets …) → 하위 경로 페이지에서도 해석됨 */
$lang   = $GLOBALS['YIDO_LANG'];
$origin = 'https://half1126-byte.github.io';
$path   = $page['path'] ?? '';                 // '' = 루트, 'about/', 'treatments/implant/'
$pfx    = $lang === 'ko' ? '' : $lang . '/';
$canonical = $origin . '/' . $pfx . $path;
$e = fn($s) => htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8');

if (!empty($page['title_label'])) {            // 스포크: nav 라벨 + 브랜드명
  $title = t($page['title_label']) . ' | ' . t('brand.name');
  $ogt   = $title;
} else {                                        // 홈/명시 메타키
  $title = t($page['title']   ?? 'meta.title');
  $ogt   = t($page['ogtitle'] ?? 'meta.ogtitle');
}
$desc   = t($page['desc']    ?? 'meta.desc');
$ogd    = t($page['ogdesc']  ?? 'meta.ogdesc');
$locale = t('meta.locale');
?>
<!DOCTYPE html>
<html lang="<?= $e($lang) ?>">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script>document.documentElement.classList.add('js')</script><!-- 인트로 게이트(no-JS 폴백) -->
  <title><?= $e($title) ?></title>
  <meta name="description" content="<?= $e($desc) ?>" />
  <meta name="robots" content="noindex,nofollow" /><!-- DRAFT: 출시 시 index,follow -->
  <meta name="theme-color" content="#232220" />
  <meta name="geo.region" content="KR-11" />
  <meta name="geo.placename" content="서울 마포구 공덕" />
  <link rel="canonical" href="<?= $e($canonical) ?>" />

  <!-- 다국어 hreflang (페이지별 4언어 + x-default) -->
  <link rel="alternate" hreflang="ko" href="<?= $e($origin . '/' . $path) ?>" />
  <link rel="alternate" hreflang="en" href="<?= $e($origin . '/en/' . $path) ?>" />
  <link rel="alternate" hreflang="ja" href="<?= $e($origin . '/ja/' . $path) ?>" />
  <link rel="alternate" hreflang="zh" href="<?= $e($origin . '/zh/' . $path) ?>" />
  <link rel="alternate" hreflang="x-default" href="<?= $e($origin . '/' . $path) ?>" />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="서울이도치과의원" />
  <meta property="og:title" content="<?= $e($ogt) ?>" />
  <meta property="og:description" content="<?= $e($ogd) ?>" />
  <meta property="og:locale" content="<?= $e($locale) ?>" />
  <meta property="og:locale:alternate" content="en_US" />
  <meta property="og:locale:alternate" content="ja_JP" />
  <meta property="og:locale:alternate" content="zh_CN" />
  <meta property="og:url" content="<?= $e($canonical) ?>" />
  <meta property="og:image" content="<?= $e($origin) ?>/assets/og-image.jpg" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="<?= $e($ogt) ?>" />
  <meta name="twitter:description" content="<?= $e($ogd) ?>" />
  <meta name="twitter:image" content="<?= $e($origin) ?>/assets/og-image.jpg" />

  <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png" />
  <link rel="icon" type="image/png" sizes="512x512" href="/assets/favicon-512.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/favicon-180.png" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Gowun+Dodum&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css" />

  <link rel="stylesheet" href="/css/tokens.css" />
  <link rel="stylesheet" href="/css/base.css" />
  <link rel="stylesheet" href="/css/layout.css" />
  <link rel="stylesheet" href="/css/components.css" />

<?php
  /* 페이지별 구조화 데이터(JSON-LD) */
  if (!empty($page['schema_file']) && is_file(__DIR__ . '/' . $page['schema_file'])) {
    echo file_get_contents(__DIR__ . '/' . $page['schema_file']);   // 홈 등 전용 스키마
  } else {
    $emit = function ($obj) {
      echo "  <script type=\"application/ld+json\">\n  "
         . json_encode($obj, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT)
         . "\n  </script>\n";
    };
    // 스포크 기본 WebPage(진료 페이지는 MedicalWebPage)
    $emit([
      '@context' => 'https://schema.org', '@type' => $page['wptype'] ?? 'WebPage',
      'url' => $canonical, 'name' => $title, 'inLanguage' => $lang,
      'dateModified' => '2026-06-26',
      'isPartOf' => ['@type' => 'WebSite', 'name' => '서울이도치과의원', 'url' => $origin . '/'],
    ]);
    // 빵부스러기(BreadcrumbList)
    if (!empty($page['crumb'])) {
      $items = [];
      foreach ($page['crumb'] as $idx => $c) {
        $items[] = ['@type' => 'ListItem', 'position' => $idx + 1,
                    'name' => t($c[0]), 'item' => $origin . '/' . $pfx . $c[1]];
      }
      $emit(['@context' => 'https://schema.org', '@type' => 'BreadcrumbList', 'itemListElement' => $items]);
    }
    // FAQPage (페이지별 Q&A — 기존 i18n 키 재사용)
    if (!empty($page['faq'])) {
      $qs = [];
      foreach ($page['faq'] as $qa) {
        $qs[] = ['@type' => 'Question', 'name' => t($qa[0]),
                 'acceptedAnswer' => ['@type' => 'Answer', 'text' => t($qa[1])]];
      }
      $emit(['@context' => 'https://schema.org', '@type' => 'FAQPage', 'mainEntity' => $qs]);
    }
  }
?>
</head>
