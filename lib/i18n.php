<?php
/* ============================================================
   서울이도치과 (YIDO) — PHP i18n 렌더 엔진
   scripts/gen-lang-pages.js(Node 빌드)의 서버사이드 포팅.
   index.html(ko 원본 템플릿)을 요청 시점에 선택 언어로 렌더한다.
   - data-i18n="key"            → textContent(이스케이프) 치환
   - data-i18n-html="key"       → innerHTML(신뢰된 인라인 마크업) 치환
   - data-i18n-attr="a:k;b:k2"  → 속성 치환
   폴백 체인: 선택 언어 값(비어있지 않음) → 한국어 → 원문 유지
   ※ 바이트 오프셋 일관 사용(멀티바이트 한국어 안전).
   ============================================================ */

$GLOBALS['YIDO_DICT']    = [];
$GLOBALS['YIDO_DICT_KO'] = [];
$GLOBALS['YIDO_LANG']    = 'ko';

/* lang/ko.php(폴백) + lang/<lang>.php 로드 */
function yido_load_lang($lang) {
  $dir = dirname(__DIR__) . '/lang';
  $GLOBALS['YIDO_DICT_KO'] = require $dir . '/ko.php';
  $GLOBALS['YIDO_DICT']    = ($lang === 'ko')
    ? $GLOBALS['YIDO_DICT_KO']
    : require $dir . '/' . $lang . '.php';
  $GLOBALS['YIDO_LANG'] = $lang;
}

/* 문구 조회(폴백 체인). 없으면 null → 호출부에서 원문 유지 */
function yido_resolve($lang, $key) {
  $v = $GLOBALS['YIDO_DICT'][$key] ?? null;
  if ($v !== null && $v !== '') return $v;
  $ko = $GLOBALS['YIDO_DICT_KO'][$key] ?? null;
  if ($ko !== null && $ko !== '') return $ko;
  return null;
}

/* 퍼블리셔용 간편 헬퍼: 현재 요청 언어로 키 조회(텍스트는 호출부에서 escape) */
function t($key) {
  $v = yido_resolve($GLOBALS['YIDO_LANG'], $key);
  return $v === null ? '' : $v;
}

function yido_esc_html($s) { return str_replace(['&', '<', '>'], ['&amp;', '&lt;', '&gt;'], (string)$s); }
function yido_esc_attr($s) { return str_replace(['&', '"'], ['&amp;', '&quot;'], (string)$s); }

/* 같은 이름 중첩을 카운트해 매칭 닫힘태그의 바이트 인덱스 반환 */
function yido_find_close($html, $fromIdx, $tag) {
  $re = '/<' . preg_quote($tag, '/') . '(?:\s|>|\/)|<\/' . preg_quote($tag, '/') . '\s*>/i';
  $depth = 1;
  if (preg_match_all($re, $html, $ms, PREG_OFFSET_CAPTURE | PREG_SET_ORDER, $fromIdx)) {
    foreach ($ms as $m) {
      $match = $m[0][0]; $idx = $m[0][1];
      if ($match[1] === '/') { $depth--; if ($depth === 0) return $idx; }
      else { $depth++; }
    }
  }
  return -1;
}

/* 여는 태그의 data-i18n-attr 스펙으로 속성값 치환 */
function yido_apply_attr_spec($openTag, $spec, $lang) {
  foreach (explode(';', $spec) as $pair) {
    $p = explode(':', $pair);
    if (count($p) !== 2) continue;
    $attr = trim($p[0]); $key = trim($p[1]);
    $val = yido_resolve($lang, $key);
    if ($val === null) continue;
    $val = yido_esc_attr($val);
    $re = '/(\s' . preg_quote($attr, '/') . '\s*=\s*")[^"]*(")/';
    if (preg_match($re, $openTag)) {
      $openTag = preg_replace_callback($re, function ($m) use ($val) { return $m[1] . $val . $m[2]; }, $openTag, 1);
    } else {
      $openTag = preg_replace_callback('/\s*\/?>$/', function ($m) use ($attr, $val) {
        return ' ' . $attr . '="' . $val . '"' . $m[0];
      }, $openTag, 1);
    }
  }
  return $openTag;
}

/* data-i18n / -html / -attr 일괄 해석 */
function yido_apply_i18n($html, $lang) {
  preg_match_all('/<([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/', $html, $matches, PREG_OFFSET_CAPTURE | PREG_SET_ORDER);
  $jobs = [];
  foreach ($matches as $m) {
    $full = $m[0][0];
    if (strpos($full, 'data-i18n') === false) continue;
    $start = $m[0][1];
    $jobs[] = ['tag' => $m[1][0], 'full' => $full, 'openStart' => $start, 'openEnd' => $start + strlen($full)];
  }
  // 끝→앞 순으로 적용(인덱스 보존)
  for ($i = count($jobs) - 1; $i >= 0; $i--) {
    $j = $jobs[$i]; $full = $j['full'];
    $htmlKey = preg_match('/\sdata-i18n-html\s*=\s*"([^"]*)"/', $full, $mm) ? $mm[1] : null;
    $attrKey = preg_match('/\sdata-i18n-attr\s*=\s*"([^"]*)"/', $full, $mm) ? $mm[1] : null;
    $textKey = preg_match('/\sdata-i18n\s*=\s*"([^"]*)"/', $full, $mm) ? $mm[1] : null; // data-i18n="..." 정확 매칭

    $newOpen = $full;
    if ($attrKey) $newOpen = yido_apply_attr_spec($newOpen, $attrKey, $lang);

    if ($htmlKey || $textKey) {
      $closeStart = yido_find_close($html, $j['openEnd'], $j['tag']);
      if ($closeStart === -1) {
        $html = substr($html, 0, $j['openStart']) . $newOpen . substr($html, $j['openEnd']);
        continue;
      }
      if ($htmlKey) {
        $val = yido_resolve($lang, $htmlKey);
        $inner = ($val === null) ? substr($html, $j['openEnd'], $closeStart - $j['openEnd']) : $val;
      } else {
        $val = yido_resolve($lang, $textKey);
        $inner = ($val === null) ? substr($html, $j['openEnd'], $closeStart - $j['openEnd']) : yido_esc_html($val);
      }
      $html = substr($html, 0, $j['openStart']) . $newOpen . $inner . substr($html, $closeStart);
    } else {
      $html = substr($html, 0, $j['openStart']) . $newOpen . substr($html, $j['openEnd']);
    }
  }
  return $html;
}

/* 헤드 메타·title·canonical·og:url 언어 반영 */
function yido_replace_meta($html, $lang) {
  $origin = 'https://half1126-byte.github.io';
  $langUrl = $origin . '/' . $lang . '/';
  $title = yido_esc_html(yido_resolve($lang, 'meta.title') ?? '');
  $desc  = yido_esc_attr(yido_resolve($lang, 'meta.desc') ?? '');
  $ogt   = yido_esc_attr(yido_resolve($lang, 'meta.ogtitle') ?? '');
  $ogd   = yido_esc_attr(yido_resolve($lang, 'meta.ogdesc') ?? '');
  $loc   = yido_esc_attr(yido_resolve($lang, 'meta.locale') ?? '');

  $sub = function ($re, $cb) use (&$html) { $html = preg_replace_callback($re, $cb, $html, 1); };
  $sub('/<title>[\s\S]*?<\/title>/', function () use ($title) { return '<title>' . $title . '</title>'; });
  $sub('/(<meta name="description" content=")[^"]*(")/', function ($m) use ($desc) { return $m[1] . $desc . $m[2]; });
  $sub('/(<meta property="og:title" content=")[^"]*(")/', function ($m) use ($ogt) { return $m[1] . $ogt . $m[2]; });
  $sub('/(<meta property="og:description" content=")[^"]*(")/', function ($m) use ($ogd) { return $m[1] . $ogd . $m[2]; });
  $sub('/(<meta property="og:locale" content=")[^"]*(")/', function ($m) use ($loc) { return $m[1] . $loc . $m[2]; });
  $sub('/(<meta name="twitter:title" content=")[^"]*(")/', function ($m) use ($ogt) { return $m[1] . $ogt . $m[2]; });
  $sub('/(<meta name="twitter:description" content=")[^"]*(")/', function ($m) use ($ogd) { return $m[1] . $ogd . $m[2]; });
  $sub('#(<link rel="canonical" href=")https://half1126-byte\.github\.io/(")#', function ($m) use ($langUrl) { return $m[1] . $langUrl . $m[2]; });
  $sub('#(<meta property="og:url" content=")https://half1126-byte\.github\.io/(")#', function ($m) use ($langUrl) { return $m[1] . $langUrl . $m[2]; });
  return $html;
}

/* 상대 자산경로 → 루트 절대경로(서브경로 /en/ 등에서 해석되도록) */
function yido_rewrite_assets($html) {
  return preg_replace('/(\s(?:href|src)=")(css\/|js\/|assets\/|video\/|i18n\/)/', '$1/$2', $html);
}

/* 템플릿(index.html)을 선택 언어로 렌더.
   ko = 원본 그대로(정적 소스와 동일), en/ja/zh = gen-lang-pages.js 와 동일 변환 */
function yido_render($tpl, $lang) {
  if ($lang === 'ko') return $tpl;
  $html = preg_replace('/<html lang="ko">/', '<html lang="' . $lang . '">', $tpl, 1);
  $html = yido_apply_i18n($html, $lang);
  $html = yido_replace_meta($html, $lang);
  $html = yido_rewrite_assets($html);
  return $html;
}
