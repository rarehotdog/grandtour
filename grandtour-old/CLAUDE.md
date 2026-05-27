# 🌍 Grand Tour 2026 — Claude 작업 가이드

> **목적**: 이 문서는 Claude (Claude Code, 다른 채팅 세션, 또는 어떤 AI 에이전트든) 가 이 프로젝트를 이어서 작업할 수 있도록 필요한 모든 컨텍스트를 담는다.

## 📍 프로젝트 한 줄

**Tyler (김태현) × 주연의 2026년 6월 15일~7월 12일 28일간 유럽·UAE 신혼여행 동반자 앱.** React 단일 파일 (`index.html`) · localStorage 저장 · Vercel 배포.

- **Live URL**: https://grandtour-lilac.vercel.app/
- **Repo**: https://github.com/rarehotdog/grandtour
- **호스팅**: Vercel (GitHub `main` 브랜치 자동 배포)

---

## 🚀 새 Claude 세션 시작하는 방법

### 옵션 A: Claude Code (터미널)

```bash
# 1. 저장소 클론 (한 번만)
git clone https://github.com/rarehotdog/grandtour.git
cd grandtour

# 2. Claude Code 시작
claude
```

첫 메시지 예시:
```
이 폴더의 CLAUDE.md를 먼저 읽고, 이 프로젝트의 컨텍스트 파악해줘.
그 다음에 [요청 사항] 작업 시작해주면 돼.
```

### 옵션 B: 다른 Claude 채팅 (claude.ai 웹/앱)

새 채팅 시작 → 다음 첨부:
1. `CLAUDE.md` (이 문서)
2. `companion_app.jsx` (메인 소스 — React 컴포넌트)
3. `build_html.py` (HTML 빌드 스크립트)

첫 메시지:
```
첨부한 CLAUDE.md 먼저 읽고 컨텍스트 파악해줘. 
이 신혼여행 앱 디벨롭 이어서 할 거야. 
오늘 작업할 거: [요청 사항]
```

---

## 🏗️ 아키텍처 (3분 안에 이해)

### 파일 구조

```
grandtour/
├── index.html              # ← 배포되는 실제 파일 (Vercel이 서빙)
├── vercel.json             # Vercel 설정 (캐시 헤더)
├── README.md               # 짧은 안내
├── CLAUDE.md               # ← 이 문서
├── companion_app.jsx       # 개발용 소스 (React JSX)
├── build_html.py           # JSX → HTML 빌드 스크립트
└── claude_code_guide.md    # 풀스택 업그레이드 가이드 (Supabase 등)
```

### 빌드 흐름

```
companion_app.jsx  ──build_html.py──▶  index.html  ──git push──▶  Vercel
```

`companion_app.jsx`를 수정하고, `python3 build_html.py` 돌리면 `index.html`이 갱신됨. 이걸 GitHub에 푸시하면 Vercel이 30초 안에 자동 배포.

### 기술 스택

- **React 18** (UMD via CDN, JSX 인라인)
- **Babel Standalone** (브라우저에서 JSX 컴파일)
- **localStorage** (모든 데이터 — 서버 없음)
- **OpenStreetMap iframe** (인라인 지도, API 키 없음)
- **Open-Meteo API** (날씨, 무료, CORS ✓)
- **open.er-api.com** (환율, 무료, CORS ✓)
- **빌드 도구 없음** — 단일 HTML 파일

빌드 시스템 없음 = 의존성 충돌 없음 = 단순함.

---

## 📂 코드 맵 (`companion_app.jsx` 섹션별)

| 라인 범위 | 섹션 | 역할 |
|----------|------|------|
| 1-22 | Imports + CHAPTERS | 9개 도시 메타데이터 (좌표·색상·테마) |
| 24-50 | mapsUrl + compressImage | Google Maps URL + 이미지 압축 |
| 52-260 | RECOMMENDATIONS | 9 도시 × 4 시간대 × ~3 추천 |
| 262-305 | DAYS_DEFAULT | 28일 일정 (날짜·호텔·활동·질문) |
| 307-318 | HOTELS_DEFAULT | 10개 호텔 (확정 상태) |
| 320-330 | FLIGHTS_DEFAULT | 8개 항공편 |
| 332-396 | CHECKLIST | D-30 준비 항목 (8개 섹션) |
| 398-440 | PACKING (Tyler) | 8 카테고리 |
| 442-510 | PACKING_JUYEON | 7 카테고리 |
| 512-560 | PACKING_COUPLE | 5 카테고리 |
| 562-570 | PACKING_ALL | 통합 객체 |
| 572-610 | OUTPUTS (3 티어) | Lifetime 4 / Major 6 / Working 9 |
| 612-625 | RESTAURANTS | 9개 미슐랭급 |
| 627-640 | CITY_COORDS | 날씨 API용 좌표 |
| 642-680 | storage | localStorage 비동기 래퍼 |
| 682-710 | TRIP_START + getCurrentStatus | D-Day 계산 |
| 712-1010 | function App() | 메인 — 상태 + 라우팅 |
| 1012-1080 | Header | 컴팩트 헤더 (네이비 바) |
| 1082-1195 | PhotoSlot | 사진 업로드 (Canvas 압축) |
| 1197-1240 | InlineMap | OpenStreetMap iframe |
| 1242-1330 | Recommendations | 도시별 추천 4×3 |
| 1332-1490 | Private | PIN 잠금 + 메모+산물 |
| 1492-1545 | NotesInner | 메모 28일 (Private 내부) |
| 1547-1670 | OutputsInner | 산물 3 티어 (Private 내부) |
| 1672-1820 | PhotoGallery | 28장 그리드 + 라이트박스 모달 |
| 1822-1915 | ExchangeRates | 실시간 환율 |
| 1917-2050 | WeatherWidget | 9 도시 날씨 |
| 2052-2200 | RestaurantTracker | 예약 상태 트래커 |
| 2202-2260 | EditableField | 모든 필드 ✎ 편집 |
| 2262-2440 | EditableDayDetail | 일정 펼친 화면 |
| 2442-2620 | Home | 메인 홈 화면 |
| 2622-2810 | Days | 28일 리스트 (expand) |
| 2812-2920 | NoteEditor | 메모 입력 (Private 내) |
| 2922-3030 | Checklist | 체크리스트 + 패킹 |
| 3032-3150 | PackingSection | 패킹 카테고리 (편집/추가) |
| 3152-3220 | Notes (구버전) | ⚠️ 라우팅 끊김 — Private이 대체 |
| 3222-3290 | Outputs (구버전) | ⚠️ 라우팅 끊김 — Private이 대체 |
| 3292-3350 | Logistics | 6 sub-tab (지도/호텔/항공/미식/실시간/비용) |
| 3352-3470 | MapView | SVG 지도 + 챕터 선택 |
| 3472-3540 | HotelsList | 호텔 10개 카드 |
| 3542-3590 | FlightsList | 항공편 8개 |
| 3592-3650 | CostsSummary | 예산 분석 |
| 3652-3750 | UI Helpers | Card, SubTab, StatCard, btnStyle 등 |
| 3752-3768 | BottomNav | 5 탭 (홈/일정/체크/지도/🔒) |

---

## 🔑 핵심 결정 사항 (왜 이렇게 설계했나)

### 1. **단일 HTML 파일 = 빌드 시스템 없음**
- 이유: Tyler가 비개발자에 가까움. npm/webpack/vite 같은 도구 없이 모든 게 동작해야 함.
- 단점: 큰 파일 (170KB), Babel 런타임 컴파일로 첫 로드 1초 지연
- 장점: 어디서나 작동, 의존성 0, 디버깅 쉬움

### 2. **localStorage = 서버 없음**
- 이유: 비용 0, 백엔드 운영 부담 0
- 단점: 기기/브라우저별 별도 데이터, ~5MB 한도
- 보완: JSON 백업/복원 기능 내장
- 향후: Supabase 동기화 가능 (`claude_code_guide.md` 참고)

### 3. **메모 + 산물 = PIN 잠금**
- 이유: 주연이 메모/산물 콘텐츠 안 좋아함 → 그녀가 안 보이게 분리
- PIN 4자리 (localStorage `pin` 키)
- 잠금 해제는 세션 단위 (새로고침 시 다시 잠김)
- 일정 펼친 화면에서도 NoteEditor 제거됨 (Private 안에서만)

### 4. **카테고리 색상 = 챕터별 고유**
- 9개 챕터 각각 `color` (배경) + `accent` (글자) 페어
- 표준 그레이는 3톤: `#1B2A4A`, `#6B6760`, `#A8A39A`
- 폰트 사이즈는 7단계 (10/11/12/13/14/18/24px) 내에서

### 5. **여행 단계별 동작**
- `phase: 'pre'` — D-Day 카운트, 체크리스트 강조
- `phase: 'during'` — 오늘 카드 자동 표시 (Day n)
- `phase: 'post'` — 회고 모드

`getCurrentStatus()` 함수가 자동 판단.

---

## 🛠️ 개발 워크플로우 (Claude/Claude Code용)

### 표준 사이클

```
1. [읽기] companion_app.jsx 의 변경 대상 섹션 view
2. [수정] str_replace 또는 직접 편집
3. [빌드] python3 build_html.py
4. [확인] 로컬에서 open index.html 또는 더블클릭
5. [푸시] git add . && git commit -m "..." && git push
6. [대기] 30초 후 https://grandtour-lilac.vercel.app/ 자동 배포
```

### 빌드 스크립트 (`build_html.py`)

```python
# 입력: companion_app.jsx
# 출력: index.html
# 변환:
#   - "import React, { useState, ... }" → "const { useState, ... } = React;"
#   - "export default function App()" → "function App()"
#   - window.storage → localStorage 비동기 래퍼
#   - 마지막에 ReactDOM.createRoot(...).render(<App />) 추가
```

쉘에서 한 줄로:
```bash
python3 build_html.py && echo "✅ Built index.html"
```

### 변경 사항 검증

빌드 후 반드시 확인:

```bash
# 1. JSX 줄 수 확인 (예상치 안에 있는지)
wc -l companion_app.jsx

# 2. 컴포넌트 함수 갯수 확인 (현재 30+개)
grep -c "^function " companion_app.jsx

# 3. HTML 빌드 결과 확인
grep "ReactDOM.createRoot" index.html

# 4. 라우팅 무결성 확인
grep "view ===" companion_app.jsx | head
```

### 로컬 테스트

```bash
# Mac
open index.html

# Linux
xdg-open index.html

# 또는 간단 서버
python3 -m http.server 8000
# → http://localhost:8000
```

---

## 🎯 자주 하는 작업 예시

### Case 1: 호텔 정보 업데이트

```bash
# companion_app.jsx에서 HOTELS_DEFAULT 찾기
grep -n "const HOTELS_DEFAULT" companion_app.jsx
# → line 307
```

그 줄 근처에서 직접 편집 또는 Claude에게:
> "HOTELS_DEFAULT에서 6번째 호텔 conf 필드를 '확정 ✓ 60672934'로 바꿔줘"

### Case 2: 새 챕터 일정 활동 추가

`DAYS_DEFAULT`의 `hl` (highlight), `food`, `asi` (산물), `q` (질문), `mo` (모먼트) 필드 수정.

### Case 3: 디자인 컬러 변경

색상 표준:
- 회색 3톤: `#1B2A4A` (primary), `#6B6760` (secondary), `#A8A39A` (tertiary)
- 골드: `#C9A961`
- 챕터 accent는 각 챕터별 고유 (CHAPTERS에서 변경)

### Case 4: 새 위젯/컴포넌트 추가

1. 함수 정의: `// =================== 컴포넌트명 ===================` 주석으로 섹션 구분
2. App에서 상태 관리 (필요 시)
3. 라우팅 추가 (BottomNav 또는 Logistics sub-tab)
4. 필요 시 storage 키 추가 (예: `restaurants`, `weather_cache`)

---

## 🗂️ Storage Keys (localStorage)

| 키 | 데이터 | 형식 |
|---|---|---|
| `check` | 체크리스트 완료 상태 | `{ c1: true, c2: false, ... }` |
| `notes` | 28일 메모 | `{ 1: {content: '...', savedAt: '...'}, ... }` |
| `outputs` | 산물 19개 (done + 내용) | `{ L1: {done: true, content: '...'}, ... }` |
| `packing` | 패킹 체크 상태 | `{ pk1: true, jw1: false, ... }` |
| `packing_custom` | 사용자 추가 패킹 항목 | `{ tyler: {section: [items]}, juyeon: {}, couple: {} }` |
| `packing_edits` | 편집된 패킹 텍스트 | `{ pk1: {t: '...', src: '...'} }` |
| `edits` | 일정/호텔/항공편 편집 | `{ day: {}, hotel: {}, flight: {} }` |
| `photos` | 28일 사진 (base64) | `{ 1: {data: 'data:image/jpeg;...', savedAt: '...'}, ... }` |
| `restaurants` | 레스토랑 예약 상태 | `{ R1: 'confirmed', R2: 'pending', ... }` |
| `pin` | 비공개 탭 PIN | `'1234'` |
| `fx_cache` | 환율 캐시 | `{ rates: {EUR: 1453, ...}, savedAt: timestamp }` |
| `weather_cache` | 날씨 캐시 | `{ data: {paris: {...}, ...}, savedAt: timestamp }` |

---

## ⚠️ 주의사항 / 함정

### 1. **window.storage vs localStorage**
JSX에서는 `storage.get/set` (비동기) 사용. 이게 HTML로 빌드되면 localStorage로 자동 변환됨. **절대 직접 localStorage 호출 금지** (이중 변환 충돌).

### 2. **`<>` JSX Fragment 안 됨**
Babel standalone이 일부 fragment 문법 처리 못 함. `<div>` 또는 `React.Fragment` 사용.

### 3. **외부 이미지/폰트 로드**
Vercel `vercel.json`에 `X-Frame-Options: SAMEORIGIN`이 있어서 iframe은 OK지만, 일부 폰트는 CORS 차단. 시스템 폰트만 사용 권장 (현재 Georgia + system).

### 4. **PIN 분실**
사용자가 PIN 잊어도 Private 콘텐츠(메모/산물)는 사라지지 않음. 잠금 화면 하단의 "비밀번호 초기화" 누르면 PIN만 리셋되고 데이터 유지.

### 5. **사진 용량**
한 사진당 ~100KB (1000px max, JPEG 0.7). 28장이면 ~2.8MB. localStorage 한도(~5MB) 안. 더 늘리면 IndexedDB 마이그레이션 필요.

### 6. **구버전 Notes/Outputs 컴포넌트**
파일에 `function Notes` (line 3152)와 `function Outputs` (line 3222) 컴포넌트 남아있지만 라우팅에서 끊김. 삭제 안 한 이유: 안전망. 정리 시 삭제 가능.

### 7. **'tx' 챕터**
원래 7/2 FCO 완충 챕터였으나 제거됨. CHAPTERS와 일부 필터에서 `'tx'`로 검색되는 잔재 있음. 의미 없으므로 청소해도 됨.

---

## 📊 데이터 모델 핵심

### CHAPTERS (9 + 2)
```js
{
  id: 'paris',       // 키
  name: '파리',
  flag: '🇫🇷',
  icon: '🗼',
  country: 'France',
  theme: 'Taste · 취향',
  tag: '정보가 무료인 시대, 무엇이 희소한가',
  color: '#FCE7F3',  // 배경
  accent: '#BE185D', // 글자
  coords: { lat: 48.8566, lng: 2.3522 },
  search: 'Paris, France',
  dates: '6/16~18',
}
```
(+ 'p' 서막, 'ret' 귀국)

### DAYS (28개)
```js
{
  n: 10,              // Day number (1-28)
  d: '6/24',          // 날짜
  w: '수',            // 요일
  c: 'dol',           // chapter id
  city: 'Seceda 일출',
  hotel: 'X ALP',
  moves: '...',
  hl: '...',          // highlight
  food: '...',
  asi: '...',         // ASI 산물 메모
  q: '...',           // 오늘의 질문
  mo: '...',          // 커플 모먼트
  int: 'H',           // intensity: H/M+/M/L
}
```

### OUTPUTS (19개, 3 티어)
```js
{
  id: 'L1',           // L = Lifetime, M = Major, W = Working
  t: '제목',
  cat: 'lifetime',    // lifetime / major / working
  day: 10,
  ch: 'dol',
  desc: '설명',
  star: 3,            // 1-3
}
```

### RESTAURANTS (9개)
```js
{
  id: 'R1',
  name: 'Le Jules Verne',
  city: '파리',
  ch: 'paris',
  day: 3,
  date: '6/17',
  time: '저녁',
  priority: 'critical',  // critical / high / medium
  stars: 1,              // 미슐랭 스타
  why: '...',
  book: '예약 방법',
  dress: '재킷',
  size: 2,
}
```

상태는 별도 storage 'restaurants': `{ R1: 'confirmed' | 'pending' | 'waiting' | 'visited' }`

---

## 🚦 향후 가능한 작업 (백로그)

### 우선순위 ★★★
- [ ] Supabase 연동 (`claude_code_guide.md` 참고) — 주연과 데이터 공유
- [ ] 사진 갤러리 영상 추가 — 동영상 1개씩
- [ ] 메모 검색 — 전체 텍스트 검색

### 우선순위 ★★
- [ ] 일별 위치 자동 감지 (geolocation) — 오늘 자동 매칭
- [ ] 예산 자동 추적 — 영수증 OCR
- [ ] 한국어 번역 위젯 (구글 번역 임베드)
- [ ] 비행 정보 자동 업데이트 (Flightradar24 API)

### 우선순위 ★
- [ ] PWA 매니페스트 + 오프라인 모드 (Service Worker)
- [ ] 시간대 자동 변환 (각 도시 현지 시간)
- [ ] 모스크/교회 드레스코드 자동 알림 (입장 전)
- [ ] Spotify 챕터별 플레이리스트 임베드

### 손대지 말 것 ❌
- 풀스택 마이그레이션 (Next.js 등) — 단순함 잃음
- 의존성 추가 (lodash 등) — CDN 부담
- 디자인 시스템 라이브러리 (Material UI 등) — 현재 인라인이 컨트롤 더 좋음

---

## 🔗 외부 API (캐싱 정책 포함)

| API | URL | 캐시 | 키 필요? |
|-----|-----|------|----------|
| 환율 | `https://open.er-api.com/v6/latest/KRW` | 1시간 | ❌ |
| 날씨 | `https://api.open-meteo.com/v1/forecast` | 30분 | ❌ |
| 지도 | `https://www.openstreetmap.org/export/embed.html` | iframe (즉시) | ❌ |
| Google Maps | `https://www.google.com/maps/search/?...` | 외부 링크 | ❌ |

모두 무료. CORS 통과. 키 없음. **유지보수 부담 0**.

---

## 💬 Tyler 컨텍스트 (작업 시 참고)

- **직업**: 카카오모빌리티 Strategy & Operations Manager (행성기획팀)
- **배경**: Tribus 공동창업 (B2B OCR SaaS) · 도쿄·자카르타·미국 거주 경험
- **목표 (이 여행)**: Stanford GSB 지원 (2026년 8월 R1) + 다음 회사 청사진
- **여행 철학**: "무언가가 되기 위해 떠나는 게 아니라, 앞으로 무엇을 할지 결정하기 위해 떠난다"
- **커플**: 약혼녀 주연과 2026년 6월 결혼 → 신혼여행 (28일)
- **감성**: Fancy/Quiet luxury · 미슐랭 다수 · 호텔 점수 평균 8.8+
- **모바일 의존도**: iPhone Safari 풀스크린 PWA로 사용

---

## 📞 도움 요청 시 정확한 명세 예시

좋은 요청:
> "companion_app.jsx의 RestaurantTracker 컴포넌트에 메모 필드 추가해줘. 각 레스토랑마다 자유 메모 적을 수 있게. localStorage 키는 `restaurant_notes` 신규."

너무 모호한 요청:
> "레스토랑 좀 더 좋게 만들어줘"

작업 결과물 요청 시 항상:
1. `companion_app.jsx` (수정된 소스)
2. `index.html` (빌드 결과)
3. 변경 요약 (어떤 라인, 무슨 이유)

---

## 🎬 마무리

이 프로젝트는 **간결함이 미덕**이다. 새 기능 추가하기 전에 "이게 정말 여행 중 5초 안에 가치 줄까?"를 자문해야 함. 추가 즐거움이 안 되는 기능은 추가하지 않는 게 낫다.

여행 시작: **2026년 6월 15일**. 그때까지 안정화가 목표.

행운을!  
— Claude (`opus-4.7`) by Anthropic
