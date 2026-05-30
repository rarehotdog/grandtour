# Grand Tour 2026 — 개발 현 상태 리뷰

> 대상: `~/Desktop/grandtour/` (단일 HTML 앱, Vercel 배포)
> 정리일: **2026-05-29** · 정리자: Claude (Opus 4.8)
> 라이브: https://grandtour-lilac.vercel.app/  · **Phase H·I 포함 최신 버전 배포·폰 확인 완료**
> 저장소: https://github.com/rarehotdog/grandtour
> 출발: **2026-06-15** (D−17) · 코드 동결 권장: **2026-06-08**

---

## 0. 한눈에 보는 현 상태

| 지표 | 값 |
|---|---|
| **index.html** | 6,448줄 · ~255KB |
| **React 컴포넌트** | 53개 (App 포함) |
| **디자인 토큰** | 67개 (atomic + semantic + danger/warning-bg-deep 신규 4개) |
| **Service Worker** | `grandtour-v3` · push/notificationclick 핸들러 추가 |
| **PWA** | manifest 정상 · 192/512 SVG 아이콘 · 단축키 2개 |
| **저장소** | localStorage + IndexedDB (사진) + spotify_urls |
| **폰트** | Cormorant Garamond (Latin serif) + Pretendard Variable (Hangul/sans) |
| **빌드 단계** | 없음. `index.html` 직접 편집 → git push → Vercel 자동 배포 |

---

## 1. 진행 이력 (커밋별)

| 단계 | 커밋 | 한 줄 요약 |
|---|---|---|
| **Phase 0** | `bc2f1c2` | Source of truth = `index.html` 확정. Git 복구. |
| **Phase 1** | `6110952` | `tx` 챕터 데이터 버그 · D-Day 자동 갱신 · fetch 타임아웃 |
| **Phase 2** | `e6c31e3` | 일정 펼친 화면 상단 헤로 테마 이미지 |
| **Phase 3** | `56bfe96` | 체크리스트 stale-closure 버그 · 백업 토글 · 데드코드 −157줄 |
| **Phase A** | `c16ccba` | Visual Polish — CSS 디자인 토큰 · 글래스 헤더 · BottomNav 인디케이터 |
| **Phase B** | `992e62f` | Storytelling — HeroCountdown · TimelineStrip · ChapterProgress |
| **Phase C** | `ab2938a` | In-trip utility — CopyChip · TimezoneWidget · NextFlight · EmergencyContacts |
| **Phase D** | `c96db9c` | Stability — IndexedDB 사진 마이그레이션 · BackupReminder · GT 아이콘 |
| **Wanted DS** | `011dec0` | Pretendard + Atomic/Semantic 토큰 구조 |
| **Font fix** | `20c5d15` | dynamic-subset → 풀 variable CSS · SW v1→v2 |
| **Phase E** | `894543f` | HeroCountdown 3단 날씨 대시보드 · WMO 동적 그래디언트 · 디자인 QA |
| **Design P1** | `bda32f5` | text-muted contrast (AA) · 한국어 이탤릭 제거 |
| **Phase F** | `89f010f` | 번역위젯·위치감지·알림설정·font-size(15/16/17/20px) 전수 정리 |
| **Phase G** | `0ddba8f` | Spotify위젯·드레스코드·인라인스타일토큰화·홈레이아웃 정리 |
| **Phase H** | _(미커밋)_ | HeroCountdown 2단 세로 재구성(날씨 잘림 해결)·고정 네이비 hero(WMO 동적 제거)·dark-surface 토큰(--ink/--gold/--hairline)·여정 서브탭 4열 그리드·MapView 도시 셀렉터 flex-wrap·아이폰 자간 정리 |
| **Phase I** | `042bf0f` | 여정 유틸 12번째 **현지 꿀팁**(5개국 전압/팁/영업/식수/매너)·항공탭에 **도시 내 이동·택시앱**(9도시)·MapView 도시 선택 시 **우리 일정 요약**(DAYS 연결, 확정일정+추천 2층 구조) |
| **ExpenseTracker** | `4af3f21` | 가계부 — 일별 지출 입력·원화 환산·카테고리 합산 |
| **(GitHub 웹 편집)** | `0788e47` | Tyler가 GitHub 웹에서 직접 통합 커밋 → Vercel 배포. **로컬과 코드 동일**(트리 diff: REVIEW.md만 상이) |

---

## 2. 현재 코드 구조

### 2.1 디자인 시스템 토큰 (Wanted DS 패턴)

```
Atomic  →  Semantic  →  Scale tokens
────────────────────────────────────
색상 신규: --color-danger-bg, --color-danger-border,
           --color-warning-bg-deep, (기존 danger/warning 유지)
타입 스케일: --type-{micro,eyebrow,caption,body-sm,body,h3,h2,h1,display}
           비표준 15/16/17/20px 전수 → var() 완료
```

### 2.2 Home 화면 렌더 순서 (위 → 아래)

```
EveningReminder (저녁 20:30~23:00, 여행 중만)
HeroCountdown (pre) / RetrospectHero (post)
Trip Philosophy quote
TripSummaryCard (pre) / TimezoneWidget (during) / NextFlight
Today's Card + Recommendations (during)
Stats · ChapterProgress · OutputsProgress
EmergencyContacts
LocationSnap      ← GPS 현재 위치 감지 (신규)
NotifSetup        ← 알림 권한 설정 (신규)
Quick Links · Backup/Restore
BackupReminder    ← 최하단 (이동됨)
```

### 2.3 Logistics 탭 목록

```
🗺️ 지도 · 🏨 호텔 · ✈️ 항공(+기차/렌터카/도시내이동) · 💱 환율
🌤️ 날씨 · 🍽️ 미식 · 💰 비용 · 🧾 가계부 · 🌐 번역 · 🎵 음악
👗 복장 · 💡 꿀팁   (총 12개, 4열×3행 그리드 — 가로스크롤 없음)
지도 선택 시: 도시별 "우리 일정 요약" + "추가 추천 활동" 2층 표시
```

---

## 3. 완료 기능 전체 목록

### ✅ 안정성 (출발 전 핵심)

- [x] 오프라인 동작 — SW network-first HTML, cache-first 라이브러리 (`grandtour-v3`)
- [x] PWA 설치 — manifest · 아이콘 · 단축키 · standalone 풀스크린
- [x] iPhone safe-area — Header top, BottomNav/main bottom inset
- [x] ErrorBoundary — throw 시 복구 안내 화면
- [x] D-Day 자동 갱신 — 60초 + visibilitychange
- [x] 체크리스트 저장 버그 — functional setState
- [x] `tx` 챕터 데이터 버그 수정
- [x] 환율 fetch 타임아웃 — 8초 AbortController + 캐시 fallback
- [x] 사진 IndexedDB 마이그레이션 (localStorage 5MB 한도 해소)
- [x] 백업 리마인더 — 14일 이상 미백업 시 홈 배너 (최하단)
- [x] 데드코드 정리 (−157줄)

### ✅ UX / 스토리텔링

- [x] 글래스 헤더 · 마이크로 인터랙션 · 페이지 fade
- [x] Cormorant Garamond + Pretendard Variable
- [x] BottomNav 골드 인디케이터 · 햅틱 피드백
- [x] HeroCountdown 3단 대시보드 (D-Day · 현 위치 · 도착지 날씨)
- [x] Hero 배경 WMO 동적 그래디언트 (7단계)
- [x] 28일 타임라인 가로 스와이프
- [x] 챕터 진행도 dots · 산물 3티어 진행바
- [x] TimezoneWidget (현지+KST 듀얼 시계)
- [x] NextFlight 카운트다운
- [x] WeatherWidget 9도시 16일 예보
- [x] 메모 전체 검색 (NotesInner)
- [x] RetrospectHero (post-trip 회고 화면)

### ✅ In-trip 유틸리티 (Phase F~G)

- [x] **번역 위젯** — 프/이/영/아랍어 40+ 문장 · 카테고리 탭 · 복사 · Google 번역 링크
- [x] **위치 자동 감지** — GPS → Haversine → 가장 가까운 챕터 도시 · 챕터 색상 배경
- [x] **알림 설정** — Notification API 권한 요청 · ON/OFF 상태 표시 · SW push 핸들러 준비
- [x] **Spotify 음악 위젯** — 9챕터 무드 테마 + Spotify 검색 링크 + 커스텀 URL 임베드
- [x] **드레스코드 위젯** — 파리/피렌체/로마/두바이 핵심 장소 복장 규정 (🔴/🟡/🟢)
- [x] 비상연락처 9개 (대사관 × 5국 + Amex + 응급)
- [x] 클립보드 복사 CopyChip

### ✅ 코드 품질

- [x] CSS 디자인 토큰 67개 (atomic + semantic + scale)
- [x] 비표준 font-size 15/16/17/20px → CSS 변수 전수 완료
- [x] 하드코딩 색상 전수 토큰화: danger/danger-bg/danger-border/warning-text/warning-bg-deep

---

## 4. 알려진 제약 (의도된 설계)

- **PIN은 가림막** — localStorage 평문 저장. 실보안 아님.
- **사진은 base64 IndexedDB** — 1장당 ~100KB. 28장 ~2.8MB.
- **알림은 앱 포그라운드 한정** — iOS PWA 제약. 진짜 백그라운드 푸시는 VAPID 서버 필요 (SW 핸들러는 준비됨).
- **Spotify 임베드** — 커스텀 URL 붙여넣기 방식. 자동 재생 불가 (브라우저 정책).

---

## 5. 개선 로드맵 — 월드클래스 여행 동반자 앱 기준

> **렌즈**: "최고 수준 앱은 평온할 때가 아니라 **최악의 순간**(해외·로밍 끊김·기기 분실·예약 분쟁)에 가치를 증명한다."
> 우선순위는 *기능의 화려함*이 아니라 **여행 중 5초 안에 실제 효용 + 실패 시 타격 크기**로 매겼다.
> 출발 D-17 · 코드 동결 권장 **2026-06-08**. 동결 전엔 기능, 이후엔 데이터·백업만.
>
> ✅ **P0(작업 보존·배포)는 완료** — Phase H·I 커밋(`042bf0f`)·라이브 배포·폰 확인 끝.
> ⚠️ **운영 이슈**: 로컬↔GitHub 히스토리 갈라짐(코드는 동일, REVIEW.md만 상이). §6 참조 — 정리 필요.

### 5.0 "월드클래스"의 정의 — 이 앱이 통과해야 할 바(bar)

> *세계 어디에 내놔도 최고 수준*이란, 동급 1군 여행앱(TripIt·Wanderlog·Google Trips류)이 충족하는 다음 7개 바를 **모두** 넘는 것을 뜻한다. 현재 충족도를 같이 표기한다.

| # | 월드클래스 바 | 현재 | 갭 |
|---|---|---|---|
| 1 | **오프라인 완전 동작** — 비행기·로밍 끊김에도 지도·일정·문서가 뜬다 | 🟡 부분 | 지도 iframe·문서 부재 (→P1) |
| 2 | **데이터 무손실** — 기기 분실·파손에도 기록이 산다 | 🔴 미달 | 단일 기기 저장 (→P1/P3) |
| 3 | **첫 화면 1.5초 이내·60fps** — 모바일 Lighthouse 90+ | 🟡 부분 | Babel 런타임 컴파일 (→P2) |
| 4 | **접근성 AA** — 대비·터치 44px·스크린리더 | 🟡 부분 | aria·focus 일부 (→P2) |
| 5 | **"지금" 한눈에** — 열면 다음 행동이 0클릭에 보인다 | 🟢 양호 | 시간 인지 강화 여지 (→P2) |
| 6 | **둘이 하나의 기록** — 커플 실시간 공유 | 🔴 미달 | 단일 기기 (→P3) |
| 7 | **디테일 일관성** — 모션·타이포·여백이 한 손에서 나온 듯 | 🟢 양호 | 토큰화 거의 완료, 잔여 정리 |

→ **1·2번이 빨강**인 게 핵심. 화면 완성도(5·7)는 이미 1군이지만, *해외에서 안 끊기고·안 잃는다*는 두 축이 월드클래스와의 진짜 거리다. 아래 P1이 정확히 그 둘을 겨냥한다.

#### 이번 세션 적용분 (2026-05-30)

| 커밋 | 내용 | 관련 bar |
|---|---|---|
| `86ee5d4` | **오프라인 지도 폴백** — `useOnlineStatus` 훅, InlineMap offline 시 좌표·복사·지도앱 딥링크, 전역 OfflineBanner | #1 ↑ |
| `2b04b1e` | **theme-color 버그 수정**(meta는 CSS var 미지원→`#1B2A4A`) · 흩어진 세리프 폰트스택 6곳→`var(--font-serif)` 통일 | #7 ↑ |
| `8b3d0e6` | tap-highlight 제거 · `:focus-visible` 골드 아웃라인 | #4 ↑, #7 ↑ |

> bar #1은 "graceful 폴백"까지 도달(타일 선캐싱 아님). #2(데이터 무손실)·#3(첫 로드 성능)·#6(공유)는 미착수 — 다음 우선순위.

### 🔴 P1 — 출발 전 필수 (해외 실패 방지 + 실데이터)

월드클래스 기준에서 *지금 없으면 여행 중 가장 크게 무너지는* 항목들.

| 항목 | 임팩트 | 왜 월드클래스인가 / 비고 |
|---|---|---|
| **오프라인 지도 대비** | 🔴 치명 | 현 `InlineMap`은 OpenStreetMap **iframe = 라이브 네트워크 필수**. 해외 로밍 끊기면 지도 안 뜸. 도시별 정적 지도 이미지/스크린샷을 IDB에 선캐싱하거나, 핵심 좌표·주소를 오프라인 텍스트로 백업. *여행 앱이 길 잃었을 때 안 열리는 게 최악.* |
| **문서 금고 (Document Vault)** | 🔴 높음 | 여권 스캔·여행자보험·항공/호텔 바우처·비자·예방접종 증명을 **PIN+IDB 오프라인** 저장. 분실·도난·입국심사 때 즉시 제시. 현재 앱에 문서 저장 기능 자체가 없음 — 최고 여행앱의 기본기. |
| **데이터 복원력 (자동 백업)** | 🔴 높음 | 현재 단일 기기 localStorage/IDB. **폰 분실/파손 = 28일 기록·사진 전손.** 최소: 출발 직전 전체 백업 강제 리마인더 + 주 1회 자동 내보내기 유도. 진짜 해법은 §P3 동기화. |
| **실기기 아이폰 QA** | 🔴 높음 | safe-area·폰트·터치 타깃·스크롤·standalone 실측. 시뮬레이터 ≠ 실제 Safari. 28일 내내 쓰는 단 하나의 기기에서의 체감이 전부. |
| **실데이터 입력** | 🔴 높음 | 호텔·항공 확정 예약번호, 레스토랑 예약 상태(미식 탭), 가계부 통화·초기 예산. *비어 있으면 멋진 껍데기.* |

### 🟡 P2 — 체감 품질 (월드클래스 디테일)

평온할 때 "잘 만들었다"를 만드는 디테일. 동결 전 여유분.

| 항목 | 임팩트 | 비고 |
|---|---|---|
| **첫 로드 성능** | 중간 | Babel standalone 런타임 컴파일 = 첫 진입 1초+ 지연(255KB). 단일파일 철학 유지하되 critical CSS 인라인·폰트 preload·로딩 스켈레톤으로 *체감* 개선. 측정: Lighthouse 모바일. |
| **접근성(a11y)** | 중간 | 대비(AA 일부 완료)·터치 타깃 44px·`aria-label`·focus-visible·prefers-reduced-motion. 월드클래스는 a11y가 기본 입장권. |
| **데일리 "지금" 포커스** | 중간 | 여행 중 홈을 열면 *오늘 다음 행동*(체크인 시간·다음 이동·예약 알림)이 1순위로. 현재 Today 카드 존재 → 시간 인지형으로 강화. |
| **일정 펼친 화면에 추천 연결** | 중간 | MapView처럼 일정 상세에도 "추가 추천 활동" 노출 → 패턴 일관성. |
| **마이크로 인터랙션 일관화** | 낮음 | 전 화면 전환·탭·로딩 모션 토큰 통일. 가로 슬라이드 잔여(번역 카테고리·날씨 셀렉터) 정리, 28일 타임라인·챕터필터는 가로 유지. |
| 비표준 font-size/radius 잔여 | 낮음 | 토큰 스케일로 수렴. 시각 무변, 코드 품질. |

### 🟢 P3 — 여행 후 / 큰 작업 (변혁적)

단순함을 일부 내주고 큰 가치를 얻는, 동결 이후/귀국 후 과제.

| 항목 | 임팩트 | 비고 |
|---|---|---|
| **실시간 동기화 (주연과 공유)** | 🔴 변혁 | Supabase/CRDT. 둘이 같은 메모·사진·가계부·체크리스트를 실시간 공유. *커플 여행앱의 본질 가치.* 단일파일+localStorage 철학과의 절충 설계 필요(~3h+). 기기 분실 복원력도 동시 해결. |
| **사진 → 여정 자동 정렬** | 중간 | 촬영 시각/위치 기반 Day 자동 매칭·지도 핀. 회고(RetrospectHero) 품질 급상승. |
| **PWA 백그라운드 푸시** | 중간 | 진짜 저녁 회고 알림·예약 D-1 알림. VAPID 키 + 서버 필요(현 SW 핸들러는 준비됨). |
| **갤러리 영상 + 회고 내보내기** | 낮음 | IDB 용량 검토. 귀국 후 "28일 한 편" 요약 PDF/슬라이드 자동 생성 → GSB 에세이 소재. |

### 손대지 말 것 ❌ (단순함 사수)
- 풀스택 프레임워크 마이그레이션(Next.js 등) — 단일파일 철학 상실
- 무거운 UI 라이브러리(MUI 등) — 인라인 제어권 상실
- `companion_app.jsx`/`build_html.py` 빌드 파이프라인 부활 — 폐기 확정

---

## 6. 운영 메모

### ⚠️ 히스토리 갈라짐 (2026-05-29 발견)

로컬과 GitHub가 공통 조상 `bda32f5` 이후 서로 다른 커밋 경로로 갈라짐.
- **GitHub(origin/main)**: `1c0d3a5` → `dbfc309` → `0788e47`(웹 통합 편집, 현재 라이브)
- **로컬(main)**: `4af3f21`(가계부) → `042bf0f`(Phase H·I)
- **코드는 동일** — `git diff origin/main 042bf0f`는 `REVIEW.md` 한 파일만 차이(index.html·sw.js 100% 일치). **유실 작업 없음.**
- **정리 방안**: 라이브 기준은 origin이므로, 로컬 REVIEW.md만 origin에 반영하면 수렴.
  Tyler 수동 푸시(사내망 차단으로 Claude는 푸시 안 함). 옵션:
  ① 로컬에서 `git push`(non-FF면 거부) → ② `git pull --rebase` 후 충돌(REVIEW.md)만 해결 → 푸시
  또는 GitHub 웹에서 REVIEW.md만 직접 갱신. 코드가 같으므로 위험 낮음.

### 배포

```
index.html / sw.js 직접 편집
  → git add . && git commit && git push origin main
  → Vercel 30초 자동 배포
```

### SW 캐시 정책

- HTML (`/`) — network-first
- 라이브러리/Pretendard — cache-first (`grandtour-v3`)
- 외부 API — passthrough (캐시 안 함)
- **버전 bump**: `sw.js` 자체 수정 시만 `CACHE` 상수 v3 → v4

### 백업 권장 주기

- 출발 직전 (사진 포함 ON)
- 여행 중 주 1회 (사진 제외 OK)
- PIN은 백업에서 의도적으로 제외 → 복원 후 재설정 필요

### PWA 설치 (iPhone)

1. Safari → https://grandtour-lilac.vercel.app/
2. 공유 → "홈 화면에 추가"
3. `GT` 아이콘 (네이비+골드) → 풀스크린 standalone

### 폰트 문제 시

- Safari 설정 → 고급 → 웹사이트 데이터 → `grandtour-lilac.vercel.app` 삭제
- `sw.js` CACHE → v4 bump
