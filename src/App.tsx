import React, { useState, useEffect } from 'react';
import { GradeLevel, ActivityMode, ActivityContent, HarnessLayerStatus } from './types/harness';
import { CURRICULUM_DATA } from './data/curriculumData';
import { INITIAL_EXAM_BANK_SAMPLES, ExamBankItem } from './data/examBank';
import { Header } from './components/Header';
import { DashboardCards } from './components/DashboardCards';
import { HarnessInspector } from './components/HarnessInspector';
import { TeacherDashboard } from './components/TeacherDashboard';
import { ExamBankModal } from './components/ExamBankModal';
import { ListeningModule } from './components/modules/ListeningModule';
import { ReadingModule } from './components/modules/ReadingModule';
import { SpeakingModule } from './components/modules/SpeakingModule';
import { WritingModule } from './components/modules/WritingModule';
import { IntegratedModule } from './components/modules/IntegratedModule';
import { Sparkles, ArrowLeft } from 'lucide-react';

export const App: React.FC = () => {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | 'ALL'>('ALL');
  const [selectedMode, setSelectedMode] = useState<ActivityMode>('all');
  const [activeTab, setActiveTab] = useState<'studio' | 'inspector' | 'teacher'>('studio');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExamBankOpen, setIsExamBankOpen] = useState(false);

  // 현재 선택된 과업 (기본값: 첫 번째 연계 과업)
  const [selectedActivity, setSelectedActivity] = useState<ActivityContent>(CURRICULUM_DATA[0]);

  // 학습 몰입 시간 측정
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [studentOutput, setStudentOutput] = useState<string>('');

  // 6겹 하네스 상태 관리
  const [harnessStatus, setHarnessStatus] = useState<HarnessLayerStatus>({
    guide: {
      rule: '학생 대신 완성된 답안을 생성하지 않고 질문과 힌트로 비계를 제공한다.',
      curriculumCode: '2022개정 [10영01-02] 세부 정보 파악 및 요약',
      rubricCriteria: '명확성(Clarity) 40%, 논리적 응집성 30%, 어법 정확성 30%',
      active: true,
    },
    sensor: {
      name: '단어 일치도 및 린터 센서',
      currentScore: null,
      status: 'idle',
      feedback: '학생 입력을 대기 중입니다.',
    },
    loop: {
      attempts: 0,
      maxAttempts: 3,
      currentStep: '1차 과업 수행 중',
      escalated: false,
    },
    memory: {
      handoffData: null,
      historyCount: 0,
      keyInsights: [],
    },
    permission: {
      allowAnswerGeneration: false, // 대필 차단
      allowScaffolding: true,
      tokenBudgetRemaining: 2000,
    },
    observability: {
      tripwireTriggered: false,
      timeSpentSeconds: 0,
      failureClass: null,
      neisObservationLog: '',
    },
  });

  // 타이머
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((prev) => {
        const next = prev + 1;
        setHarnessStatus((h) => ({
          ...h,
          observability: {
            ...h.observability,
            timeSpentSeconds: next,
          },
        }));
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 과업 변경 시 가이드 업데이트
  const handleSelectActivity = (activity: ActivityContent) => {
    setSelectedActivity(activity);
    const curriculumCode =
      activity.grade === 'G1'
        ? '[10공통영어01-03] 대의 파악 및 단락 쓰기'
        : activity.grade === 'G2'
        ? '[12영어II02-04] 복합 담화 논증 및 에세이'
        : '[12심화영어03-05] 비판적 독해 및 학술 논변';

    setHarnessStatus((prev) => ({
      ...prev,
      guide: {
        ...prev.guide,
        curriculumCode,
        rubricCriteria: `${activity.lexile} 기준 어휘 다양성 및 논리성 평가`,
      },
      loop: {
        ...prev.loop,
        attempts: 0,
        currentStep: `${activity.title} 시작`,
      },
    }));
  };

  // 기출 문항 제목에서 시험명/문항번호를 정제하여 순수 학술 주제만 추출
  const cleanItemTopic = (rawTitle: string): string => {
    if (!rawTitle) return '학술 텍스트';
    let clean = rawTitle.replace(/\[.*?\]\s*/g, '').replace(/\b\d+번[:\s]*/g, '').trim();
    return clean || '학술 영어 텍스트';
  };

  const handleLoadExamItem = (item: ExamBankItem) => {
    handleLoadMultipleExamItems([item]);
  };

  // 단일 또는 복수 기출 문항 스튜디오 로드 함수
  const handleLoadMultipleExamItems = (items: ExamBankItem[]) => {
    if (items.length === 0) return;

    if (items.length === 1) {
      const item = items[0];
      const isListening = item.category === 'listening';
      const gradeLevel: GradeLevel = item.grade === '고1' ? 'G1' : item.grade === '고2' ? 'G2' : 'G3';
      const topic = cleanItemTopic(item.title);
      
      const dictationWords = (item.words && item.words.length > 0) 
        ? item.words.map(w => w.word) 
        : ['important', 'problem', 'solution', 'strategic'];

      const newActivity: ActivityContent = {
        id: item.id,
        grade: gradeLevel,
        mode: isListening ? 'listening' : 'read-write',
        title: item.title,
        subTitle: `${item.year}년 ${item.exam} ${item.grade} 기출 [${item.type}] ➔ 6겹 하네스 가드레일 가동`,
        badgeNumber: item.qNumber,
        cefrLevel: item.cefrLevel,
        lexile: item.lexile,
        tags: [item.grade, `${item.year}년`, item.exam, item.type],
        overview: isListening
          ? `실제 평가원/교육청 원어민 음성 스크립트를 청취하고 쉐도잉 및 청킹 받아쓰기 센서로 유창성을 훈련합니다.`
          : `실제 기출 지문을 정밀 분석하고 소크라테스식 발문과 Synthesis 에세이 작문을 통해 논리적 사고력을 기릅니다.`,
        audioScript: item.script,
        audioDuration: isListening ? '0:45' : undefined,
        dictationTarget: dictationWords.slice(0, 4),
        readingPassage: item.passage,
        writingPrompt: `'${topic}'에 관한 지문의 핵심 논지와 인과관계를 요약하고 자신의 견해를 100~140단어로 작성하세요. (지문 문장을 그대로 복사하면 표절 센서가 작동합니다)`,
        minWords: 80,
        targetKeywords: dictationWords.slice(0, 4),
        handoffInstruction: {
          step1Title: 'Step 1: 지문 분석 및 핵심 논거 코넬 메모',
          step2Title: 'Step 2: 메모를 바탕으로 한 Synthesis 에세이 작문',
          handoffKey: 'examHandoff'
        },
        multiPassages: [{
          id: item.id,
          grade: item.grade,
          year: item.year,
          exam: item.exam,
          qNumber: item.qNumber,
          category: item.category,
          type: item.type,
          title: item.title,
          cleanTopic: topic,
          passage: item.passage,
          script: item.script,
          words: item.words,
          cefrLevel: item.cefrLevel,
          lexile: item.lexile,
        }]
      };

      setSelectedActivity(newActivity);
      setActiveTab('studio');

      setHarnessStatus(prev => ({
        ...prev,
        guide: {
          ...prev.guide,
          rule: `[기출 연동] ${item.grade} ${item.year}년 ${item.exam} ${item.type} 기준 가드레일`,
          curriculumCode: `${item.grade} 기출 평가원 공식 표준`,
          rubricCriteria: `${item.lexile} / ${item.cefrLevel} 기준 정밀 평가`
        },
        sensor: {
          ...prev.sensor,
          currentScore: null,
          status: 'idle',
          feedback: `'${topic}' 지문이 스튜디오에 로드되었습니다.`
        },
        loop: {
          ...prev.loop,
          attempts: 0,
          currentStep: '기출 과업 시작'
        },
        observability: {
          ...prev.observability,
          failureClass: null,
          neisObservationLog: `'${topic}' 텍스트를 심층 독해하고 하네스 비계를 활용하여 논리적 이해를 구조화함.`
        }
      }));
      return;
    }

    // 2개 이상의 문항이 선택된 경우 (다중 텍스트 비교 대조 및 Synthesis 에세이)
    const hasG3 = items.some(i => i.grade === '고3');
    const hasG2 = items.some(i => i.grade === '고2');
    const gradeLevel: GradeLevel = hasG3 ? 'G3' : hasG2 ? 'G2' : 'G1';

    const passages = items.map(item => ({
      id: item.id,
      grade: item.grade,
      year: item.year,
      exam: item.exam,
      qNumber: item.qNumber,
      category: item.category,
      type: item.type,
      title: item.title,
      cleanTopic: cleanItemTopic(item.title),
      passage: item.passage,
      script: item.script,
      words: item.words,
      cefrLevel: item.cefrLevel,
      lexile: item.lexile,
    }));

    const cleanTopics = passages.map(p => p.cleanTopic);
    const combinedReadingPassage = passages
      .map((p, idx) => `[지문 ${idx + 1}: ${p.cleanTopic} (${p.year}년 ${p.exam} ${p.qNumber}번)]\n${p.passage || p.script || ''}`)
      .join('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n');

    const allWords = passages.flatMap(p => (p.words || []).map(w => w.word));
    const uniqueKeywords = Array.from(new Set(allWords)).slice(0, 6);

    const newActivity: ActivityContent = {
      id: `multi-${Date.now()}`,
      grade: gradeLevel,
      mode: 'read-write',
      title: `다중 텍스트 비교 분석: ${cleanTopics.slice(0, 2).join(' & ')}`,
      subTitle: `${items.length}개 기출 지문(${items.map(i => `${i.year} ${i.exam} ${i.qNumber}번`).join(', ')}) 비교 대조 및 종합(Synthesis) 작문`,
      badgeNumber: items.length,
      cefrLevel: passages[0].cefrLevel || 'B2',
      lexile: passages[0].lexile || '1150L',
      tags: ['다중텍스트', '비교독해', 'Synthesis', `${items.length}개 지문`],
      overview: `선택하신 ${items.length}개의 기출 지문을 교차 분석하고, 각 텍스트의 논리적 연결성과 상반된 관점을 비교하여 비판적 종합 에세이를 완성합니다.`,
      readingPassage: combinedReadingPassage,
      writingPrompt: `제시된 복수 지문 [${cleanTopics.slice(0, 2).join(']과 [')}]의 핵심 전제와 인과관계를 비교 분석하고, 두 관점을 종합(Synthesis)하여 자신만의 통찰을 120~160단어로 작성하세요.`,
      minWords: 100,
      targetKeywords: uniqueKeywords.length > 0 ? uniqueKeywords : ['perspective', 'contrast', 'synthesis', 'evidence'],
      handoffInstruction: {
        step1Title: `Step 1: ${items.length}개 텍스트 비교 분석 및 상호 대조 코넬 메모`,
        step2Title: 'Step 2: 비교 관점을 융합한 Synthesis 종합 에세이 작성',
        handoffKey: 'multiExamHandoff'
      },
      multiPassages: passages
    };

    setSelectedActivity(newActivity);
    setActiveTab('studio');

    setHarnessStatus(prev => ({
      ...prev,
      guide: {
        ...prev.guide,
        rule: `[복수 기출 연동] ${items.length}개 다중 텍스트 비교 분석 가드레일`,
        curriculumCode: `[12영어II/심화] 상호텍스트성 비교 및 비판적 Synthesis`,
        rubricCriteria: `복수 텍스트 간 논리적 연계성 및 어휘 다양성(TTR) 검증`
      },
      sensor: {
        ...prev.sensor,
        currentScore: null,
        status: 'idle',
        feedback: `${items.length}개 문항이 다중 텍스트 스튜디오에 바인딩되었습니다.`
      },
      loop: {
        ...prev.loop,
        attempts: 0,
        currentStep: '다중 지문 비교 분석 시작'
      },
      observability: {
        ...prev.observability,
        failureClass: null,
        neisObservationLog: `복수의 학술 텍스트(${cleanTopics.slice(0, 2).join(', ')})를 비교 독해하고 상호 텍스트성을 바탕으로 비판적 에세이를 작성함.`
      }
    }));
  };


  // 필터링된 활동 목록
  const filteredActivities = CURRICULUM_DATA.filter((item) => {
    if (selectedGrade !== 'ALL' && item.grade !== selectedGrade) return false;
    if (selectedMode !== 'all' && item.mode !== selectedMode) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.subTitle.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1E293B] flex flex-col font-sans selection:bg-honey-200">
      {/* 상단 헤더 & 필터 바 */}
      <Header
        currentGrade={selectedGrade}
        onSelectGrade={setSelectedGrade}
        currentMode={selectedMode}
        onSelectMode={setSelectedMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenExamBank={() => setIsExamBankOpen(true)}
      />

      {/* 2020~2026 기출 문제은행 모달 */}
      <ExamBankModal
        isOpen={isExamBankOpen}
        onClose={() => setIsExamBankOpen(false)}
        examItems={INITIAL_EXAM_BANK_SAMPLES}
        onLoadExamItem={handleLoadExamItem}
        onLoadExamItems={handleLoadMultipleExamItems}
      />

      {/* 메인 컨텐츠 영역 */}
      <main className="flex-1 pb-16">
        {activeTab === 'studio' && (
          <>
            {/* '처음이라면 이것부터' 추천 카드 섹션 */}
            <DashboardCards
              activities={filteredActivities}
              onSelectActivity={handleSelectActivity}
              selectedActivityId={selectedActivity.id}
            />

            {/* 현재 선택된 과업의 인터랙티브 스튜디오 워크스페이스 */}
            <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 mt-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-honey-500 animate-pulse"></span>
                  <h3 className="text-base font-bold text-slateText-title">
                    진행 중인 활동 스튜디오: <span className="text-honey-700">{selectedActivity.title}</span>
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('inspector')}
                  className="text-xs font-semibold text-honey-700 hover:text-honey-800 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" /> 6겹 하네스 동작 현황 보기
                </button>
              </div>

              {/* 활동 모드별 컴포넌트 마운트 */}
              {selectedActivity.mode.includes('-') ? (
                <IntegratedModule
                  activity={selectedActivity}
                  updateHarnessStatus={setHarnessStatus}
                  onStudentOutputChange={setStudentOutput}
                />
              ) : selectedActivity.mode === 'listening' ? (
                <ListeningModule
                  activity={selectedActivity}
                  updateHarnessStatus={setHarnessStatus}
                />
              ) : selectedActivity.mode === 'reading' ? (
                <ReadingModule
                  activity={selectedActivity}
                  updateHarnessStatus={setHarnessStatus}
                />
              ) : selectedActivity.mode === 'speaking' ? (
                <SpeakingModule
                  activity={selectedActivity}
                  updateHarnessStatus={setHarnessStatus}
                />
              ) : (
                <WritingModule
                  activity={selectedActivity}
                  updateHarnessStatus={setHarnessStatus}
                  onStudentOutputChange={setStudentOutput}
                />
              )}
            </section>
          </>
        )}

        {activeTab === 'inspector' && (
          <HarnessInspector
            status={harnessStatus}
            activity={selectedActivity}
            onResetLoop={() =>
              setHarnessStatus((p) => ({
                ...p,
                loop: { ...p.loop, attempts: 0, escalated: false },
              }))
            }
          />
        )}

        {activeTab === 'teacher' && (
          <TeacherDashboard
            activity={selectedActivity}
            timeSpent={timeSpent}
            attemptsCount={harnessStatus.loop.attempts}
            sensorScore={harnessStatus.sensor.currentScore}
            studentOutput={studentOutput}
          />
        )}
      </main>

      {/* 하단 푸터 */}
      <footer className="w-full border-t border-stone-200 bg-white py-6 px-4 sm:px-8 text-center text-xs text-slateText-muted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            <strong>Vibe English Harness Studio</strong> — 2022 개정 교육과정 및 수능 체계 연계 영어과 에이전틱 플랫폼
          </p>
          <p className="text-stone-400">
            기반 모델: Gemini / Claude / GPT + 6-Layer Educational Harness
          </p>
        </div>
      </footer>
    </div>
  );
};
