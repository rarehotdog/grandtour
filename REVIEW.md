[REVIEW.md](https://github.com/user-attachments/files/28381532/REVIEW.md)
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
| **index.html** | 5,965줄 · ~240KB |
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
🗺️ 지도 · 🏨 호텔 · ✈️ 항공 · 💱 환율 · 🌤️ 날씨
🍽️ 미식 · 💰 비용 · 🌐 번역 · 🎵 음악 · 👗 복장
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

## 5. 잔여 백로그

| 항목 | 임팩트 | 난이도 | 비고 |
|---|---|---|---|
| Supabase 동기화 | 주연과 실시간 공유 | 높음 | 풀스택 마이그레이션 필요 |
| 사진 갤러리 영상 | 추억 보존 | 중간 | IDB 용량 검토 필요 |
| PWA 백그라운드 푸시 | 진짜 저녁 알림 | 높음 | VAPID 키 + 서버 필요 |
| 비표준 font-size 잔존 | 코드 품질 | 낮음 | 여행 후 정리 |

> ⚠️ **코드 동결 권장일: 2026-06-08 (출발 1주 전)**

---

## 6. 운영 메모

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
