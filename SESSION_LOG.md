# Grand Tour 2026 — 세션 로그

> 각 entry는 한 세션의 작업 기록. **마지막 entry = 다음 세션의 ground truth.**
> 상세 현황·로드맵은 `REVIEW.md`, 작업 가이드는 `CLAUDE.md` 참조.

---

## 2026-06-09 (23차) — 여행 중(during) 실사용 강화: 오늘의 현지 도구

**시작 상태**: `origin/main`==`2617430`. 로컬 7커밋 미푸시(19~22차)에서 이어 작업. 사용자 "계속 디벨롭" → plan mode 협의 후 **"여행 중 실사용 강화"** 방향 선택·승인. 탐색 결론: 여행 중 필요한 정보(환율·현지꿀팁·교통·드레스코드)는 이미 다 있으나 **여정 탭 12서브탭에 흩어져** 홈에서 닿으려면 2~3탭 필요 → "지금 이 도시" 컨텍스트로 홈에 모음.

**한 일** (index.html, 커밋 `330439a`, 전부 기존 데이터 재사용·during 한정·추가 전용)
1. **D1 딥링크 인프라**: `pendingLogiSub` 모듈변수(`pendingDayFocus` 패턴 복제) → `Logistics` mount 시 초기 subTab 1회 소비(`useState(pendingLogiSub ?? 'map')` + `useEffect` clear). Home `goLogi(sub)` 헬퍼(햅틱+`setView('logi')`).
2. **D2 '🧭 오늘의 현지 도구' 카드**(신규 `LocalToolkit`, Today 카드 직후·`todayChapter.coords` 가드로 서막/귀국 제외): 2×2 탭 가능 미니셀 — ① 💱 통화(오늘 나라 1단위→KRW, `fx_cache` 읽기 재사용·오프라인 캐시 동작, 없으면 새로고침 유도)→fx ② 🔌 현지꿀팁(LOCAL_TIPS 전압 요약, `flag` 조인)→tips ③ 🚕 교통(CITY_TRANSIT 택시앱, `name` 조인)→flights ④ 👗 드레스코드(예약 🌟인 날)/🌤️ 날씨(그 외)→dress/weather. 신규 상수는 통화맵 `TOOLKIT_CURRENCY` 1개뿐.
3. **D3 비상연락처 컨텍스트화**: `EmergencyContacts({ todayFlag })` — 오늘 위치 나라 대사관을 최상단+`· 오늘 위치` 배지+warning-bg(라벨이 국기로 시작 → flag 매칭, 이탈리아/그리스 하위도시도 정확). pre/post는 `todayFlag=null`로 원순서.
4. **D4 클린업**: Today 카드 `nowPhase`(아침/오후/저녁) 중복 계산 2곳(지금포커스·동선타임라인) → Home 상단 1회 공용 계산. 동작 동일.

**중요 발견 / 원칙**
- 여행 중 정보는 "전부 있느냐"보다 **"지금 맥락에서 0~1탭에 닿느냐"** — 데이터는 그대로 두고 컨텍스트 집약만으로 실사용 가치↑(신규 데이터 0).
- 딥링크는 기존 `pendingDayFocus` 모듈변수 패턴이 검증돼 있어 그대로 복제(새 prop 배선 불필요, 회귀 위험↓).
- 조인 키는 **flag(꿀팁)·도시명(교통)·country(통화)** — 전부 CHAPTERS에 이미 있어 정확 일치(9도시 검증).
- 환율은 네트워크 미추가, `fx_cache`만 읽음 → **오프라인서도 마지막 캐시로 동작**(비행기모드 안전), 캐시 없으면 계산기로 유도.

**검증**: esbuild 인라인 JSX **0오류**(556KB 산출) · top-level `function` **69**(+LocalToolkit) · `ReactDOM.createRoot` **1** · `<>` Fragment **0** · index.html **8450줄** · 딥링크 타깃 5개(fx·tips·flights·dress·weather) Logistics 분기 존재 · CITY_TRANSIT 9도시=챕터 9도시명 일치 · LOCAL_TIPS flag 5 · 통화맵 5개국 커버 · `hour` 잔재 0. (헤드리스 Chrome 금지 → 런타임 시각검증은 Tyler 실기기.)

**종료 상태**: 코드 `330439a`(23차 1of2) + 본 docs(2of2) 커밋. `origin/main`==`2617430` 기준 **로컬 9커밋 ahead 미푸시**(Tyler 수동 푸시 대기). sw.js 무변경 → **SW v5 유지**. 브라우저 자동 open 안 함.

**보류 / 다음 세션 ground truth**
- 🔴 **실데이터**(Tyler): 귀국편 ET6973 코드 재확인, 6/18·6/22·7/3·7/6·7/8 편명, 가계부 통화·예산.
- 🔴 **실기기 QA**: during phase는 6/15 이후(또는 TRIP_START 임시 당김)에 확인 — ① 오늘 도시 기준 4개 셀 값 정확 ② 각 셀 탭 → 여정 해당 서브탭 직행 ③ 비상연락처 오늘 나라 최상단·배지 ④ 시간대별 지금 포커스 무회귀 ⑤ 비행기모드서 통화 셀 캐시 폴백. (pre 현재는 LocalToolkit 미표시가 정상)
- 🟢 동결 후: 사진/메모 Supabase Storage, Today 카드 본문 깊은 리디자인(실기기 확인 후). PWA 백그라운드 푸시는 서버리스라 구조적 불가(현행 '앱 열 때 알림' 유지).

---

## 2026-06-09 (22차) — 기기 연동 UX 개선 + 헤더 동기화 상태 배지

**시작 상태**: `origin/main`==`2617430`(19차 docs). 로컬 5커밋 미푸시(`1ed8137`·`801edae`·`cfd2e07` 온보딩·`cbcff35` 여정그룹·`65fc142` 20·21차 docs)에서 이어 작업. 동기화 기능은 "친구 초대" 프레이밍이었으나 실사용 1순위는 **내 폰↔PC 등 본인 다기기 연동**이라 UX를 그쪽으로 재정렬.

**한 일** (index.html, 커밋 `9ac8576`)
1. **Part 1 — 연동 UX 재구성 (SyncPanel)**: 제목 `🤝 공동작업(친구 초대)` → `🔗 기기 연동 · 함께 쓰기`. **내 이름 입력을 연결 전에도 항상 노출**(연결돼야 보이던 것을 앞으로 빼 '내 이름으로 연동' 흐름). 비연결 상태에 **3-step 안내 박스**(① 코드 만들기 ② 다른 기기에서 같은 코드/링크 ③ 실시간 반영). 문구 전반 일반화(친구 → 내 폰·주연 기기). **메커니즘 불변**(gtSync·actor_name·`?trip=` 초대링크·SYNC_KEYS 11키 그대로).
2. **Part 2 — 헤더 동기화 배지 (Header)**: tripId 연결 시 헤더 TAEHYEON·JUYEON 아래에 **상시 `● 동기화 중 · 이름` 배지**(online=success 점/offline=muted 점·텍스트 '오프라인'). 탭 시 홈(SyncPanel)으로 이동. `App`에서 `Header`에 `setView` prop 전달, Header는 `useOnlineStatus()`·`gtSync.tripId()`·`actorName()` 구독.

**중요 발견 / 원칙**
- 동기화의 실수요는 "친구 협업"보다 **본인 다기기 연속성** — 프레이밍을 사용자 실제 행동에 맞추니 같은 코드 한 줄도 안 건드리고 진입 마찰만 낮아짐(코드 변경 없는 메커니즘, 라벨·배치·노출 타이밍만).
- **연결 상태 가시성**: 동기화는 보이지 않으면 "되고 있나?" 불안 → 헤더 상시 배지로 online/offline·내 이름을 항상 노출(여행 중 비행기모드 토글 시 상태 변화도 즉시 체감).
- `(1of2)` = feature 커밋. **`(2of2)` = 본 SESSION_LOG·REVIEW 문서 갱신**(이 항목).

**검증**: esbuild 인라인 JSX **0오류**(babel 블록 431줄~ 동적 탐지 후 추출, 551KB 산출) · top-level `function` **68**(20·21차 Onboarding 추가분 유지, 22차 신규 함수 0) · `ReactDOM.createRoot` **1** · `<>` Fragment **0** · index.html **8374줄**. (헤드리스 Chrome 금지 → 런타임 시각검증은 Tyler 실기기 몫.)

**종료 상태**: 코드 `9ac8576`(22차 feat) 커밋. 본 문서 갱신 커밋(2of2)까지 합쳐 `origin/main`==`2617430` 기준 **로컬 7커밋 ahead 미푸시**(Tyler 수동 푸시 대기). sw.js 무변경 → **SW v5 유지**. (브라우저 자동 open 안 함)

**보류 / 다음 세션 ground truth**
- 🔴 **실데이터**(Tyler): 귀국편 ET6973 코드 재확인, 6/18·6/22·7/3·7/6·7/8 편명, 가계부 통화·예산.
- 🔴 **실기기 QA**: **① 기기 연동 흐름**(시크릿창/둘째 기기에서 같은 코드·링크로 연결 → 체크·메모 실시간 반영) · **② 헤더 동기화 배지**(연결 시 표시·online/offline 색 전환·탭 시 홈 이동) · ③ 온보딩 첫 실행(20차) · ④ 여정 3그룹(21차) · (during) 홈 Today 최상단.
- 🟢 동결 후: 사진/메모 Supabase Storage, PWA 예약 D-1 푸시, Today 카드 본문 깊은 리디자인(실기기 확인 후).

---

## 2026-06-09 (20·21차) — 주연용 온보딩 + 여정 탭 3그룹 재구성

**시작 상태**: `origin/main`==`2617430`(19차 docs). 로컬 `1ed8137`(빈상태)·`801edae`(docs) 미푸시 상태에서 이어 작업. 사용자 "순서대로 진행"(① 온보딩 → ② 화면 리디자인 → ③ 마감).

**한 일** (index.html)
1. **20차 주연용 온보딩**(`cfd2e07`): 첫 실행 1회(localStorage `onboarded` 플래그) **하단 시트 환영 오버레이**. 🌍 브랜드·태그라인 → 5탭 안내(홈/일정/체크/여정/기록 한 줄씩) → 🤝 둘이 연결(공동작업)·🔒 데이터 기기저장 → '시작하기 ✈️'(플래그 저장·닫힘) / '지도·예약부터 둘러보기'(여정 진입). `Onboarding` 컴포넌트 신설(function 67→68), App에 `showOnboard` state + `loaded` 후 플래그 체크 effect + `closeOnboard` + 렌더(BottomNav 뒤). `gt-expand` 등장·백드롭 블러·토큰 재사용. fork/invite(`?trip=`) 진입한 주연에게도 표시(가장 유용).
2. **21차 여정 탭 3그룹 재구성**(`cbcff35`): 12 서브탭 평면 4×3 그리드(동등 나열) → **이동·숙박 / 돈·예산 / 현지 생활** 3그룹 + eyebrow 라벨로 위계·스캔성↑. `SUBTABS`(평면) → `TAB_META`(id→icon/label) + `SUBTAB_GROUPS`(그룹). 기능·렌더 분기 12개·칩 스타일 불변.

**중요 발견 / 원칙**
- 온보딩은 **비개발자 공동 사용자(주연) 진입 마찰 0**이 목적 — 점검 내내 최대 갭으로 꼽혔던 것(이전 차수엔 사용자가 제외했다가 이번에 진행).
- 평면 12 그리드는 위계 0 → **의미 그룹 + eyebrow 라벨**로 인지 부하↓(기능 제거 없이 정보구조만).
- 둘 다 **pre phase에서 보여 지금 테스트 가능**(during 의존 아님).

**검증**: esbuild 인라인 JSX 0오류 · function 68 · ReactDOM.createRoot 1 · DAYS 27 · 온보딩 배선 5곳 · 서브탭 12 id 그룹 분류 누락/중복 0 · 렌더 분기 12.

**종료 상태**: `cfd2e07`(20차)·`cbcff35`(21차) 커밋. `origin/main`==`2617430` 기준 **로컬 4커밋 ahead 미푸시**(`1ed8137`·`801edae`·`cfd2e07`·`cbcff35`). sw.js 무변경 → SW v5 유지. (브라우저 자동 open 안 함)

**보류 / 다음 세션 ground truth**
- 🔴 **실데이터**(Tyler): 귀국편 ET6973 코드 재확인, 6/18·6/22·7/3·7/6·7/8 편명, 가계부 통화·예산.
- 🔴 **실기기 QA**: **온보딩 첫 실행**(신규 기기/시크릿창에서 1회 뜨는지·닫으면 다시 안 뜨는지)·여정 3그룹 레이아웃·(during) 홈 Today 최상단·두 기기 동기화.
- 🟢 동결 후: 사진/메모 Supabase Storage, PWA 예약 D-1 푸시, Today 카드 본문 깊은 리디자인(실기기 확인 후).

---

## 2026-06-09 (19차) — 홈 UX 고도화(로딩 스켈레톤·during 흐름·Today 헤더) + 예약 요약 완료 기능

**시작 상태**: `origin/main`==`8b822de`(17차). 로컬 18차 코드 `8df602c`(푸시됨) + 18차 docs 미커밋 상태에서 이어 작업. 19차 코드 `94525f7`(plan mode 승인 후 실행), **미푸시**.

**한 일** (index.html, 커밋 `94525f7`) — plan `gleaming-wobbling-wind.md` 기반, 사용자 "UX 고도화" 요청
1. **Part A 로딩/빈 상태 고급화**: 위젯 로딩 텍스트 "불러오는 중…" 5곳(NextFlight 날씨·HeroCountdown 날씨[다크, opacity 0.3]·환율·WeatherWidget·ForkPreview) → `.gt-skel` 스켈레톤으로 통일(앱 초기 로드 L1945~와 일관). 텍스트 잔재 0.
2. **Part B during-trip 흐름 심화**: 여행 중 홈에서 **Today 카드(지금 포커스)를 최상단**(EveningReminder 바로 뒤)으로. 작은 블록 3개(철학·TimezoneWidget·NextFlight, ~30줄)를 Today 카드 아래로 이동(137줄 카드 이동보다 안전). during: EveningReminder→Today→Timezone→NextFlight→철학→Recommendations. **pre 부수효과**: NextFlight가 철학 위로 옴(출발 카운트다운 상향, 무해).
3. **Part C Today 카드 헤더**: "오늘 · Day N" → "오늘 · Day N · M/D (요일)". 밀집한 카드 본문은 during 시각검증 불가(D-7)라 재구성 안 함(안전 우선).
4. **Part E 예약 요약 완료→제거**(사용자 요청): 체크탭 '지금 예약·신청할 것'·'직접 확인·준비할 것' 각 항목에 완료 체크 버튼(`toggleCheck(i.id)`) 추가 → 완료 시 `urgent && !checks` 필터로 요약에서 자동 제거. 행을 `<a>`→`div`(체크버튼+예약링크)로 재구성(button in anchor 회피).
5. **Part F 빈 상태 톤 정리**(`1ed8137`, 19차 후속): 빈 상태 전수 점검 — 가계부·오늘 할일·백업·메모 검색은 이미 친근체 양호. 유일하게 무미건조하던 문서 금고 카테고리 빈 슬롯 "아직 없음" → "아직 없어요 — 위 +로 추가"(행동 유도형). 그 외 빈 상태는 억지 변경 안 함(이미 충분).

**중요 발견 / 원칙**
- **서브에이전트 결과 반환 실패 반복**: designer×2·Explore×2 모두 분석은 했으나 최종 메시지에 리스트 미반환(이 환경 특성). → 에이전트 의존 중단, 직접 grep 점검으로 전환.
- **온보딩 부재가 최대 갭**이나 사용자가 제외 선택 → 로딩/흐름/화면 3방향이 홈에서 수렴 → 홈 단일 대상 고도화.
- 137줄 블록 이동보다 **작은 블록을 반대로 이동**이 안전(동일 효과, 회귀 위험↓).
- during-phase 변경은 D-7이라 코드 검증만, 시각은 Tyler 실기기 몫.

**검증**: esbuild 인라인 JSX 0오류 · function 67 · ReactDOM.createRoot 1 · DAYS 27 · `<>` 0 · "불러오는 중" 잔재 0 · `gt-skel` 11곳 · index.html 8300줄.

**종료 상태**: 코드 `94525f7`(Part A~E) + `1ed8137`(Part F 빈상태) 커밋. **`94525f7`·docs `2617430`까지 푸시 완료**(`origin/main`==`2617430`). `1ed8137`은 **미푸시 1커밋**. sw.js 무변경 → SW v5 유지.

**보류 / 다음 세션 ground truth**
- 🔴 **실데이터**: 귀국편 ET6973 코드 재확인(EY?), 6/18·6/22·7/3·7/6·7/8 편명, 가계부 통화·예산.
- 🔴 **실기기 QA**: (during) Today 카드 최상단·날짜 헤더·로딩 스켈레톤(비행기모드 토글)·예약 요약 완료버튼 동작. **두 기기 동기화**.
- 🟡 미착수: 온보딩(주연용 첫 실행 안내) — 사용자가 이번엔 제외, 추후 옵션. Today 카드 본문 깊은 리디자인도 실기기 확인 후 가능.
- 🟢 동결 후: 사진/메모 Supabase Storage, PWA 예약 D-1 푸시.

---

## 2026-06-08 (18차) — 일정 펼침 모션·화살표 회전 통일 + 동기화 전수 검증

**시작 상태**: `origin/main`==`8b822de`(17차 푸시 완료). 이번 코드 `8df602c`(단일 feat), **미푸시**(Tyler 수동).

**한 일** (index.html, 커밋 `8df602c`)
1. **디자인/UX 고퀄 디벨롭** (사용자 "전체 점검·고퀄화" 요청):
   - 깊은 점검 결과 **기본기 이미 최상급** 확인 — 마이크로 인터랙션(button:active scale·gt-card hover·gt-tap-card·view fade·skeleton·gold sheen)·토큰·타이포(serif 20곳·tabular-nums 19곳)·빈상태 톤 모두 양호.
   - **일정 카드 펼침 부드러운 전환**: 즉시 토글 → `.gt-expand`(opacity+translateY 0.28s, reduced-motion 정지).
   - **토글 화살표 회전 통일**: 3곳 중 일정 카드만 `›` 회전+transition이었고 나머지 2곳(3819·4388)은 `▾/▸` 글리프 교체 → **전부 `›` + 90° 회전 transition**으로 일원화.
   - 여백 px 혼재·lineHeight 산발·다크 surface rgba 투명도는 **회귀>효과**라 의도적 보류(LESSONS 22).
2. **동기화 전수 점검·검증** (사용자 "공유 동기화 정리·체크" 요청, **코드 변경 0**):
   - 배선 확인 — Push: `storage.set` monkey-patch 래핑(`_storageSet`+`gtSync.push`)으로 전 저장 자동 push(SYNC_KEYS 11키 필터). Pull: Realtime→`gt:remote`→App map 9키 + ExpenseTracker(`expenses`)·RestaurantTracker(`restaurant_status`) 자체 리스너 2키 = **11키 전부 수신, 반쪽 동기화 0**.
   - SyncPanel(홈) 안내 정확: 공유=체크/패킹/미식예약/가계부/일정(편집·할일)/메모, 제외=관점·사진·PIN.
   - **Supabase 11키 왕복 스모크 통과**(UPSERT 201·READ 11키 일치·DELETE 204).

**중요 발견 / 원칙**
- **검증 스크립트 zsh 함정**: `for k in $KEYS`가 zsh에선 단어분할 안 됨(SH_WORD_SPLIT off) → $k=전체 문자열. 배열 `KEYS=(...)`로 해결. 첫 "11키 read 0"은 앱이 아니라 테스트 버그였음.
- **babel 블록 검증은 시작 줄 동적 탐지** 필수 — CSS 추가로 줄 밀리면 `sed 402` 하드코딩이 CSS를 JSX로 파싱해 가짜 에러. `grep type="text/babel"`로 시작 줄 찾기.
- 점검 결론이 "변경 없음"인 게 정상 — 동기화·디자인 기본기가 이미 완성형.

**검증**: esbuild 인라인 JSX 0오류 · function 67 · ReactDOM.createRoot 1 · DAYS 27 · `▾/▸` 글리프 잔재 0 · Supabase 11키 왕복 201/11/204 · index.html 8282줄.

**종료 상태**: 코드 `8df602c` 커밋, **미푸시**. sw.js 무변경 → SW v5 유지.

**보류 / 다음 세션 ground truth**
- 🔴 **잔여 실데이터**: 귀국편 ET6973 코드 재확인(Etihad 보통 EY), 6/18 Eurostar·6/22 BA600·7/3 NAP·7/6·7/8 편명, 가계부 통화·예산.
- 🔴 **실기기 QA**: 일정 펼침 모션·화살표 회전·**두 기기 동기화**(서로 다른 기기/시크릿창에서 같은 trip code 연결→체크·할일·메모 실시간 반영) 실측.
- 🟢 동결 후: 사진/메모 Supabase Storage, PWA 예약 D-1 푸시. 특정 화면 깊은 리디자인(홈/일정상세/기록)은 요청 시.

---

## 2026-06-08 (17차) — 귀국편 확정·토스카나 시간표 + 디자인/UX 점검 디벨롭

**시작 상태**: `origin/main`==`3d40207`, 로컬 13~16차 6커밋 미푸시 ahead. 이번 코드 `c8fff38`(단일 feat), **미푸시**(Tyler 수동).

**한 일** (index.html, 커밋 `c8fff38`)
1. **귀국편 항공사 확정**: ET6973 · **Asiana 코드셰어·Etihad 운항** (FLIGHTS + 체크리스트 c2). *(주의: Etihad 정식 코드는 보통 EY — e-ticket에서 ET6973 재확인 권장.)*
2. **토스카나 6/27 발도르차 드라이브 시간표 구체화**: 08:00 피렌체 출발 → 09:30 부온콘벤토 → 10:30 피엔차(점심) → 13:30 San Biagio → 15:00 출발 → 17:30 로마. DAY_RECS[13] 각 카드 시간 + day13 moves.
3. **전체 점검 → UX 개선 4건**:
   - FLIGHTS 도착시간 보강(NAP→JTR 13:45→16:40·ATH→AUH 07:20→13:00, 시차 반영 → 픽업 간격 정합 확인).
   - 항공·이동 탭 **날짜 그룹핑**(요일·도시 헤더 `React.Fragment`, 카드 우측 중복 날짜 제거).
   - 홈 **Today 카드에 그날 일정 할일(day_items)** 표시·체크 토글·"+추가"로 일정탭 점프.
   - 홈 **출발 준비 카드에 '🔴 지금 예약·신청 N건' 배너**(클릭→체크탭).
4. **디자인/UX 점검 디벨롭**:
   - 모션: `all 0.2s` 안티패턴(GPS 버튼) → 명시 속성, 체크리스트 transition `var(--ease)` 토큰화.
   - **Day 자동 스크롤**: 홈→Day 진입 시 그 날 카드로 `scrollIntoView`(`scrollMarginTop=headerH+64`로 sticky 가림 방지).
   - 홈 계층: pre phase 준비현황(+예약 배너)을 **철학 인용구 위로**(during 무영향).
   - 카드 그림자 7곳은 **특수목적(버튼 elevation·sticky 방향그림자·모달·BottomNav)**이라 범용 토큰과 값 달라 강제 통일 회피(회귀 방지).
5. **버그 수정**: `Day n/28` → `/27` (26박27일 전환 시 D-Day 라벨 누락분).

**중요 발견 / 원칙**
- 그림자 7곳은 토큰 잔재가 아니라 **의도된 다른 그림자** — "토큰화≠스냅" 재확인, 값 다르면 유지.
- 자간 px(0.5px 등)도 영문 라벨 트래킹이라 px→em 토큰화는 회귀 → 유지.
- 점검 결과 기본기 양호: 억지 통일보다 **명확한 잔재(transition·버그)만** 손대는 게 정답.

**검증**: esbuild 인라인 JSX 0오류 · function 67 · ReactDOM.createRoot 1 · DAYS 27 · React.Fragment 짝 균형 · `all 0.2s` 잔재 0 · index.html 8234줄.

**종료 상태**: 코드 `c8fff38` 커밋, **미푸시**. sw.js 무변경 → SW v5 유지. (브라우저 자동 open 중단 — Tyler 직접 새로고침)

**보류 / 다음 세션 ground truth**
- 🔴 **잔여 실데이터**: 귀국편 ET6973 코드 재확인(EY?), 6/18 Eurostar·6/22 BA600·7/3 NAP·7/6·7/8 편명, 가계부 통화·예산.
- 🔴 **실기기 QA**: Day 자동 스크롤·홈 계층(준비현황 위로)·항공 탭 날짜 그룹핑·홈 '🔴 예약' 배너·(여행 중) 오늘 카드 할일.
- 🟡 Frecciarossa 기차표 기결제 시 환불 확인(일정은 운전으로 정리). 토스카나 점심 맛집 구체화는 선택.
- 🟢 동결 후: 사진/메모 Supabase Storage, PWA 예약 D-1 푸시.

---

## 2026-06-08 (16차) — 실예약 전수 반영 + 출발편 확정 + UX(스크롤·일정할일·동기화) + 발도르차 드라이브

**시작 상태**: `origin/main`==`3d40207`, 로컬 13~15차 4커밋 미푸시 ahead. 이번 세션 코드는 `64af8c4`(단일 feat)로 커밋, **미푸시**(Tyler 수동).

**한 일** (index.html, 커밋 `64af8c4`)
1. **출발편 확정** (Cathay e-ticket): CX411 ICN 15:10→HKG 18:00 · CX261 HKG 00:05→CDG 07:50(16일), 비즈니스 12H/14G. FLIGHTS 2편 분리·day1·day2 moves·체크리스트 c9 ✅(urgent off).
2. **호텔/항공/픽업 실예약 반영**: 호텔 3곳 예약번호·금액(La Cort My Dollhouse·Palazzo Talamo·NOŪS, NOŪS는 새 번호로 교체). 항공 2건 **정정**(7/3 FCO→ATH→JTR 환승 → **NAP→JTR 직항**, 7/8 ATH→DXB → **ATH→AUH**). 공항픽업 4건(CDG 6/16·JTR 7/3·ATH 7/6·AUH 7/8) FLIGHTS transfer로 추가.
3. **돌로미티 호텔 변경**: X ALP → **La Cort My Dollhouse**(7곳).
4. **6/30 로마→포지타노**: 프라이빗 트랜스퍼 → **Italo 9975(예약 GYGI5F·€45.80) + Welcome Pickups(€155)**, 총 €200.80.
5. **렌터카 로마 반납 확정**(Tyler 주소 제공): Enterprise **베네치아 마르코폴로 공항 픽업 → 로마 Via Sardegna 25/Cavalieri 반납**. → 6/27 피렌체→로마를 **자가운전(발도르차 경유)**으로, **Frecciarossa 기차(a4) 삭제**, Hertz→Enterprise 정정(2곳).
6. **체크리스트 강화**: 영국 ETA(a9)·Alpe di Siusi 차량통제/주차(t13)·피렌체 ZTL(a10)·피렌체 주차(a12)·로마 ZTL 무관확인(a11, Cavalieri=Monte Mario ZTL 밖). 입장 3건(Duomo/Acropolis/Borghese) urgent 승격. 링크 점검(Burj Khalifa 404→`/en/`, ETA→`/eta`).
7. **출발 준비 요약 개선**: 6개 잘림 제거 → **예약·신청(외부링크)/확인·준비(직접)** 2분할 + **여행 사용일순 정렬**(`tripDateKey`, 날짜없는 행정 최우선).
8. **UX 심리스 네비**: `setView` 래핑 + `useLayoutEffect`로 **탭별 스크롤 위치 기억·복원**(첫 진입 상단, 재진입 이어보기). 기존엔 리셋 로직 없어 중간부터 보이던 버그 해소.
9. **일정 '내 활동·할일'**(`day_items`): 일정 카드에 자유 할일 추가/체크/삭제(localStorage) + **Supabase 실시간 공유**(SYNC_KEYS·onRemote map 합류, 공유 안내 문구 갱신).
10. **6/27 발도르차 드라이브**: 부온콘벤토·피엔차(Corsignano)·San Biagio(몬테풀치아노) DAY_RECS[13] 재구성 + day13 moves/hl/food/int(L→M). **DayRecs `r.q` 항목별 지도검색어** 추가(타지역 스팟이 챕터명으로 오검색되던 버그 방지).

**중요 발견 / 원칙**
- **실예약이 기존 가정을 뒤집음**: 7/3 환승→직항, 7/8 두바이→아부다비, 피렌체반납→로마반납. 데이터 받으면 일정·항공·체크리스트·잔재(Frecciarossa·Hertz·환승편)를 grep 전수 추적.
- **새 state는 동기화 배선 누락 점검**: `SYNC_KEYS` + onRemote `map` **둘 다** 추가해야 공유됨. 실작동은 Supabase REST 왕복 스모크(201/200/204)로 검증.
- **항공사 Etihad(귀국편)는 여전히 추정**. 출발편만 Cathay 확정.
- 토스카나 블로그(blog.naver.com)는 Claude Code fetch 차단 → 사용자가 준 구글맵 3곳으로 코스 직접 설계(발도르차 남하 동선).

**검증**: esbuild 인라인 JSX 0오류 · function 67 · ReactDOM.createRoot 1 · DAYS 27 · index.html 8187줄 · Supabase day_items 왕복 스모크 201/200/204.

**종료 상태**: 코드 `64af8c4` 커밋, **미푸시**. sw.js 무변경 → SW v5 유지. (브라우저 자동 open 중단 — Tyler 직접 새로고침)

**보류 / 다음 세션 ground truth**
- 🔴 **항공사·잔여 실데이터**: 귀국편 항공사 확정(Etihad 추정), 6/18 Eurostar·6/22 BA600·7/3 NAP편명·7/6·7/8 항공편명·가계부 통화·예산.
- 🔴 **실기기 QA**: 출발편 확정 표시·스크롤 복원·일정 할일 추가/동기화(두 기기)·발도르차 추천 지도링크·예약요약 2분할.
- 🟡 **Frecciarossa 기차표 이미 결제했다면** 환불 확인(일정은 운전으로 정리됨). 토스카나 점심 맛집 구체화·사이프러스 포토스팟은 선택 확장.
- 🟢 동결 후: 사진/메모 Supabase Storage, PWA 예약 D-1 푸시.

---

## 2026-06-07 (15차) — 귀국편 직항 확정·26박27일 재정리 + 영국 ETA·출발편 체크리스트

**시작 상태**: `origin/main`==`3d40207`, 로컬 13·14차 2커밋(`a4979c2`·`df30c88`) 미푸시 ahead 상태에서 이어 작업.

**한 일** (index.html, 커밋 `ee92cf4`)
1. **영국 ETA 누락 보강**: 2025년부터 한국인 영국 입국 시 전자여행허가(ETA) 필수인데 체크리스트에 없었음(Tyler가 "까먹을 뻔") → `📋 서류·행정·안전`에 `a9`(둘 다, 런던 입국 전, urgent, gov.uk 링크) 추가.
2. **귀국편 확정 반영** (Tyler 제공: 7/10 AUH 21:10 → 7/11 ICN 10:50, 직항): 기존 두바이→홍콩 경유·7/12 도착 전제가 붕괴 → 일정 전면 정리.
   - FLIGHTS 귀국편 `DXB→HKG→ICN`(미정) → `AUH→ICN 직항`(Etihad 추정·시간 Tyler 확정).
   - day26(7/10) 아부다비 직항 출국(두바이 경유 제거), day27(7/11) **인천 도착 마지막 카드**로 재구성(기내 2년 로드맵 + 도착·봉인·"우리 이제 시작이다" 통합), **day28(7/12) 삭제**.
   - 27박28일→**26박27일**: "28일"→"27일" 전수(타임라인·일정·식비·콘텐츠 12곳), `TRIP_END` 7/12→7/11, `getCurrentStatus` day 인덱스 클램프 27→26, ret 챕터 dates `7/10~11`, **서울 일출 사진 day27로 이동(정본 보존)**, OUTPUTS 봉인 산물(o19) day27 연결.
3. **체크리스트 '지금 확정' 정리**: 귀국편 c2 → 확정(✅)·urgent off(요약서 제외). 점검 중 **출발편(6/15 ICN→HKG→CDG)도 시간 미정** 발견 → c9 신규(urgent).

**중요 발견 / 미확인**
- **항공사 Etihad는 추정** — Tyler가 시간만 줌. AUH 21:10→ICN 직항이 사실상 에티하드뿐이라 표기. 실제 항공사·편명 확정 필요.
- 출발편(6/15)도 데이터상 "시간 미정"이었음 — 귀국편만 미정인 줄 알았으나 출발편도. c9로 가시화.
- DAYS 27개로 축소(`n:1~27`). `{ n: 숫자 }` 37 = DAYS 27 + HOTELS 10.

**검증**: esbuild 인라인 JSX 파싱 0오류 · function 67 · ReactDOM.createRoot 1 · day28 잔재(n:28·28일·day:28·HKG 귀국) 전부 0 · index.html 8101줄.

**종료 상태**: 커밋 `ee92cf4`(코드) + 본 SESSION_LOG 갱신 커밋. 13·14차 2커밋과 함께 **origin/main 푸시 완료**(Tyler 명시 요청). sw.js 무변경 → SW v5 유지.

**보류 / 다음 세션 ground truth**
- 🔴 **항공사 확정**: 귀국편 Etihad는 추정 → 실제 항공사·편명 확인 후 정정.
- 🔴 **출발편(6/15) 시간 확정**: 미정 상태(c9). Tyler 직접.
- 🔴 **실데이터 입력**(Tyler 직접): 호텔·항공 예약번호, 미식 예약 상태, 가계부 통화·초기 예산.
- 🔴 **실기기 아이폰 QA**: 13·14차(보조 셀렉터 줄바꿈·radius) + 15차(귀국 일정 7/11 마지막·체크리스트 '지금 확정' 요약·서울 일출 day27) 실측.
- 🟡 **REVIEW.md 본문 미반영**: 15차 일정 변경(26박27일·귀국편 직항)이 REVIEW 0번 표·일정 행에 아직 안 들어감 — 다음 정식 갱신 시 수정.

---

## 2026-06-05 (14차) — 비표준 radius 토큰화 (numeric 단일 스케일 + t-shirt alias, 시각 변화 0)

**시작 상태**: `origin/main`==`HEAD`==`3d40207`. working tree = 13차 변경분(index.html + 문서 3종) **미커밋** 상태에서 이어 작업. REVIEW P2 "비표준 radius 잔여"(13차가 회귀 위험으로 보류한 `borderRadius:8px` 24곳) 해소가 목표.

**한 일** (index.html 1파일 + 본 문서 3종, 미커밋)
1. **근본 진단**: radius가 **두 체계로 이원화** — t-shirt 토큰(`xs`4/`sm`6/`md`10/`lg`14/`xl`18/`2xl`24)이 `var()`로 143곳, 코드가 실제 쓰는 4배수값(8/12/16/20)은 인라인 magic-number 41곳. t-shirt 스케일이 8을 못 담아 생긴 구조적 불일치가 13차 보류의 원인. (참고: `--radius-2xl`은 정의됐으나 사용 0회.)
2. **해법 = exact-value 토큰화(스냅 아님)**: radius 스케일을 **numeric(px=이름)** 단일 진실원천으로 재정의(`--radius-2`~`--radius-24`+`--radius-pill`). 기존 t-shirt 이름은 **numeric을 가리키는 alias**(`--radius-xs: var(--radius-4)` …)로 유지 → 기존 `var()` 143곳 **무수정·무위험**, 8px가 정식 토큰을 얻음.
3. **인라인 41곳 치환**: 8px×24·12px×7·20px×5·3px×3·16px×1·2px×1 → 대응 numeric 토큰. `borderRadius:'50%'` 8곳(원형)은 의미상 유지.

**중요 발견 / 원칙**
- **토큰화 ≠ 스냅**. 13차가 보류한 이유는 "8px를 기존 토큰(6/10)으로 스냅 = 1~4px 시각 변화 = 회귀". exact-value 토큰을 **추가**하면 값 불변이라 회귀 0 + 구조적 불일치 해소. "안전 정리"의 정의 = 값 보존.
- 두 스케일 공존(t-shirt vs 4배수)을 **alias로 봉합** — 기존 호출부를 건드리지 않고 단일 진실원천을 세우는 무위험 마이그레이션. t-shirt는 점진 정리 대상으로 남김.
- 자간(letterSpacing)은 손대지 않음 — 남은 px 자간은 대부분 **영문 uppercase 라벨의 의도된 트래킹(1~2px)**이고, px→em 토큰화는 폰트 크기 의존이라 값이 달라져 회귀. REVIEW대로 한글 라벨은 이미 토큰화 완료.

**검증**: esbuild 인라인 JSX 파싱 **0 오류**(525KB). 인라인 magic-number radius **0**(50% 원형 8개만 잔존)·새 numeric 토큰 41 참조·t-shirt alias 143곳 무수정 유지·`function` 67개·`ReactDOM.createRoot` 1개. index.html 8087→**8101줄**(+14 = 토큰 정의 추가분). sw.js 무변경 → **SW v5 유지**. (시각 동등성은 alias가 동일 px로 해석되어 구조적으로 보장 — 추가 실측 불요, 다만 Tyler 실기기 회귀 확인은 13차분과 함께 권장.)

**종료 상태**: index.html **미커밋**(13차분과 누적). working tree = index.html + SESSION_LOG·REVIEW·LESSONS 변경. `origin/main`==`HEAD`==`3d40207` 유지.

**보류 / 다음 세션 ground truth**
- 🔴 **실데이터 입력**(Tyler 직접): 호텔·항공 예약번호, 미식 예약 상태, 가계부 통화·초기 예산.
- 🔴 **실기기 아이폰 QA**(헤드리스 금지): 13차(보조 셀렉터 줄바꿈·칩 0.15s 모션) + 14차(radius 시각 동등성 — 모서리 둥글기 무회귀) 일괄 실측 후 커밋(F2).
- 🟡 **남은 코드 작업 사실상 없음**: P2 radius·마이크로 인터랙션 완료. 자간은 의도된 잔여뿐. (선택적: t-shirt alias→numeric 점진 정리, 코드 품질용 극저순위.)
- 🟢 동결(D−5, 6/8) 후: 사진→여정 자동정렬, PWA 예약 D-1 푸시, 사진·메모 Supabase Storage 동기화.

---

## 2026-06-05 (13차) — 마이크로 인터랙션 일관화 (보조 셀렉터 줄바꿈 + 칩 전환 모션 토큰 단일화)

**시작 상태**: `origin/main`==`HEAD`==`3d40207`(12차 6커밋 전부 푸시 완료), working tree clean. 12차 SESSION_LOG의 "미푸시" 메모는 이후 정리되어 현재 선형·동기 상태.

**한 일** (REVIEW P2 "마이크로 인터랙션 일관화" 항목, index.html 1파일·미커밋)
1. **CSS 클래스 2개 신설** (`gt-chips` 블록 직후). ① `.gt-wrap` = `display:flex; flex-wrap:wrap; gap:var(--space-2)` — 가로 스크롤로 화면 밖에 숨던 보조 셀렉터 선택지를 줄바꿈으로 전부 노출(발견성, Logistics 서브탭을 grid로 푼 것과 동일 철학). ② `.gt-chip` = `transition: background/color/border-color 0.15s var(--ease)` — 칩·탭 선택 전환 모션을 단일 토큰으로.
2. **보조 셀렉터 5곳 `gt-chips`→`gt-wrap`**: 번역 카테고리(`TranslateWidget`)·가계부 카테고리(`ExpenseTracker`)·음악 챕터(`SpotifyWidget`)·복장 필터(`DressCodeWidget`)·날씨 도시(`WeatherWidget`). 모두 한 화면에 들어가는 짧은 라벨 셀렉터.
3. **가로 유지**(REVIEW 명시): 28일 타임라인(`TimelineStrip`)·일정 챕터 필터(sticky)는 `gt-chips` 유지 — 항목 多·라벨 길어 가로 스크롤이 정석.
4. **전환 모션 `gt-chip` 통일**(10개 버튼): 위 5개 wrap 셀렉터 버튼 + 챕터 필터 버튼(전체/챕터) + Logistics 서브탭 + MapView 챕터 탭. Logistics 서브탭·MapView 탭의 **인라인 `transition` 문자열은 제거**하고 클래스로 일원화 → 인라인 0.15s transition 잔여 **0개**(완전 단일화).

**중요 발견 / 원칙**
- 보조 셀렉터의 가로 스크롤은 "선택지 일부가 화면 밖에 숨음" = 발견성 손실. 항목이 한 화면에 들어가면 줄바꿈(wrap)이 우월. **가로 유지 기준 = 항목 수·라벨 길이로 한 화면 초과**(28일·챕터필터)뿐.
- MapView 챕터 탭 div는 `justifyContent:'center'`라 `gt-wrap`(기본 flex-start)으로 바꾸면 정렬 회귀 → **div는 그대로, 버튼만 `gt-chip`**으로 모션만 통일.
- 동일 transition 문자열이 인라인에 분산되면 토큰화 의미가 없음 → **클래스 1곳으로 모아야 진짜 단일화**.

**검증**: babel JSX 블록 esbuild 파싱 **0 오류**. `function` 67개 유지·`ReactDOM.createRoot` 1개. `gt-chips` 2(가로유지)·`gt-wrap` 5·`gt-chip` 10·인라인 0.15s transition 0. index.html 8079→**8087줄**. (헤드리스 Chrome 금지 → 줄바꿈 레이아웃·모션 시각검증은 Tyler 실기기 몫.)

**종료 상태**: index.html **미커밋**(시각 변화 동반 → 실기기 확인 후 커밋 권장, F2 원칙). sw.js 무변경 → **SW v5 유지**. working tree = index.html 1파일 변경 + 본 문서 갱신.

**보류 / 다음 세션 ground truth**
- 🔴 **실데이터 입력**(Tyler 직접): 호텔·항공 예약번호, 미식 예약 상태, 가계부 통화·초기 예산.
- 🔴 **실기기 아이폰 QA**(헤드리스 금지): 13차 변경 실측 — ① 5개 보조 셀렉터 **줄바꿈 펼침**(날씨 9개 도시 2줄 등 과하지 않은지), ② 칩 선택 시 **0.15s 전환 모션** 자연스러움, ③ 가로 유지 2곳(타임라인·챕터필터) 무회귀.
- 🟡 남은 코드: 시각 일관화 잔여(비표준 radius·자간, 보류된 디자인 정리)뿐. 🟢 동결 후: 사진→여정 자동정렬, PWA 예약 D-1 푸시, 사진·메모 Supabase Storage 동기화.

---

## 2026-06-03 (12차) — 공동작업 디테일 + 첫 로드 defer + 골드 글로시 확장 + 데일리/출발 포커스

**시작 상태**: `origin/main`==`2a5aedf`(코드), 로컬 HEAD==`6c38255`(11차 문서커밋 `c46dd47`·`6c38255` 미푸시 상태). working tree clean.

**한 일** (REVIEW P2 통합 우선순위 기준, 6커밋·전부 푸시 또는 푸시 대기)
1. **공동작업 디테일(P2 #6)** → `a70bbbd`. ① **swipe 발견성**: `SwipeRow`에 첫 1회 nudge(공동 수정기록 있는 첫 항목만 −34px 열렸다 닫힘, `localStorage('swipe_hinted')` 영구·reduced-motion 제외) + 상시 chevron(`pointerEvents:'none'`로 기존 탭 무회귀). ② **LWW 메모 충돌 인디케이터**: `NoteEditor`가 원격 변경을 무조건 덮어써 동시편집 손실되던 버그 수정 — `baseRef`+dirty 추적으로 편집 중이면 내 입력 보존 + ⚠️ 배너([상대 버전으로]/[내 입력 유지]).
2. **첫 로드 성능** → `365476a`. React·ReactDOM·supabase·babel 4개 `defer` — 동기 스크립트(babel 324KB)가 막던 로딩 스플래시 즉시 페인트. babel-standalone은 `DOMContentLoaded` 변환이라 defer 호환.
3. **골드 글로시 확장** → `367d789`. 무채 챕터 카드의 금빛 글로시를 4곳으로 절제 확장: Lifetime 산물 카드(`gt-gold-edge`)·헤더 구분선(`gt-gold-line` 가로 sheen `::after`)·하단네비 활성 탭·확정 배지(의미색 유지+`gt-gold-glow` 광택만). 가로 keyframe `gtGoldSheenX` 신설, reduced-motion 전부 정지.
4. **데일리 "지금" 포커스** → `5305877`. Today 카드 최상단 ⏱️ 지금 포커스 배너 — 현재 시각(아침/오후/저녁) 기준 다음 행동 1줄 + 🌟예약 식당 알림 + 저녁엔 🧳내일 이동 D-1. 추가 전용, during phase만.
5. **출발 준비 요약** → `69fb1ec`. 체크리스트 탭 최상단 요약 — 전체 완료율 + 8섹션 흩어진 긴급 미완료(`urgent && !checked`)를 '🔴 지금 예약·확정할 것 N건'으로 집약(url은 예약 링크 칩, 상위 6+초과 카운트). 항목 정렬 안 해 체크 시 점프 없음.

**중요 발견 / 원칙**
- `NoteEditor`의 `useEffect(()=>setVal(note.content),[note.content])`가 LWW 손실의 근원 — 원격 도착 시 textarea 무조건 덮어씀. baseRef 기준값으로 dirty 판별해야 동시편집 보존됨.
- 골드 **확정 배지는 의미색(초록=확정) 유지 + glow만** — green→gold 전환은 status 색 체계(🔴🟡✅) 붕괴 + 다수 노출 과용이라 배제(quiet luxury).
- `<>` Fragment 금지 재확인(Babel standalone) — 출발 준비 요약 칩은 a/div 분기로 처리.

**검증**: 매 변경 후 esbuild로 babel JSX 블록 파싱 **0 오류**, `function` 67개 유지, `ReactDOM.createRoot` 단일. (헤드리스 Chrome 금지 → 런타임 시각검증은 Tyler 실기기 몫.)

**종료 상태**: `a70bbbd`·`365476a`는 푸시됨(라이브 반영). `367d789`·`5305877`·`69fb1ec` **미푸시**(Tyler 수동 푸시 대기). sw.js 무변경 → **SW v5 유지**. index.html **8079줄**. working tree clean.

**보류 / 다음 세션 ground truth**
- 🔴 **실데이터 입력**(Tyler 직접): 호텔·항공 예약번호, 미식 예약 상태, 가계부 통화·초기 예산.
- 🔴 **실기기 아이폰 QA**(헤드리스 금지): 12차 변경 실측 — ① swipe nudge·chevron, ② **메모 동시편집 충돌 배너**(두 기기 필요), ③ **defer 후 첫 화면 정상 표시**(흰화면 아닌지·babel 변환), ④ 골드 글로시 4곳 과용 여부(특히 하단네비·확정 배지 다수), ⑤ during phase '지금 포커스' 배너(TRIP_START 임시 당겨 확인), ⑥ 출발 준비 요약.
- 🟡 남은 코드: 마이크로 인터랙션·시각 일관화(P2 낮음). 🟢 동결 후: 사진→여정 자동정렬, PWA 예약 D-1 푸시, 사진·메모 Supabase Storage 동기화.

---

## 2026-06-03 (10·11차) — REVIEW 동기화 + 금빛 테두리 + 디자인 규격 토큰화

**시작 상태**: `origin/main`==`495a44f`(10차 8커밋은 푸시됐으나 REVIEW.md는 9차 `f0e0548`에 머물러 미문서화 상태).

**한 일**
1. **REVIEW 10차 갱신** — 미문서화 커밋 8개(`1f672c2`~`495a44f`: 홈 동선 타임라인·챕터→일정 연결·`DAY_RECS` day별 추천·`LOCAL_EATS` 로컬 맛집·체크/패킹 탭 통합·챕터 필터 sticky) 정리. → 커밋 `f031320`, 푸시 완료.
2. **금빛 glossy 테두리** — 도시색이 무채색(`#F5F5F4`)인 챕터는 서막('p')·귀국('ret') 둘뿐 → 이들이 그려지는 **28일 일정 카드(Day1·27·28)**의 왼쪽 띠를 `.gt-gold-edge`로 교체(다중스톱 금 그라데이션·화이트 하이라이트·골드 glow·`gtGoldSheen` 4.5s, `prefers-reduced-motion` 정지). ChapterProgress는 p/ret를 필터로 제외하므로 대상 아님.
3. **디자인 규격 검토 + 안전 정리(시각 무변화 한정)** — Explore 에이전트 전수 검토 후 grep으로 사실 확인. 적용분: 인라인 `#fff` 7곳 → `var(--color-atomic-white)`(canvas `#ffffff` 제외), `fontFamily` 하드코딩 2곳 → `var(--font-sans)`. → 커밋 `2129a31`.
4. **REVIEW 11차 갱신** → 커밋 `2a5aedf`. (`f031320`→`2a5aedf`까지 푸시 완료)
5. **SESSION_LOG 신규** → `c46dd47`.
6. **LESSONS 보강** — 디자인 토큰 교훈 추가(C5 토큰 이름≠값, C6 토큰화≠무변화, C7 box-shadow 그라데이션 불가→`::before`, D5 에이전트 리포트 grep 검증, D6 모호 요청 데이터 기준 범위 확정).

**중요 발견**
- `--color-text-inverse`는 순백이 아니라 `--color-atomic-cream-50`(크림) → 흰색 대체엔 반드시 `--color-atomic-white` 사용.
- `body`는 이미 `var(--font-sans)`(Pretendard)였으나 App 루트(`1817`)가 `-apple-system`으로 덮어써 **한글 본문이 사실상 애플고딕으로 렌더되던 불일치**를 정상화 → 한글이 Pretendard로 통일됨(미세 시각 변화 동반).

**검증**: esbuild 인라인 JSX 파싱 0 오류. `var(--color-atomic-white)` 18곳·`var(--font-sans)` 22곳·apple-system 하드코딩 0.

**종료 상태**: 코드(`index.html`)는 `2a5aedf`까지 푸시됨(`origin/main`). 이후 문서 커밋 `c46dd47`(SESSION_LOG) + LESSONS·SESSION_LOG 보강 커밋은 **미푸시**(Tyler 수동 푸시 대기). sw.js 무변경 → SW v5 유지. *앱 동작은 라이브에 모두 반영됨, 미푸시분은 문서뿐.*

**보류 / 다음 세션 ground truth**
- 🔴 **실데이터 입력**(Tyler 직접): 호텔·항공 확정 예약번호, 미식 예약 상태, 가계부 통화·초기 예산. *코드 아님.*
- 🔴 **실기기 아이폰 QA**(Tyler 직접, 헤드리스 금지): 10·11차 변경 실측 — ① **gold edge 금빛 광택**(서막/귀국 카드), ② **한글 본문 Pretendard 전환** 확인, ③ 동선 타임라인·챕터 필터 sticky·로컬 맛집·day별 추천·체크/패킹 통합.
- 🟡 **보류된 디자인 정리**(시각 변화 동반이라 미적용): 한글 라벨 자간 px(`0.2px`) → `--track-label`(자간 벌어짐), `borderRadius:8px` 24곳(토큰 스케일에 8px 없음 → 일괄 변경 시 모서리 회귀 위험).
- 🟡 P2: 공동작업 swipe 발견성 힌트, 마이크로 인터랙션 일관화.
