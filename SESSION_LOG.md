# Grand Tour 2026 — 세션 로그

> 각 entry는 한 세션의 작업 기록. **마지막 entry = 다음 세션의 ground truth.**
> 상세 현황·로드맵은 `REVIEW.md`, 작업 가이드는 `CLAUDE.md` 참조.

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
