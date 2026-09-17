export type GradeLevel = 'G1' | 'G2' | 'G3';

export type ActivityMode = 
  | 'all'
  | 'listening'
  | 'reading'
  | 'speaking'
  | 'writing'
  | 'listen-speak'
  | 'read-write'
  | 'listen-write';

export interface HarnessLayerStatus {
  guide: {
    rule: string;
    curriculumCode: string;
    rubricCriteria: string;
    active: boolean;
  };
  sensor: {
    name: string;
    currentScore: number | null;
    status: 'idle' | 'checking' | 'passed' | 'failed' | 'warning';
    feedback: string;
  };
  loop: {
    attempts: number;
    maxAttempts: number;
    currentStep: string;
    escalated: boolean;
  };
  memory: {
    handoffData: Record<string, any> | null;
    historyCount: number;
    keyInsights: string[];
  };
  permission: {
    allowAnswerGeneration: boolean; // 기본값 false (대필 절대 차단)
    allowScaffolding: boolean;
    tokenBudgetRemaining: number;
  };
  observability: {
    tripwireTriggered: boolean;
    timeSpentSeconds: number;
    failureClass: string | null;
    neisObservationLog: string;
  };
}

export interface PassageItem {
  id: string;
  grade: string;
  year: string;
  exam: string;
  qNumber: number;
  category: 'listening' | 'reading' | 'integrated';
  type: string;
  title: string;
  cleanTopic: string;
  passage?: string;
  script?: string;
  words?: { word: string; meaning: string }[];
  cefrLevel: string;
  lexile: string;
}

export interface ActivityContent {
  id: string;
  grade: GradeLevel;
  mode: ActivityMode;
  title: string;
  subTitle: string;
  badgeNumber: number;
  cefrLevel: string;
  lexile: string;
  tags: string[];
  overview: string;
  
  // 듣기 관련
  audioScript?: string;
  audioDuration?: string;
  dictationTarget?: string[];
  listeningQuiz?: {
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  };
  
  // 읽기 관련
  readingPassage?: string;
  comprehensionQuestions?: {
    question: string;
    options: string[];
    answerIndex: number;
    socraticHint: string;
  }[];
  
  // 말하기 관련
  speakingPrompt?: string;
  roleplayScenario?: string;
  sampleAnswerSteps?: {
    basic: string;
    natural: string;
    academic: string;
  };

  // 쓰기 관련
  writingPrompt?: string;
  minWords?: number;
  targetKeywords?: string[];
  writingMissions?: {
    blankFill?: {
      sentence: string;
      answer: string;
      hint: string;
    };
    topicStatement?: {
      guidePrompt: string;
      sampleAnswer: string;
    };
    summaryWriting?: {
      guidePrompt: string;
      sampleAnswer: string;
    };
  };

  // 연계(Handoff) 관련
  handoffInstruction?: {
    step1Title: string;
    step2Title: string;
    handoffKey: string;
  };

  // 복수 문항 연동 관련
  multiPassages?: PassageItem[];
}

