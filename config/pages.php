<?php
/* config/pages.php — 라우트(페이지키) → 페이지 설정 화이트리스트
   pageKey: URL에서 언어 프리픽스를 뺀 경로. 'home' = 루트.
   필드:
     path        : URL 경로(끝 슬래시 포함). canonical/hreflang 계산에 사용. 루트='' .
     template    : pages/ 하위 본문 파일
     title/desc/ogtitle/ogdesc : <head> 메타에 쓸 i18n 키(생략 시 meta.* 기본)
     schema_file : partials/ 하위 JSON-LD 파일(생략 시 _schema_home.html)
   ▶ 멀티페이지 확장 시 여기에 about/doctors/treatments/* 등을 추가한다(계획서 6장). */
return [
  'home' => [
    'path'        => '',
    'template'    => 'home.php',
    'title'       => 'meta.title',
    'desc'        => 'meta.desc',
    'ogtitle'     => 'meta.ogtitle',
    'ogdesc'      => 'meta.ogdesc',
    'schema_file' => '_schema_home.html',
  ],

  /* 1단계 스포크 페이지 — 제목은 nav 라벨 + brand.name 으로 조합(title_label),
     설명은 사이트 기본(meta.desc) 임시. 2단계에서 페이지별 메타·스키마 세분화. */
  'about' => [
    'path' => 'about/', 'template' => 'about.php', 'title_label' => 'nav.about',
  ],
  'doctors' => [
    'path' => 'doctors/', 'template' => 'doctors.php', 'title_label' => 'nav.doctors',
  ],
  'treatments' => [
    'path' => 'treatments/', 'template' => 'treatments/index.php', 'title_label' => 'nav.services',
  ],
  'experience' => [
    'path' => 'experience/', 'template' => 'experience.php', 'title_label' => 'nav.care',
  ],
  'lab' => [
    'path' => 'lab/', 'template' => 'lab.php', 'title_label' => 'nav.lab',
  ],
  'visit' => [
    'path' => 'visit/', 'template' => 'visit.php', 'title_label' => 'nav.contact',
  ],
  'faq' => [
    'path' => 'faq/', 'template' => 'faq.php', 'title_label' => 'faq.title',
    'faq' => [['faq.q1','faq.a1'],['faq.q2','faq.a2'],['faq.q3','faq.a3'],['faq.q4','faq.a4'],['faq.q5','faq.a5'],['faq.q6','faq.a6']],
  ],

  /* 2단계: 진료별 허브 (MedicalWebPage + BreadcrumbList). 콘텐츠는 ko 초안(원장 감수 전),
     en/ja/zh 는 폴백으로 ko 노출 → 4단계에서 번역. crumb = [라벨키, 경로(끝슬래시)]. */
  'treatments/implant' => [
    'path' => 'treatments/implant/', 'template' => 'treatments/implant.php',
    'title' => 'tx.implant.title', 'desc' => 'tx.implant.desc', 'wptype' => 'MedicalWebPage',
    'crumb' => [['tx.crumb.home', ''], ['tx.crumb.tx', 'treatments/'], ['tx.implant.h1', 'treatments/implant/']],
    'faq' => [['tx.implant.q1','faq.a5'],['tx.implant.q2','tx.implant.a2'],['tx.implant.q3','tx.implant.a3']],
  ],
  'treatments/aesthetic' => [
    'path' => 'treatments/aesthetic/', 'template' => 'treatments/aesthetic.php',
    'title' => 'tx.aesthetic.title', 'desc' => 'tx.aesthetic.desc', 'wptype' => 'MedicalWebPage',
    'crumb' => [['tx.crumb.home', ''], ['tx.crumb.tx', 'treatments/'], ['tx.aesthetic.h1', 'treatments/aesthetic/']],
    'faq' => [['tx.aesthetic.q1','faq.a6'],['tx.aesthetic.q2','tx.aesthetic.a2'],['tx.aesthetic.q3','tx.aesthetic.a3']],
  ],
  'treatments/ortho' => [
    'path' => 'treatments/ortho/', 'template' => 'treatments/ortho.php',
    'title' => 'tx.ortho.title', 'desc' => 'tx.ortho.desc', 'wptype' => 'MedicalWebPage',
    'crumb' => [['tx.crumb.home', ''], ['tx.crumb.tx', 'treatments/'], ['tx.ortho.h1', 'treatments/ortho/']],
    'faq' => [['tx.ortho.q1','tx.ortho.a1'],['tx.ortho.q2','tx.ortho.a2'],['tx.ortho.q3','tx.ortho.a3']],
  ],
  'treatments/general' => [
    'path' => 'treatments/general/', 'template' => 'treatments/general.php',
    'title' => 'tx.general.title', 'desc' => 'tx.general.desc', 'wptype' => 'MedicalWebPage',
    'crumb' => [['tx.crumb.home', ''], ['tx.crumb.tx', 'treatments/'], ['tx.general.h1', 'treatments/general/']],
    'faq' => [['tx.general.q1','tx.general.a1'],['tx.general.q2','tx.general.a2'],['tx.general.q3','tx.general.a3']],
  ],
  'treatments/prevention' => [
    'path' => 'treatments/prevention/', 'template' => 'treatments/prevention.php',
    'title' => 'tx.prevention.title', 'desc' => 'tx.prevention.desc', 'wptype' => 'MedicalWebPage',
    'crumb' => [['tx.crumb.home', ''], ['tx.crumb.tx', 'treatments/'], ['tx.prevention.h1', 'treatments/prevention/']],
    'faq' => [['tx.prevention.q1','tx.prevention.a1'],['tx.prevention.q2','faq.a4'],['tx.prevention.q3','tx.prevention.a3']],
  ],
];
