# Grand Tour 2026 — 세션 로그

> 각 entry는 한 세션의 작업 기록. **마지막 entry = 다음 세션의 ground truth.**
> 상세 현황·로드맵은 `REVIEW.md`, 작업 가이드는 `CLAUDE.md` 참조.

---

## 2026-06-03 (10·11차) — REVIEW 동기화 + 금빛 테두리 + 디자인 규격 토큰화

**시작 상태**: `origin/main`==`495a44f`(10차 8커밋은 푸시됐으나 REVIEW.md는 9차 `f0e0548`에 머물러 미문서화 상태).

**한 일**
1. **REVIEW 10차 갱신** — 미문서화 커밋 8개(`1f672c2`~`495a44f`: 홈 동선 타임라인·챕터→일정 연결·`DAY_RECS` day별 추천·`LOCAL_EATS` 로컬 맛집·체크/패킹 탭 통합·챕터 필터 sticky) 정리. → 커밋 `f031320`, 푸시 완료.
2. **금빛 glossy 테두리** — 도시색이 무채색(`#F5F5F4`)인 챕터는 서막('p')·귀국('ret') 둘뿐 → 이들이 그려지는 **28일 일정 카드(Day1·27·28)**의 왼쪽 띠를 `.gt-gold-edge`로 교체(다중스톱 금 그라데이션·화이트 하이라이트·골드 glow·`gtGoldSheen` 4.5s, `prefers-reduced-motion` 정지). ChapterProgress는 p/ret를 필터로 제외하므로 대상 아님.
3. **디자인 규격 검토 + 안전 정리(시각 무변화 한정)** — Explore 에이전트 전수 검토 후 grep으로 사실 확인. 적용분: 인라인 `#fff` 7곳 → `var(--color-atomic-white)`(canvas `#ffffff` 제외), `fontFamily` 하드코딩 2곳 → `var(--font-sans)`. → 커밋 `2129a31`.
4. **REVIEW 11차 갱신** → 커밋 `2a5aedf`. 전부 푸시 완료.

**중요 발견**
- `--color-text-inverse`는 순백이 아니라 `--color-atomic-cream-50`(크림) → 흰색 대체엔 반드시 `--color-atomic-white` 사용.
- `body`는 이미 `var(--font-sans)`(Pretendard)였으나 App 루트(`1817`)가 `-apple-system`으로 덮어써 **한글 본문이 사실상 애플고딕으로 렌더되던 불일치**를 정상화 → 한글이 Pretendard로 통일됨(미세 시각 변화 동반).

**검증**: esbuild 인라인 JSX 파싱 0 오류. `var(--color-atomic-white)` 18곳·`var(--font-sans)` 22곳·apple-system 하드코딩 0.

**종료 상태**: `origin/main`==`2a5aedf` (working tree clean). index.html만 변경, sw.js 무변경 → SW v5 유지.

**보류 / 다음 세션 ground truth**
- 🔴 **실데이터 입력**(Tyler 직접): 호텔·항공 확정 예약번호, 미식 예약 상태, 가계부 통화·초기 예산. *코드 아님.*
- 🔴 **실기기 아이폰 QA**(Tyler 직접, 헤드리스 금지): 10·11차 변경 실측 — ① **gold edge 금빛 광택**(서막/귀국 카드), ② **한글 본문 Pretendard 전환** 확인, ③ 동선 타임라인·챕터 필터 sticky·로컬 맛집·day별 추천·체크/패킹 통합.
- 🟡 **보류된 디자인 정리**(시각 변화 동반이라 미적용): 한글 라벨 자간 px(`0.2px`) → `--track-label`(자간 벌어짐), `borderRadius:8px` 24곳(토큰 스케일에 8px 없음 → 일괄 변경 시 모서리 회귀 위험).
- 🟡 P2: 공동작업 swipe 발견성 힌트, 마이크로 인터랙션 일관화.
