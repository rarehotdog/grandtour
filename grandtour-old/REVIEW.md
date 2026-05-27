# Grand Tour 2026 — 코드 점검 리뷰

> 대상: `~/Desktop/grandtour/index.html` (3,339줄, 단일 파일 React)
> 점검일: 2026-05-27 · 점검자: Claude (opus-4.7)
> 맥락: 6/15 출발 신혼여행 동반자 앱. **여행 중 해외에서 모바일로 쓰는 것**이 전제이므로, 오프라인·네트워크 불안정·아이폰 PWA 환경이 평가의 핵심 기준이다.

## 우선순위 요약

| # | 항목 | 심각도 | 위치 |
|---|------|--------|------|
| 1 | CDN 런타임 의존 + 오프라인 미대응 → 비행기/해외 데이터 없으면 **앱이 안 뜸** | 🔴 높음 | `<head>` 24-26 |
| 2 | 아이폰 노치/홈 인디케이터 미대응 → 하단 탭(🔒 포함) 가림 | 🔴 높음 | 5, 3292-3304 |
| 3 | "PWA"라 적혀 있으나 manifest·Service Worker 없음 (설치/오프라인 불가) | 🔴 높음 | `<head>` |
| 4 | `o11` 산물이 존재하지 않는 챕터 `'tx'` 참조 (데이터 버그) | 🟡 중간 | 601 |
| 5 | D-Day/phase가 마운트 1회만 계산 → 자정·여행 시작 전환 안 됨 | 🟡 중간 | 660 |
| 6 | 사진 base64를 localStorage에 저장 → 5MB 한도 근접, 초과 시 저장 실패 | 🟡 중간 | 762, storage |
| 7 | 에러 바운더리 없음 → 컴포넌트 1개 throw 시 전체 흰 화면 | 🟡 중간 | 전역 |
| 8 | 백업(JSON)에 `pin`·`fx_cache` 누락, 사진 통째 포함으로 파일 비대 | 🟡 중간 | 830-876 |
| 9 | 데드코드: `Notes`/`Outputs` 구버전 컴포넌트 미사용 (~120줄) | ⚪ 낮음 | 2580, 2645 |
| 10 | 환율 fetch 타임아웃 없음 → 느린 망에서 "불러오는 중…" 무한 가능 | ⚪ 낮음 | 3051 |
| 11 | 매 렌더마다 `DAYS/HOTELS/FLIGHTS` 재생성 (useMemo 가능) | ⚪ 낮음 | 691-693 |
| 12 | `CLAUDE.md` 가이드가 미구현 기능(날씨·미식·갤러리)을 있는 것처럼 문서화 | ⚪ 낮음 | (문서) |
| 13 | PIN·사진이 평문 localStorage (실보안 아님) — 설계 의도지만 명시 필요 | ⚪ 낮음 | (설계) |

---

## 🔴 높음 — 여행 안정성 직결

### 1. CDN 런타임 의존 → 오프라인이면 앱이 아예 안 뜬다 (가장 중요)
`<head>` 24-26에서 React·ReactDOM·**Babel**을 전부 `cdnjs.cloudflare.com`에서 실시간으로 받는다. 게다가 `type="text/babel"`이라 매 실행마다 3,300줄을 브라우저에서 컴파일한다.
- **문제**: 비행기(기내 와이파이 X), 입국 직후 유심 전, 산토리니·돌로미티 산간 등 **네트워크가 끊기면 흰 화면**. 여행용 앱인데 정작 여행 중 못 쓸 수 있다. 첫 로딩도 Babel 컴파일로 1초+ 느림.
- **개선(택1)**:
  - (권장) React/ReactDOM/Babel 3개 파일을 repo에 동봉하고 `<script src="./vendor/...">`로 로컬 참조 + **Service Worker로 index.html·vendor·사진을 캐싱**. 한 번 연 뒤엔 오프라인에서도 동작.
  - (차선) 최소한 `babel-standalone`만이라도 빌드 타임에 한 번 컴파일해 순수 JS로 박아넣기(런타임 Babel 제거). 단일 파일 철학과 충돌하면 보류.

### 2. 아이폰 노치/홈 인디케이터 미대응
5번 줄에 `viewport-fit=cover`는 켜져 있는데, 코드 어디에도 `env(safe-area-inset-*)`가 없다(검색 0건). 하단 `BottomNav`는 `position:fixed; bottom:0; padding:8px 0 16px`(3292-3304).
- **문제**: 홈 인디케이터가 있는 아이폰(X 이후)에서 하단 탭, 특히 맨 오른쪽 **🔒(비공개) 탭**이 인디케이터 바에 겹쳐 터치가 어렵다.
- **개선**: BottomNav `paddingBottom`을 `calc(16px + env(safe-area-inset-bottom))`로, App 컨테이너 `paddingBottom`(884: `80px`)도 safe-area 더해 조정.

### 3. "PWA" 표방 vs 실제
`apple-mobile-web-app-capable=yes`만 있고 `manifest`·`serviceWorker` 등록은 0건. 즉 홈 화면 추가는 되지만 **진짜 설치형·오프라인 PWA가 아니다**. `CLAUDE.md`의 "iPhone Safari 풀스크린 PWA" 설명과 불일치.
- **개선**: 1번과 함께 `manifest.webmanifest`(아이콘·이름·`display:standalone`) 추가 + SW 등록. 단일 파일 유지하려면 manifest는 data URI로도 가능.

---

## 🟡 중간 — 데이터/UX

### 4. `o11` 산물이 유령 챕터 `'tx'` 참조 (데이터 버그)
601: `{ id: 'o11', ..., ch: 'tx', ... }`. 그런데 `CHAPTERS`에 `'tx'`는 없다(과거 FCO 완충 챕터가 제거된 잔재). 1824에서 필터가 `'tx'`를 방어적으로 제외하고는 있으나, o11을 챕터로 매핑하는 곳에서는 `undefined`가 나와 색상/이름이 비거나 깨질 수 있다.
- **개선**: `o11`의 `ch`를 실제 챕터(예: Day 18 일정에 맞는 챕터 id)로 교정. 동시에 1824의 `'tx'` 필터 잔재도 정리.

### 5. D-Day가 마운트 1회만 계산
660: `const [status] = useState(getCurrentStatus())` — 이후 갱신 안 됨. 앱을 띄워둔 채 **자정을 넘기거나 여행이 시작돼도** `phase`(pre→during)·D-Day가 새로고침 전까지 안 바뀐다.
- **개선**: `useEffect`로 일정 간격(예: 1분~1시간) 재계산하거나, 화면 포커스(`visibilitychange`) 시 재계산.

### 6. 사진 base64 → localStorage 한도
762에서 사진을 `data:` base64로 `photos` 키에 저장. 28장×~100KB ≈ 2.8MB로 5MB 한도에 근접. 초과 시 `storage.set`이 `QuotaExceededError` alert만 띄우고 **조용히 저장 실패**(이미 화면엔 보이는데 새로고침하면 사라짐).
- **개선(중장기)**: 사진은 IndexedDB로 분리(용량 수백 MB). 단기로는 압축 더 강하게(가로 800px/0.6) + 저장 성공 여부를 UI로 피드백.

### 7. 에러 바운더리 없음
React `ErrorBoundary`가 없어 어떤 컴포넌트든 렌더 중 예외가 나면 **전체가 흰 화면**이 되고, 여행 중엔 복구 수단이 없다.
- **개선**: 최상위에 ErrorBoundary 추가 — "문제가 생겼어요 / 새로고침" + 백업 내보내기 버튼 노출.

### 8. 백업 완전성/크기
`exportData`(830)는 8개 키만 담고 `pin`·`fx_cache`는 제외. PIN 제외는 의도일 수 있으나, 기기 교체·복원 시 PIN을 다시 설정해야 함을 사용자가 모른다. 또 `photos`가 JSON에 통째로 들어가 백업 파일이 수 MB가 된다.
- **개선**: 복원 화면에 "PIN은 복원되지 않음" 안내. 사진 제외 옵션(텍스트만 백업)을 추가하면 가볍게 공유 가능.

---

## ⚪ 낮음 — 정리/유지보수

### 9. 데드코드: `Notes`(2580)·`Outputs`(2645)
JSX에서 `<Notes`/`<Outputs` 호출 0건 확인. 실제로는 `NotesInner`/`OutputsInner`(Private 내부)가 쓰인다. 약 120줄 안전하게 삭제 가능.

### 10. 환율 fetch 타임아웃 없음
`ExchangeRates`(3051)의 `fetch`에 `AbortController` 타임아웃이 없다. 느린/반응 없는 망에서 응답이 안 오면 "환율 불러오는 중…"이 계속 남는다(캐시 폴백은 fetch가 reject돼야 작동).
- **개선**: 8~10초 `AbortController`로 끊고 catch로 캐시 폴백 태우기. (참고: 이건 이번에 추가한 위젯이라 자기 점검 항목)

### 11. 매 렌더 재계산
691-693에서 `DAYS/HOTELS/FLIGHTS`를 매 렌더마다 `.map()`으로 재생성. 데이터가 작아 체감 영향은 없으나 `useMemo([edits])`로 묶을 수 있다.

### 12. 문서 ↔ 코드 불일치
`CLAUDE.md`가 WeatherWidget·RestaurantTracker·PhotoGallery를 구현된 것처럼 기술하나 실제 코드엔 없다(환율 위젯은 이번에 추가됨). 가이드를 실제 상태로 정정하거나, 해당 기능을 구현해 맞추는 결정 필요.

### 13. PIN·사진 평문 저장 (설계 명시)
PIN(`pin` 키)·사진 모두 localStorage 평문. 클라이언트 전용이라 **실제 보안이 아니라 가림막**이다. 의도된 설계지만, 민감 메모를 다룬다면 사용자가 이 한계를 알아야 한다.

---

## 권장 처리 순서
1. **출발 전 필수**: #1 오프라인(CDN+SW), #2 safe-area, #7 에러 바운더리 — 여행 중 "앱이 안 뜸/안 눌림/흰 화면"을 막는 3종.
2. **데이터 안전**: #6 사진 저장, #8 백업 안내 — 추억 유실 방지.
3. **빠른 정리**: #4 `tx` 데이터 버그, #9 데드코드, #10 fetch 타임아웃, #12 문서 — 저위험·빠른 개선.

## 적용 이력
- **2026-05-27 — "출발 전 필수" 적용 완료**: #1 오프라인(Service Worker `sw.js` + manifest, CDN 캐싱·network-first), #2 safe-area(Header top / App·BottomNav bottom inset), #3 PWA manifest, #7 ErrorBoundary 추가. 변경/신규 파일: `index.html`, `sw.js`(신규), `manifest.webmanifest`(신규), `vercel.json`(sw.js 캐시 헤더).
  - 검증: Babel 트랜스파일·JSON·sw.js 문법 통과, localhost 서빙 확인. **단 SW 오프라인 동작은 HTTPS(배포) 또는 localhost 에서만 검증 가능** — `file://` 직접 열기로는 등록 안 됨.
- **남은 권장 항목**: #4 `tx` 데이터 버그, #5 D-Day 갱신, #6 사진 IndexedDB, #8 백업 안내, #9 데드코드, #10 fetch 타임아웃, #11 useMemo, #12 문서 정정, #13 보안 명시.

> 다음 항목을 지정해 주면 `index.html`에 바로 반영한다.
