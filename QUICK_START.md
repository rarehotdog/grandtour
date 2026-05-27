# 🚀 새 Claude 세션 시작 프롬프트

> 새 채팅 / Claude Code 시작할 때 이거 그대로 복붙

---

## 🟢 시나리오 1: Claude Code (터미널)

### 첫 번째 메시지

```
이 프로젝트의 CLAUDE.md 파일 먼저 읽고 컨텍스트 파악해줘. 
그리고 현재 companion_app.jsx 구조 한 번 훑어주고 (각 섹션 위치만), 
어디까지 진행됐는지 요약해줘.

그 다음에 내가 작업 지시할게.
```

### 사이클 예시

```
1. 사용자: "환율 위젯에 JPY 추가해줘"
2. Claude Code: companion_app.jsx의 ExchangeRates 컴포넌트 수정
3. Claude Code: python3 build_html.py 자동 실행
4. Claude Code: 로컬 open index.html 으로 검증
5. 사용자: "OK, 푸시해줘"
6. Claude Code: git add . && git commit -m "..." && git push
7. 30초 후 https://grandtour-lilac.vercel.app/ 자동 배포
```

### 셋업 (한 번만)

```bash
git clone https://github.com/rarehotdog/grandtour.git
cd grandtour
ls
# CLAUDE.md  README.md  build_html.py  companion_app.jsx  index.html  vercel.json

claude  # Claude Code 시작
```

---

## 🟡 시나리오 2: 다른 Claude 채팅 (claude.ai 웹/앱)

### 첨부 파일

다음 3개 파일을 첨부:
1. `CLAUDE.md` (반드시)
2. `companion_app.jsx` (메인 소스)
3. `build_html.py` (빌드 스크립트)

선택 (도움됨):
- `index.html` (현재 배포된 결과)
- `claude_code_guide.md` (장기 업그레이드 가이드)

### 첫 번째 메시지

```
첨부한 CLAUDE.md를 먼저 다 읽고 컨텍스트 파악해줘. 
이 신혼여행 동반자 앱 이어서 개발할 거야.

현재 상태:
- 배포 URL: https://grandtour-lilac.vercel.app/
- GitHub: https://github.com/rarehotdog/grandtour
- D-Day: [현재 날짜 기준 2026.06.15까지]

오늘 작업: [여기에 요청 작성]

작업 후에는 반드시:
1. 수정된 companion_app.jsx 전체 또는 변경 부분
2. 변경된 index.html (build_html.py 돌린 결과)
3. 변경 요약 (어떤 라인, 무슨 이유, 어떤 효과)
이렇게 3가지 산물 줘.
```

### 산물 받은 후 → GitHub 푸시

```
1. companion_app.jsx 다운로드 → 로컬 폴더에 저장
2. index.html 다운로드 → 로컬 폴더에 저장
3. https://github.com/rarehotdog/grandtour 접속
4. 우상단 "Add file ▾" → "Upload files"
5. 두 파일 드래그 (같은 이름 덮어쓰기)
6. Commit message 작성 → Commit
7. 30초 대기 → 라이브 URL 확인
```

---

## 🔵 시나리오 3: 빠른 수정 (소소한 텍스트 변경)

소스 다운로드 없이 GitHub 웹에서 직접:

1. https://github.com/rarehotdog/grandtour
2. `index.html` 클릭 → 우상단 **연필 (✏️)** 아이콘
3. 텍스트 검색 (Cmd+F): 바꾸고 싶은 부분
4. 직접 편집
5. 페이지 하단 → Commit changes
6. 30초 후 라이브 반영

⚠️ 단, 이 방법은 `index.html`만 바뀌고 `companion_app.jsx`와 비동기화됨. 다음 빌드 시 덮어쓰기 되니까, 소소한 임시 수정에만 권장.

---

## 🎯 작업 요청 좋은 예시 / 나쁜 예시

### ✅ 좋은 예시

```
"companion_app.jsx의 WeatherWidget 컴포넌트에 강수 확률 표시 추가해줘. 
Open-Meteo API의 daily.precipitation_probability_max 필드 쓰면 됨.
표시 위치: 현재 기온 옆에 '💧 X%' 형태로.
빌드해서 index.html도 같이 줘."
```

```
"7월 9일 At.mosphere 예약 정보 업데이트:
- 예약 번호: ABC123
- 확정 날짜: 2026-05-15
- 메뉴: 8-course tasting
RESTAURANTS 배열의 R9 항목 찾아서 conf 필드 추가하고, 
상태도 'pending' → 'confirmed'로 디폴트 변경해줘."
```

### ❌ 나쁜 예시

```
"앱을 좀 더 좋게 만들어줘"  ← 너무 모호
"새 기능 추가해줘"           ← 어떤 기능?
"디자인 깔끔하게"             ← 어디가, 어떻게?
```

---

## 🧰 자주 쓰는 Claude Code 명령

```bash
# 빠른 빌드 + 푸시
claude "지금 jsx 빌드해서 git push까지 자동으로 해줘"

# 특정 라인 부근 보기
claude "companion_app.jsx 1820라인 근처 ExchangeRates 컴포넌트 보여줘"

# 검증
claude "지금 jsx에 컴포넌트 함수가 몇 개야? grep 돌려서 확인해줘"

# 백로그 진행
claude "CLAUDE.md 백로그에서 ★★★ 항목 중 하나 골라서 작업 제안해줘"
```

---

## 🚨 비상 상황: 라이브 사이트가 깨졌을 때

### 즉시 롤백

1. https://vercel.com/dashboard 접속
2. `grandtour` 프로젝트 클릭
3. "Deployments" 탭
4. 잘 작동하던 이전 버전 옆 **점 3개 (⋯)**
5. "Promote to Production"
6. 5초 안에 그 버전으로 복원

### 다음 단계: 깨진 원인 찾기

1. https://grandtour-lilac.vercel.app/ 에서 브라우저 콘솔 (F12) 열기
2. 빨간 에러 메시지 복사
3. 다음 Claude 세션에:
   ```
   사이트가 깨졌어. 에러 메시지:
   [복붙]
   
   최근 변경: [무엇을 바꿨는지]
   롤백한 커밋: [Vercel에서 본 hash]
   
   원인 분석하고 수정해줘.
   ```

---

## 💡 팁

1. **CLAUDE.md 업데이트 잊지 말기** — 큰 구조 변경했으면 CLAUDE.md도 같이 수정해서 푸시
2. **백업** — 큰 변경 전에 홈 화면 "📦 백업 다운로드" 1회
3. **세션 분리** — 한 세션에서 너무 많이 일하지 말기 (Claude의 컨텍스트 길어지면 느려짐). 큰 마일스톤마다 새 세션
4. **여행 1주 전부터는 코드 동결** — 데이터만 입력하고 기능 추가는 멈춰 (안정성)
5. **여행 중에는 Claude 안 부르기** — 백업/롤백만 활용

---

좋은 여행 + 좋은 개발 되길!
