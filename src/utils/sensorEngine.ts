/**
 * 지능형 텍스트 센서 분석 엔진 (Smart Sensor Engine)
 * - CEFR(A1~C2) 어휘 수준 프로파일러 & AWL(학술어휘 570) 분석
 * - 다차원 문법 및 스타일 린터 (Grammar & Style Linter)
 * - 지능형 원문 복사율 및 패러프레이징 판정
 * - 담화 표제어 및 논리 연결사(Discourse Markers) 분석
 */

// 1. CEFR & 학술 어휘(AWL) 사전 데이터셋
export const CEFR_VOCABULARY = {
  // A1-A2 기본 일상어 (약 200개 대표어)
  basic: new Set([
    'a', 'about', 'all', 'also', 'and', 'as', 'at', 'be', 'because', 'but', 'by', 'can', 'come', 'could',
    'day', 'do', 'even', 'find', 'first', 'for', 'from', 'get', 'give', 'go', 'good', 'have', 'he', 'her',
    'here', 'him', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'just', 'know', 'like', 'look',
    'make', 'man', 'many', 'me', 'more', 'my', 'new', 'no', 'not', 'now', 'of', 'on', 'one', 'only', 'or',
    'other', 'our', 'out', 'people', 'say', 'see', 'she', 'so', 'some', 'take', 'tell', 'than', 'that', 'the',
    'their', 'them', 'then', 'there', 'these', 'they', 'thing', 'think', 'this', 'time', 'to', 'two', 'up',
    'use', 'very', 'want', 'way', 'we', 'well', 'what', 'when', 'which', 'who', 'will', 'with', 'would',
    'year', 'you', 'your', 'big', 'small', 'help', 'bad', 'happy', 'sad', 'easy', 'hard', 'water', 'food',
    'school', 'student', 'teacher', 'world', 'life', 'live', 'work', 'place', 'need', 'feel', 'try', 'ask'
  ]),

  // B1-B2 중고교 핵심 학술어 (대표어)
  intermediate: new Set([
    'achieve', 'advantage', 'affect', 'benefit', 'challenge', 'community', 'consequence', 'culture', 'decide',
    'develop', 'difference', 'difficult', 'discover', 'education', 'effort', 'encourage', 'environment',
    'experience', 'explain', 'factor', 'future', 'generation', 'global', 'growth', 'habit', 'health', 'history',
    'human', 'identify', 'impact', 'improve', 'individual', 'influence', 'information', 'issue', 'knowledge',
    'leadership', 'limit', 'maintain', 'major', 'manage', 'meaning', 'measure', 'media', 'method', 'modern',
    'nature', 'negative', 'opportunity', 'organization', 'participate', 'patient', 'perform', 'perspective',
    'physical', 'planet', 'population', 'positive', 'potential', 'practice', 'prepare', 'prevent', 'primary',
    'problem', 'process', 'produce', 'protect', 'purpose', 'quality', 'reason', 'reduce', 'reflect', 'region',
    'relationship', 'require', 'resource', 'respect', 'responsibility', 'result', 'science', 'society',
    'solution', 'strategy', 'strength', 'structure', 'success', 'support', 'technology', 'threat', 'tradition',
    'understand', 'unique', 'valuable', 'variety', 'victim', 'volunteer', 'weight', 'youth'
  ]),

  // C1-C2 수능 심화 및 고급 학술어 (대표어)
  advanced: new Set([
    'accelerate', 'allocate', 'ambiguous', 'anticipate', 'arbitrary', 'cognitive', 'coherent', 'commodity',
    'compensate', 'comprehend', 'concur', 'constitute', 'contemporary', 'contradict', 'crucial', 'deteriorate',
    'dilemma', 'diminish', 'discretion', 'disparity', 'elaborate', 'elucidate', 'empirical', 'endure',
    'enhance', 'ephemeral', 'equilibrium', 'exacerbate', 'exemplify', 'explicit', 'facilitate', 'feasible',
    'fluctuate', 'hierarchy', 'hypothesize', 'ideology', 'imminent', 'implicit', 'incentive', 'indispensable',
    'inherent', 'inhibit', 'innovate', 'integral', 'intrinsic', 'intuitive', 'invoke', 'irreversible',
    'jurisdiction', 'manifest', 'meticulous', 'monopoly', 'paradigm', 'perceive', 'perpetual', 'plausible',
    'pragmatic', 'prevalent', 'profound', 'proliferation', 'proponent', 'rationale', 'reciprocal', 'reconcile',
    'resilient', 'retrospect', 'rigorous', 'scrutinize', 'spontaneous', 'stagnant', 'subtle', 'susceptible',
    'tangible', 'ubiquitous', 'unprecedented', 'utilize', 'validate', 'viable', 'vulnerable'
  ]),

  // AWL (Academic Word List 핵심 학술어 570 대표)
  awl: new Set([
    'abstract', 'acquire', 'adapt', 'adequate', 'adjust', 'advocate', 'aggregate', 'alter', 'alternative',
    'analyze', 'apparent', 'append', 'appreciate', 'approach', 'appropriate', 'approximate', 'aspect',
    'assemble', 'assess', 'assign', 'assist', 'assume', 'assure', 'attach', 'attain', 'attitude', 'attribute',
    'author', 'authority', 'automate', 'available', 'aware', 'behalf', 'bias', 'bond', 'brief', 'bulk',
    'capable', 'capacity', 'category', 'cease', 'channel', 'chapter', 'chart', 'chemical', 'circumstance',
    'cite', 'civil', 'clarify', 'classic', 'clause', 'code', 'coherent', 'coincide', 'collapse', 'colleague',
    'commence', 'comment', 'commission', 'commit', 'community', 'compatible', 'compensate', 'compile',
    'complement', 'complex', 'component', 'compound', 'comprehensive', 'comprise', 'compute', 'conceive',
    'concentrate', 'concept', 'conclude', 'concurrent', 'conduct', 'confer', 'confine', 'confirm', 'conflict',
    'conform', 'consent', 'consequent', 'considerable', 'consist', 'constant', 'constitute', 'constrain',
    'construct', 'consult', 'consume', 'contact', 'contemporary', 'context', 'contract', 'contradict',
    'contrary', 'contrast', 'contribute', 'controversy', 'convene', 'converse', 'convert', 'convince',
    'cooperate', 'coordinate', 'core', 'corporate', 'correspond', 'couple', 'create', 'credit', 'criteria',
    'crucial', 'culture', 'currency', 'cycle', 'data', 'debate', 'decade', 'decline', 'deduce', 'define',
    'definite', 'demonstrate', 'denote', 'deny', 'depress', 'derive', 'design', 'despite', 'detect',
    'deviate', 'device', 'devote', 'differentiate', 'dimension', 'diminish', 'discrete', 'discriminate',
    'displace', 'display', 'dispose', 'distinct', 'distort', 'distribute', 'diverse', 'document', 'domain',
    'domestic', 'dominate', 'draft', 'drama', 'duration', 'dynamic', 'economy', 'edit', 'element', 'eliminate',
    'emerge', 'emphasis', 'empirical', 'enable', 'encounter', 'energy', 'enforce', 'enhance', 'enormous',
    'ensure', 'entity', 'environment', 'equate', 'equip', 'equivalent', 'erode', 'error', 'establish',
    'estate', 'estimate', 'ethic', 'ethnic', 'evaluate', 'eventual', 'evident', 'evolve', 'exceed', 'exclude',
    'exhibit', 'expand', 'expert', 'explicit', 'exploit', 'export', 'expose', 'external', 'extract',
    'facilitate', 'factor', 'feature', 'federal', 'fee', 'file', 'final', 'finance', 'finite', 'flexible',
    'fluctuate', 'focus', 'format', 'formula', 'forthcoming', 'foundation', 'framework', 'function', 'fund',
    'fundamental', 'furthermore', 'gender', 'generate', 'generation', 'globe', 'goal', 'grade', 'grant',
    'guarantee', 'guideline', 'hence', 'hierarchy', 'highlight', 'hypothesis', 'identical', 'identify',
    'ideology', 'ignorant', 'illustrate', 'image', 'immigrate', 'impact', 'implement', 'implicate',
    'implicit', 'imply', 'impose', 'incentive', 'incidence', 'incline', 'income', 'incorporate', 'index',
    'indicate', 'individual', 'induce', 'inevitable', 'infer', 'infrastructure', 'inherent', 'inhibit',
    'initial', 'initiate', 'injure', 'innovate', 'input', 'insert', 'insight', 'inspect', 'instance',
    'institute', 'instruct', 'integral', 'integrate', 'integrity', 'intelligence', 'intense', 'interact',
    'intermediate', 'internal', 'interpret', 'interval', 'intervene', 'intrinsic', 'invest', 'investigate',
    'invoke', 'involve', 'isolate', 'issue', 'item', 'job', 'journal', 'justify', 'label', 'labor',
    'layer', 'lecture', 'legal', 'legislate', 'levy', 'liberal', 'license', 'likewise', 'link', 'locate',
    'logic', 'maintain', 'major', 'manipulate', 'manual', 'margin', 'mature', 'maximize', 'mechanism',
    'media', 'mediate', 'medical', 'medium', 'mental', 'method', 'migrate', 'military', 'minimal',
    'minimize', 'minimum', 'ministry', 'minor', 'mode', 'modify', 'monitor', 'motive', 'mutual', 'negate',
    'network', 'neutral', 'nevertheless', 'nonetheless', 'norm', 'normal', 'notion', 'notwithstanding',
    'nuclear', 'objective', 'obtain', 'obvious', 'occupy', 'occur', 'odd', 'offset', 'ongoing', 'option',
    'orient', 'outcome', 'output', 'overall', 'overlap', 'overseas', 'panel', 'paradigm', 'paragraph',
    'parallel', 'parameter', 'participate', 'partner', 'passive', 'perceive', 'percent', 'period', 'persist',
    'perspective', 'phase', 'phenomenon', 'philosophy', 'physical', 'plus', 'policy', 'portion', 'pose',
    'positive', 'potential', 'practitioner', 'precede', 'precise', 'predict', 'predominant', 'preliminary',
    'presume', 'previous', 'primary', 'prime', 'principal', 'principle', 'prior', 'priority', 'proceed',
    'process', 'professional', 'prohibit', 'project', 'promote', 'proportion', 'prospect', 'protocol',
    'psychology', 'publication', 'publish', 'purchase', 'pursue', 'qualitative', 'quote', 'radical',
    'random', 'range', 'ratio', 'rational', 'react', 'recover', 'refine', 'regime', 'region', 'register',
    'regulate', 'reinforce', 'reject', 'relax', 'release', 'relevant', 'rely', 'remove', 'require',
    'research', 'reside', 'resolve', 'resource', 'respond', 'restore', 'restrain', 'restrict', 'retain',
    'reveal', 'revenue', 'reverse', 'revise', 'revolution', 'rigid', 'role', 'route', 'scenario', 'schedule',
    'scheme', 'scope', 'section', 'sector', 'secure', 'seek', 'select', 'sequence', 'series', 'shift',
    'significant', 'similar', 'simulate', 'site', 'so-called', 'sole', 'somewhat', 'source', 'specific',
    'specify', 'sphere', 'stable', 'statistic', 'status', 'straightforward', 'strategy', 'stress', 'structure',
    'style', 'submit', 'subordinate', 'subsequent', 'subsidy', 'substitute', 'successor', 'sufficient',
    'sum', 'summary', 'supplement', 'survey', 'survive', 'suspend', 'sustain', 'symbol', 'tape', 'target',
    'task', 'team', 'technical', 'technique', 'technology', 'temporary', 'tense', 'terminate', 'text',
    'theme', 'theory', 'thereby', 'thesis', 'topic', 'trace', 'tradition', 'transfer', 'transform', 'transit',
    'transmit', 'transport', 'trend', 'trigger', 'ultimate', 'undergo', 'underlie', 'undertake', 'uniform',
    'unify', 'unique', 'utilize', 'valid', 'vary', 'vehicle', 'version', 'via', 'violate', 'virtual',
    'visible', 'vision', 'visual', 'volume', 'voluntary', 'welfare', 'whereas', 'whereby', 'widespread'
  ])
};

// 2. 학술 어휘 업그레이드 추천 사전 (일상어 ➔ 고급/학술 대체어)
export const ACADEMIC_SYNONYMS: Record<string, string[]> = {
  good: ['beneficial', 'advantageous', 'favorable', 'positive'],
  bad: ['detrimental', 'adverse', 'unfavorable', 'harmful'],
  big: ['substantial', 'significant', 'considerable', 'vast'],
  small: ['minimal', 'negligible', 'diminutive', 'marginal'],
  make: ['generate', 'establish', 'construct', 'formulate'],
  get: ['acquire', 'obtain', 'derive', 'attain'],
  think: ['consider', 'assert', 'perceive', 'speculate'],
  show: ['demonstrate', 'illustrate', 'indicate', 'manifest'],
  important: ['crucial', 'indispensable', 'vital', 'fundamental'],
  problem: ['dilemma', 'obstacle', 'challenge', 'impediment'],
  change: ['transform', 'modify', 'fluctuate', 'alter'],
  help: ['facilitate', 'assist', 'bolster', 'support'],
  look: ['scrutinize', 'examine', 'observe', 'investigate']
};

// 3. 논리 연결사(Discourse Markers) 카테고리
export const TRANSITION_WORDS = {
  contrast: ['however', 'nevertheless', 'on the other hand', 'in contrast', 'conversely', 'yet', 'despite', 'whereas'],
  causeEffect: ['therefore', 'thus', 'consequently', 'as a result', 'hence', 'accordingly', 'thereby'],
  addition: ['furthermore', 'moreover', 'in addition', 'besides', 'additionally', 'not only'],
  example: ['for example', 'for instance', 'specifically', 'to illustrate', 'such as'],
  conclusion: ['in conclusion', 'to summarize', 'overall', 'ultimately', 'in summary']
};

export interface VocabularyAnalysisResult {
  totalWords: number;
  uniqueWords: number;
  ttr: number; // 어휘 다양성(0-100%)
  levels: {
    basic: { count: number; percentage: number }; // A1-A2
    intermediate: { count: number; percentage: number }; // B1-B2
    advanced: { count: number; percentage: number }; // C1-C2
    awl: { count: number; percentage: number }; // Academic Word List
  };
  advancedWordsFound: string[];
  awlWordsFound: string[];
  suggestions: { original: string; better: string[] }[];
}

export interface GrammarLintResult {
  rule: string;
  message: string;
  severity: 'warning' | 'suggestion';
  example?: string;
}

export interface PlagiarismResult {
  copyRate: number; // 복사율 0~100%
  status: 'safe' | 'warning' | 'danger';
  longestMatchLength: number;
  copiedPhrases: string[];
}

export interface TransitionAnalysisResult {
  score: number; // 0~100
  foundTransitions: { word: string; type: string }[];
  categoriesUsed: string[];
}

export interface SmartSensorReportData {
  overallScore: number;
  status: 'passed' | 'warning' | 'failed';
  feedbackSummary: string;
  vocabulary: VocabularyAnalysisResult;
  grammar: GrammarLintResult[];
  plagiarism: PlagiarismResult;
  transitions: TransitionAnalysisResult;
}

/**
 * 1. 어휘 레벨 및 학술성 분석
 */
export const analyzeVocabulary = (text: string): VocabularyAnalysisResult => {
  const cleanWords = text
    .toLowerCase()
    .replace(/[^a-z\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1);

  const totalWords = cleanWords.length;
  if (totalWords === 0) {
    return {
      totalWords: 0,
      uniqueWords: 0,
      ttr: 0,
      levels: {
        basic: { count: 0, percentage: 0 },
        intermediate: { count: 0, percentage: 0 },
        advanced: { count: 0, percentage: 0 },
        awl: { count: 0, percentage: 0 },
      },
      advancedWordsFound: [],
      awlWordsFound: [],
      suggestions: [],
    };
  }

  const uniqueSet = new Set(cleanWords);
  const uniqueWords = uniqueSet.size;
  const ttr = Math.round((uniqueWords / totalWords) * 100);

  let basicCount = 0;
  let intermediateCount = 0;
  let advancedCount = 0;
  let awlCount = 0;

  const advancedWordsFound: string[] = [];
  const awlWordsFound: string[] = [];
  const suggestions: { original: string; better: string[] }[] = [];

  uniqueSet.forEach((w) => {
    let matched = false;

    if (CEFR_VOCABULARY.awl.has(w)) {
      awlCount++;
      awlWordsFound.push(w);
      matched = true;
    }

    if (CEFR_VOCABULARY.advanced.has(w)) {
      advancedCount++;
      if (!awlWordsFound.includes(w)) advancedWordsFound.push(w);
      matched = true;
    } else if (CEFR_VOCABULARY.intermediate.has(w)) {
      intermediateCount++;
      matched = true;
    } else if (CEFR_VOCABULARY.basic.has(w)) {
      basicCount++;
      matched = true;
    }

    // 학술 대체어 제안
    if (ACADEMIC_SYNONYMS[w]) {
      suggestions.push({
        original: w,
        better: ACADEMIC_SYNONYMS[w],
      });
    }
  });

  return {
    totalWords,
    uniqueWords,
    ttr,
    levels: {
      basic: { count: basicCount, percentage: Math.round((basicCount / uniqueWords) * 100) },
      intermediate: { count: intermediateCount, percentage: Math.round((intermediateCount / uniqueWords) * 100) },
      advanced: { count: advancedCount, percentage: Math.round((advancedCount / uniqueWords) * 100) },
      awl: { count: awlCount, percentage: Math.round((awlCount / uniqueWords) * 100) },
    },
    advancedWordsFound: advancedWordsFound.slice(0, 8),
    awlWordsFound: awlWordsFound.slice(0, 8),
    suggestions: suggestions.slice(0, 4),
  };
};

/**
 * 2. 다차원 문법 및 스타일 린터
 */
export const lintGrammarAndStyle = (text: string, minWords = 50): GrammarLintResult[] => {
  const issues: GrammarLintResult[] = [];
  const words = text.trim().split(/\s+/).filter(Boolean);

  if (words.length < minWords) {
    issues.push({
      rule: '분량 충족',
      message: `최소 권장 분량(${minWords}단어)에 미달합니다. (현재 ${words.length}단어)`,
      severity: 'warning',
    });
  }

  // 주어-동사 수일치
  const subjectVerbRegex = /\b(he|she|it|this|that|one)\s+(go|do|have|make|take|say|show|need|seem)\b/gi;
  let match;
  while ((match = subjectVerbRegex.exec(text)) !== null) {
    issues.push({
      rule: '3인칭 단수 주어-동사 수일치',
      message: `'${match[1]} ${match[2]}' ➔ 3인칭 단수 주어 뒤 동사에 -s/-es가 필요합니다.`,
      example: `${match[1]} ${match[2]}s`,
      severity: 'warning',
    });
  }

  // 부정관사 a/an 오류
  const articleRegex = /\b(a)\s+([aeiou][a-z]+)\b/gi;
  while ((match = articleRegex.exec(text)) !== null) {
    // 예외 단어 처리 (university, union 등 제외)
    if (!match[2].startsWith('uni') && !match[2].startsWith('use')) {
      issues.push({
        rule: '부정관사 an 표기',
        message: `'${match[0]}' ➔ 모음 발음 단어 앞에는 'an'을 권장합니다.`,
        example: `an ${match[2]}`,
        severity: 'warning',
      });
    }
  }

  // 구어체 축약어 점검 (Academic Formal Style)
  const contractionRegex = /\b(don't|doesn't|can't|won't|isn't|aren't|didn't|it's)\b/gi;
  const contractions: string[] = [];
  while ((match = contractionRegex.exec(text)) !== null) {
    contractions.push(match[0]);
  }
  if (contractions.length > 0) {
    issues.push({
      rule: '격식적 학술체 (No Contractions)',
      message: `학술 에세이에서는 축약어(${contractions.slice(0, 3).join(', ')}) 대신 풀어서 쓰는 것을 권장합니다.`,
      example: 'do not, cannot, it is',
      severity: 'suggestion',
    });
  }

  // 문장 부호 점검 (마침표 누락)
  if (text.trim().length > 0 && !/[.!?]$/.test(text.trim())) {
    issues.push({
      rule: '문장 종결 부호',
      message: '단락의 마지막 문장에 마침표(.)가 누락되었습니다.',
      severity: 'suggestion',
    });
  }

  return issues;
};

/**
 * 3. 지능형 원문 복사율 및 패러프레이징 판정
 */
export const checkPassageCopyRate = (
  essayText: string,
  originalPassage?: string
): PlagiarismResult => {
  if (!originalPassage || !essayText.trim()) {
    return { copyRate: 0, status: 'safe', longestMatchLength: 0, copiedPhrases: [] };
  }

  const cleanOriginal = originalPassage.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const essayWords = essayText.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);

  if (essayWords.length < 5) {
    return { copyRate: 0, status: 'safe', longestMatchLength: 0, copiedPhrases: [] };
  }

  const copiedPhrases: string[] = [];
  let copiedWordsCount = 0;
  let longestMatchLength = 0;

  // 4-gram 연속 일치 검색
  const checkedIndices = new Set<number>();
  for (let i = 0; i <= essayWords.length - 4; i++) {
    const chunk = essayWords.slice(i, i + 4).join(' ');
    if (cleanOriginal.includes(chunk)) {
      if (!copiedPhrases.includes(chunk)) {
        copiedPhrases.push(chunk);
      }
      for (let j = i; j < i + 4; j++) {
        checkedIndices.add(j);
      }
      longestMatchLength = Math.max(longestMatchLength, 4);
    }
  }

  copiedWordsCount = checkedIndices.size;
  const copyRate = Math.min(100, Math.round((copiedWordsCount / essayWords.length) * 100));

  let status: 'safe' | 'warning' | 'danger' = 'safe';
  if (copyRate >= 30) status = 'danger';
  else if (copyRate >= 15) status = 'warning';

  return {
    copyRate,
    status,
    longestMatchLength,
    copiedPhrases: copiedPhrases.slice(0, 3),
  };
};

/**
 * 4. 논리 연결사 및 결속성 분석
 */
export const analyzeTransitions = (text: string): TransitionAnalysisResult => {
  const lower = text.toLowerCase();
  const foundTransitions: { word: string; type: string }[] = [];
  const categoriesUsed = new Set<string>();

  Object.entries(TRANSITION_WORDS).forEach(([category, words]) => {
    words.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(lower)) {
        foundTransitions.push({ word, type: category });
        categoriesUsed.add(category);
      }
    });
  });

  // 논리성 점수 산출: 다양한 범주의 연결사를 균형 있게 사용했는지 (0~100)
  const categoryCount = categoriesUsed.size;
  const score = Math.min(100, Math.round((categoryCount / 3) * 70 + Math.min(30, foundTransitions.length * 10)));

  return {
    score,
    foundTransitions,
    categoriesUsed: Array.from(categoriesUsed),
  };
};

/**
 * 종합 지능형 센서 검사 (Full Inspection)
 */
export const runFullSmartSensorInspection = (
  essayText: string,
  originalPassage?: string,
  minWords = 50
): SmartSensorReportData => {
  const vocab = analyzeVocabulary(essayText);
  const grammar = lintGrammarAndStyle(essayText, minWords);
  const plagiarism = checkPassageCopyRate(essayText, originalPassage);
  const transitions = analyzeTransitions(essayText);

  // 종합 점수 계산 가중치: 어휘 다양성(30%) + 문법 완성도(30%) + 표절 안전도(25%) + 논리 결속성(15%)
  const grammarPenalty = grammar.filter((g) => g.severity === 'warning').length * 10;
  const grammarScore = Math.max(20, 100 - grammarPenalty);
  const plagiarismScore = Math.max(0, 100 - plagiarism.copyRate * 2.5);

  const overallScore = Math.min(
    100,
    Math.round(
      vocab.ttr * 0.3 +
      grammarScore * 0.3 +
      plagiarismScore * 0.25 +
      transitions.score * 0.15
    )
  );

  let status: 'passed' | 'warning' | 'failed' = 'passed';
  if (plagiarism.status === 'danger' || overallScore < 50) {
    status = 'failed';
  } else if (plagiarism.status === 'warning' || grammar.length > 2 || overallScore < 70) {
    status = 'warning';
  }

  let feedbackSummary = '';
  if (status === 'passed') {
    feedbackSummary = `우수! 어휘 다양도(${vocab.ttr}%)와 B2~C2 학술 어휘(${vocab.levels.advanced.percentage + vocab.levels.awl.percentage}%)를 균형 있게 활용하여 완성도 높은 글을 작성했습니다.`;
  } else if (plagiarism.status === 'danger') {
    feedbackSummary = `주의: 원문 복사율이 ${plagiarism.copyRate}%로 감지되었습니다. 지문의 핵심 아이디어를 자신만의 표현으로 패러프레이징하세요!`;
  } else {
    feedbackSummary = `보완 권고: ${grammar.length}건의 문법·스타일 개선사항이 있습니다. 제안된 어휘를 활용해 글을 한층 더 다듬어보세요.`;
  }

  return {
    overallScore,
    status,
    feedbackSummary,
    vocabulary: vocab,
    grammar,
    plagiarism,
    transitions,
  };
};
