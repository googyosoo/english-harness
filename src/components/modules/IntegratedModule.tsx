import React, { useState, useEffect } from 'react';
import { ActivityContent, HarnessLayerStatus, DifficultyLevel } from '../../types/harness';
import { AudioPlayer } from '../common/AudioPlayer';
import { Layers, ArrowRight, CheckCircle2, Database, FileEdit, Lightbulb } from 'lucide-react';
import { loadStudentProgress, saveStudentProgress } from '../../utils/storage';
import { runFullSmartSensorInspection, SmartSensorReportData } from '../../utils/sensorEngine';
import { IntelligentSensorReport } from '../common/IntelligentSensorReport';

interface IntegratedModuleProps {
  activity: ActivityContent;
  updateHarnessStatus: (updater: (prev: HarnessLayerStatus) => HarnessLayerStatus) => void;
  onStudentOutputChange?: (output: string) => void;
  difficultyLevel?: DifficultyLevel;
}

export const IntegratedModule: React.FC<IntegratedModuleProps> = ({
  activity,
  updateHarnessStatus,
  onStudentOutputChange,
  difficultyLevel = 'intermediate',
}) => {
  // 로컬 저장소에서 이전 작성 상태 복원
  const savedData = loadStudentProgress().integratedDrafts[activity.id];

  const [currentStep, setCurrentStep] = useState<1 | 2>(savedData?.currentStep || 1);
  const [step1Notes, setStep1Notes] = useState(savedData?.step1Notes || '');
  const [collectedEvidence, setCollectedEvidence] = useState<string[]>(savedData?.evidence || []);
  const [selectedStance, setSelectedStance] = useState<'pro' | 'con' | ''>(savedData?.stance || '');
  const [step2Output, setStep2Output] = useState(savedData?.step2Output || '');
  const [completedHandoff, setCompletedHandoff] = useState(Boolean(savedData?.step1Notes));
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [smartReport, setSmartReport] = useState<SmartSensorReportData | null>(null);

  // 복수 지문 탭 및 뷰 모드 상태
  const [activePassageIndex, setActivePassageIndex] = useState(0);
  const [isSideBySide, setIsSideBySide] = useState(false);

  // 과업 변경 시 해당 과업 데이터 복원
  useEffect(() => {
    const p = loadStudentProgress().integratedDrafts[activity.id];
    if (p) {
      setCurrentStep(p.currentStep || 1);
      setStep1Notes(p.step1Notes || '');
      setCollectedEvidence(p.evidence || []);
      setSelectedStance(p.stance || '');
      setStep2Output(p.step2Output || '');
      setCompletedHandoff(Boolean(p.step1Notes));
      if (p.step2Output && onStudentOutputChange) {
        onStudentOutputChange(p.step2Output);
      }
    } else {
      setCurrentStep(1);
      setStep1Notes('');
      setCollectedEvidence([]);
      setSelectedStance('');
      setStep2Output('');
      setCompletedHandoff(false);
    }
    setFeedbackMsg('');
  }, [activity.id]);

  // 로컬 저장 헬퍼
  const saveProgressToStorage = (updates: Partial<{
    step1Notes: string;
    evidence: string[];
    stance: 'pro' | 'con' | '';
    step2Output: string;
    currentStep: 1 | 2;
  }>) => {
    const progress = loadStudentProgress();
    const currentDraft = progress.integratedDrafts[activity.id] || {
      step1Notes: '',
      evidence: [],
      stance: '',
      step2Output: '',
      currentStep: 1,
    };
    const updatedDraft = { ...currentDraft, ...updates };

    saveStudentProgress({
      integratedDrafts: {
        ...progress.integratedDrafts,
        [activity.id]: updatedDraft,
      },
      studentOutput: updates.step2Output !== undefined ? updates.step2Output : progress.studentOutput,
    });
  };

  const handleStep1NotesChange = (text: string) => {
    setStep1Notes(text);
    saveProgressToStorage({ step1Notes: text });
  };

  const handleStep2OutputChange = (text: string) => {
    setStep2Output(text);
    if (onStudentOutputChange) onStudentOutputChange(text);
    saveProgressToStorage({ step2Output: text });
  };

  // 생각 이어쓰기 실행 (Step 1 ➔ Step 2)
  const handleHandoff = () => {
    setCurrentStep(2);
    setCompletedHandoff(true);
    saveProgressToStorage({ currentStep: 2 });

    const handoffPayload = {
      notes: step1Notes,
      evidence: collectedEvidence,
      stance: selectedStance,
      timestamp: new Date().toISOString()
    };

    updateHarnessStatus(prev => ({
      ...prev,
      memory: {
        ...prev.memory,
        handoffData: handoffPayload,
        historyCount: prev.memory.historyCount + 1,
        keyInsights: [
          ...prev.memory.keyInsights,
          `1단계 생각 정리: [${step1Notes.slice(0, 20)}...] 내용이 2단계 글쓰기로 안전하게 전달됨`
        ]
      },
      loop: {
        ...prev.loop,
        currentStep: '2단계 생각 이어쓰기 과업 진행 중'
      }
    }));
  };

  // 학술 대체어 원클릭 치환 함수
  const handleApplySuggestion = (original: string, replacement: string) => {
    const regex = new RegExp(`\\b${original}\\b`, 'i');
    const newText = step2Output.replace(regex, replacement);
    handleStep2OutputChange(newText);

    const referencePassage = activity.readingPassage || 
      activity.multiPassages?.map(p => p.passage || p.script || '').join(' ');
    const report = runFullSmartSensorInspection(newText, referencePassage, 60);
    setSmartReport(report);
  };

  // Step 2 최종 제출 및 지능형 센서 검사
  const handleSubmitStep2 = () => {
    if (onStudentOutputChange) {
      onStudentOutputChange(step2Output);
    }

    const referencePassage = activity.readingPassage || 
      activity.multiPassages?.map(p => p.passage || p.script || '').join(' ');

    const report = runFullSmartSensorInspection(step2Output, referencePassage, 60);
    setSmartReport(report);

    const vocab = report.vocabulary;
    const awlList = vocab.awlWordsFound.slice(0, 3).join(', ');

    setFeedbackMsg('🎉 연계 활동 완료! 1단계에서 정리한 핵심 생각과 근거가 2단계 완성 산출물로 훌륭하게 이어졌습니다.');

    updateHarnessStatus(prev => ({
      ...prev,
      sensor: {
        name: '생각 이어쓰기 완결성 & CEFR 어휘 프로파일러 센서',
        currentScore: report.overallScore,
        status: report.status,
        feedback: report.feedbackSummary,
      },
      loop: {
        ...prev.loop,
        attempts: prev.loop.attempts + 1,
        currentStep: '2단계 최종 에세이 진단 완료',
      },
      observability: {
        ...prev.observability,
        neisObservationLog: `[${activity.title}] 2단계 연계 활동에서 1단계의 분석적 사고 결과를 2단계 표현 산출물로 유실 없이 통합 전이함. 어휘 다양성(TTR ${vocab.ttr}%) 및 학술 어휘(${vocab.levels.advanced.percentage + vocab.levels.awl.percentage}%)${awlList ? `(${awlList} 등)` : ''}를 논리적 연결사와 함께 조화롭게 구사함.`
      }
    }));
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-warm-sm">
      {/* 모듈 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-stone-100 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-honey-100 text-honey-800 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slateText-title">
                {activity.title}
              </h3>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-honey-100 text-honey-800 border border-honey-300">
                🔗 2개 영역 통합 연계
              </span>
            </div>
            <p className="text-xs text-slateText-muted">{activity.subTitle}</p>
          </div>
        </div>

        {/* 2단계 인디케이터 */}
        <div className="flex items-center gap-2 bg-[#F8F6F0] p-1.5 rounded-xl border border-stone-200 text-xs">
          <button
            onClick={() => {
              setCurrentStep(1);
              saveProgressToStorage({ currentStep: 1 });
            }}
            className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
              currentStep === 1
                ? 'bg-honey-400 text-slateText-title shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>1단계 (내용 정리)</span>
            {completedHandoff && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
          </button>
          <ArrowRight className="w-3 h-3 text-stone-400" />
          <button
            onClick={() => {
              if (completedHandoff || step1Notes.trim()) {
                setCurrentStep(2);
                saveProgressToStorage({ currentStep: 2 });
              }
            }}
            className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
              currentStep === 2
                ? 'bg-honey-400 text-slateText-title shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>2단계 (생각 이어쓰기)</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1단계 화면 (수집, 청취, 독해, 메모) */}
      {/* ============================================================ */}
      {currentStep === 1 && (
        <div className="space-y-5">
          <div className="p-4 bg-honey-50/50 rounded-xl border border-honey-200">
            <h4 className="font-bold text-xs text-honey-900 uppercase mb-1">
              {activity.handoffInstruction?.step1Title}
            </h4>
            <p className="text-xs text-slateText-body leading-relaxed">
              2단계 활동(말하기/쓰기)의 재료가 될 핵심 정보와 논거를 먼저 파악하고 정리하세요. 여기서 작성된 메모는 하네스 메모리를 통해 2단계 작업창으로 자동 전달됩니다.
            </p>
          </div>

          {/* 오디오가 있는 경우 */}
          {activity.audioScript && (
            <div>
              <label className="block text-xs font-bold text-slateText-title mb-1">
                🎧 1차 청취 음원 (배속 조절 가능)
              </label>
              <AudioPlayer script={activity.audioScript} duration={activity.audioDuration} />
            </div>
          )}

          {/* 독해 지문 (복수 지문 지원: 탭 또는 2열 나란히 보기) */}
          {activity.multiPassages && activity.multiPassages.length >= 2 ? (
            <div className="bg-[#FDFBF7] p-4 rounded-xl border border-stone-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/80 pb-2.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-slateText-title mr-1">
                    📖 다중 비교 텍스트 ({activity.multiPassages.length}개):
                  </span>
                  {activity.multiPassages.map((p, idx) => (
                    <button
                      key={p.id || idx}
                      onClick={() => {
                        setActivePassageIndex(idx);
                        setIsSideBySide(false);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        !isSideBySide && activePassageIndex === idx
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                      }`}
                    >
                      <span>지문 {idx + 1}: {p.cleanTopic.slice(0, 16)}...</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setIsSideBySide(!isSideBySide)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                    isSideBySide
                      ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border-stone-200'
                  }`}
                >
                  {isSideBySide ? '단일 탭 뷰로 전환' : '👥 나란히 2열 비교 뷰'}
                </button>
              </div>

              {/* 2열 나란히 보기 뷰 */}
              {isSideBySide ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activity.multiPassages.map((p, idx) => (
                    <div key={p.id || idx} className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-inner space-y-2">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-1.5">
                        <span className="text-xs font-bold text-indigo-700">
                          지문 {idx + 1}: {p.cleanTopic}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {p.year}년 {p.exam} {p.qNumber}번 | {p.lexile}
                        </span>
                      </div>
                      <div className="text-xs text-slateText-body font-serif leading-relaxed whitespace-pre-line max-h-72 overflow-y-auto pr-1">
                        {p.passage || p.script}
                      </div>
                      {p.words && p.words.length > 0 && (
                        <div className="pt-2 border-t border-stone-100 flex flex-wrap gap-1">
                          {p.words.slice(0, 3).map((w, wIdx) => (
                            <span key={wIdx} className="text-[10px] px-1.5 py-0.5 bg-stone-50 border border-stone-200 rounded text-stone-600">
                              {w.word}: {w.meaning}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* 개별 탭 뷰 */
                (() => {
                  const currentP = activity.multiPassages[activePassageIndex] || activity.multiPassages[0];
                  return (
                    <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-inner space-y-2.5">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                        <div>
                          <h5 className="text-xs font-bold text-slateText-title">
                            [지문 {activePassageIndex + 1}] {currentP.cleanTopic}
                          </h5>
                          <p className="text-[11px] text-stone-400">
                            {currentP.year}년 {currentP.exam} {currentP.qNumber}번 기출 ({currentP.type})
                          </p>
                        </div>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                          {currentP.lexile} | {currentP.cefrLevel}
                        </span>
                      </div>

                      <div className="text-xs text-slateText-body font-serif leading-relaxed whitespace-pre-line max-h-80 overflow-y-auto pr-1">
                        {currentP.passage || currentP.script}
                      </div>

                      {currentP.words && currentP.words.length > 0 && (
                        <div className="pt-2.5 border-t border-stone-100">
                          <span className="text-[11px] font-bold text-stone-500 mr-2">핵심 어휘:</span>
                          <div className="inline-flex flex-wrap gap-1.5 mt-1">
                            {currentP.words.map((w, wIdx) => (
                              <span key={wIdx} className="text-[10px] px-2 py-0.5 bg-honey-50 border border-honey-200 rounded text-amber-900 font-medium">
                                <strong>{w.word}</strong>: {w.meaning}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>
          ) : (
            activity.readingPassage && (
              <div className="bg-[#FDFBF7] p-4 rounded-xl border border-stone-200">
                <label className="block text-xs font-bold text-slateText-title mb-2">
                  📖 1차 분석 텍스트
                </label>
                <div className="text-xs text-slateText-body font-serif leading-relaxed whitespace-pre-line bg-white p-3.5 rounded-lg border border-stone-200 shadow-inner">
                  {activity.readingPassage}
                </div>
              </div>
            )
          )}

          {/* 1단계 메모 작성 영역 */}
          <div>
            <label className="block text-xs font-bold text-slateText-title mb-1.5 flex items-center justify-between">
              <span>📝 1단계 핵심 생각 정리 (코넬 메모 / 핵심 근거)</span>
              <span className="text-[11px] text-emerald-600 font-medium">실시간 자동 저장 중</span>
            </label>
            <textarea
              rows={4}
              value={step1Notes}
              onChange={(e) => handleStep1NotesChange(e.target.value)}
              placeholder="음원이나 지문에서 파악한 핵심 단어, 주요 사실, 인과관계, 찬반 논거 등을 영어 또는 한국어로 자유롭게 정리하세요... (2단계 글쓰기로 자동 전달됩니다)"
              className="w-full p-3.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-honey-500 shadow-inner leading-relaxed"
            />
          </div>

          {/* 2단계 전환 버튼 */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleHandoff}
              disabled={!step1Notes.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-honey-400 hover:bg-honey-500 disabled:opacity-50 text-slateText-title font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <span>1단계 메모 저장하고 2단계 글쓰기로 이동</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2단계 화면 (1단계 메모를 바탕으로 글 완성) */}
      {/* ============================================================ */}
      {currentStep === 2 && (
        <div className="space-y-5">
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200">
            <h4 className="font-bold text-xs text-emerald-900 uppercase mb-1">
              {activity.handoffInstruction?.step2Title}
            </h4>
            <p className="text-xs text-emerald-800 leading-relaxed">
              1단계에서 정리한 메모가 안전하게 연결되었습니다. 이를 바탕으로 최종 산출물을 완성하세요.
            </p>
          </div>

          {/* 1단계에서 넘어온 메모 카드 표시 */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slateText-title flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-honey-600" />
                [기억된 생각] 1단계에서 정리한 핵심 메모
              </span>
              <button
                onClick={() => {
                  setCurrentStep(1);
                  saveProgressToStorage({ currentStep: 1 });
                }}
                className="text-[11px] text-honey-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <FileEdit className="w-3 h-3" /> 메모 수정하기
              </button>
            </div>
            <div className="text-xs text-slateText-body bg-white p-3 rounded-lg border border-stone-200 whitespace-pre-line font-mono">
              {step1Notes || '(작성된 메모가 없습니다)'}
            </div>
          </div>

          {/* 활동 유형에 따른 2단계 입력창 */}
          <div>
            <label className="block text-xs font-bold text-slateText-title mb-1.5 flex items-center justify-between">
              <span>
                {activity.mode === 'listen-speak'
                  ? '🗣️ AI 토론 파트너에 대응하는 나의 주장 스피치'
                  : '✍️ 1단계 메모를 바탕으로 작성하는 영문 완성문'}
              </span>
              <span className="text-[11px] text-emerald-600 font-medium">실시간 자동 저장 중</span>
            </label>

            {activity.mode === 'listen-speak' ? (
              <div className="space-y-3">
                <div className="p-3 bg-honey-50 rounded-lg border border-honey-200 text-xs text-honey-900">
                  <strong>🤖 AI 디베이트 파트너:</strong> "{activity.speakingPrompt}"
                </div>
                <textarea
                  rows={4}
                  value={step2Output}
                  onChange={(e) => handleStep2OutputChange(e.target.value)}
                  placeholder="위 AI 파트너의 반론에 대응하여 자신의 논거(주장 + 이유 + 예시)를 영어로 작성하거나 구술하세요..."
                  className="w-full p-3.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-honey-500 leading-relaxed shadow-inner"
                />
              </div>
            ) : (
              <textarea
                rows={6}
                value={step2Output}
                onChange={(e) => handleStep2OutputChange(e.target.value)}
                placeholder="1단계 메모의 핵심 어휘와 사실을 인용하여 완성된 영문 에세이를 작성하세요..."
                className="w-full p-3.5 text-xs font-mono bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-500 leading-relaxed shadow-inner"
              />
            )}
          </div>

          {/* 최종 제출 및 검증 */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-stone-400">
              * 1단계 메모 내용이 2단계 완성문에 얼마나 잘 연결되었는지 점검합니다.
            </span>
            <button
              onClick={handleSubmitStep2}
              disabled={!step2Output.trim()}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              연계 활동 최종 제출 및 피드백 확인
            </button>
          </div>

          {feedbackMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium leading-relaxed">
              {feedbackMsg}
            </div>
          )}

          {/* 지능형 센서 리포트 및 학술 대체어 치환 패널 */}
          {smartReport && (
            <IntelligentSensorReport 
              report={smartReport} 
              onApplySuggestion={handleApplySuggestion} 
            />
          )}
        </div>
      )}
    </div>
  );
};
