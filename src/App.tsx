import React, { useState, useEffect, useRef } from 'react';
import { GradeLevel, ActivityMode, ActivityContent, HarnessLayerStatus, DifficultyLevel } from './types/harness';
import { UserProfile } from './types/auth';
import { CURRICULUM_DATA } from './data/curriculumData';
import { INITIAL_EXAM_BANK_SAMPLES, ExamBankItem } from './data/examBank';
import { Header } from './components/Header';
import { DashboardCards } from './components/DashboardCards';
import { HarnessInspector } from './components/HarnessInspector';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { LoginModal } from './components/auth/LoginModal';
import { ExamBankModal } from './components/ExamBankModal';
import { ListeningModule } from './components/modules/ListeningModule';
import { ReadingModule } from './components/modules/ReadingModule';
import { SpeakingModule } from './components/modules/SpeakingModule';
import { WritingModule } from './components/modules/WritingModule';
import { IntegratedModule } from './components/modules/IntegratedModule';
import { Sparkles, Layers, SlidersHorizontal, BookOpen, Headphones, PenTool, MessageSquare } from 'lucide-react';
import { loadStudentProgress, saveStudentProgress, clearStudentProgress } from './utils/storage';
import { loadCurrentUser, saveCurrentUser, logoutUser, saveSubmission } from './utils/authStorage';
import { 
  loadActivities, saveActivities, deleteActivityById, 
  deleteActivitiesByIds, clearAllActivities, resetToDefaultActivities,
  addActivitiesToStudio 
} from './utils/activityStorage';
import { runFullSmartSensorInspection } from './utils/sensorEngine';

export const App: React.FC = () => {
  // 인증 및 사용자 세션 상태
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => loadCurrentUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(() => !loadCurrentUser());

  // 2022 개정 맞춤형 학습 난이도 상태 (초급 🌱 / 중급 🌿 / 고급 🌳)
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>(() => {
    try {
      const saved = localStorage.getItem('english_difficulty_level');
      if (saved === 'beginner' || saved === 'intermediate' || saved === 'advanced') {
        return saved;
      }
    } catch (e) {}
    return 'intermediate';
  });

  const handleSelectDifficulty = (level: DifficultyLevel) => {
    setDifficultyLevel(level);
    try {
      localStorage.setItem('english_difficulty_level', level);
    } catch (e) {}
  };

  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | 'ALL'>('ALL');
  const [selectedMode, setSelectedMode] = useState<ActivityMode>('all');
  const [activeTab, setActiveTab] = useState<'studio' | 'inspector' | 'teacher' | 'studentDashboard'>('studio');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExamBankOpen, setIsExamBankOpen] = useState(false);

  // 스튜디오 문항 목록 동적 관리 (삭제 및 복구 지원)
  const [activities, setActivities] = useState<ActivityContent[]>(() => loadActivities());

  // 로컬 저장소에서 이전 학습 기록 복원
  const initialSaved = useRef(loadStudentProgress()).current;
  const initialActivity = 
    activities.find((a) => a.id === initialSaved.selectedActivityId) || activities[0] || CURRICULUM_DATA[0];

  // 현재 선택된 과업
  const [selectedActivity, setSelectedActivity] = useState<ActivityContent>(initialActivity);

  // 학습 몰입 시간 측정 (초)
  const [timeSpent, setTimeSpent] = useState<number>(initialSaved.timeSpent || 0);
  const [studentOutput, setStudentOutput] = useState<string>(initialSaved.studentOutput || '');
  const [lastSavedAt, setLastSavedAt] = useState<string>(initialSaved.lastSavedAt || '방금 전');
  // 2020~2026 전체 기출 문항 상태 (초기 샘플 -> 백그라운드에서 2,209문항 전체 로드)
  const [examItems, setExamItems] = useState<ExamBankItem[]>(INITIAL_EXAM_BANK_SAMPLES);

  // 앱 마운트 시 2020~2026 전체 기출 데이터 백그라운드 프리로드
  useEffect(() => {
    fetch('/data/exam_bank.json')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ExamBankItem[] | null) => {
        if (Array.isArray(data) && data.length > 0) {
          setExamItems(data);
        }
      })
      .catch((err) => console.warn('Preload exam bank data failed:', err));
  }, []);

  // 6단계 학습 코칭 안전망 상태 관리
  const [harnessStatus, setHarnessStatus] = useState<HarnessLayerStatus>({
    guide: {
      rule: 'AI가 답을 대신 써주지 않고 단계별 질문과 힌트로 생각을 이끕니다.',
      curriculumCode: '2022개정 [10영01-02] 세부 정보 파악 및 요약',
      rubricCriteria: '명확성(Clarity) 40%, 논리적 응집성 30%, 어법 정확성 30%',
      active: true,
    },
    sensor: {
      name: '어휘 다양성 및 문법·표현 점검',
      currentScore: null,
      status: 'idle',
      feedback: '학생 입력을 대기 중입니다.',
    },
    loop: {
      attempts: initialSaved.attemptsCount || 0,
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
      allowAnswerGeneration: false, // 대필 원천 차단
      allowScaffolding: true,
      tokenBudgetRemaining: 2000,
    },
    observability: {
      tripwireTriggered: false,
      timeSpentSeconds: initialSaved.timeSpent || 0,
      failureClass: null,
      neisObservationLog: '',
    },
  });

  // 로그인 성공 핸들러
  const handleLoginSuccess = (user: UserProfile) => {
    saveCurrentUser(user);
    setCurrentUser(user);
    setIsLoginModalOpen(false);
    // 교사인 경우 교사 대시보드로, 학생인 경우 스튜디오 또는 학생 대시보드로 이동
    if (user.role === 'teacher') {
      setActiveTab('teacher');
    } else {
      setActiveTab('studio');
    }
  };

  // 로그아웃 핸들러
  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setIsLoginModalOpen(true);
  };

  // 타이머 & 주기적 자동 저장 (5초 주기)
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

        if (next % 5 === 0) {
          saveStudentProgress({ timeSpent: next });
          setLastSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 학생 산출물 변경 시 자동 저장 및 제출 기록 연동
  const handleStudentOutputChange = (output: string) => {
    setStudentOutput(output);
    saveStudentProgress({ studentOutput: output });
    
    // 만약 학생으로 로그인되어 있고 유의미한 출력이 제출/완성되었을 때 제출물 DB에 보존
    if (currentUser && currentUser.role === 'student' && output.trim().length > 20) {
      const refPassage = selectedActivity.readingPassage || 
        selectedActivity.multiPassages?.map(p => p.passage || p.script || '').join(' ') || '';
      const report = runFullSmartSensorInspection(output, refPassage, 60);

      saveSubmission({
        studentId: currentUser.id,
        studentName: currentUser.name,
        studentNumber: currentUser.studentNumber,
        activityId: selectedActivity.id,
        activityTitle: selectedActivity.title,
        grade: selectedActivity.grade,
        mode: selectedActivity.mode,
        timeSpentSeconds: timeSpent,
        attemptsCount: harnessStatus.loop.attempts || 1,
        studentOutput: output,
        sensorReport: report,
      });
    }
  };

  // 초기화 함수
  const handleResetProgress = () => {
    if (window.confirm('작성 중인 모든 학습 내용과 메모를 처음 상태로 되돌리시겠습니까?')) {
      clearStudentProgress();
      setTimeSpent(0);
      setStudentOutput('');
      setLastSavedAt('방금 전');
      setSelectedActivity(CURRICULUM_DATA[0]);
      setHarnessStatus((h) => ({
        ...h,
        loop: { ...h.loop, attempts: 0, currentStep: '1차 과업 수행 중' },
        memory: { handoffData: null, historyCount: 0, keyInsights: [] },
        observability: { ...h.observability, timeSpentSeconds: 0, neisObservationLog: '' },
      }));
      window.location.reload();
    }
  };

  // 과업 변경 시 가이드 업데이트 및 로컬 저장
  const handleSelectActivity = (activity: ActivityContent) => {
    setSelectedActivity(activity);
    saveStudentProgress({ selectedActivityId: activity.id });
    setLastSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

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
  const cleanItemTopic = (title: string): string => {
    if (!title) return '학술 텍스트 심층 독해';
    let clean = title.replace(/\[.*?\]\s*/g, '').replace(/\b\d+번[:\s]*/g, '').trim();
    clean = clean.replace(/^(다중 텍스트 비교 분석|다중 텍스트 심층 비교 독해|주제 중심 독해|대의 파악|빈칸 추론|순서 배열|주제 파악)[:\s]*/, '').trim();
    return clean || '학술 영어 텍스트 심층 독해';
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

      // 스튜디오 목록에 실제로 영구 추가
      const updatedActivities = addActivitiesToStudio([newActivity]);
      setActivities(updatedActivities);
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

    const cleanTitles = passages.map(p => `'${p.cleanTopic}'`).join(' 및 ');

    const combinedActivity: ActivityContent = {
      id: `multi-exam-${Date.now()}`,
      grade: gradeLevel,
      mode: 'read-write',
      title: `[복수 기출 연계 심층 분석] ${passages.map(p => `[${p.year} ${p.exam} ${p.qNumber}]`).join(' + ')}`,
      subTitle: `${passages.length}개 기출 텍스트의 상호 텍스트성(Intertextuality) 비교 분석 및 Synthesis 에세이`,
      badgeNumber: passages.length,
      cefrLevel: 'B2~C1',
      lexile: '1150L+',
      tags: ['다중 지문', '기출 연계', '비교 독해', 'Synthesis 에세이'],
      overview: `서로 다른 관점과 맥락을 다룬 ${passages.length}개의 기출 지문을 교차 분석합니다. 각 지문의 중심 논지와 인과관계를 비교·대조하고, 이를 통합하여 자신만의 학술 에세이를 완성합니다.`,
      multiPassages: passages,
      writingPrompt: `제시된 ${passages.length}개 기출 텍스트(${cleanTitles})의 핵심 논지와 상이한 논거를 종합 분석하고, 두 관점의 상호작용 또는 해결 방안에 대한 자신의 견해를 120~180단어로 작성하세요. (각 지문에서 최소 1개 이상의 핵심 개념을 인용·패러프레이징할 것)`,
      minWords: 100,
      handoffInstruction: {
        step1Title: 'Step 1: 다중 텍스트 비교 대조 및 핵심 논거 코넬 메모',
        step2Title: 'Step 2: 메모를 바탕으로 한 다중 지문 Synthesis 에세이 작문',
        handoffKey: 'multiExamHandoff'
      }
    };

    // 스튜디오 목록에 복수 문항 연계 과업 영구 추가
    const updatedActivities = addActivitiesToStudio([combinedActivity]);
    setActivities(updatedActivities);
    setSelectedActivity(combinedActivity);
    setActiveTab('studio');

    setHarnessStatus(prev => ({
      ...prev,
      guide: {
        ...prev.guide,
        rule: `[다중 기출 비교 독해] ${passages.length}개 지문 통합 가드레일`,
        curriculumCode: `2022 개정 심화영어 [12심영02-05] 다중 텍스트 비판적 종합 분석`,
        rubricCriteria: `1150L+ 다중 텍스트 간 논리적 연계성 및 Synthesis 역량 평가`
      },
      sensor: {
        ...prev.sensor,
        currentScore: null,
        status: 'idle',
        feedback: `${passages.length}개의 기출 지문이 연동되었습니다.`
      },
      loop: {
        ...prev.loop,
        attempts: 0,
        currentStep: '다중 지문 비교 분석 시작'
      },
      observability: {
        ...prev.observability,
        failureClass: null,
        neisObservationLog: `${cleanTitles}를 제재로 한 복수의 학술 텍스트를 비교·분석하는 심층 독해 과업을 수행함.`
      }
    }));
  };

  // 문항 삭제/복구 핸들러
  const handleDeleteActivity = (activityId: string) => {
    const updated = deleteActivityById(activityId);
    setActivities(updated);
    if (selectedActivity.id === activityId) {
      if (updated.length > 0) {
        handleSelectActivity(updated[0]);
      }
    }
  };

  const handleDeleteMultipleActivities = (activityIds: string[]) => {
    const updated = deleteActivitiesByIds(activityIds);
    setActivities(updated);
    if (activityIds.includes(selectedActivity.id)) {
      if (updated.length > 0) {
        handleSelectActivity(updated[0]);
      }
    }
  };

  const handleClearAllActivities = () => {
    const updated = clearAllActivities();
    setActivities(updated);
  };

  const handleResetDefaultActivities = () => {
    const updated = resetToDefaultActivities();
    setActivities(updated);
    if (updated.length > 0) {
      handleSelectActivity(updated[0]);
    }
  };

  // 활동 모드(듣기/읽기/말하기/쓰기) 선택 시 작업 화면 즉시 전환 핸들러
  const handleSelectMode = (mode: ActivityMode) => {
    setSelectedMode(mode);
    if (mode === 'all') return;

    // 해당 모드에 속한 활동이 있으면 선택, 없으면 현재 활동의 모드를 즉시 변경
    const matching = activities.find((a) => a.mode === mode);
    if (matching) {
      handleSelectActivity(matching);
    } else {
      setSelectedActivity((prev) => ({
        ...prev,
        mode: mode,
      }));
    }
  };

  // 과업 필터링 (동적 activities 기준)
  const filteredActivities = activities.filter((activity) => {
    const matchesGrade = selectedGrade === 'ALL' || activity.grade === selectedGrade;
    const matchesMode =
      selectedMode === 'all'
        ? true
        : selectedMode === 'read-write'
        ? activity.mode === 'read-write'
        : selectedMode === 'listen-speak'
        ? activity.mode === 'listen-speak'
        : selectedMode === 'listen-write'
        ? activity.mode === 'listen-write'
        : activity.mode === selectedMode;

    const matchesSearch =
      searchQuery === '' ||
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.subTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesGrade && matchesMode && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slateText-body flex flex-col font-sans selection:bg-honey-200 selection:text-slateText-title">
      {/* 구글 SSO 로그인 모달 */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* 헤더 네비게이션 */}
      <Header
        currentGrade={selectedGrade}
        onSelectGrade={setSelectedGrade}
        currentMode={selectedMode}
        onSelectMode={handleSelectMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenExamBank={() => setIsExamBankOpen(true)}
        lastSavedAt={lastSavedAt}
        onResetProgress={handleResetProgress}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* 기출 문제은행 모달 */}
      <ExamBankModal
        isOpen={isExamBankOpen}
        onClose={() => setIsExamBankOpen(false)}
        onLoadExamItem={handleLoadExamItem}
        onLoadExamItems={handleLoadMultipleExamItems}
        examItems={examItems}
      />

      {/* 메인 뷰 컨테이너 */}
      <main className="flex-1 pb-16">
        {activeTab === 'studio' && (
          <>
            {/* 상단 큐레이션 과업 카드 그리드 (Pills 필터와 실시간 연동 및 삭제 기능 제공) */}
            <DashboardCards
              activities={filteredActivities}
              selectedActivityId={selectedActivity.id}
              onSelectActivity={handleSelectActivity}
              onDeleteActivity={handleDeleteActivity}
              onDeleteMultipleActivities={handleDeleteMultipleActivities}
              onClearAllActivities={handleClearAllActivities}
              onResetDefaultActivities={handleResetDefaultActivities}
            />

            {/* 현재 선택된 과업의 인터랙티브 스튜디오 워크스페이스 */}
            <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 mt-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-honey-500 animate-pulse"></span>
                  <h3 className="text-base font-bold text-slateText-title">
                    진행 중인 학습: <span className="text-honey-700">{selectedActivity.title}</span>
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab('studentDashboard')}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    📊 내 학습 대시보드 보기
                  </button>
                  <button
                    onClick={() => setActiveTab('inspector')}
                    className="text-xs font-semibold text-honey-700 hover:text-honey-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> AI 6단계 코칭 상태
                  </button>
                </div>
              </div>

              {/* 상단 컨트롤 바: 진행 활동명 + 2022 개정 수준별 난이도 토글 스위치 */}
              <div className="mb-4 p-4 bg-white rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-2.5 h-2.5 rounded-full bg-honey-500 animate-pulse"></span>
                    <span className="text-[11px] font-extrabold text-stone-400 font-mono uppercase tracking-wider">Active Learning Task</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-honey-100 text-honey-800">
                      {selectedActivity.grade} | {selectedActivity.cefrLevel}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slateText-title">
                    {selectedActivity.title}
                  </h3>
                </div>

                {/* 수준별 난이도(비계) 선택 토글 버튼 바 */}
                <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl border border-stone-200 self-start md:self-auto">
                  {[
                    { id: 'beginner', label: '🌱 초급', sub: '기초 비계·블록 조립', color: 'text-emerald-700' },
                    { id: 'intermediate', label: '🌿 중급', sub: '표준 완성·프레임', color: 'text-amber-700' },
                    { id: 'advanced', label: '🌳 고급', sub: '심층 확장·자유 영작', color: 'text-purple-700' }
                  ].map((lvl) => {
                    const isSelected = difficultyLevel === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => handleSelectDifficulty(lvl.id as DifficultyLevel)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-white text-stone-900 shadow-sm border border-stone-300 ring-2 ring-honey-400'
                            : 'text-stone-500 hover:text-stone-800 hover:bg-stone-200/50'
                        }`}
                      >
                        <span className={isSelected ? lvl.color : ''}>{lvl.label}</span>
                        <span className="text-[10px] text-stone-400 font-normal hidden lg:inline">
                          ({lvl.sub})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2022 개정 이해-표현 연계 중심의 직관적 3대 과업 탭 바 */}
              <div className="mb-4 flex flex-wrap items-center gap-2 p-1.5 bg-stone-100/90 rounded-2xl border border-stone-200 shadow-xs">
                {[
                  { id: 'speaking', label: '🎧🗣️ 1. 듣고 말하기', sub: 'Listen & Speak (청취 ➔ 쉐도잉 발화)' },
                  { id: 'writing', label: '📖✍️ 2. 읽고 쓰기', sub: 'Read & Write (지문 독해 ➔ 수준별 서술 영작)' },
                  { id: 'read-write', label: '📑✍️ 3. 듣고 요약하기', sub: 'Listen & Summary (담화 청취 ➔ 핵심 압축 요약)' },
                  { id: 'listening', label: '🎧 실전 듣기 평가', sub: '4지선다 객관식 퀴즈 모드' },
                ].map((tab) => {
                  const isActive = selectedActivity.mode === tab.id || (tab.id === 'read-write' && selectedActivity.mode.includes('-'));
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setSelectedActivity((prev) => ({
                          ...prev,
                          mode: tab.id as any,
                        }));
                      }}
                      className={`flex-1 min-w-[150px] py-2 px-3 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                        isActive
                          ? 'bg-white text-slateText-title font-extrabold shadow-sm border border-stone-300 ring-2 ring-honey-400'
                          : 'text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 font-semibold'
                      }`}
                    >
                      <span className="text-xs">{tab.label}</span>
                      <span className="text-[10px] text-stone-400 font-normal">{tab.sub}</span>
                    </button>
                  );
                })}
              </div>

              {/* 활동 모드별 컴포넌트 마운트 (난이도 prop 전달) */}
              {selectedActivity.mode.includes('-') ? (
                <IntegratedModule
                  activity={selectedActivity}
                  updateHarnessStatus={setHarnessStatus}
                  onStudentOutputChange={handleStudentOutputChange}
                  difficultyLevel={difficultyLevel}
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
                  difficultyLevel={difficultyLevel}
                />
              ) : (
                <WritingModule
                  activity={selectedActivity}
                  updateHarnessStatus={setHarnessStatus}
                  onStudentOutputChange={handleStudentOutputChange}
                  difficultyLevel={difficultyLevel}
                />
              )}
            </section>
          </>
        )}

        {/* AI 6단계 코칭 안전망 인스펙터 */}
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

        {/* 학생 전용 개인 맞춤 학습 대시보드 */}
        {activeTab === 'studentDashboard' && (
          <StudentDashboard
            user={currentUser || {
              id: 'guest_student',
              name: '학생(게스트)',
              email: 'guest@student.school.kr',
              avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
              role: 'student',
              grade: 'G2',
            }}
            onSelectActivity={(actId) => {
              const act = CURRICULUM_DATA.find((a) => a.id === actId);
              if (act) {
                handleSelectActivity(act);
                setActiveTab('studio');
              }
            }}
          />
        )}

        {/* 교사용 학생 관찰 기록 & 생활기록부 세특 관제 센터 */}
        {activeTab === 'teacher' && (
          <TeacherDashboard
            activity={selectedActivity}
            timeSpent={timeSpent}
            attemptsCount={harnessStatus.loop.attempts}
            sensorScore={harnessStatus.sensor.currentScore}
            studentOutput={studentOutput}
            user={currentUser || undefined}
          />
        )}
      </main>

      {/* 하단 푸터 */}
      <footer className="w-full border-t border-stone-200 bg-white py-6 px-4 sm:px-8 text-center text-xs text-slateText-muted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            <strong>바이브 영어 학습 스튜디오</strong> — 2022 개정 교육과정 및 수능·모의고사 연계 자기주도 학습 플랫폼
          </p>
          <p className="text-stone-400">
            학생의 생각을 키우는 6단계 AI 학습 안전망 (대필 방지 & 단계별 힌트 지원)
          </p>
        </div>
      </footer>
    </div>
  );
};
