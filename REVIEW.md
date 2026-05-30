# Grand Tour 2026 — 개발 현 상태 리뷰

> 대상: `~/Desktop/grandtour/` (단일 HTML 앱, Vercel 배포)
> 정리일: **2026-05-30** (4차 갱신) · 정리자: Claude (Opus 4.8)
> 라이브: https://grandtour-lilac.vercel.app/  · **추억 바이트·추천 worth·산물 desc 푸시 완료(`51a8e86`) · 여정 지도 비행기 애니메이션 구현(미커밋, 시각 확인 대기)**
> 저장소: https://github.com/rarehotdog/grandtour
> 출발: **2026-06-15** (D−16) · 코드 동결 권장: **2026-06-08**

---

## 0. 한눈에 보는 현 상태

| 지표 | 값 |
|---|---|
| **index.html** | 6,791줄 · ~324KB |
| **React 컴포넌트** | 56개 (App 포함, 함수형) |
| **디자인 토큰** | 100개 (atomic + semantic + scale) |
| **체크리스트** | 주제별 8카테고리 · 36항목(전 항목 한 줄 desc) |
| **일정 사진** | 검증 Unsplash 21장 + 7개 day는 챕터 그래디언트 폴백(검정박스 0) |
| **일정 사색 레이어** | 🍪 추억 바이트 — 28일 전부 `why`+`qchain`(꼬리질문 3) · 추천 `worth` 9도시 108개 (친근체·공동 톤) · OUTPUTS 19개 desc |
| **여정 지도** | 🛫 곡선 항로 draw 애니메이션 + ✈️ SMIL 순회(16s) + 현재위치 펄스(during) — `MapView` (미커밋) |
| **Service Worker** | `grandtour-v4` · push/notificationclick 핸들러 · 설치 PWA 강제 갱신 bump |
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
| **(GitHub 웹 통합)** | `0788e47` | Tyler가 GitHub 웹에서 Phase H·I+가계부를 통합 커밋. 로컬 `042bf0f`/`4af3f21`은 이 커밋으로 대체(코드 동일). 이후 선형 히스토리 기준. |
| **Offline P1** | `87840cd` | 오프라인 지도 폴백(`useOnlineStatus`·InlineMap 좌표/딥링크)·전역 OfflineBanner |
| **Polish** | `df28a1f` | theme-color 메타 버그 수정·세리프 폰트스택 `var(--font-serif)` 통일 |
| **a11y** | `89270e3` | tap-highlight 제거·`:focus-visible` 골드 아웃라인 |
| **Docs** | `f31de3e` | REVIEW 월드클래스 7-bar 기준·로드맵·세션 적용분 |
| **Sync (P3 #6)** | `c9ce0e6` | **Supabase 기기 간 동기화** — supabase-js·gtSync·Realtime 구독·SyncPanel(공유 trip code, last-write-wins) |
| **Checklist** | `96d48f7` | **예약 항목 확장+예약 딥링크**(36개 url)·영국 체험·공연 섹션(해리포터/West End/Soane) |
| **레스토랑 정밀화** | `288efc2` | 미식 트래커 6곳 예약 칩+체크리스트 r1~r8 URL을 공식 플랫폼으로(SevenRooms 4·자체 4·호텔 1)·Selene 피르고스→피라 정정·SW `v4` bump |
| **UI 정비** | `288efc2` | **일정 사진 폴백**(깨진/엉뚱 11장 정리→DayHero onError→ChapterFallback, 검정박스 0)·**체크리스트 주제별 8카테고리 재편**(D-day→주제, id 전부 보존+desc 한 줄)·**이동(moves) 7개 날짜 상세화**·**.gt-chips 좌측 잘림 수정**·한글 라벨 자간 토큰화 |
| **콘텐츠: 추억 바이트** | _(로컬 미푸시)_ | **일정 사색 레이어** — ASI 라벨 `🍪 오늘의 추억 바이트`로 변경·DAYS 28일 전부 `why`(철학/역사/경제 맥락)+`qchain`(꼬리 질문 3개) 추가, `EditableDayDetail` 접힘 토글 노출·RECOMMENDATIONS 9도시 108개 `worth`(왜 하면 좋을지) 추가. 톤=친근체+공동(주연 공유, GSB 등 개인 커리어 표현 제거) |
| **콘텐츠: 산물 디벨롭** | `51a8e86` | **OUTPUTS 19개 `desc`** 친근체+맥락으로 디벨롭(추억 바이트 톤 연결). Private 영역이라 1인칭 사색 유지, 제목·storage 키 불변. _(`f21e52f`와 함께 origin 푸시 완료)_ |
| **여정 지도 애니메이션** | _(미커밋)_ | `MapView` 직선→**곡선 항로**+draw-on(`gtMapDraw`)·**✈️ SMIL `animateMotion` 순회**·during 시 **현재위치 펄스**+"✈️ 현재 OO". 시각 확인 후 커밋 예정 |

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

- [x] 오프라인 동작 — SW network-first HTML, cache-first 라이브러리 (`grandtour-v4`)
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

### ✅ 동기화 / 예약 (2026-05-30 세션)

- [x] **Supabase 기기 간 동기화** — 공유 trip code로 체크·패킹·예약·가계부 양 기기 실시간 공유 (메모·산물·사진·PIN 제외). last-write-wins·자기 에코 가드·오프라인 graceful. SyncPanel은 홈에 공개.
- [x] **체크리스트 예약 딥링크** — 36개 예약/입장 항목에 공식 URL `예약 ↗` (영국 체험·공연 섹션 신규)
- [x] **미식 트래커 예약처 정밀화** — 6곳 공식 예약 칩 (SevenRooms: La Pergola·At.mosphere / 자체: Le Jules Verne·Septime·Selene / 호텔: Anna Stuben), Selene 피르고스→피라 위치 정정

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
> 출발 D-16 · 코드 동결 권장 **2026-06-08**. 동결 전엔 기능, 이후엔 데이터·백업만.
>
> ✅ **P0(작업 보존·배포)는 완료** — Phase H·I 커밋(`042bf0f`)·라이브 배포·폰 확인 끝.
> ✅ **운영**: 로컬↔GitHub 히스토리 갈라짐 **해소**(현재 선형, origin==local). §6 참조.

### 5.0 "월드클래스"의 정의 — 이 앱이 통과해야 할 바(bar)

> *세계 어디에 내놔도 최고 수준*이란, 동급 1군 여행앱(TripIt·Wanderlog·Google Trips류)이 충족하는 다음 7개 바를 **모두** 넘는 것을 뜻한다. 현재 충족도를 같이 표기한다.

| # | 월드클래스 바 | 현재 | 갭 |
|---|---|---|---|
| 1 | **오프라인 완전 동작** — 비행기·로밍 끊김에도 지도·일정·문서가 뜬다 | 🟡 부분 | 지도 iframe·문서 부재 (→P1) |
| 2 | **데이터 무손실** — 기기 분실·파손에도 기록이 산다 | 🟡 부분 | Supabase 동기화 시 클라우드 사본 (메모·사진 제외) |
| 3 | **첫 화면 1.5초 이내·60fps** — 모바일 Lighthouse 90+ | 🟡 부분 | Babel 런타임 컴파일 (→P2) |
| 4 | **접근성 AA** — 대비·터치 44px·스크린리더 | 🟡 부분 | aria·focus 일부 (→P2) |
| 5 | **"지금" 한눈에** — 열면 다음 행동이 0클릭에 보인다 | 🟢 양호 | 시간 인지 강화 여지 (→P2) |
| 6 | **둘이 하나의 기록** — 커플 실시간 공유 | 🟡 1차 달성 | Supabase 공유 trip code (체크·예약·가계부·패킹) |
| 7 | **디테일 일관성** — 모션·타이포·여백이 한 손에서 나온 듯 | 🟢 양호 | 토큰화 거의 완료, 잔여 정리 |

→ 출발 전 핵심이던 **#2·#6**은 Supabase 동기화로 🟡까지 올라옴. 남은 실질 격차는 **#1 오프라인 지도(폴백까지·타일 선캐싱 미착수)·#3 첫 로드 성능**. 화면 완성도(5·7)는 이미 1군이다.

#### 이번 세션 적용분 (2026-05-30)

| 커밋 | 내용 | 관련 bar |
|---|---|---|
| `87840cd` | **오프라인 지도 폴백** — `useOnlineStatus` 훅, InlineMap offline 시 좌표·복사·지도앱 딥링크, 전역 OfflineBanner | #1 ↑ |
| `df28a1f` | **theme-color 버그 수정**(meta는 CSS var 미지원→`#1B2A4A`) · 흩어진 세리프 폰트스택 6곳→`var(--font-serif)` 통일 | #7 ↑ |
| `89270e3` | tap-highlight 제거 · `:focus-visible` 골드 아웃라인 | #4 ↑, #7 ↑ |
| `c9ce0e6` | **Supabase 기기 간 동기화** — 공유 trip code로 체크·패킹·예약·가계부 실시간 공유 (메모·산물·사진 제외) | **#2 ↑, #6 ↑↑** |
| `96d48f7` | **체크리스트 예약 딥링크**(36개)·영국 체험·공연 섹션 | #5 ↑ |
| `288efc2` | **레스토랑 예약처 공식 플랫폼 정밀화**(SevenRooms 4·자체 4·호텔 1)·Selene 피라 정정·SW `v4` bump | #1 ↑, #7 ↑ |
| `288efc2` | **일정 사진 깨짐 전수 해결** — 깨진/엉뚱 11장 정리, DayHero `onError`→ChapterFallback 폴백(외부 CDN 죽어도 검정박스 0) | #1 ↑, #7 ↑ |
| `288efc2` | **체크리스트 주제별 8카테고리 재편** + 전 항목 한 줄 desc(무엇/왜) · id 전부 보존 | #5 ↑↑ |
| `288efc2` | 일정 이동(moves) 7개 날짜 교통편·구간·소요시간 상세화 · `.gt-chips` 좌측 잘림 수정 · 한글 라벨 자간 토큰화 | #5 ↑, #7 ↑ |

> bar #1은 "graceful 폴백"까지 도달(지도·**사진** 둘 다 외부 CDN 죽어도 깨지지 않음, 타일 선캐싱은 아직). **#6(커플 공유)는 Supabase로 1차 달성**, #2(무손실)도 클라우드 사본으로 부분 완화. **#5(지금 한눈에)는 체크리스트 주제화+설명으로 강화.** 남은 실질 우선순위는 **§P1 실데이터·실기기 QA → #3 첫 로드 성능**.

#### 2026-05-30 (3차) — 일정 사색 레이어 "추억 바이트"

> 사용자 요청으로 일정마다 "왜 이걸 하는지"의 맥락과 꼬리를 무는 질문을 더해 깊이를 부여. 주연과 공유하는 **공동 앱** 전제가 확정됨.

**완료**
- ASI 표시 라벨 → `🍪 오늘의 추억 바이트` (주연 피드백: "ASI 산물"이 과함). 필드명 `asi`는 코드 유지.
- DAYS 28일 전부에 `why`(이 날 산물·질문의 철학/역사/경제 맥락 2~3문장) + `qchain`(꼬리 질문 3개 배열). `EditableDayDetail`에 접힘 토글 `▸ 왜 이 바이트인가` / `▸ 꼬리를 무는 질문 (n)` (useState `showWhy`/`showChain`).
- RECOMMENDATIONS 9도시 108개 전부 `worth`(왜 하면 좋을지 한 줄). `Recommendations`에 `item.worth` → `↳ …` 렌더.
- **콘텐츠 톤 규칙 확정 (이후 전 콘텐츠 적용)**: ① 공동 앱 → GSB·다음 회사·LP 등 **Tyler 개인 커리어 표현 금지**, "둘이/우리/다음 여정" 톤. ② **친근한 해체**("~이야/~돼/~좋아"), 격식체 지양.
- 검증: DAYS·RECOMMENDATIONS 배열 Node 구문검사 통과 · `why` 28 · `qchain` 28 · `worth` 108 · 격식체 잔존 0.

**콘텐츠 후속 개선 — 우선순위**

| 우선 | 항목 | 임팩트 | 비고 |
|---|---|---|---|
| 1 | **실데이터 입력 먼저** (P1 유지) | 🔴 높음 | why·worth가 좋아도 호텔·항공 예약번호, 레스토랑 상태, 가계부 통화가 비면 껍데기. 콘텐츠보다 먼저. **Tyler 직접.** |
| 2 | ✅ OUTPUTS 19개 desc 톤 통일 → **q·mo 잔재 점검만 남음** | 중간 | **OUTPUTS desc 19개 친근체+맥락(철학/역사/경제) 완료.** Private 영역이라 1인칭 사색 유지하되 학교·브랜드 직접 언급 회피. 남은 건 메모 질문(`q`)·커플 모먼트(`mo`)의 격식·개인 표현 잔재 점검. |
| 3 | **추억 바이트 "답 적기"** | 중간 | `qchain` 꼬리 질문에 실제 답을 쓰도록 — Private 28일 메모(`notes`)와 연결. 사색을 기록으로 남겨 여행 중 실효↑. |
| 4 | **why/qchain/worth 편집 가능화** | 낮음 | 현재 읽기 전용. `EditableField` 패턴으로 둘이 직접 고쳐 쓰게. 단 단순성 trade-off 고려. |
| 5 | **추천 worth 시각 강조·정렬** | 낮음 | worth 있는 항목 강조, 챕터 테마 연관도순 정렬 등. |

> 콘텐츠 후속은 대부분 P2~P3급. **출발 전 최우선은 여전히 아래 P1**(실데이터·실기기 QA·오프라인 지도 타일·문서 금고).

#### 2026-05-30 (4차) — 여정 지도 "비행기 항로" 애니메이션

> 사용자 요청: 여정 중간 지도를 실제 비행기 이동처럼 실감나게. (이 여정은 파리→런던 유로스타만 빼면 실제로 대부분 항공편)

**완료 (미커밋 — 시각 확인 후 커밋 예정)**
- `MapView`(line ~5164) SVG 항로를 직선 점선 → **위로 볼록한 곡선 항로**로 교체. 9개 도시를 잇는 단일 `path`(quadratic Bézier, `arcD`) 생성.
- **draw-on**: 지도 진입 시 경로가 1.8초에 그려짐(`pathLength=100` + `stroke-dashoffset` keyframes `gtMapDraw`). `prefers-reduced-motion` 시 비활성.
- **✈️ 비행기 순회**: SMIL `<animateMotion>`(dur 16s, `rotate="auto"`)으로 전 항로를 따라 비행.
- **현재 위치 펄스**: `getCurrentStatus().phase==='during'`이면 오늘 도시에 SMIL 펄스 링 + 상단 "✈️ 현재 OO". 출발(6/15) 후 자동 활성.
- ⚠️ 미해결 후보: ✈️ 이모지 회전각이 곡선 구간에서 어색할 수 있음 → 피드백 시 `rotate` off 또는 점+꼬리 마커로 대체.

### 🎯 다음 개선 — 통합 우선순위 (2026-05-30 기준)

> 기준: **출발 중 5초 효용 + 실패 시 타격 크기.** 시각·콘텐츠 다듬기 < 출발 전 실패 방지. 분류: 🔴 출발 전 필수 / 🟡 체감 품질 / 🟢 여유·확장.

| 순위 | 항목 | 분류 | 비고 |
|---|---|---|---|
| 1 | **실데이터 입력** | 🔴 | 호텔·항공 예약번호, 미식 예약 상태, 가계부 통화·예산. 비면 멋진 껍데기. **Tyler 직접, 최우선.** |
| 2 | **실기기 아이폰 QA** | 🔴 | 이번 변경(추억 바이트 토글·지도 SMIL·worth·산물 desc) 실제 폰 PWA에서 1회 검증. SMIL은 iOS Safari 지원하나 실측 권장. |
| 3 | **q·mo 톤 점검** | 🟡 | 메모 질문(`q`)·커플 모먼트(`mo`)의 "회사" 등 개인 표현 → 보편/공동, 친근체 정리. **착수 예정(이번 흐름).** |
| 4 | **자간·타이포 디테일** | 🟡 | 한글 라벨 letter-spacing·줄간격 미세 조정. **착수 예정(이번 흐름).** |
| 5 | **오프라인 지도 타일 선캐싱 · 문서 금고** | 🔴 | 로밍 끊겨도 지도 그림 뜨게(IDB 선캐싱), 여권·바우처 PIN+오프라인 저장. (아래 P1 상세) |
| 6 | **지도 인터랙션 확장** | 🟢 | 핀 탭 시 그 구간으로 비행기 점프, 홈에 미니 여정 진행바, 갤러리↔지도 도시 연결. |
| 7 | **추억 바이트 답 적기 / 편집 가능화** | 🟢 | `qchain`↔Private 메모(`notes`) 연결, `why`/`worth` EditableField화(단순성 trade-off 고려). |
| 8 | **첫 로드 성능(Lighthouse)** | 🟡 | Babel 런타임 컴파일 체감 개선 — critical CSS 인라인·폰트 preload·로딩 스켈레톤. |

### 🔴 P1 — 출발 전 필수 (해외 실패 방지 + 실데이터) · D−16

월드클래스 기준에서 *지금 없으면 여행 중 가장 크게 무너지는* 항목들. **출발이 가까워 이제 P1 = 동결 전 최우선.**

| 우선 | 항목 | 임팩트 | 왜 월드클래스인가 / 비고 |
|---|---|---|---|
| 1 | **실데이터 입력** | 🔴 높음 | 호텔·항공 확정 예약번호, 레스토랑 예약 상태(미식 탭), 가계부 통화·초기 예산. *비어 있으면 멋진 껍데기.* **코드 아닌 입력 작업 — Tyler 직접, 가장 먼저.** |
| 2 | **실기기 아이폰 QA** | 🔴 높음 | safe-area·폰트·터치 타깃·스크롤·standalone 실측. 시뮬레이터 ≠ 실제 Safari. 특히 이번 세션 변경(사진 폴백·체크리스트 재편·SW v4 갱신)을 **실제 폰 PWA에서 1회 검증** 필요. |
| 3 | **오프라인 지도 타일 선캐싱** | 🔴 치명 | 폴백(좌표·딥링크)까진 됨. 다음 단계는 도시별 정적 지도 이미지를 IDB 선캐싱 → 로밍 끊겨도 *지도 그림*이 뜸. *길 잃었을 때 안 열리는 게 최악.* |
| 4 | **문서 금고 (Document Vault)** | 🔴 높음 | 여권 스캔·여행자보험·항공/호텔 바우처·비자를 **PIN+IDB 오프라인** 저장. 분실·도난·입국심사 때 즉시 제시. 현재 기능 자체가 없음 — 최고 여행앱의 기본기. |
| 5 | **데이터 복원력 (자동 백업)** | 🔴 높음 | Supabase 동기화로 부분 완화됐으나 **메모·사진은 여전히 단일 기기.** 최소: 출발 직전 전체 백업(사진 포함) 강제 리마인더. 진짜 해법은 §P3 사진 동기화. |

### 🟡 P2 — 체감 품질 (월드클래스 디테일)

평온할 때 "잘 만들었다"를 만드는 디테일. 동결 전 여유분.

| 항목 | 임팩트 | 비고 |
|---|---|---|
| **첫 로드 성능** | 중간 | Babel standalone 런타임 컴파일 = 첫 진입 1초+ 지연(324KB). 단일파일 철학 유지하되 critical CSS 인라인·폰트 preload·로딩 스켈레톤으로 *체감* 개선. 측정: Lighthouse 모바일. |
| **일정 사진 품질 업그레이드** | 중간 | 이번 세션은 "안 깨지게"가 목표 → 7개 day는 그래디언트 폴백 상태. 다음은 폴백 day(런던 하이드파크·피렌체×2·트레비·판테온·아부다비 모스크)에 **검증된 실사진 보강** 또는 도시 사진을 IDB 선캐싱(오프라인+영구). |
| **접근성(a11y)** | 중간 | 대비(AA 일부 완료)·터치 타깃 44px·`aria-label`·focus-visible·prefers-reduced-motion. 월드클래스는 a11y가 기본 입장권. |
| **데일리 "지금" 포커스** | 중간 | 여행 중 홈을 열면 *오늘 다음 행동*(체크인 시간·다음 이동·예약 알림)이 1순위로. 현재 Today 카드 존재 → 시간 인지형으로 강화. |
| **체크리스트 진행률 카테고리별 표시** | 낮음 | 주제별 재편 완료 → 다음은 카테고리별 완료율 배지·정렬(미완료 위로)로 "지금 뭘 예약해야" 가독성↑. |
| **일정 펼친 화면에 추천 연결** | 중간 | MapView처럼 일정 상세에도 "추가 추천 활동" 노출 → 패턴 일관성. |
| **마이크로 인터랙션 일관화** | 낮음 | 전 화면 전환·탭·로딩 모션 토큰 통일. 가로 슬라이드 잔여(번역 카테고리·날씨 셀렉터) 정리, 28일 타임라인·챕터필터는 가로 유지. |
| 비표준 font-size/radius·자간 잔여 | 낮음 | uppercase 영문 라벨 자간(1.5~2px)은 의도된 디자인이라 유지. 한글 라벨은 토큰화 완료. 잔여는 코드 품질용. |

### 🟢 P3 — 여행 후 / 큰 작업 (변혁적)

단순함을 일부 내주고 큰 가치를 얻는, 동결 이후/귀국 후 과제.

| 항목 | 임팩트 | 비고 |
|---|---|---|
| **사진·메모 동기화 확장** | 🔴 변혁 | 체크·예약·가계부는 Supabase 공유 완료(`c9ce0e6`). 남은 건 **사진(IDB)·메모** — 용량 큰 사진은 Supabase Storage 별도 설계 필요. 완료 시 bar #2(무손실)·#6(공유) 둘 다 🟢. |
| **사진 → 여정 자동 정렬** | 중간 | 촬영 시각/위치 기반 Day 자동 매칭·지도 핀. 회고(RetrospectHero) 품질 급상승. |
| **PWA 백그라운드 푸시** | 중간 | 진짜 저녁 회고 알림·예약 D-1 알림. VAPID 키 + 서버 필요(현 SW 핸들러는 준비됨). |
| **갤러리 영상 + 회고 내보내기** | 낮음 | IDB 용량 검토. 귀국 후 "28일 한 편" 요약 PDF/슬라이드 자동 생성 → GSB 에세이 소재. |

### 손대지 말 것 ❌ (단순함 사수)
- 풀스택 프레임워크 마이그레이션(Next.js 등) — 단일파일 철학 상실
- 무거운 UI 라이브러리(MUI 등) — 인라인 제어권 상실
- `companion_app.jsx`/`build_html.py` 빌드 파이프라인 부활 — 폐기 확정

---

## 6. 운영 메모

### ✅ 히스토리 갈라짐 — 해소됨 (2026-05-30)

2026-05-29 발견된 로컬↔GitHub 갈라짐은 **해소되어 현재 선형 히스토리**다.
- 이번 세션 변경 직전 기준 `main` == `origin/main` == `96d48f7` (working tree clean).
- 로컬 전용이던 `042bf0f`(Phase H·I)·`4af3f21`(가계부)는 **`0788e47`(GitHub 웹 통합)으로 대체** — 두 해시는 더 이상 조상이 아니나 **코드 내용은 보존**(`git merge-base --is-ancestor` 확인: 둘 다 "히스토리에 없음").
- 이후 `87840cd → df28a1f → 89270e3 → f31de3e → c9ce0e6 → 96d48f7`까지 origin 위에 선형 적층. **유실 작업 없음.**
- 푸시는 여전히 Tyler 수동(사내망 차단으로 Claude는 푸시 안 함). 이번 세션 변경(index.html·sw.js·REVIEW.md)은 워킹트리 미커밋 → 한 번에 커밋·푸시 권장.

### 배포

```
index.html / sw.js 직접 편집
  → git add . && git commit && git push origin main
  → Vercel 30초 자동 배포
```

### SW 캐시 정책

- HTML (`/`) — network-first
- 라이브러리/Pretendard — cache-first (`grandtour-v4`)
- 외부 API — passthrough (캐시 안 함)
- **버전 bump**: `sw.js` 자체 수정 시만 `CACHE` 상수 v4 → v5 (이번 세션 v3→v4 적용 완료)

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
- `sw.js` CACHE → v5 bump
