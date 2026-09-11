import { ActivityContent } from '../types/harness';

export const CURRICULUM_DATA: ActivityContent[] = [
  // ====================================================================
  // [고1 실전] 호랭이닷컴 3월 전국연합학력평가 기출 실전
  // ====================================================================
  {
    id: 'horaeng-g1-listening-1',
    grade: 'G1',
    mode: 'listening',
    title: '[고1 기출] 드론 쇼 교내 재공연 안내 담화',
    subTitle: '2025 3월 학평 1번 기출 ➔ 청킹 딕테이션 & WER 센서',
    badgeNumber: 1,
    cefrLevel: 'A2+',
    lexile: '810L',
    tags: ['호랭이닷컴 기출', '고1 3월 학평', '듣기 1번', '드론쇼'],
    overview: '교감선생님의 드론 동아리 전국대회 우승 축하 및 교내 운동장 재공연 관람 권유 방송을 듣고 핵심 어휘를 받아씁니다.',
    audioScript: 'Good morning, students. This is your vice principal Richard Simpson. As you know, our school drone club was awarded first prize at the Drone Show Contest. Actually, I asked the drone club to perform the show again for you. And they said, "Yes". So I would recommend you watch the performance at the school field tomorrow. Please come and see the club\'s drone performance, and show your support. Thank you.',
    audioDuration: '0:38',
    dictationTarget: ['awarded first prize', 'Drone Show Contest', 'school field tomorrow', 'show your support'],
  },
  {
    id: 'horaeng-g1-reading-21',
    grade: 'G1',
    mode: 'reading',
    title: '[고1 기출] 인간 유전자 편집과 윤리적 미끄러운 경사길',
    subTitle: '2025 3월 학평 21번 함축의미 추론 ➔ 소크라테스 발문 하네스',
    badgeNumber: 2,
    cefrLevel: 'B1',
    lexile: '890L',
    tags: ['호랭이닷컴 기출', '고1 3월 21번', '함축의미', '생명윤리'],
    overview: '유전자 편집 기술의 질병 치료를 넘어선 인체 능력 향상(Enhancement)에 대한 윤리적 쟁점 지문을 읽고 소크라테스 질문으로 추론합니다.',
    readingPassage: 'Assuming gene editing in humans proves to be safe and effective, we should not immediately start down this slippery slope. While curing severe hereditary diseases through gene modification is widely supported, using the identical technology for human enhancement creates grave moral inequalities. Once wealthy parents begin genetically selecting their children\'s intelligence or athletic traits, the boundary between therapy and genetic design dissolves, cementing irreversible social divides.',
    comprehensionQuestions: [
      {
        question: '밑줄 친 "start down this slippery slope(미끄러운 경사길에 들어서다)"가 의미하는 바로 가장 적절한 것은?',
        options: [
          '치료 목적을 넘어 인간 개량(enhancement)으로 나아가 돌이킬 수 없는 사회적 불평등을 초래하는 것',
          '유전자 연구에 대한 정부 지원금을 급격히 축소하는 것',
          '의사들이 새로운 수술 기법의 안전성을 과대평가하는 것',
          '가난한 사람들에게만 유전자 치료를 무료로 강제하는 것'
        ],
        answerIndex: 0,
        socraticHint: '지문 후반부의 "boundary between therapy and genetic design dissolves"와 "social divides"의 인과관계에 주목해보세요!'
      }
    ]
  },
  {
    id: 'horaeng-g1-listen-write-1',
    grade: 'G1',
    mode: 'listen-write',
    title: '[고1 연계] 인기 뮤지컬 관람 대화 ➔ 5W1H 메모 ➔ 추천문 작문',
    subTitle: '2025 3월 학평 2번 대화 ➔ 코넬 메모 ➔ 3문장 추천문 Handoff',
    badgeNumber: 3,
    cefrLevel: 'A2~B1',
    lexile: '830L',
    tags: ['호랭이닷컴 기출', '듣기-쓰기 연계', '코넬노트', 'Handoff'],
    overview: '인기 뮤지컬 티켓팅 성공과 관람 후기 대화를 청취하며 코넬 메모를 작성하고, 학급 추천 영문 글을 작성합니다.',
    audioScript: 'Woman: Ryan, did you enjoy the musical "Tigers" yesterday? Man: Yes, I loved it! I cannot believe we got tickets for such a popular show. The actors singing and dynamic choreography were breathtaking. Woman: Exactly. The energy in the auditorium was electric. You should definitely write a review for our school art magazine.',
    audioDuration: '0:35',
    dictationTarget: ['popular show', 'dynamic choreography', 'school art magazine'],
    writingPrompt: '대화에서 언급된 뮤지컬의 매력 포인트(연기, 안무, 객석 분위기)를 포함하여 학급 친구들에게 관람을 권유하는 3문장의 영문 추천글(50~70단어)을 작성하세요.',
    minWords: 45,
    targetKeywords: ['musical', 'choreography', 'breathtaking', 'recommend'],
    handoffInstruction: {
      step1Title: 'Step 1: 뮤지컬 대화 청취 및 핵심 표현 코넬 메모',
      step2Title: 'Step 2: 메모를 활용한 학급 추천 영문 리뷰 작성',
      handoffKey: 'musicalNotes'
    }
  },

  // ====================================================================
  // [고2 실전] 호랭이닷컴 3월 고2 전국연합학력평가 기출 실전
  // ====================================================================
  {
    id: 'horaeng-g2-read-write-1',
    grade: 'G2',
    mode: 'read-write',
    title: '[고2 기출] 상황 윤리(Situational Ethics)의 딜레마',
    subTitle: '2025 3월 고2 학평 30번 어휘/주제 ➔ Synthesis 비교 에세이',
    badgeNumber: 4,
    cefrLevel: 'B1+',
    lexile: '1080L',
    tags: ['호랭이닷컴 기출', '고2 3월 30번', '상황윤리', '스포츠맨십'],
    overview: '친구들과의 길거리 농구와 심판이 있는 공식 경기에서 선수들이 반칙을 대하는 상반된 태도를 통해 상황 윤리의 명암을 비교 작문합니다.',
    readingPassage: 'Situational ethics is an ethical theory that takes into account the context of an act when judging whether it is right. In a casual pickup game of basketball among friends, everyone calls their own fouls to protect friendship and trust. However, once an organized game is played with official referees, most athletes willingly abandon spontaneous honesty because the end goal of winning justifies concealing fouls from the officials.',
    writingPrompt: '지문의 농구 경기 사례를 인용하여 "친구 간의 친선 경기"와 "공식 승부"에서의 도덕적 기준 변화를 요약하고, 상황 윤리의 위험성을 100~130단어로 비판하세요. (원문 단순 복사 시 표절 센서 작동)',
    minWords: 90,
    targetKeywords: ['situational ethics', 'referee', 'honesty', 'competitive', 'justifies'],
    handoffInstruction: {
      step1Title: 'Step 1: 비공식 경기 vs 공식 경기의 도덕적 대조 논거 정리',
      step2Title: 'Step 2: 증거를 바탕으로 한 비판적 Synthesis 에세이 작성',
      handoffKey: 'ethicsEvidence'
    }
  },
  {
    id: 'horaeng-g2-listen-speak-1',
    grade: 'G2',
    mode: 'listen-speak',
    title: '[고2 기출] 실내 암벽등반과 문제해결 전략 토론',
    subTitle: '고2 실전 대화 청취 ➔ 전략적 사고에 관한 즉각 음성 스피치',
    badgeNumber: 5,
    cefrLevel: 'B2',
    lexile: '1020L',
    tags: ['호랭이닷컴 기출', '듣기-말하기', '실시간 STT', '문제해결력'],
    overview: '암벽등반이 문제해결력을 기르는 원리에 대한 담화를 듣고, 전략적 계획 수정의 중요성에 대해 1분간 음성으로 구술합니다.',
    audioScript: 'Woman: I think indoor rock climbing helps improve problem-solving skills. You use strategic thinking to solve the problem of getting to the top. That means you have to strategically plan the holds to grab. If the plan fails, you adapt immediately while climbing. It trains your mind to adjust to real-time information.',
    audioDuration: '0:42',
    speakingPrompt: 'Why does rock climbing train problem-solving abilities? Explain how adapting plans during climbing relates to academic or life challenges.',
    roleplayScenario: '체육 교육 세미나에서 신체 활동의 인지적 효과 발표',
    sampleAnswerSteps: {
      basic: 'Climbing helps thinking because you must change plans when you cannot reach the rocks.',
      natural: 'Rock climbing enhances cognitive flexibility because climbers are compelled to formulate strategies and instantly adapt when unexpected obstacles occur.',
      academic: 'Indoor climbing functions as an experiential problem-solving laboratory, cultivating strategic foresight and dynamic adaptability indispensable for academic resilience.'
    },
    handoffInstruction: {
      step1Title: 'Step 1: 등반과 인지능력 상관관계 오디오 청취 & 핵심어 추출',
      step2Title: 'Step 2: 음성 녹음을 통한 PREP 구조 1분 스피치',
      handoffKey: 'climbingCognition'
    }
  },

  // ====================================================================
  // [고3 실전] 호랭이닷컴 대학수학능력시험 공식 기출 실전
  // ====================================================================
  {
    id: 'horaeng-g3-listening-1',
    grade: 'G3',
    mode: 'listening',
    title: '[수능 실전] 건강 수면 코칭 담화 (Nightly Journey)',
    subTitle: '대학수학능력시험 듣기 1번 실전 ➔ 원어민 145WPM 쉐도잉',
    badgeNumber: 6,
    cefrLevel: 'B2',
    lexile: '1150L',
    tags: ['호랭이닷컴 기출', '수능 영어 1번', '원어민 145WPM', '수면코칭'],
    overview: '대학수학능력시험 1번 실제 원어민 담화를 듣고, 호흡법과 숙면 유도 오디오 기능에 대한 핵심 청킹을 딕테이션합니다.',
    audioScript: 'Hello, viewers. It is Ryan. Welcome back to Only4Health Channel. Do you want to have good sleep? Then, the app Nightly Journey is perfect for you. This app provides a variety of aids that help you sleep well, such as calming sounds, peaceful and quiet music, and bedtime stories. It also offers audio exercises that teach you how to breathe in order to sleep better. Why don\'t you try this app and get some good sleep tonight?',
    audioDuration: '0:40',
    dictationTarget: ['Nightly Journey', 'peaceful and quiet music', 'teach you how to breathe', 'feeling refreshed'],
  },
  {
    id: 'horaeng-g3-read-write-31',
    grade: 'G3',
    mode: 'read-write',
    title: '[수능 킬러] 19세기 다국적 곡물 무역과 선물(Futures) 시장',
    subTitle: '대학수학능력시험 31번 빈칸추론 ➔ 비판적 논증문 작문',
    badgeNumber: 7,
    cefrLevel: 'B2+~C1',
    lexile: '1310L',
    tags: ['호랭이닷컴 기출', '수능 31번 킬러', '경제학 학술문', 'TTR 센서', '세특 연계'],
    overview: '기후 변동으로 인한 수확량 불안정을 극복하기 위해 다국적 정보망과 선물 거래를 결합한 초기 곡물 무역 상사의 위험 분산 전략을 분석하고 학술 에세이를 작성합니다.',
    readingPassage: 'The early grain trade firms were active in both surplus-producing and food deficit regions, making it their business to know the state of supply and demand in both. Because this information was the key to their profitability, these firms worked in relative secrecy, frequently built on family ties, trust, and loyalty. Locking-in prices by buying and selling grain for future delivery helped these firms to minimize natural agricultural risks. Their access to information in multiple markets enabled them to easily cover the risks associated with global commodity trade.',
    writingPrompt: '지문의 "profitability(수익성)", "relative secrecy(상대적 비밀주의)", "locking-in prices(선물 거래를 통한 가격 고정)" 메커니즘을 요약하고, 현대 글로벌 공급망에서 정보 비대칭과 리스크 관리의 중요성을 120~170단어로 논증하세요.',
    minWords: 120,
    targetKeywords: ['profitability', 'deficit', 'secrecy', 'commodity', 'minimize risks'],
    handoffInstruction: {
      step1Title: 'Step 1: 19세기 곡물 상사의 정보 독점 및 선물 거래 메커니즘 도해',
      step2Title: 'Step 2: 리스크 헤징 관점의 학술 논증 에세이 작성 (표절/린터 검사)',
      handoffKey: 'grainFutures'
    }
  },
  {
    id: 'horaeng-g3-reading-32',
    grade: 'G3',
    mode: 'reading',
    title: '[수능 32번] 훌륭한 글쓰기 스타일과 대화의 협력 원리',
    subTitle: '대학수학능력시험 32번 빈칸추론 ➔ 소크라테스 인과구조 분석',
    badgeNumber: 8,
    cefrLevel: 'C1',
    lexile: '1290L',
    tags: ['호랭이닷컴 기출', '수능 32번 3점', '수사학', '가상대화'],
    overview: '글쓰기는 독자와의 가상 대화(Virtual Conversation)이므로 청중의 기대(명확성, 관련성, 균형)를 상상하며 써야 한다는 수능 3점 빈칸 지문을 분석합니다.',
    readingPassage: 'The basic guidelines for good style are not mysterious; in fact, you use them every day in conversation. In conversation and in writing, we all rely heavily on cooperation to make sense of exchanges. Writers develop a polished practical style by acknowledging that readers expect clarity, relevance, and proportion. In fact, attention to audience is even more critical in writing because writing lacks immediate feedback. As writers, we have to imagine both halves of a virtual conversation.',
    comprehensionQuestions: [
      {
        question: '필자가 글쓰기에서 "독자와의 가상 대화(virtual conversation)"를 상상해야 한다고 강조한 결정적 이유는 무엇인가요?',
        options: [
          '글쓰기는 대화와 달리 비언어적 의사소통과 즉각적인 피드백이 부재하기 때문',
          '구어체 표현을 문어체보다 더 많이 써야 하기 때문',
          '문서의 길이를 무조건 두 배로 늘려야 하기 때문',
          '독자는 작가의 모든 배경지식을 이미 알고 있다고 가정하기 때문'
        ],
        answerIndex: 0,
        socraticHint: '지문의 "because writing does not permit the nonverbal communication and immediate feedback" 문장을 다시 점검해보세요!'
      }
    ]
  }
];
