# Grand Tour 2026 — 개발 현 상태 리뷰

> 대상: `~/Desktop/grandtour/` (단일 HTML 앱, Vercel 배포)
> 정리일: **2026-06-09** (19차 갱신) · 정리자: Claude (Opus 4.8)
> 라이브: https://grandtour-lilac.vercel.app/  · 상세 차수별 기록은 `SESSION_LOG.md`(ground truth) 참조
> 저장소: https://github.com/rarehotdog/grandtour
> 출발: **2026-06-15** (D−6) · 코드 동결 권장일 경과 → 데이터·실기기 QA 위주
> 푸시 상태: `origin/main`==`2617430`(19차 docs까지 푸시 완료). 로컬 **`1ed8137`(19차 후속 빈상태 톤) 1커밋 + 본 SESSION_LOG/REVIEW 갱신 미푸시** — Tyler 수동 푸시 대기.
>
> **13~19차 요약(코드)**: 13차 마이크로인터랙션 · 14차 radius 토큰 · 15차 귀국편 직항(26박27일)·영국 ETA · 16차 실예약 전수(출발편·호텔3·항공정정2·픽업4·렌터카 베네치아→로마·Italo)·스크롤복원·일정 할일+동기화·발도르차 · 17차 귀국편 ET6973·토스카나 시간표·항공탭 날짜그룹핑·Today 할일·홈 예약배너·Day 자동스크롤 · **18차 일정 펼침 모션·화살표 회전 통일·동기화 11키 전수검증(스모크 201/11/204)**(`8df602c`, 푸시됨) · **19차 홈 UX 고도화(로딩 스켈레톤 5곳·during Today카드 최상단·Today 날짜헤더)·예약요약 완료→제거 버튼**(`94525f7`).

---

## 0. 한눈에 보는 현 상태

| 지표 | 값 |
|---|---|
| **index.html** | 7,885줄 · ~460KB (실제 지리 베이스맵 path 포함) |
| **React 컴포넌트** | 63개 top-level + 인라인 (App 포함, 함수형). 10차 신규 `DayRecs` |
| **디자인 토큰** | ~69 (atomic + semantic + scale) |
| **체크리스트** | 주제별 8카테고리 · 36항목(전 항목 한 줄 desc) · 카테고리별 진행바·🔴 urgent 배지·완료 하단 정렬 |
| **일정 사진** | 28일 전부 사진(전수 육안 검증) — 빈 7일 채움·정본화(런던 웨스트민스터·피렌체 두오모×2·**트레비 분수 실사**·**판테온 정면**·아부다비 모스크=Wikimedia)·**7/12 인천→서울 일출(큰 해, 새로운 시작)**. onError→ChapterFallback 유지 |
| **도시 히어로 사진** | `CITY_HERO` 9도시 — 육안 검증 Unsplash(피렌체 두오모 포함) · 실패 시 챕터 파스텔 폴백 |
| **일정 사색 레이어** | 🍪 추억 바이트 — 28일 전부 `why`+`qchain`(꼬리질문 3) · 추천 `worth` 9도시 108개 (친근체·공동 톤) · OUTPUTS 19개 desc |
| **일정 추천** | **`DAY_RECS` — 24일 각각 숙소·이동·시간대 기준 day별 맞춤 추천 3~4곳**(이동/기내일 생략, `DayRecs` 컴포넌트). 홈 today·지도 도시 추천은 도시 단위 `Recommendations` 유지 |
| **로컬 맛집** | `LOCAL_EATS` 9도시×4~5곳 현지 명물(미식 탭 상단, 구글맵 링크) |
| **여정 지도** | 🗺️ 실제 지리 베이스맵(Natural Earth 110m 해안선·국가경계, equirect 투영 인라인 SVG) + 핀치/휠/드래그/버튼 줌·팬(RAF 트윈) + 핀·도시 탭→그 도시 확대 + 도시 몰입 히어로 — `MapView`/`CityMomentHero` (커밋·배포 완료) |
| **Service Worker** | `grandtour-v5` · push/notificationclick 핸들러 · 설치 PWA 강제 갱신 bump |
| **PWA** | manifest 정상 · 192/512 SVG 아이콘 · 단축키 2개 · 입력 줌 방지(`maximum-scale=1`) |
| **저장소** | localStorage + IndexedDB (사진 · **오프라인 지도 타일 `maptiles` · 문서 금고 `documents`**, VER 3) + spotify_urls |
| **폰트 · 타이포** | Cormorant Garamond (Latin serif) + Pretendard Variable (Hangul/sans) · **타입 스케일 본문 16px(전체 +1~2px), 한글 라벨 자간 토큰화 완료** · 11차: App 루트 `fontFamily` 하드코딩(`-apple-system`) → `var(--font-sans)` 통일(한글 본문이 의도대로 Pretendard로 렌더) |
| **도시색 없는 챕터** | 서막('p')·귀국('ret')은 무채색(`#F5F5F4`) → 28일 일정 카드 왼쪽 띠를 **금빛 glossy 테두리**(`.gt-gold-edge`, 다중스톱 금 그라데이션·하이라이트·glow·sheen 4.5s, reduced-motion 정지). 9개 도시 카드는 도시색 `inset` 띠 유지 |
| **오프라인 지도** | 📥 9도시 OSM 타일 2×2 합성 IDB 선캐싱(수동 다운로드) · InlineMap 오프라인 시 저장 타일 표시 |
| **문서 금고** | 🔐 여권·비자·보험·항공/호텔 바우처·기타 — IDB `documents` 오프라인 저장(기록 탭, PIN 없이 기기 잠금 안내) |
| **탭 구조(10차)** | 체크 탭 1단계 통합(체크리스트/🤵태현/👰주연/👫공용) · 패킹 flex-wrap 잘림 해소 · 28일 일정 챕터 필터 **상단 sticky 고정** |
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
| **콘텐츠: 추억 바이트** | `f21e52f` | **일정 사색 레이어** — ASI 라벨 `🍪 오늘의 추억 바이트`로 변경·DAYS 28일 전부 `why`(철학/역사/경제 맥락)+`qchain`(꼬리 질문 3개) 추가, `EditableDayDetail` 접힘 토글 노출·RECOMMENDATIONS 9도시 108개 `worth`(왜 하면 좋을지) 추가. 톤=친근체+공동(주연 공유, GSB 등 개인 커리어 표현 제거) _(origin 푸시 완료)_ |
| **콘텐츠: 산물 디벨롭** | `51a8e86` | **OUTPUTS 19개 `desc`** 친근체+맥락으로 디벨롭(추억 바이트 톤 연결). Private 영역이라 1인칭 사색 유지, 제목·storage 키 불변. _(`f21e52f`와 함께 origin 푸시 완료)_ |
| **인터랙티브 여정 지도** | `4d5eeda` | **실제 지리 베이스맵**(Natural Earth 110m 해안선·국가경계를 `project()`와 동일 equirect 투영으로 인라인 SVG 정적 임베드, 의존성 0)·**비행기 SMIL 순회 제거** → 핀치/휠/드래그/버튼 **줌·팬**(RAF 트윈, 1~8배)·핀/도시 탭→**그 도시로 확대**(핀·라벨은 transform 밖 렌더로 상수 크기)·**`CityMomentHero`** 도시별 검증 사진 배경+연한 스크림(**피렌체 두오모 포함 9도시 육안 검증**, 실패 시 챕터 파스텔 폴백)·지도 가로폭 본문 정렬·여정 자간/간격 **디자인 토큰 정렬**(`--track-*`/`--space-*`)·전역 `-0.02em`→`var(--track-tight)`. **푸시·배포·라이브 마커 검증 완료** |
| **Publish→Fork 씨앗** | `9b1b821` | **"여정의 GitHub" 1차** — `journeyShare` 헬퍼(`gt_state` 재사용: trip_id=publish코드, k='journey'\|'counters')·**Publish**(일정·비용·관점만, allowlist 3키로 사적 데이터 구조적 차단)·**Fork**(`?j=` 자동감지 + 코드 입력 → `ForkPreview` 읽기전용 → "내 앱으로 가져오기" 병합/덮어쓰기)·`JourneyShareCard`(기록 탭)·view/fork 카운터(vanity). esbuild 파싱 0·프라이버시 불변식 단위 증명 완료 |
| **공동작업 실시간** | `9e4a6c1` | **친구 초대 → 체크리스트·메모 실시간 공유 + "누가 언제 수정"** — `notes`+`check_meta`+`notes_meta`를 `SYNC_KEYS`/realtime map에 합류(메모는 연결 시에만 공유, 솔로는 로컬)·표시 이름 `actor_name`(기기 로컬)·`toggleCheck`/`saveNote`가 `{by,at}` 도장·`<SwipeRow>`(포인터 드래그·pan-y·스냅+햅틱)로 항목 옆으로 밀면 `👤 이름 · n분 전`·`?trip=` 초대 링크 자동참여·SyncPanel "🤝 공동작업"(이름·초대링크). 검증: esbuild 0·`getRelativeTime` 경계값·**Supabase REST 왕복 스모크(notes/check_meta upsert·read·delete 201/200/204)** |
| **일정 사진 정본화** | `003a4b2`·`4968337`·`bfc4c2b`·`ed428cd` | **28일 전수 사진**(빈 7일 채움·검정박스 0) — 전 후보 다운로드 후 **육안 검증**·오인 컷 제거. 트레비/판테온 실사·아부다비 모스크=Wikimedia·**7/12 서울 일출(큰 해)**. URL 200·`onError` 폴백 유지 |
| **(9차) 질문 톤 통일** | `d96e89f` | 28개 `q` 공동·친근체 통일(8차 후속) |
| **(9차) 타이포·일정 맵링크** | `9b4a1e1` | **타입 스케일 +1px**(본문 14→16px, 토큰 10종)·한글 라벨 자간 px→`var(--track-label)` 8곳 토큰화·추천 활동 본문 확대·**일정 상세 도시·숙소·활동 행별 📍 구글맵 링크**(`EditRow` `mapQuery` prop) |
| **(9차) 오프라인 지도·문서 금고·백업** | `cef1613` | **오프라인 지도 타일 선캐싱**(OSM 타일 2×2 canvas 합성 → IDB `maptiles`, `crossOrigin` tainted 회피, InlineMap 오프라인 시 저장 타일, 지도 탭 수동 다운로드+OSM attribution)·**문서 금고**(여권·비자·보험·바우처 IDB `documents`, 기록 탭 🔐 문서 SubTab, PIN 없이 기기 잠금 안내)·**출발 D−7 사진 포함 전체 백업 강조 배너**(`lastFullBackupAt` 추적)·idb VER 1→3(photos 보존+maptiles·documents)·`compressImage` 해상도 파라미터화 |
| **(9차) 성능·접근성·체크리스트** | `6eb9f3d` | `cdnjs.cloudflare.com` preconnect(React·ReactDOM·Babel 핸드셰이크)·`prefers-reduced-motion`에 `animation-iteration-count`·`scroll-behavior` 보강·**체크리스트 카테고리별 진행바·🔴 urgent 미완료 배지·완료 자동 하단 정렬**(stable sort) |
| **(9차) 일정↔추천·데일리 포커스** | `f0e0548` | 일정 펼친 화면(`EditableDayDetail`)에 공용 `Recommendations` 노출(없는 챕터는 자동 null)·**여행 중 Today 카드 강화**(🚐 이동 추가·강도 배지 `INT_LABEL`·🌟 식사 예약 확인 강조) |
| **(9차) REVIEW 갱신** | `f924719` | REVIEW 9차 문서 갱신(오프라인 지도·문서 금고·백업·성능·체크리스트 반영) |
| **(10차) 홈 디테일** | `1f672c2` | **여행 중 오늘 카드 동선 타임라인**(이동→활동→식사, 현재 시각 '지금쯤' 강조)·**관점 기록 탭에 홈과 동일 티어별 진행 요약**·백업/복원 안내 `keep-all`+폰트 확대·NextFlight 서막 버그(coords 없는 챕터 제외)·**도시색**(아테네 무채→연보라, ChapterProgress·28일 카드 왼쪽 도시색 띠)·입력 줌 방지(`maximum-scale=1`·`user-scalable=no`) |
| **(10차) 디자인 버그 점검** | `80f5438` | **챕터 카드 테두리 소실 버그**(인라인 border shorthand+longhand 혼용 리렌더 → `box-shadow inset`로 전환)·일정 상세 추천 중복 제거·**`OUTPUTS_TIERS` 상수 추출**(OutputsInner·OutputsProgress 공용 DRY) |
| **(10차) 챕터→일정·탭 통합·로컬 맛집** | `2519b55` | **홈 챕터 진행 Day 버튼 → 일정 탭 해당 챕터 필터+그 날 펼침**(`daysFocus` 상태 체인)·**체크 화면 탭 1단계 통합**(체크리스트/태현/주연/공용)·**`LOCAL_EATS` 9도시×4~5곳 로컬 맛집 둘러보기**(미식 탭, 구글맵 링크) |
| **(10차) 패킹·자간·SW v5** | `8854929` | 패킹 탭 가로스크롤→`flex-wrap`(주연·공용 잘림 해소)·패킹 아이콘 🤵태현/👰주연/👫공용(신혼 컨셉)·NoteEditor 한글 자간 토큰화·**SW v4→v5 강제 갱신** |
| **(10차) 일정 즉시 펼침·미식 순서** | `b31e342`·`047f762` | 챕터 진행→일정 클릭 시 **그 날 즉시 펼침**(useState 초기값→ 최종 **모듈변수 `pendingDayFocus`** 동기 설정, 1회 소비)·미식 탭 로컬 맛집 위/미슐랭 예약 아래·추천 설명·worth·tip 카드 가로폭 전체+`word-break:keep-all`(어절 단위) |
| **(10차) 일정 추천 day별 동선 맞춤** | `c1df0e5` | **`DAY_RECS`** — 24일 각각 숙소·이동·활동·시간대 기준 추천 3~4곳(이동/기내일 생략)·**`DayRecs` 컴포넌트**(일정 상세에서 도시 단위→day별 교체)·같은 도시라도 날마다 다른 동선·구글맵 링크. 홈 today·지도 도시 추천은 도시 단위 유지 |
| **(10차) 챕터 필터 sticky** | `495a44f` | 28일 일정 챕터 필터(전체/서막/파리…)를 **글래스 헤더 바로 아래 sticky 고정**(헤더 높이 JS 측정·resize 대응)·칩 줄 전체폭 배경+패딩·미세 그림자 |
| **(11차) 금빛 테두리·규격 토큰화** | `2129a31` | **도시색 없는 챕터(서막·귀국) 금빛 glossy 테두리**(`.gt-gold-edge`, 28일 일정 카드 Day1·27·28)·**디자인 규격 안전 정리(시각 무변화)**: 인라인 `#fff` 7곳→`var(--color-atomic-white)`(canvas `#ffffff` 제외)·`fontFamily` 하드코딩 2곳→`var(--font-sans)`. esbuild 파싱 0 오류 |
| **(12차) 공동작업·defer·골드·포커스** | `a70bbbd`~`3d40207` | swipe 발견성+메모 LWW 충돌배너·head 스크립트 defer·골드 글로시 4곳 확장·데일리 '지금 포커스'·출발 준비 요약 카드 |
| **(13차) 마이크로 인터랙션** | `a4979c2` | 보조 셀렉터 5곳 줄바꿈(`.gt-wrap`)·칩 전환 모션 단일 토큰(`.gt-chip`) |
| **(14차) radius 토큰** | `a4979c2` | radius numeric 단일 스케일+t-shirt alias·인라인 magic-number 41곳 토큰화(시각 0) |
| **(15차) 귀국편 직항·26박27일** | `ee92cf4` | 귀국편 AUH 직항(7/10 21:10→7/11 10:50)·day28 삭제·"28일"→"27일" 전수·영국 ETA·출발편 c9 |
| **(16차) 실예약·UX·동기화·드라이브** | `64af8c4` | 출발편 CX411/CX261 확정·호텔3·항공정정2(7/3 NAP직항·7/8 AUH)·픽업4·렌터카 Enterprise 베네치아→로마(Frecciarossa 삭제)·6/30 Italo·**탭 스크롤 복원**·**일정 할일 day_items+Supabase 동기화**·**6/27 발도르차 드라이브**·ZTL/주차·예약요약 2분할정렬 |
| **(17차) 귀국편 확정·토스카나·디자인/UX** | `c8fff38` | 귀국편 ET6973(Asiana 코드셰어·Etihad)·토스카나 시간표·**항공 도착시간 보강+픽업 정합**·**항공탭 날짜 그룹핑**·**Today 카드 일정 할일**·**홈 🔴예약 배너**·**Day 자동 스크롤**·홈 계층 재정리(준비현황↑)·모션 토큰화(all 0.2s 제거)·`Day n/28→/27` 버그·그림자 통일 회피(회귀방지) |
| **(18차) 펼침 모션·화살표 통일·동기화 검증** | `8df602c` | 일정 카드 `.gt-expand` 펼침 전환·토글 화살표 `›` 회전 통일(▾/▸ 제거)·동기화 11키 전수 점검+Supabase 왕복 스모크(201/11/204, 코드변경0). **푸시 완료** |
| **(19차) 홈 UX 고도화·예약요약 완료** | `94525f7` | 로딩 텍스트 5곳→`gt-skel` 스켈레톤·**during 홈 Today 카드 최상단**·Today 날짜 헤더·**예약 요약 완료→제거 버튼**(toBook·toConfirm 체크). plan mode 승인 후 실행 |
| **(19차 후속) 빈 상태 톤** | `1ed8137` | 빈 상태 전수 점검(대부분 양호) → 문서 금고 "아직 없음"만 행동 유도형으로 통일 |

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
🍽️ 미식(10차): 로컬 맛집 둘러보기(`LOCAL_EATS` 9도시×4~5곳) 위 / 미슐랭 예약 트래커 아래
```

> 체크 탭(10차): 2단계 → **1단계 통합** — 체크리스트 / 🤵 태현 / 👰 주연 / 👫 공용 한 줄.
> 일정 탭(10차): 챕터 필터 **상단 sticky** · 홈 챕터 진행의 Day 버튼 → 그 챕터 필터+해당 날 즉시 펼침.

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

#### 2026-05-30 (4차) — 여정 지도 "비행기 항로" 애니메이션 _(→ 5차에서 대체됨)_

> 사용자 요청: 여정 중간 지도를 실제 비행기 이동처럼 실감나게. (이 여정은 파리→런던 유로스타만 빼면 실제로 대부분 항공편)

**완료했으나 5차에서 제거/대체** — 곡선 항로 draw-on(`gtMapDraw`)은 정적 점선으로 유지, **✈️ SMIL 순회는 제거**(사용자 피드백: "비행기 움직이는 건 굳이"), 펄스는 유지. 아래 5차의 인터랙티브 지도로 대체됨.

#### 2026-05-31 (5차) — 인터랙티브 여정 지도 + 도시 몰입 히어로 (`4d5eeda`, 푸시·배포 완료)

> 사용자 요청 흐름: ① 지도 배경이 가짜 덩어리라 밋밋 → 실제 지도 ② 비행기 이동 빼고 **확대 가능 + 도시 누르면 그 순간으로** ③ 대시보드 색 연하게·배경을 그 나라 사진으로·지도 약간 축소 ④ 사진 검증(피렌체 포함)·지도 가로폭 정렬·자간/간격 점검.

**완료**
- **실제 지리 베이스맵**: Natural Earth 110m 해안선(`MAP_LAND_D`)·국가경계(`MAP_BORDER_D`)를 `project()`와 동일 equirect 투영으로 변환해 인라인 SVG 상수로 정적 임베드. 런타임 의존성 0·오프라인 유지. 핀·항로가 실제 지형 위에 정확히 안착.
- **줌·팬**: 핀치(2지점, 중점 고정)·휠(커서 고정)·드래그·`+/−/⤢` 버튼. `requestAnimationFrame` 트윈(480ms ease-out), 스케일 1~8배 클램프. `touchAction:none`으로 페이지 스크롤 충돌 차단.
- **도시 진입**: 핀 번호/챕터 탭 탭 → 그 도시로 3.6배 확대. 핀·라벨은 `<g transform>` **밖에서 화면좌표로 렌더**해 확대해도 상수 크기, 해안선/경계/항로는 `non-scaling-stroke`.
- **`CityMomentHero`**: 도시별 대표 사진 배경(`CITY_HERO`) + 가벼운 중성 스크림(연한 톤) + 챕터 색/철학 태그. 사진 실패 시 `onError`→챕터 파스텔 폴백. **9도시 전부 이미지 다운로드 후 육안 검증**(피렌체 두오모 `1476362174823` 추가, 돌로미티는 일반 알프스 계곡 유지).
- **정리**: 지도 가로폭 본문 정렬 · 여정 섹션 자간/간격을 DS 토큰(`--track-eyebrow`/`--track-tight`/`--space-*`)으로 통일 · 전역 인라인 `-0.02em`→`var(--track-tight)`.
- **검증**: esbuild로 인라인 JSX 전체 파싱(구문 오류 0) · 9사진 HTTP 200+피사체 육안 확인 · 푸시 후 **라이브에서 새 마커(`CityMomentHero`/`MAP_LAND_D`/피렌체 URL/`onTouchStart`) 검증, `animateMotion` 0**.

**후속(선택)**
- 돌로미티 히어로를 실제 돌로미티(세체다/트레치메) 사진으로 교체 — 사용자가 사진 지정 시 검증 후 반영.
- 앱 전역 자간/간격 전수 재정렬은 미착수(시각 회귀 위험·헤드리스 검증 제약). 화면 단위로 요청 시 정밀 진행.
- 지도 인터랙션 확장(핀 탭→갤러리 연결, 홈 미니 진행바)은 P3급.

#### 2026-05-31 (6차) — "여정의 GitHub" 씨앗: Publish → Fork

> 사용자 비전: 기록/관점 탭을 "여정의 GitHub"로 진화 — 과정·노트를 공개하고 남이 그대로 포크해 편집, 더 좋게 만들면 원작자가 당겨옴. 공유할수록 내가 업그레이드. (전체는 별도 제품 규모 → 지금은 비전 문서 + 씨앗 1개.)

**완료 (미푸시→이번 커밋)**
- `journeyShare` 헬퍼: 기존 `gt_state` 재사용(새 테이블/마이그레이션 없음). `buildSnapshot`(allowlist `edits{day,hotel,flight}`·`expenses`·`outputs.content`만 — `notes`/`mo`/`pin`/`done` 구조적 차단)·`publish`(journey+counters 2행)·`shareUrl(?j=)`·`fetch`·`incView/incFork`(vanity, 위조가능 주석).
- `?j=` 자동감지(App) + 코드 입력(`JourneyShareCard`, 기록 탭) → `ForkPreview` 읽기전용(관점·비용·일정) → "⬇️ 내 앱으로 가져오기"(병합/덮어쓰기 confirm, `importData` 패턴, expenses id 재생성 + `gt:remote` 갱신, `forked_from` 계보).
- 검증: esbuild 인라인 JSX 파싱 0 오류·프래그먼트 0·프라이버시 불변식 node 단위 증명(적대 입력에도 사적 키 전부 탈락).
- 결정: 공개=일정·비용·관점만. 비목표=auth·upstream PR·커밋 타임라인·디스커버리.

#### 2026-05-31 (7차) — 공동작업 실시간 공유 + "누가 언제 수정"(swipe)

> 사용자 요청: 친구를 초대하면 체크리스트·메모가 실시간 공유, 항목을 옆으로 밀면 누가 언제 고쳤는지.

**완료 (미푸시→이번 커밋)** — 결정: ① 참여 시 표시 이름 입력 ② 메모 LWW+누가·언제 ③ 마지막 수정자만.
- 메모 실시간: `SYNC_KEYS`에 `notes` 합류(연결 시에만 공유, 솔로는 기기 로컬 유지) + realtime map `notes:setNotes`.
- 신원: `actor_name`(기기 로컬, 동기화 제외) + `actorName()`. SyncPanel에서 편집, 연결/초대 시 prompt.
- 메타: `check_meta`/`notes_meta` = `{id:{by,at}}` 동기화 키. `toggleCheck`/`saveNote`가 도장.
- `<SwipeRow>`: 포인터 드래그(터치+마우스)·`touchAction:pan-y`로 세로 스크롤 보존·가로 우세 판정·임계 절반 스냅+햅틱. 뒤 패널 `👤 이름 · n분 전`(없으면 "수정 기록 없음"). 체크 항목·메모 카드에 적용. `getRelativeTime()` 신규.
- 초대: `?trip=code` 자동감지(참여 confirm→이름→연결). SyncPanel "🤝 공동작업 (친구 초대)" + 🔗 초대 링크/코드 복사. 공유 범위 안내 갱신(메모 포함).
- 한계(문서화): 전체 키 LWW(동시 같은 날 메모/다른 항목 토글 시 나중 게 이김, realtime이 창 좁힘) · 관점·사진 미동기화 유지.
- 검증: esbuild JSX 0오류·프래그먼트 0·`getRelativeTime` 경계값·**Supabase REST 왕복 스모크**(notes/check_meta 201·read 200·delete 204). 실시간 UI 두 탭 확인은 사용자 몫(헤드리스 금지).

#### 2026-05-31 (8차) — 일정 사진 전수 정본화

> 사용자 요청: 멋진 사진으로 업데이트·빈 날 채우기·7/12은 서울 상징(남산/경복궁)으로.

**완료 (커밋 `003a4b2`·`4968337`·`bfc4c2b`·`ed428cd`·이번 커밋, 전부 push)**
- 빈 7일 채움 → 28일 전부 사진 보유(검정/빈 박스 0). 모든 후보를 **실제 다운로드해 육안 검증** 후 배정(피사 사탑·LA·밴쿠버·요트 등 오인 컷 전부 걸러냄).
- 정본화: 13 트레비 분수 정면·15 판테온 정면(로톤다 광장)·11·12 피렌체 두오모·6 런던 웨스트민스터.
- 아부다비 모스크(24·26): Unsplash에 정본 없음 → **Wikimedia Commons API**로 셰이크 자이드 모스크 확보(thumb URL).
- **7/12(day28, 귀국=새 시작)**: 인천→여러 후보(남산 일몰·경복궁 경회루·북촌 한옥 아침) 검토 끝에 **서울 일출(큰 해가 떠오르는 정통 일출)** 확정. "무엇을 할지 정하러 떠난다"는 철학과 맞물려 마지막 카드를 일출로 닫음.
- `onError→ChapterFallback` 폴백 유지(외부 CDN 죽어도 그래디언트). URL 전수 200·esbuild 0오류.
- 혼합 소스(Unsplash + Wikimedia upload.wikimedia.org). SW는 동일 출처/지정 CDN만 캐시 → 외부 img는 passthrough+폴백.

#### 2026-06-02~03 (10차) — 홈 디테일·챕터↔일정 연결·day별 추천·탭 통합

> 사용자 요청 흐름: 홈을 더 살아있게(동선 타임라인·도시색·관점 진행 싱크) → 챕터에서 그 날 일정으로 바로 점프 → 탭 단계 줄이기(체크·패킹 통합) → 미식에 현지 로컬 맛집 → 일정 추천을 "같은 도시라도 그 날 동선"에 맞게 → 챕터 필터를 스크롤해도 고정.

**완료 (커밋 `1f672c2`~`495a44f`, 전부 push·배포)**
- **홈(`1f672c2`)**: 여행 중 오늘 카드에 동선 타임라인(이동→활동→식사)+현재 시각 '지금쯤' 강조. 관점 기록 탭에 홈과 동일한 티어별 진행 요약(싱크). 28일 카드·ChapterProgress 왼쪽 **도시색 띠**, 아테네 무채색→연보라. NextFlight 서막 버그(coords 없는 챕터 제외)로 깨진 맵링크/배지 제거. 입력 시 줌 방지(`maximum-scale=1`).
- **디자인 버그(`80f5438`)**: 인라인 `border` shorthand+longhand 혼용 리렌더로 챕터 카드 테두리가 사라지던 버그 → `box-shadow inset`로 전환. 일정 상세 추천 중복 제거. 산물 티어 `OUTPUTS_TIERS` 상수 추출(공용 DRY).
- **연결·통합(`2519b55`)**: 홈 챕터 진행 Day 버튼 → 일정 탭 해당 챕터 필터+그 날 펼침(`daysFocus` 상태 체인). 체크 화면 탭 2단계→**1단계 통합**. 미식 탭 `LOCAL_EATS`(9도시×4~5곳 현지 명물+구글맵).
- **패킹·SW(`8854929`)**: 패킹 탭 가로스크롤→`flex-wrap`(태현만 보이던 잘림 해소), 🤵/👰/👫 신혼 아이콘. 한글 자간 토큰화. **SW v5 강제 갱신**.
- **즉시 펼침·미식 순서(`b31e342`·`047f762`)**: 챕터→일정 클릭 시 그 날 즉시 펼침을 React 상태 타이밍 대신 **모듈변수 `pendingDayFocus`** 동기 설정(1회 소비)으로 확실화. 미식 로컬 위/미슐랭 아래. 추천 설명 `word-break:keep-all`(어절 단위)·가로폭 전체.
- **day별 추천(`c1df0e5`)**: **`DAY_RECS`** — 24일 각각 숙소·이동·시간대 기준 추천 3~4곳(이동/기내일 생략), `DayRecs` 컴포넌트로 일정 상세에서 도시 단위→day별 교체. 홈 today·지도 도시 추천은 도시 단위 유지.
- **챕터 필터 sticky(`495a44f`)**: 28일 일정 챕터 필터를 글래스 헤더 바로 아래 sticky 고정(헤더 높이 JS 측정·resize 대응)·칩 줄 전체폭 배경+그림자.

**검증/한계**: index.html 7,885줄·SW v5·`main`==`origin/main`==`495a44f`(working tree clean). 실시간·실기기 시각 검증은 사용자 몫(헤드리스 금지 규칙 유지) — P1 #2 실기기 QA에 10차 변경(동선 타임라인·도시색·sticky 필터·체크/패킹 통합·로컬 맛집·day별 추천) 합류.

#### 2026-06-03 (11차) — 금빛 glossy 테두리 + 디자인 규격 안전 토큰화

> 사용자 요청: ① 도시색이 없는 부분을 glossy·shiny한 황금색 테두리로 ② 전체 디자인 규격이 다 맞는지 검토.

**완료 (커밋 `2129a31`)**
- **금빛 glossy 테두리**: 색이 무채색(`#F5F5F4`)인 챕터는 서막('p')·귀국('ret') 둘뿐 → 이들이 그려지는 곳은 **28일 일정 카드(Day1·27·28)**. ChapterProgress는 `chapters = CHAPTERS.filter(c => !['p','ret'])`로 애초에 제외라 대상 아님. `.gt-gold-edge` CSS 클래스(다중스톱 금 그라데이션 `#FBEFC2→#C9A961→#9C7C42→#FBEFC2`·안쪽 화이트 하이라이트·골드 glow·`gtGoldSheen` 4.5s, `prefers-reduced-motion` 정지). 무채색 판정 `ch.color === '#F5F5F4'` 시 회색 `inset` 띠를 `none`으로 끄고 클래스 부여.
- **디자인 규격 검토(Explore 에이전트) + 사실 확인**: 토큰 시스템 대체로 일관. 에이전트 리포트의 과대·오류는 grep으로 교정(예: `borderRadius:50%` 8곳은 원형 아이콘이라 `--radius-pill`이 아닌 50%가 정석 → 유지, fontFamily 하드코딩은 4곳이 아니라 2곳).
- **안전 정리(시각 무변화 한정)**: 인라인 `#fff` 7곳 → `var(--color-atomic-white)`(둘 다 `#FFFFFF`). canvas `ctx.strokeStyle='#ffffff'`(`1115`)는 CSS 변수 미적용이라 제외. `fontFamily` 하드코딩 2곳(ErrorBoundary `1380`·App 루트 `1817`) → `var(--font-sans)`.
  - **주의(무변화 아님이라 사용자 승인 후 적용)**: `--color-text-inverse`는 순백이 아니라 `--color-atomic-cream-50`(크림) → 흰색 대체엔 `--color-atomic-white`를 써야 함. `body`는 이미 `var(--font-sans)`(Pretendard)였으나 App 루트가 `-apple-system`으로 덮어써 **한글 본문이 사실상 애플고딕으로 렌더되던 불일치**를 정상화 → 한글이 Pretendard로 통일(미세 시각 변화 동반, 사용자 승인됨).
- **보류**: 한글 라벨 자간 px(`0.2px`) → `--track-label`(0.08em)은 자간이 눈에 띄게 벌어져 무변화가 아니므로 미적용.
- ~~`borderRadius:8px` 24곳 구조적 불일치~~ ✅ **14차 해소** — 스냅(8→6/10)이 아닌 **exact-value 토큰 추가**로 시각 변화 0. radius 스케일을 numeric(px=이름) 단일 진실원천으로 재정의, 기존 t-shirt 이름(`xs/sm/md/lg/xl/2xl`)은 numeric을 가리키는 alias로 유지 → 기존 `var()` 143곳 무수정, 인라인 magic-number radius 0(50% 원형만 잔존).

**검증**: esbuild 인라인 JSX 파싱 0 오류 · `var(--color-atomic-white)` 18곳·`var(--font-sans)` 22곳·잔여 인라인 `#fff`=canvas 1곳뿐·apple-system 하드코딩 0. 시각 확인(gold edge 광택·한글 Pretendard 전환)은 Tyler 폰/브라우저 실측 몫(헤드리스 금지).

### 🎯 다음 개선 — 통합 우선순위 (2026-06-05 기준 · 14차)

> 기준: **출발 중 5초 효용 + 실패 시 타격 크기.** 시각·콘텐츠 다듬기 < 출발 전 실패 방지. 분류: 🔴 출발 전 필수 / 🟡 체감 품질 / 🟢 여유·확장(동결 후).
> **9차 누적 완료(코드)**: 오프라인 지도 타일 선캐싱 · 문서 금고 · 출발 전 전체 백업 강조 · 첫 로드 preconnect · 접근성 보강 · 체크리스트 카테고리 완료율 · 일정↔추천 연결 · 데일리 "지금" 포커스 · 본문 16px·자간 토큰화·일정 맵링크.
> **10차 누적 완료(코드)**: 홈 동선 타임라인·관점 진행 싱크·도시색 띠 · 챕터→일정 클릭 점프 · day별 동선 맞춤 추천(`DAY_RECS`) · 로컬 맛집 둘러보기(`LOCAL_EATS`) · 체크/패킹 탭 통합 · 챕터 필터 sticky · 테두리 버그·추천 중복·입력 줌 수정 · SW v5. **→ 코드로 할 수 있는 🔴 출발 전 항목은 일단락. 남은 🔴는 Tyler 직접 작업(실데이터 입력·실기기 QA).**
> **12차 누적 완료(코드)**: 공동작업 디테일(swipe 1회 nudge/상시 chevron · 메모 LWW 충돌 인디케이터) · 첫 로드 스크립트 defer · 골드 글로시 4곳 확장(Lifetime 카드·헤더 라인·하단네비·확정 배지) · 데일리 '지금 포커스' 배너 · 출발 준비 요약 카드. **→ P2 #6 완료, 첫 로드 성능 체감개선 진전.**
> **13차 누적 완료(코드)**: 마이크로 인터랙션 일관화 — 보조 셀렉터 5곳(번역 카테고리·가계부 카테고리·음악 챕터·복장 필터·날씨 도시) 가로 스크롤→줄바꿈(`.gt-wrap`, 발견성↑) · 칩/탭 전환 모션 단일 토큰(`.gt-chip` 0.15s) 10개 버튼 통일·인라인 transition 0개. 28일 타임라인·챕터필터는 가로 유지. **→ P2 마이크로 인터랙션 완료.**
> **14차 누적 완료(코드)**: 비표준 radius 토큰화 — radius 스케일을 numeric(px=이름) 단일 진실원천으로 재정의, t-shirt 이름은 alias로 유지(기존 `var()` 143곳 무수정). 인라인 magic-number radius 41곳(8px×24·12px×7·20px×5·3px×3·16px×1·2px×1)→토큰, 50% 원형만 잔존. **시각 변화 0**(스냅 아닌 exact-value). **→ P2 radius 항목 완료. 자간은 잔여=의도된 영문 uppercase 트래킹뿐(px→em은 회귀라 유지). 남은 코드 작업 사실상 없음 — 나머지는 🔴 Tyler 직접 또는 🟢 동결 후.**

| 순위 | 항목 | 분류 | 비고 |
|---|---|---|---|
| 1 | **실데이터 입력** | 🔴 | 호텔·항공 확정 예약번호, 미식 예약 상태, 가계부 통화·초기 예산. 비면 멋진 껍데기. **코드 아닌 입력 — Tyler 직접, 최우선.** (체크리스트 카테고리 완료율로 "뭐가 덜 됐나" 가시화됨) |
| 2 | **실기기 아이폰 QA(누적분)** | 🔴 | 9차 전부를 실제 폰 PWA에서: **오프라인 지도 다운로드→비행기 모드 표시**·**문서 금고 업로드/라이트박스**·체크리스트 진행바·일정 맵링크·본문 16px. 헤드리스로 못 본 부분(타일 fetch·IDB·오프라인) — 실측 필수. |
| ~~3~~ | ~~오프라인 지도 타일 선캐싱 + 문서 금고~~ ✅ | — | **완료(`cef1613`)** — OSM 타일 2×2 합성 IDB 선캐싱 + InlineMap 오프라인 표시, 문서 금고(IDB `documents`). PIN은 사용자 선택으로 미적용(기기 잠금 안내). |
| ~~4~~ | ~~데이터 복원력(출발 직전 백업)~~ ✅ | — | **완료(`cef1613`)** — 출발 D−7 이내 사진 포함 전체 백업 강조 배너(`lastFullBackupAt`). 사진 클라우드 동기화는 §P3 잔여. |
| ~~5~~ | ~~q·mo 톤 점검~~ ✅ | — | **완료** — 28개 `q` 전수 공동·친근 해체체로 통일. `mo` 불변. |
| ~~6~~ | ~~공동작업 디테일~~ ✅ | — | **완료(`a70bbbd`, 12차)** — swipe 1회 nudge + 상시 chevron(`pointerEvents:'none'`로 기존 탭 무회귀) · 메모 LWW 충돌 배너(`baseRef`+dirty 추적, [상대 버전으로]/[내 입력 유지]). 관점 swipe 메타 확장은 잔여(P3 #10). |
| ~~7~~ | ~~첫 로드 성능~~ ✅ 체감개선 | — | **preconnect(`6eb9f3d`) + 스크립트 defer(`365476a`, 12차)** — 동기 스크립트(babel 324KB)가 막던 로딩 스플래시 즉시 페인트. Babel 런타임 컴파일이 근본 병목이나 빌드 도입은 단일파일 철학상 ❌ → 체감 개선까지가 한계. *(defer 후 첫 화면 정상 표시는 실기기 1회 확인 필요.)* |
| ~~8~~ | ~~접근성(a11y)~~ ✅ | — | **이미 완비 + 보강(`6eb9f3d`)** — `prefers-reduced-motion` 전역(iteration-count·scroll-behavior 추가)·`:focus-visible`·tap-highlight 제거. 잔여는 터치 44px·`aria-label` 미세 점검(임팩트 낮음). |
| ~~+~~ | ~~일정↔추천 연결 · 데일리 포커스~~ ✅ | — | **완료(`f0e0548`)** — 일정 상세에 추천 노출, 여행 중 Today 카드에 이동·강도·예약 강조. |
| 9 | **"여정의 GitHub" 비전 확장** | 🟢 | 커밋 타임라인·fork→원작 upstream PR·디스커버리·카운터 신뢰화. 동결 후/귀국 후. |
| 10 | **사진·메모 동기화 + 지도 인터랙션 확장** | 🟢 | 사진 Supabase Storage 동기화 · 핀↔갤러리 연결 · 추억 바이트 답 적기(`qchain`↔notes). |

### 🔴 P1 — 출발 전 필수 (해외 실패 방지 + 실데이터) · D−12

월드클래스 기준에서 *지금 없으면 여행 중 가장 크게 무너지는* 항목들. **출발이 가까워 이제 P1 = 동결 전 최우선.**
> **9차 결과: 코드 항목(3·4·5)은 전부 완료. 남은 P1은 Tyler 직접 작업(1·2)뿐.**

| 우선 | 항목 | 임팩트 | 왜 월드클래스인가 / 비고 |
|---|---|---|---|
| 1 | **실데이터 입력** | 🔴 높음 | 호텔·항공 확정 예약번호, 레스토랑 예약 상태(미식 탭), 가계부 통화·초기 예산. *비어 있으면 멋진 껍데기.* **코드 아닌 입력 작업 — Tyler 직접, 가장 먼저.** |
| 2 | **실기기 아이폰 QA** | 🔴 높음 | safe-area·폰트·터치 타깃·스크롤·standalone 실측. 시뮬레이터 ≠ 실제 Safari. **9차 변경(오프라인 지도·문서 금고·체크리스트 진행바·본문 16px)을 실제 폰 PWA에서 1회 검증** 필요. |
| ~~3~~ | ~~오프라인 지도 타일 선캐싱~~ ✅ | — | **완료(`cef1613`)** — OSM 타일 2×2 canvas 합성 → IDB `maptiles` 선캐싱, InlineMap 오프라인 시 저장 타일 표시, 지도 탭 수동 다운로드. *(타일 실제 수신은 폰 실측 필요)* |
| ~~4~~ | ~~문서 금고 (Document Vault)~~ ✅ | — | **완료(`cef1613`)** — 여권·비자·보험·항공/호텔 바우처·기타 IDB `documents` 오프라인 저장(기록 탭 🔐 문서). PIN은 사용자 선택으로 미적용 → 기기 화면 잠금 안내로 보완. |
| ~~5~~ | ~~데이터 복원력 (자동 백업)~~ ✅ | — | **완료(`cef1613`)** — 출발 D−7 이내 사진 포함 전체 백업 강조 배너(`lastFullBackupAt`). 사진 클라우드 동기화는 §P3 잔여. |

### 🟡 P2 — 체감 품질 (월드클래스 디테일)

평온할 때 "잘 만들었다"를 만드는 디테일. 동결 전 여유분.

| 항목 | 임팩트 | 비고 |
|---|---|---|
| **첫 로드 성능** | 중간 | Babel standalone 런타임 컴파일 = 첫 진입 1초+ 지연(324KB). 단일파일 철학 유지하되 critical CSS 인라인·폰트 preload·로딩 스켈레톤으로 *체감* 개선. 측정: Lighthouse 모바일. |
| ~~일정 사진 품질 업그레이드~~ ✅ | — | **완료(8차)** — 28일 전수 정본화·빈 날 0. 남은 건 도시 사진 IDB 선캐싱(오프라인+영구)뿐 → P1 #3과 합류. |
| **접근성(a11y)** | 중간 | 대비(AA 일부 완료)·터치 타깃 44px·`aria-label`·focus-visible·prefers-reduced-motion. 월드클래스는 a11y가 기본 입장권. |
| **데일리 "지금" 포커스** | 중간 | 여행 중 홈을 열면 *오늘 다음 행동*(체크인 시간·다음 이동·예약 알림)이 1순위로. 현재 Today 카드 존재 → 시간 인지형으로 강화. |
| **체크리스트 진행률 카테고리별 표시** | 낮음 | 주제별 재편 완료 → 다음은 카테고리별 완료율 배지·정렬(미완료 위로)로 "지금 뭘 예약해야" 가독성↑. |
| **일정 펼친 화면에 추천 연결** | 중간 | MapView처럼 일정 상세에도 "추가 추천 활동" 노출 → 패턴 일관성. |
| ~~마이크로 인터랙션 일관화~~ ✅ | — | **완료(13차, 미커밋)** — 보조 셀렉터 5곳 가로 스크롤→줄바꿈(`.gt-wrap`), 칩/탭 전환 모션 단일 토큰(`.gt-chip` 0.15s) 10개 버튼 통일·인라인 transition 0. 28일 타임라인·챕터필터는 가로 유지. *(줄바꿈 레이아웃·모션은 실기기 확인 후 커밋 권장.)* |
| ~~비표준 radius 잔여~~ ✅ | — | **완료(14차, 미커밋)** — radius numeric 단일 스케일 + t-shirt alias, 인라인 magic-number radius 41곳→토큰(50% 원형만 잔존), 시각 변화 0. |
| 비표준 font-size/자간 잔여 | 낮음 | uppercase 영문 라벨 자간(1.5~2px)은 의도된 디자인이라 유지(px→em 토큰화는 폰트크기 의존이라 시각 회귀). 한글 라벨은 토큰화 완료. 잔여는 코드 품질용. |

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
- 이후 `87840cd → df28a1f → 89270e3 → f31de3e → c9ce0e6 → 96d48f7 → 288efc2 → … → f21e52f → 51a8e86 → fd6e8be → 4d5eeda`까지 origin 위에 선형 적층. **유실 작업 없음.**
- **2026-06-03 현재 `main` == `origin/main` == `495a44f`** (10차 8커밋 `1f672c2`→`495a44f` push 성공·Vercel 배포, working tree clean. 본 REVIEW.md 10차 갱신만 미커밋).
- 10차 선형 적층: `f924719 → 1f672c2 → 80f5438 → 2519b55 → 8854929 → b31e342 → 047f762 → c1df0e5 → 495a44f`. **유실 작업 없음.**
- **11차(2026-06-03)**: `495a44f` 위에 `f031320`(REVIEW 10차, **push 완료** → `origin/main`) → `2129a31`(디자인: gold edge·`#fff`·fontFamily) → REVIEW 11차 커밋. **`2129a31` 이후는 미푸시, Tyler 수동 푸시 대기.** index.html만 변경(sw.js 무변경 → SW v5 유지, HTML은 network-first라 bump 불필요).
- 9차 선형 적층: `d96e89f → 9b4a1e1 → cef1613 → 6eb9f3d → f0e0548`. **유실 작업 없음.**
- 평소엔 Tyler 수동 푸시(사내망 차단)지만, 사용자 명시 요청 시 Claude가 커밋·푸시 수행. 9차·10차 모두 정상 푸시됨. 기본 규칙(요청 시에만 푸시)은 유지.

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
- **버전 bump**: `sw.js` 자체 수정 시만 `CACHE` 상수 bump (10차에서 v4→v5 적용 완료)

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
- `sw.js` CACHE → v6 bump (현재 v5)
