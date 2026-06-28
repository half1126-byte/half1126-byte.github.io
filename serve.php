<?php
/* 로컬 QA 전용 라우터 — `php -S localhost:8000 serve.php`
   존재하는 정적 파일(css/js/assets/video/i18n/favicon 등)은 그대로 서빙하고,
   그 외 모든 경로(루트·언어·페이지)는 index.php(라우터)로 위임한다.
   운영(Apache)에서는 이 파일 대신 .htaccess 가 같은 역할을 한다.
   (파일명 주의: 일부 백신이 'router.php'를 차단해 serve.php 로 둠) */
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$file = __DIR__ . $path;

// 존재하는 정적 파일(디렉터리 아님)은 내장 서버가 직접 서빙
if ($path !== '/' && is_file($file)) return false;

// 그 외(루트·언어·페이지·미존재)는 PHP 라우터로
require __DIR__ . '/index.php';
