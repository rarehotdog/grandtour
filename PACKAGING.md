# 📦 PACKAGING — "단일 파일 퍼스널 컴패니언 앱" 재사용 틀

> Grand Tour 2026에서 검증한 **틀(frame)**을 규격화한 문서.
> **"내용만 바꾸고 틀은 그대로 가져간다"**를 목표로 함 — 신혼여행 앱 → 출산 준비 / 이직 90일 / 창업 100일 / 학습 챌린지 등 *"기간이 있는 개인 여정 + 매일의 기록 + 사색 산출물"* 형태면 그대로 재사용.
> 정리자: Claude (Opus 4.8) · 2026-05-30

---

## 0. 한 줄 정체성

**기간이 정해진 개인 여정을, 단일 HTML 파일 하나로 담는 모바일 PWA.**
빌드 없음 · 의존성 0 · 서버 0 · localStorage + 선택적 Supabase 동기화 · Vercel 자동배포.

비개발자에 가까운 1인 오너가 *어디서나, 영원히, 혼자서* 유지할 수 있어야 한다 — 이 제약이 모든 설계 결정의 뿌리.

---

## 1. "내용" vs "틀" — 무엇을 바꾸고 무엇을 유지하나

| 층위 | 바꾼다 (내용 = CONTENT) | 유지한다 (틀 = FRAME) |
|---|---|---|
| 데이터 | 챕터·일자·추천·산출물의 *값* | 데이터 **스키마**(아래 §3) |
| 콘텐츠 | 문구·맥락·질문의 *텍스트* | **사색 레이어 패턴**(why/심화질문/가치, §4) |
| 비주얼 | 색·이모지·테마 *값* | **디자인 토큰 구조**(atomic→semantic→scale, §5) |
| 화면 | 위젯의 *종류·개수* | **컴포넌트 골격·라우팅 규약**(§6) |
| 저장 | storage 키 *이름* | **storage 래퍼·동기화·IDB 패턴**(§7) |
| 운영 | 도메인·레포 | **직접편집→push→Vercel 흐름**(§8) |
| 말투 | — | **톤·콘텐츠 규칙**(§9) |

> 규칙: 새 프로젝트는 **§3~§9의 FRAME을 복사**하고, **CONTENT만 새로 채운다.** 틀을 건드리는 순간 재사용성이 깨진다.

---

## 2. 아키텍처 골격 (단일 HTML 1장)

```
index.html
├── <head>
│   ├── PWA 메타 (manifest, theme-color, apple-mobile-web-app)
│   ├── <style> ── 디자인 토큰(:root) + keyframes + 전역 리셋
│   └── CDN: React 18 UMD + Babel standalone
├── <body><div id="root">
└── <script type="text/babel">
    ├── [1] 데이터 상수      ── CONTENT (교체)
    ├── [2] 헬퍼            ── storage / idb / mapsUrl / compressImage / getCurrentStatus
    ├── [3] 컴포넌트         ── 56개, 역할군별 (§6)
    └── [4] 진입점          ── ErrorBoundary > App + ReactDOM.createRoot + SW 등록
sw.js                       ── network-first HTML, cache-first 라이브러리 (버전 상수 1개)
manifest.webmanifest        ── 아이콘(인라인 SVG data-URI) + 단축키
vercel.json                 ── 캐시 헤더 + SAMEORIGIN
```

**불변 규칙**
- 빌드 단계 없음. `index.html` 직접 편집이 유일한 진실.
- JSX Fragment `<>` 금지 → `<div>` / `React.Fragment` (Babel standalone 한계).
- 외부 폰트·이미지는 죽을 수 있다는 전제 → **항상 폴백**(onError → 그래디언트/좌표).

---

## 3. 데이터 스키마 규격 (CONTENT 교체 대상)

Grand Tour의 23개 상수를 **역할**로 일반화. 새 프로젝트는 같은 역할의 상수만 새로 채운다.

| 역할 | GT 예시 | 일반화된 스키마 |
|---|---|---|
| **CHAPTERS** (여정 단위) | 9개 도시 | `{ id, name, icon, theme, tag, color, accent, coords, dates }` — 여정을 나누는 "장(章)". color/accent 페어가 챕터 정체성. |
| **DAYS** (일자 타임라인) | 28일 | `{ n, date, chapterId, title, ...활동필드, ...사색레이어 }` — 하루 = 한 객체. §4 사색 필드 포함. |
| **ITEMS / RECS** (큐레이션) | RECOMMENDATIONS 9×4 | `{ t, why, worth, tip, tag }` — 챕터별 추천. `why`=무엇, `worth`=왜 좋은지. |
| **OUTPUTS** (산출물) | 산물 19개 | `{ id, t, day, ch, desc, star }` — 여정이 남기는 결과물 + 진행 체크. |
| **CHECKLIST / PACKING** | 준비 항목 | `{ id, label, desc, url? }` 카테고리 그룹. |
| **LOOKUP 메타** | CITY_TZ, FX, TRANSPORT… | 위젯이 참조하는 정적 참조표. |

**설계 원칙**
- 모든 엔티티는 **안정적인 `id`**(storage 키로 쓰임) — 텍스트(`t`)를 바꿔도 id는 불변.
- `chapterId`로 DAYS ↔ CHAPTERS ↔ RECS를 조인 (관계형 없이 `filter`로).
- `_DEFAULT` 접미사 = "초기값, 사용자 편집은 `edits` 키에 오버레이"(원본 보존).

---

## 4. 사색 레이어 패턴 ★ (이 틀의 차별점)

각 일자/항목은 **3겹의 깊이**를 가진다. 단순 "무엇"을 넘어 "왜·어떻게·무슨 가치"로 내려간다.

| 레이어 | 필드 | 역할 | 노출 방식 |
|---|---|---|---|
| **맥락** | `why` | 이걸 왜 하는가 — 철학/역사/경제 한 스푼 | 접힘 토글 `▸ 왜 …인가` |
| **심화** | `qchain` | 꼬리를 무는 질문 3개 (점층) | 접힘 토글 `▸ 꼬리를 무는 질문 (n)` |
| **가치** | `worth` | 왜 하면 좋은지 한 줄 | 인라인 `↳ …` |
| **산출** | `desc` | 결과물의 의미 부여 | 카드 부연 |

> 재사용 시: 도메인이 바뀌어도 이 **3겹 구조**는 유지. "여행지 추천"이 "면접 준비 항목"이 되어도 *맥락·심화·가치*는 그대로 적용된다.

---

## 5. 디자인 시스템 (71 토큰, 3계층)

```
Atomic   →  Semantic        →  Scale
색 원자      --color-text-*       --type-{micro…display}  (타입 9단)
            --color-bg-*         --track-* (자간)
            --color-accent-*     --radius-{xs…pill}
            --color-border-*     --ease (모션 1종)
                                 --font-{serif,sans}
```

**규칙**
- 인라인 스타일에 **하드코딩 색/px 금지** → 반드시 `var(--token)`.
- 챕터별 정체성은 `chapter.color`(배경) + `chapter.accent`(강조) **페어**로만.
- 폰트 2종 고정: serif(제목·인용) + sans(본문·한글). 시스템 폰트 폴백.
- 모션 ease 1종(`--ease`)으로 전 화면 통일.

---

## 6. 컴포넌트 골격 (56개 → 역할군)

| 군 | 예시 | 역할 |
|---|---|---|
| **셸** | App, Header, BottomNav, ErrorBoundary | 라우팅(`view`/`subTab` 상태) + safe-area |
| **홈 상태형** | HeroCountdown, TripSummaryCard, RetrospectHero | `getCurrentStatus().phase`(pre/during/post)로 분기 |
| **타임라인** | Days, EditableDayDetail, TimelineStrip | 일자 리스트 + 펼침 상세 |
| **유틸 위젯** | Weather, Exchange, Timezone, Translate, Map… | 독립 위젯, 각자 storage 캐시 |
| **프라이빗** | Private(PIN), NotesInner, OutputsInner | 잠금 영역 (오너 전용) |
| **편집 프리미티브** | EditableField, EditRow | 모든 필드 `✎` 인라인 편집 → `edits` 오버레이 |
| **UI 헬퍼** | Card, SectionTitle, StatCard, SubTab, CopyChip | 재사용 원자 UI |

**라우팅 규약**: 하단 `BottomNav` 5탭 + 탭 내 `subTab`. 새 화면 = 함수 1개 + 라우팅 1줄 + (필요시) storage 키 1개.

**상태형 패턴**: 시간 의존 UI는 `getCurrentStatus()`(pre/during/post) 한 곳에서 분기. D-day·"오늘 카드"·회고 모드가 자동 전환.

---

## 7. 상태 · 저장 (3층)

```
localStorage  ── 일반 상태 (15키: check/notes/edits/packing/…)  ★ storage 비동기 래퍼로만 접근
IndexedDB     ── 용량 큰 것 (사진 base64) — 5MB 한도 회피, 자동 마이그레이션
Supabase      ── 선택적 기기 간 동기화 (gtSync 레이어, Realtime, last-write-wins)
```

**동기화 규약 (SYNC_KEYS)**: 공유할 키만 화이트리스트. **사적인 것(메모·산물·사진·PIN)은 동기화 제외.** publishable 키만 클라이언트에 상수로(공개 안전), secret 키 미사용.

**편집 오버레이**: 원본 `_DEFAULT`는 불변, 사용자 편집은 별도 `edits` 키에 `{타입:{id:{필드:값}}}`로 쌓아 머지. → 앱 업데이트가 사용자 데이터를 안 덮음.

---

## 8. 빌드 · 배포

```
index.html / sw.js 직접 편집
  → git add && commit && push origin main   (push는 오너 수동 — §9)
  → Vercel 30초 자동배포
  → PWA는 SW(network-first HTML)로 새 버전 자동 픽업
```
- `sw.js` 자체를 고칠 때만 `CACHE` 버전 상수 bump(v4→v5).
- 데이터 배열은 JSX가 아니므로 **`node --check`로 구문 검증 가능**(§11).

---

## 9. 톤 · 콘텐츠 규칙 (페르소나 주입)

이 틀의 "목소리"는 프로젝트마다 바뀌지만 **결정 축은 동일**:

1. **독자 정의** — 혼자 보나(개인 사색 1인칭 OK) vs 공유하나(공동 "우리" 톤, 개인 커리어·브랜드명 회피).
2. **공개 vs Private** — 공개 화면은 공동 톤, PIN 영역은 1인칭 사색 허용.
3. **종결 톤** — 친근한 해체("~이야/~돼") vs 격식체. 독자 취향에 맞춰 **전수 통일**.
4. **사색 깊이** — 맥락은 철학/역사/경제를 "한 스푼"씩, 과하지 않게.

> 톤 규칙은 한 번 정하면 **모든 콘텐츠에 일괄 적용**하고 문서에 박아둔다(이 프로젝트: 공동·친근체).

---

## 10. 프롬프트 프레임 ★ (반복 작업 워크플로우 규격)

이 세션에서 반복적으로 작동한 "요청 → 빌딩" 패턴. 새 프로젝트에서도 이 프레임을 그대로 쓴다.

### F1. 콘텐츠 디벨롭 프레임
> "X를 같은 톤으로 디벨롭해줘"
1. 데이터 스키마에 **필드 추가**(예: `why`/`worth`) — 기존 필드 보존
2. 렌더 컴포넌트에 **조건부 노출**(`{item.field && …}`) — 없는 항목도 안전
3. **톤 규칙 적용**(§9) — 전수 통일
4. **파일럿 → 확장**: 1개 챕터 먼저 만들어 톤 합의 → OK 후 나머지
5. **Node 구문검증 + grep 카운트**로 누락·오류 0 확인

### F2. 기능 추가 프레임
> "Y 기능 넣어줘"
1. 데이터 상수(필요시) → 2. 컴포넌트 함수 1개 → 3. 라우팅 1줄(BottomNav/subTab) → 4. storage 키(필요시) → 5. 상태형이면 `getCurrentStatus` 분기

### F3. 대량 데이터 편집 프레임
- 한 줄=한 객체일 땐 **유니크 텍스트로 객체별 Edit**
- 블록(도시 등)일 땐 **블록 통째 교체**가 개별 Edit보다 안전·효율
- 편집 후 **`node --check`(데이터 배열만 추출)** + **격식체/잔재 grep**

### F4. 검증 프레임 (배포 전 필수)
```
node --check (데이터 배열 추출)   # JS 구문
grep -c "패턴"                    # 개수 일치 (28일/108추천 등)
괄호 균형 awk | grep -o '[(){}]'  # JSX 균형
미정의 토큰 grep                  # var(--없는토큰) 0 확인
```

### F5. 리뷰·정리 프레임
- 작업 후 `REVIEW.md` 갱신: ① 현 상태 표 ② 커밋 이력 ③ **다음 개선 통합 우선순위 표**(분류: 출발 전 필수/체감 품질/여유)
- 우선순위 기준 문장을 고정: *"5초 효용 + 실패 시 타격"*

---

## 11. 새 프로젝트 부트스트랩 체크리스트

```
[ ] index.html 복사 → 데이터 상수(§3) 전부 새 도메인으로 교체
[ ] CHAPTERS color/accent 페어 재설계 (정체성)
[ ] 사색 레이어(§4) 필드 채우기 — 파일럿 1챕터 → 확장
[ ] 톤 규칙(§9) 한 줄로 확정해 문서화
[ ] storage 키 이름만 도메인에 맞게, 래퍼/오버레이 구조 유지
[ ] sw.js CACHE 이름 + manifest 아이콘(SVG data-URI) 교체
[ ] vercel.json 그대로, 새 레포 연결
[ ] 검증 프레임(F4) 통과 후 첫 배포
[ ] REVIEW.md + LESSONS.md 새로 시작
```

---

## 부록: 이 틀이 안 맞는 경우

- 다중 사용자·실시간 협업이 **핵심**(단순 공유 넘어) → 진짜 백엔드 필요, 이 틀 부적합
- 콘텐츠가 수천 건 → 단일 파일·localStorage 한계, DB 필요
- SEO·공개 마케팅 페이지 → SSR 프레임워크가 맞음

이 틀은 **"1인 오너의, 기간이 있는, 사적인 여정 기록"**에 최적화돼 있다. 그 밖으로 나가면 단순함의 이점이 사라진다.
