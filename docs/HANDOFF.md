# 서울이도치과(YIDO) 홈페이지 — 작업 핸드오프 (웹디자이너·웹퍼블리셔용)

원페이지 스크롤 홈페이지입니다. **빌드 도구·프레임워크 없음** — 순수 HTML/CSS/JS라
`index.html`을 **더블클릭하면 바로 열립니다.** 받아서 바로 수정하시면 됩니다.

- 라이브: https://half1126-byte.github.io/  (개원 전 초안 · noindex)
- 소스: https://github.com/half1126-byte/half1126-byte.github.io

---

## 1. 받기 (Git 몰라도 OK)
GitHub 소스 페이지 → 초록색 **`< > Code`** 버튼 → **Download ZIP** → 압축 풀기.
끝입니다. (Git 쓰시면 `git clone` 해도 동일)

## 2. 미리보기
- **가장 간단:** `index.html` 더블클릭 → 브라우저에서 열림(언어전환·스크롤·메뉴 모두 동작).
- **권장(폰트·캐시 정확):** 폴더에서 터미널 열고
  ```bash
  python -m http.server 8080      # → http://localhost:8080
  ```
- 폰트(Pretendard·Cormorant·Inter)는 CDN 로드, 네트워크 없으면 시스템 폰트로 자동 폴백.

## 3. 파일 구조
```
index.html              # 원페이지 본체 (9개 섹션 + 헤더/푸터, data-i18n, JSON-LD)
en/ ja/ zh/ index.html  # ⚠️ 자동 생성물 — 직접 수정 금지 (4번 참고)
css/
  tokens.css            # ★ 디자인 토큰(:root) — 색/타이포/간격/모션 전부 여기
  base.css              # 리셋·타이포·접근성(포커스, reduced-motion)
  layout.css            # 헤더/네비/섹션/그리드/푸터
  components.css        # 버튼/카드/플레이스홀더/시간표/언어전환/스크롤FX
js/                     # i18n·nav·motion·scroll-fx (전부 <script defer>, 라이브러리 0)
i18n/  ko.js en.js ja.js zh.js   # 언어 사전 (ko=기준)
assets/  favicon.svg  og-image.jpg  img/
video/                 # 배경 영상 (av1 + mp4 듀얼 소스)
scripts/gen-lang-pages.js        # 다국어 페이지 생성기
robots.txt sitemap.xml llms.txt
```
CSS는 **이 순서로 로드**됩니다(토큰 → base → layout → components). 색/폰트/간격을
바꾸려면 거의 다 **`css/tokens.css`** 한 곳만 고치면 전체에 반영됩니다.

## 4. 자주 바꾸는 작업

**(a) 문구 수정** — `index.html`의 한국어 텍스트와 `i18n/ko.js`를 **함께** 고칩니다(둘 다 한국어 기준).
**(b) 다국어** — 영어/일어/중국어는 `i18n/en.js`·`ja.js`·`zh.js`의 `""` 안에 번역을 채우면 반영
(비워두면 한국어로 폴백). **`/en` `/ja` `/zh` 폴더의 index.html은 `scripts/gen-lang-pages.js`가
생성한 결과물이라 직접 수정하지 마세요** — 원본(`index.html` + 사전)만 고치면 됩니다.
**(c) 색·폰트·간격** — `css/tokens.css`의 `:root` 변수만 수정.
**(d) 이미지/영상 교체** — 자리마다 `data-asset="이름"` 플레이스홀더가 있습니다:

| data-asset | 위치 | 넣을 것 |
|---|---|---|
| `hero-video` | 메인 히어로 | 분위기 영상(이미 임베드됨, `<source>`만 교체) |
| `care-video` | Total Care | 케어 과정 영상 |
| `film-video` | 시네마틱 인터루드 | 무드 클립 |
| `doctor-1`~`doctor-4` | 원장진 | 원장 프로필 사진(인터뷰형 3:4) |
| `lab-image` | 원내기공소 | 기공소·작업 디테일 |
| `hygiene-image` | 위생·소독 | 소독·멸균 공간 |
| `map` | 오시는 길 | 네이버/카카오/구글 지도 임베드 |

## 5. 디자인 시스템 (브랜드 가이드라인 반영 — 정본은 `css/tokens.css`)
- **무드:** 에디토리얼 — **YIDO Light Ivory** 배경(`--paper #fffcf3`, 순백 아님), Brown Gray 본문,
  다크 섹션은 **YIDO Black**(`--black #232220`), 배경에 미세 **필름그레인** 텍스처.
- **브랜드 6색:** Black `#232220` · Brown Gray `#403d38` · Warm Gray `#cbc4b8` · Soft Beige `#d1c3b0` · Light Ivory `#fffcf3` · **Signature Orange `#e95e27`**.
- **포인트 컬러(≤5%만):** 시그니처 오렌지 — 본문 액센트 `--accent-600 #e95e27`,
  CTA 솔리드 버튼 `--accent-cta #c2491a`(흰 글자 대비 AA 충족). CTA·hover·focus·소액센트에만, 과채도 금지.
- **타이포(2종):** 로고/브랜드명 **고운돋움(Gowun Dodum)**, 본문·UI 전체 **Pretendard**. 로고는 이미지(`assets/logo/`).
- **로고:** YI/DO 모노그램(헤더, 라이트=`monogram-dark.png`/다크 위=`monogram-light.png` 스왑) + 풀 락업(`logo-light/dark.png`, 푸터). 파비콘 `favicon-32/180/512.png`.
- **모션:** 스크롤 진입 페이드 + 패럴랙스 + 영상. `prefers-reduced-motion` 사용자는 자동 정적 표시(꼭 유지).
- **공식 명칭:** 텍스트·메타·법적명칭은 **서울이도치과의원 / Seoul Yido Dental Office**. `YIDO`는 브랜드 심볼·섹션명에만.
- **개원 전 초안:** 의료진 실명·학력·장비명·주소·연락처·진료시간·전후사진 등 미확정 정보는 placeholder. 실데이터·의료광고 심의 후 교체.

## 6. 규칙 / 주의
- **빌드하지 마세요.** 파일 그대로가 결과물입니다(컴파일·번들 없음).
- **상대경로 유지** — `index.html` 더블클릭으로 열리는 건 경로가 상대경로라서입니다. `/css/…` 식 루트절대경로로 바꾸지 마세요.
- JS는 전부 `defer`, CSS 로드 순서 유지. 외부 라이브러리 추가 지양(현재 0개).
- **⚠️ 의료광고법(의료법 제56조):** 치료 효과 단정·비포애프터·"최고/유일/완치/보장" 등 표현,
  AI 생성 인물을 실제 원장/환자로 오인시키는 사용 **금지**. 의료 관련 문구·이미지는 임의 추가하지 말고
  **원장님 확인 후** 반영하세요. (공간·분위기·과정 안내 위주)
- SEO 자리표시자(`[domain]`·`[원장 성함]`·`[상세주소]` 등)는 개원 확정 정보로 교체 대상 — 임의로 지어내지 마세요.

## 7. 수정분 회신 방법
바꾼 파일(또는 폴더 전체)을 **zip으로 압축해 원장님께 전달**해 주세요. 배포(라이브 반영)는
repo 관리자가 진행합니다. 변경 위치를 간단히 메모(예: "index.html 3번째 섹션 문구, tokens.css 주황색")해 주시면 빠릅니다.

---
*이 문서는 외부 협업용 핸드오프입니다. 브랜드 전략·메시지·의료광고법 상세 기준 등 내부 문서는 별도 비공개로 관리됩니다.*
