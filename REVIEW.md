# Grand Tour 2026 — 개발 현 상태 리뷰

> 대상: `~/Desktop/grandtour/` (단일 HTML 앱, Vercel 배포)
> 정리일: **2026-05-29** · 정리자: Claude (Sonnet 4.6)
> 라이브: https://grandtour-lilac.vercel.app/
> 저장소: https://github.com/rarehotdog/grandtour
> 출발: **2026-06-15** (D−17)

---

## 0. 한눈에 보는 현 상태

| 지표 | 값 |
|---|---|
| **index.html** | 5,238줄 · ~210KB |
| **React 컴포넌트** | 47개 (App 포함) |
| **디자인 토큰** | 63개 (atomic + semantic + space + radius + type + shadow) |
| **Service Worker** | `grandtour-v2` · network-first HTML · cache-first 라이브러리 |
| **PWA** | manifest 정상 · 192/512 SVG 아이콘 · 단축키 2개 |
| **저장소** | localStorage (메모/체크/편집) + **IndexedDB** (사진) |
| **폰트** | Cormorant Garamond (Latin serif) + **Pretendard Variable** (Hangul/sans) |
| **빌드 단계** | 없음. `index.html` 직접 편집 → git push → Vercel 자동 배포 |

---

## 1. 진행 이력 (커밋별)

| 단계 | 커밋 | 한 줄 요약 |
|---|---|---|
| **Phase 0** | `bc2f1c2` | Source of truth = `index.html` 확정. `companion_app.jsx`+`build_html.py` deprecated. Git 복구. |
| **Phase 1** | `6110952` | `tx` 챕터 데이터 버그 수정 · D-Day 자동 갱신 · 환율 fetch 타임아웃 |
| **Phase 2** | `e6c31e3` | 일정 펼친 화면 상단 헤로 테마 이미지 · ChapterFallback 자동 전환 |
| **Phase 3** | `56bfe96` | 체크리스트 stale-closure 버그 수정 · 백업 토글 · 데드코드 −157줄 |
| **Phase A** | `c16ccba` | Visual Polish — CSS 디자인 토큰 · 글래스 헤더 · 페이지 fade · BottomNav 인디케이터 |
| (cleanup) | `d9d4bce` | `.gitignore` 추가 + 불필요 파일 추적 제거 |
| **Phase B** | `992e62f` | Storytelling — HeroCountdown · TimelineStrip · ChapterProgress · OutputsProgress |
| **Phase C** | `ab2938a` | In-trip utility — CopyChip · TimezoneWidget · NextFlight · EmergencyContacts |
| **Phase D** | `c96db9c` | Stability — 사진 IndexedDB 마이그레이션 · BackupReminder · GT 모노그램 아이콘 |
| **Wanted DS** | `011dec0` | Pretendard 폰트 + Atomic/Semantic 토큰 구조 · spacing/radius/type 스케일 |
| **Font fix** | `20c5d15` | dynamic-subset → 풀 variable CSS · SW v1→v2 cache bump |
| **REVIEW refresh** | `ef66db1` | REVIEW.md 갱신 — D-18 기준 |
| **Phase E** | _(미커밋)_ | HeroCountdown 3단 날씨 대시보드 · Hero 배경 WMO 동적 그래디언트 · 디자인 QA 전수 수정 |

---

## 2. 현재 코드 구조

### 2.1 디자인 시스템 (Wanted DS 패턴 차용)

```
Atomic (raw values)
  ├─ --color-atomic-navy-{500,700,900}
  ├─ --color-atomic-gold-{400,500,600}
  ├─ --color-atomic-cream-{50,100,200}
  └─ --color-atomic-{white, warm-600, warm-400, red-700, amber-700, amber-50}

Semantic (intent mapping)
  ├─ --color-bg-{page, surface, surface-alt, inverse}
  ├─ --color-text-{strong, default, soft, muted, inverse}
  ├─ --color-border-{default, soft, strong}
  ├─ --color-accent-{primary, hover, soft}
  └─ --color-{danger, warning-bg, warning-text}

Scale tokens
  ├─ --space-{1,2,3,4,5,6,8,10,12,16}  (4pt grid)
  ├─ --radius-{xs,sm,md,lg,xl,2xl,pill}
  └─ --type-{display,h1,h2,h3,body,body-sm,caption,eyebrow,micro}

Typography stacks
  ├─ --font-sans  = Pretendard Variable, Pretendard, -apple-system…
  ├─ --font-serif = Cormorant Garamond, Georgia…
  └─ --font-mono  = ui-monospace, SFMono-Regular…

Utility classes
  ├─ .gt-eyebrow / .gt-section-title / .gt-body / .gt-body-soft / .gt-caption
  ├─ .gt-num / .gt-serif / .gt-card / .gt-view / .gt-skel (skeleton shimmer — CSS var 기반)
  ├─ .gt-tab / .gt-tab-bar / .gt-tab-icon (BottomNav active indicator)
  └─ .gt-header (sticky + backdrop-blur glass)
```

### 2.2 데이터 흐름

```
localStorage                      IndexedDB ('grandtour' / 'photos')
  ├─ check                          └─ photo per day (data URL + savedAt)
  ├─ notes
  ├─ outputs
  ├─ packing / packing_custom / packing_edits
  ├─ edits (day/hotel/flight inline edits)
  ├─ fx_cache (환율 1h)
  ├─ weather_cache (날씨 30분)
  ├─ pin (PIN — 백업/복원 시 의도적으로 제외)
  └─ lastBackupAt (BackupReminder 트리거)
```

### 2.3 주요 컴포넌트

```
App (status, 모든 state + 저장 액션)
├── Header (glass, sticky, D-Day 라벨)
├── main (key={view} fade-in 전환)
│   ├── Home
│   │   ├── BackupReminder (14일 이상 백업 없으면 배너)
│   │   ├── HeroCountdown (pre: D-day 3단 대시보드 + 날씨 오늘/내일)
│   │   │     └─ wxBg() — WMO 코드 → Apple 스타일 동적 배경 그래디언트
│   │   ├── TimelineStrip (28일 가로 스와이프)
│   │   ├── TimezoneWidget (during: 현지+KST)
│   │   ├── NextFlight (다음 이동 카운트다운)
│   │   ├── Today's Card (during phase)
│   │   ├── ChapterProgress (9 챕터 dots + Maps 링크)
│   │   ├── OutputsProgress (Lifetime/Major/Working 3티어)
│   │   ├── EmergencyContacts (대사관 × 5국 + Amex + 응급)
│   │   └── 백업 / 복원 (사진 포함 토글)
│   ├── Days (28일 리스트 → DayHero+PhotoSlot+InlineMap+EditableDayDetail)
│   ├── Checklist (D-30~D-3 체크 + Packing 3인용 탭)
│   ├── Private (PIN 잠금 → NotesInner[검색 포함] + OutputsInner)
│   └── Logistics (MapView + HotelsList + FlightsList + WeatherWidget + ExchangeRates + RestaurantTracker + CostsSummary)
├── BottomNav (5탭, 골드 인디케이터 슬라이드)
└── ErrorBoundary (앱 어디서든 throw → 복구 안내 화면)
```

---

## 3. 출발 전 체크리스트

### ✅ 완료 (안정성 핵심)

- [x] **오프라인 동작** — Service Worker network-first HTML, cache-first 라이브러리 (`grandtour-v2`)
- [x] **PWA 설치** — manifest 정상, 192/512 SVG 아이콘, 단축키 (체크리스트/일정)
- [x] **iPhone safe-area** — Header top, BottomNav/main bottom inset
- [x] **ErrorBoundary** — 컴포넌트 throw 시 흰 화면 대신 복구 안내
- [x] **D-Day 자동 갱신** — 60초 + visibilitychange 시 즉시
- [x] **체크리스트 저장 버그** — functional setState로 stale closure 제거
- [x] **`tx` 챕터 데이터 버그** — `o11.ch: 'pos'`로 수정 + 필터 잔재 정리
- [x] **환율 fetch 타임아웃** — 8초 AbortController + 캐시 fallback
- [x] **사진 IndexedDB** — localStorage 5MB 한도 사실상 제거 + 자동 마이그레이션
- [x] **백업 리마인더** — 14일 이상 백업 없으면 Home 배너
- [x] **백업 PIN 제외** — 의도된 보안 동작 + 복원 시 재설정 안내
- [x] **데드코드 정리** — `function Notes` + `function Outputs` 제거 (-157줄)
- [x] **`.gitignore`** — `.DS_Store`/`.omc`/`grandtour-old`/`grand-tour-app` 제외

### ✅ 완료 (UX 격상)

- [x] **글래스 헤더** — backdrop-blur, sticky
- [x] **마이크로 인터랙션** — 버튼 press 0.97, 카드 hover lift, 페이지 fade
- [x] **럭셔리 타이포** — Cormorant Garamond italic (Latin) + Pretendard Variable (Hangul)
- [x] **BottomNav 인디케이터** — 활성 탭 골드 언더라인 슬라이드
- [x] **햅틱 피드백** — 탭 전환, 체크박스, 복사 시 8ms vibrate
- [x] **HeroCountdown 3단 대시보드** — D-Day · 지금 있는 곳 · 다음 행선지 날씨(오늘→내일)
- [x] **Hero 배경 동적 그래디언트** — WMO 코드 → 맑음/흐림/비/눈/천둥 7단계 Apple 스타일
- [x] **28일 타임라인** — 가로 스와이프, 오늘 강조
- [x] **챕터별/산물별 진행률** — dots + 진행바
- [x] **현지+KST 듀얼 시계** — 30초 자동 갱신
- [x] **다음 비행 카운트다운** — 오늘이면 골드 강조
- [x] **클립보드 복사** — 호텔 conf, 비상 연락처 한 탭 + 시각 ✓ 피드백
- [x] **비상 연락처 9개** — 한국대사관 × 5국 + Amex + 응급, tel: 링크 + 복사
- [x] **WeatherWidget** — 9 도시 16일 예보, 도시 셀렉터, 30분 캐시, 오프라인 fallback
- [x] **메모 전체 검색** — NotesInner 검색바 (메모·질문·도시·날짜 매칭)

### ✅ 완료 (Phase E — 디자인 QA 전수 수정 · 2026-05-29)

- [x] **인라인 스타일 → CSS 토큰** — `#E8E2D5`(35곳), `#F5F0E8`(13곳), `#F0EBE0`(6곳), `#FFF8E1`(6곳), `#FFFEF9`(4곳), `#FAF6EF`(2곳) 전부 변수화
- [x] **하드코딩 텍스트 색상 제거** — `#999`→`var(--color-text-muted)`, `#333`→`var(--color-text-strong)`, `#666`→`var(--color-text-soft)`, `#CCC`→`var(--color-border-strong)` 전수 치환
- [x] **배경 `#FFF` 치환** — 비활성 버튼·카드 배경 8곳 → `var(--color-bg-surface)`
- [x] **`minWidth: 0` 누락 수정** — flex:1 텍스트 컨테이너 3곳 (NotesInner summary, Checklist item, MapView city detail) + `overflow: hidden; text-overflow: ellipsis` 추가
- [x] **CopyChip 터치 타겟** — `3px 8px` → `7px 10px` (약 20px → 34px+)
- [x] **호텔 상태 버튼 터치 타겟** — `4px 8px` → `7px 10px`
- [x] **skeleton shimmer CSS 변수화** — `#EFEAE0`/`#F5F0E8` → `var(--color-atomic-cream-*)`
- [x] **경로 텍스트 구체화** — `ICN → CDG` → `인천국제공항 → 파리 CDG / 경유 홍콩 HKG · Cathay`

### 🟡 알려진 제약 (의도된 설계)

- **PIN은 가림막** — localStorage 평문 저장. 실보안 아님.
- **사진은 base64 IndexedDB** — 1장당 ~100KB (1000px max, JPEG 0.7). 28장 ~2.8MB.
- **백업 사진 포함 시** — JSON 수 MB. 기본 OFF (사진 제외), 토글로 ON 가능.
- **외부 API** — 환율·날씨·지도 모두 무료/CORS OK/키 불필요. 캐시 fallback 보유.
- **비표준 font-size 일부 잔존** — 15/16/20px 하드코딩 (7단계 스케일 외). 작동에 영향 없음.

### ⚪ 잔여 백로그 (출발 후/필요 시)

- [ ] **Supabase 동기화** — 주연과 데이터 공유. 풀스택 마이그레이션 필요.
- [ ] **사진 갤러리 영상** — 메모리/IDB 한도 검토 필요.
- [ ] **PWA 푸시 알림** — "오늘의 질문" 매일 저녁 알림.
- [ ] **인라인 스타일 전수 토큰화** — 아직 잔존하는 곳 (Logistics/Recommendations 등). 여행 후 정리.
- [ ] **비표준 font-size 정리** — 15/16/20px → type scale 변수. 여행 후 정리.

---

## 4. 운영 메모

### 4.1 배포 플로우

```
index.html / sw.js / manifest.webmanifest 직접 편집
  → git add . && git commit -m "..."
  → git push origin main
  → Vercel이 30초 이내 자동 배포
```

### 4.2 SW 캐시 정책

- **HTML (`/`, `/index.html`)** — network-first. 새 코드 항상 우선, 오프라인이면 캐시.
- **라이브러리 (React/Babel)** — cache-first. 한 번 받으면 안정.
- **Pretendard CSS** — `grandtour-v2` PRECACHE에 포함.
- **외부 API** — 캐시 안 함, 항상 네트워크 (passthrough).
- **버전 bump** — SW 자체를 수정할 때만 `CACHE` 상수 v2 → v3로 올림.

### 4.3 백업/복원

- **백업**: 홈 하단 "📦 백업 다운로드" → JSON 파일. 사진 포함 토글 (기본 OFF).
- **자동 알림**: 14일 이상 백업 없으면 Home 상단 골드 배너.
- **복원**: "📂 백업 복원" → JSON 선택 → confirm → alert (PIN은 별도 재설정 필요 안내).
- **권장 주기**: 출발 직전 (사진 포함) + 여행 중 주 1회 (사진 제외).

### 4.4 PWA 설치 (Tyler/주연용)

1. iPhone Safari로 https://grandtour-lilac.vercel.app/ 열기
2. 공유 → "홈 화면에 추가"
3. 홈 화면에 `GT` 모노그램 아이콘 (네이비 + 골드 세리프) 생김
4. 풀스크린 standalone 모드로 실행
5. 길게 누르면 단축키 "체크리스트" / "28일 일정" 노출

### 4.5 폰트 문제가 또 생기면

- 브라우저 캐시: Safari → 설정 → 고급 → 웹사이트 데이터 → `grandtour-lilac.vercel.app` 삭제
- SW 캐시: `sw.js`의 `CACHE` 상수 bump (`v2` → `v3`)
- 검증: DevTools → Elements → Computed → Font → "Rendered Font: Pretendard Variable"

---

## 5. 다음 후보 작업

| 후보 | 임팩트 | 비고 |
|---|---|---|
| PWA 푸시 알림 | 여행 중 "오늘의 질문" 매일 저녁 | Service Worker push API |
| Supabase 동기화 | 주연과 실시간 공유 | 풀스택 도입 필요 (~3h) |
| 사진 갤러리 영상 | 추억 보존 강화 | IDB 용량 검토 필요 |
| 인라인 스타일 전수 정리 | 코드 품질 ↑ | 여행 후 권장 |

> 출발 1주 전(6/8)부터는 **코드 동결** 권장. 안정성 > 신기능.
