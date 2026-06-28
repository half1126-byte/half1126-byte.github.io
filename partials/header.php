<body>
  <a class="skip-link" href="#main" data-i18n="skip">본문 바로가기</a>
  <p class="draft-note" data-i18n="draft.banner">본 페이지는 디자인 초안입니다. 원장 성함·주소·사진 등은 확정 후 반영되며, 의료광고 표현은 사전 검수 후 게시됩니다.</p>

  <!-- ============ HEADER ============ -->
  <header class="site-header" role="banner">
    <div class="container">
      <a class="wordmark" href="~/" aria-label="서울이도치과의원 Seoul Yido Dental Office 홈">
        <img class="wordmark__img wordmark__img--light" src="assets/logo/logo-light.png" alt="서울이도치과의원 Seoul Yido Dental Office" width="142" height="36" />
        <img class="wordmark__img wordmark__img--dark" src="assets/logo/logo-dark.png" alt="" aria-hidden="true" width="142" height="36" />
      </a>
      <nav class="nav-primary" aria-label="주요 메뉴">
        <ul>
          <li><a href="~/about/" data-i18n="nav.about">소개</a></li>
          <li><a href="~/doctors/" data-i18n="nav.doctors">원장진</a></li>
          <li><a href="~/experience/" data-i18n="nav.care">환자경험</a></li>
          <li class="has-sub">
            <a href="~/treatments/" data-i18n="nav.services">진료과목</a>
            <ul class="nav-sub">
              <li><a href="~/treatments/implant/" data-i18n="tx.implant.h1">임플란트</a></li>
              <li><a href="~/treatments/aesthetic/" data-i18n="tx.aesthetic.h1">심미 · 보철</a></li>
              <li><a href="~/treatments/ortho/" data-i18n="tx.ortho.h1">교정 · 인비절라인</a></li>
              <li><a href="~/treatments/general/" data-i18n="tx.general.h1">일반진료</a></li>
              <li><a href="~/treatments/prevention/" data-i18n="tx.prevention.h1">예방 · 구강관리</a></li>
            </ul>
          </li>
          <li><a href="~/lab/" data-i18n="nav.lab">원내기공소</a></li>
          <li><a href="~/about/#hygiene" data-i18n="nav.hygiene">위생·소독</a></li>
          <li><a href="~/visit/#contact" data-i18n="nav.contact">오시는 길</a></li>
        </ul>
      </nav>
      <div class="nav-actions">
        <div class="lang-switcher" role="group" data-i18n-attr="aria-label:lang.aria" aria-label="언어 선택">
          <button type="button" data-lang="ko" aria-current="true">KO</button>
          <button type="button" data-lang="en" aria-current="false">EN</button>
          <button type="button" data-lang="ja" aria-current="false">JP</button>
          <button type="button" data-lang="zh" aria-current="false">CN</button>
        </div>
        <a class="btn btn--solid" href="~/visit/#contact" data-i18n="nav.consult">상담·예약 안내</a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-drawer"
                data-i18n-attr="aria-label:nav.menu" aria-label="메뉴 열기"><span></span><span></span><span></span></button>
      </div>
    </div>
  </header>

  <!-- ============ MOBILE DRAWER ============ -->
  <nav class="nav-drawer" id="nav-drawer" aria-label="모바일 메뉴">
    <ul>
      <li><a href="~/about/" data-i18n="nav.about">소개</a></li>
      <li><a href="~/doctors/" data-i18n="nav.doctors">원장진</a></li>
      <li><a href="~/experience/" data-i18n="nav.care">환자경험</a></li>
      <li><a href="~/treatments/" data-i18n="nav.services">진료과목</a></li>
      <li class="nav-drawer__sub"><a href="~/treatments/implant/" data-i18n="tx.implant.h1">임플란트</a></li>
      <li class="nav-drawer__sub"><a href="~/treatments/aesthetic/" data-i18n="tx.aesthetic.h1">심미 · 보철</a></li>
      <li class="nav-drawer__sub"><a href="~/treatments/ortho/" data-i18n="tx.ortho.h1">교정 · 인비절라인</a></li>
      <li class="nav-drawer__sub"><a href="~/treatments/general/" data-i18n="tx.general.h1">일반진료</a></li>
      <li class="nav-drawer__sub"><a href="~/treatments/prevention/" data-i18n="tx.prevention.h1">예방 · 구강관리</a></li>
      <li><a href="~/lab/" data-i18n="nav.lab">원내기공소</a></li>
      <li><a href="~/about/#hygiene" data-i18n="nav.hygiene">위생·소독</a></li>
      <li><a href="~/visit/#contact" data-i18n="nav.contact">오시는 길</a></li>
    </ul>
    <div class="lang-switcher" role="group" data-i18n-attr="aria-label:lang.aria" aria-label="언어 선택">
      <button type="button" data-lang="ko" aria-current="true">KO</button>
      <button type="button" data-lang="en" aria-current="false">EN</button>
      <button type="button" data-lang="ja" aria-current="false">JP</button>
      <button type="button" data-lang="zh" aria-current="false">CN</button>
    </div>
  </nav>

  <div class="scroll-progress" aria-hidden="true"></div>

