# 🐝 Vibe English Harness Studio

> **2022 개정 교육과정 및 수능/모의고사 연계 고등학교 영어과 에이전틱 플랫폼**  
> 『에이전트 하네스 워크북』의 6겹 가드레일(가이드, 센서, 루프, 메모리, 권한, 관측) 구조를 적용하여 학생의 자기주도적 언어 기능(듣기·읽기·말하기·쓰기 및 통합 연계) 성장을 지원하고, 교육부 규격에 부합하는 생활기록부 교과세특을 실시간 자동 생성합니다.

---

## 🌟 핵심 기능 (Key Features)

### 1. 6-Layer 에이전트 하네스 가드레일 (Agentic Harness)
- **1겹 Guide (가이드)**: 2022 개정 교육과정 성취기준 코드, 평가 루브릭, 난이도(CEFR/Lexile) 자동 매핑
- **2겹 Sensor (센서)**: 어휘 다양성(TTR), 문맥 적합도, 발화 유창성(WPM), AI 표절 감지 실시간 피드백
- **3겹 Loop (루프/자가수정)**: 실패 시 정답을 주지 않고 소크라테스식 발문과 스캐폴딩 힌트로 스스로 수정 유도
- **4겹 Memory (메모리/Handoff)**: 1단계 코넬 메모·핵심 증거를 2단계 작문/스피치 과업으로 유실 없이 전이
- **5겹 Permission (권한/윤리)**: AI의 무단 답안 작성 및 대필 절대 차단 가드레일
- **6겹 Observability (관측성)**: 학생의 고민 시간, 자가수정(래칫) 횟수, 오류 패턴을 기록하여 생활기록부 근거로 동기화

### 2. 2020~2026 수능 & 학력평가 기출 문제은행 (2,250문항 전수 연동)
- 고1, 고2, 고3 학년별 평가원 수능 및 교육청 모의고사 전수 수록
- 듣기 대본, 독해 지문, 유형별 분류, Lexile/CEFR 난이도, 핵심 어휘 사전 탑재
- **문항 복수 선택(Multi-Select)** 지원: 2개 이상의 문항을 체크하여 스튜디오로 일괄 바인딩

### 3. 다중 텍스트 비교 대조 및 Synthesis(종합) 에세이
- 복수 문항 로드 시 **개별 탭 뷰** 및 **👥 나란히 2열 비교 뷰(Side-by-Side)** 제공
- 상반된 두 지문의 논거와 관점을 대조 분석하고, 이를 종합하는 학술 에세이 작성 훈련

### 4. 생활기록부 교과세특(NEIS) 자동 생성기
- **교육부 기재요령 표준 준수**: 시험명이나 문항 번호 표기를 전면 배제
- 지문의 학술 개념 분석, 담화 표제어 파악, 인과적 전개 구조 이해, 패러프레이징 및 비판적 견해 도출 궤적 중심 서술
- 복수 지문 비교 독해 시 상호 텍스트성(Intertextuality) 분석 궤적 유기적 서술
- 나이스(NEIS) 규격 한글 3바이트 기준 실시간 글자수/바이트수 계측

---

## 🛠️ 기술 스택 (Tech Stack)

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide React Icons
- **Design Theme**: 따뜻한 아이보리(warm-ivory), 허니 옐로우(honey), 부드러운 라운드 카드 레이아웃
- **Data Engine**: 2020~2026 기출 2,250문항 정제 데이터셋 (public/data/exam_bank.json)

---

## 🚀 빠른 시작 (Getting Started)

### 설치
`ash
git clone https://github.com/googyosoo/english-harness.git
cd english-harness
npm install
`

### 개발 서버 실행
`ash
npm run dev
`

### 프로덕션 빌드
`ash
npm run build
npm run preview
`

---

## 📄 라이선스 (License)
MIT License
