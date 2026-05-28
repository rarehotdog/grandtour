# Grand Tour 2026 — 개발 현 상태 리뷰

> 대상: `~/Desktop/grandtour/` (단일 HTML 앱, Vercel 배포)
> 정리일: **2026-05-28** · 정리자: Claude (Opus 4.7)
> 라이브: https://grandtour-lilac.vercel.app/
> 저장소: https://github.com/rarehotdog/grandtour
> 출발: **2026-06-15** (D−18)

---

## 0. 한눈에 보는 현 상태

| 지표 | 값 |
|---|---|
| **index.html** | 4,241줄 · 192KB |
| **React 컴포넌트** | 39개 (App 포함) |
| **React 훅 (useState/useEffect)** | 55개 |
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
| **Phase 0** | `bc2f1c2` | Source of truth = `index.html` 확정. `companion_app.jsx`+`build_html.py` deprecated. Git 복구 (grandtour-old 백업 보존). |
| **Phase 1** | `6110952` | `tx` 챕터 데이터 버그 수정 · D-Day 자동 갱신 (60초 + visibilitychange) · 환율 fetch 8초 타임아웃 |
| **Phase 2** | `e6c31e3` | 일정 펼친 화면 상단에 헤로 테마 이미지 추가 · 이미지 깨지면 ChapterFallback 자동 전환 |
| **Phase 3** | `56bfe96` | 체크리스트 저장 stale-closure 버그 수정 · 백업 `_meta` + 사진 포함 토글 · 데드코드 −157줄 |
| **Phase A** | `c16ccba` | Visual Polish — CSS 디자인 토큰 · 글래스 헤더 · 페이지 fade · 스켈레톤 · BottomNav 인디케이터 |
| (cleanup) | `d9d4bce` | `.gitignore` 추가 + `.DS_Store`/`.omc`/`grand-tour-app`/`grandtour-old` 추적 제거 |
| **Phase B** | `992e62f` | Storytelling — HeroCountdown · TimelineStrip · ChapterProgress · OutputsProgress |
| **Phase C** | `ab2938a` | In-trip utility — CopyChip · TimezoneWidget · NextFlight · EmergencyContacts |
| **Phase D** | `c96db9c` | Stability + infra — 사진 **IndexedDB 마이그레이션** · BackupReminder · GT 모노그램 앱 아이콘 |
| **Wanted DS** | `011dec0` | Pretendard 폰트 + Atomic/Semantic 토큰 구조 · spacing/radius/type 스케일 · Quiet Luxury 유지 |
| **Font fix** | `20c5d15` | dynamic-subset → 풀 variable CSS · SW v1→v2 cache bump · jsdelivr cacheable origin 추가 |

---

## 2. 현재 코드 구조

### 2.1 디자인 시스템 (Wanted DS 패턴 차용)

```
Atomic (raw values)
  ├─ --color-atomic-navy-{500,700,900}
  ├─ --color-atomic-gold-{400,500,600}
  ├─ --color-atomic-cream-{50,100,200}
  └─ --color-atomic-{white, warm-600, warm-400, red-700, amber-700, amber-50}

Semantic (intent mapping — 향후 다크모드 토대)
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
  ├─ .gt-num (tabular-nums)
  ├─ .gt-serif (force serif family)
  ├─ .gt-card (shadow-sm baseline + hover lift)
  ├─ .gt-view (page fade-in animation)
  ├─ .gt-skel (skeleton shimmer)
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
  ├─ pin (PIN — 백업/복원 시 의도적으로 제외)
  └─ lastBackupAt (BackupReminder 트리거)
```

**자동 마이그레이션**: 앱 시작 시 `storage.get('photos')`에 데이터가 있으면 IndexedDB로 자동 이전 후 localStorage 정리. (5MB 한도 사실상 제거)

### 2.3 주요 컴포넌트

```
App (status, 모든 state + 저장 액션)
├── Header (glass, sticky, D-Day 라벨)
├── main (key={view} fade-in 전환)
│   ├── Home
│   │   ├── BackupReminder (14일 이상 백업 없으면 배너)
│   │   ├── HeroCountdown (pre phase: D-day 풀히어로)
│   │   ├── Trip Philosophy 인용
│   │   ├── TimelineStrip (28일 가로 스와이프)
│   │   ├── TimezoneWidget (during phase: 현지+KST)
│   │   ├── NextFlight (다음 이동 카운트다운)
│   │   ├── Today's Card (during phase)
│   │   ├── StatCard × 2 (체크리스트 / 여행까지)
│   │   ├── ChapterProgress (9 챕터 dots + Maps 링크)
│   │   ├── OutputsProgress (Lifetime/Major/Working 3티어)
│   │   ├── EmergencyContacts (대사관 × 6 + Amex + 응급)
│   │   ├── Quick Links 4개
│   │   └── 백업 / 복원 (사진 포함 토글)
│   ├── Days (28일 리스트 → 펼치면 DayHero+PhotoSlot+InlineMap+EditableDayDetail)
│   ├── Checklist (D-30~D-3 체크 + Packing 3인용 탭)
│   ├── Private (PIN 잠금 → NotesInner + OutputsInner)
│   └── Logistics (MapView + HotelsList + FlightsList + Restaurants + Realtime + Costs)
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
- [x] **시각적 카운트다운** — HeroCountdown 76px 골드 진행바
- [x] **28일 타임라인** — 가로 스와이프, 오늘 강조
- [x] **챕터별/산물별 진행률** — dots + 진행바
- [x] **현지+KST 듀얼 시계** — 30초 자동 갱신
- [x] **다음 비행 카운트다운** — 오늘이면 골드 강조
- [x] **클립보드 복사** — 호텔 conf, 비상 연락처 한 탭 + 시각 ✓ 피드백
- [x] **비상 연락처 9개** — 한국대사관 × 5국 + Amex + 응급, tel: 링크 + 복사

### 🟡 알려진 제약 (의도된 설계)

- **PIN은 가림막** — localStorage 평문 저장. 실보안 아님. README/CLAUDE.md에 명시됨.
- **사진은 base64 IndexedDB** — 1장당 ~100KB (1000px max, JPEG 0.7). 28장 ~2.8MB.
- **백업 사진 포함 시** — JSON 수 MB. 기본 OFF (사진 제외), 토글로 ON 가능.
- **외부 API** — 환율 (open.er-api.com), 날씨 (open-meteo.com), 지도 (openstreetmap). 모두 무료/CORS OK/키 불필요. 캐시 fallback 보유.

### ⚪ 잔여 백로그 (출발 후/필요 시)

- [ ] **인라인 스타일 정리** — 아직 263+ 위치. Logistics/Recommendations 등 토큰화 가능. (시간 시)
- [ ] **다크 모드** — 시맨틱 토큰 레이어만 갈아끼우면 됨. 출발 후 검토.
- [ ] **Supabase 동기화** — 주연과 데이터 공유. 풀스택 마이그레이션 필요. 미루기.
- [ ] **사진 갤러리 영상** — 메모리/IDB 한도 검토 필요.
- [ ] **메모 전체 검색** — 28일 메모 전체 텍스트 검색.
- [ ] **PWA 푸시 알림** — "오늘의 질문" 매일 저녁 알림.
- [ ] **WeatherWidget 구현** — Open-Meteo API 사용, 9 도시 일주일.

---

## 4. 운영 메모

### 4.1 배포 플로우

```
index.html / sw.js / manifest.webmanifest 직접 편집
  → git add . && git commit -m "..."
  → git push origin main
  → Vercel이 30초 이내 자동 배포
```

빌드 단계 없음. `companion_app.jsx` + `build_html.py`는 `grandtour-old/` 로컬 백업에만 존재 (절대 main 폴더로 복원 금지).

### 4.2 SW 캐시 정책

- **HTML (`/`, `/index.html`)** — network-first. 새 코드 항상 우선, 오프라인이면 캐시.
- **라이브러리 (React/Babel)** — cache-first. 한 번 받으면 안정.
- **Pretendard CSS** — `grandtour-v2` PRECACHE에 포함.
- **외부 API (er-api, open-meteo, openstreetmap, google maps)** — 캐시 안 함, 항상 네트워크 (passthrough).
- **버전 bump** — SW 자체를 수정할 때만 `CACHE` 상수 v2 → v3로 올림. HTML 수정만으로는 bump 불필요.

### 4.3 백업/복원

- **백업**: 홈 하단 "📦 백업 다운로드" → JSON 파일. 사진 포함 토글 (기본 OFF).
- **자동 알림**: 14일 이상 백업 없으면 Home 상단 골드 배너.
- **복원**: "📂 백업 복원" → JSON 선택 → confirm → alert (PIN은 별도 재설정 필요 안내).
- **권장 주기**: 출발 직전 (사진 포함) + 여행 중 주 1회 (사진 제외, 가벼움).

### 4.4 PWA 설치 (Tyler/주연용)

1. iPhone Safari로 https://grandtour-lilac.vercel.app/ 열기
2. 공유 → "홈 화면에 추가"
3. 홈 화면에 `GT` 모노그램 아이콘 (네이비 + 골드 세리프) 생김
4. 풀스크린 standalone 모드로 실행
5. 길게 누르면 단축키 "체크리스트" / "28일 일정" 노출

### 4.5 폰트 문제가 또 생기면

- 브라우저 캐시: Safari → 설정 → 고급 → 웹사이트 데이터 → `grandtour-lilac.vercel.app` 삭제
- SW 캐시: 코드 수정 후 `sw.js`의 `CACHE` 상수만 bump (`v2` → `v3`)
- 검증: DevTools (데스크탑) → Elements → Computed → Font → "Rendered Font: Pretendard Variable" 확인

---

## 5. 다음 후보 작업 (사용자 선택)

| 후보 | 임팩트 | 시간 | 비고 |
|---|---|---|---|
| 인라인 스타일 → 토큰 마이그레이션 (Logistics/Days 등) | 코드 품질 ↑ · 다크모드 토대 | ~45분 | 안전 |
| **다크 모드 토글** | 야간 사용성 ↑ | ~40분 | 시맨틱 토큰 준비됨 |
| WeatherWidget 구현 (9 도시) | 여행 실용 ↑ | ~50분 | API 무료 |
| 메모 전체 검색 | 회고 단계 가치 | ~30분 | localStorage 인덱싱 |
| 챕터 첫날 시네마틱 인트로 | 감성 ↑↑ | ~60분 | 헤로 이미지 활용 |
| Supabase 동기화 | 주연과 공유 | ~3시간 | 풀스택 도입 (큰 변화) |

> 다음 항목을 지정해 주면 바로 반영합니다. 출발 1주 전(6/8)부터는 **코드 동결** 권장.
