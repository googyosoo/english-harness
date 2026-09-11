import React, { useState } from 'react';
import { ActivityContent, HarnessLayerStatus } from '../../types/harness';
import { AudioPlayer } from '../common/AudioPlayer';
import { Layers, ArrowRight, CheckCircle2, Sparkles, Database, FileEdit, Mic, Volume2 } from 'lucide-react';

interface IntegratedModuleProps {
  activity: ActivityContent;
  updateHarnessStatus: (updater: (prev: HarnessLayerStatus) => HarnessLayerStatus) => void;
  onStudentOutputChange?: (output: string) => void;
}

export const IntegratedModule: React.FC<IntegratedModuleProps> = ({
  activity,
  updateHarnessStatus,
  onStudentOutputChange,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  
  // Step 1 상태 (메모, 증거 카드, 주장 정리)
  const [step1Notes, setStep1Notes] = useState('');
  const [collectedEvidence, setCollectedEvidence] = useState<string[]>([]);
  const [selectedStance, setSelectedStance] = useState<'pro' | 'con' | ''>('');

  // Step 2 상태 (핸드오프 데이터 기반 산출물)
  const [step2Output, setStep2Output] = useState('');
  const [completedHandoff, setCompletedHandoff] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // 복수 지문 탭 및 뷰 모드 상태
  const [activePassageIndex, setActivePassageIndex] = useState(0);
  const [isSideBySide, setIsSideBySide] = useState(false);


  // 핸드오프 실행 (Step 1 ➔ Step 2)
  const handleHandoff = () => {
    setCurrentStep(2);
    setCompletedHandoff(true);

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
          `Step 1 완료: [${step1Notes.slice(0, 20)}...] 데이터가 Step 2로 핸드오프됨`
        ]
      },
      loop: {
        ...prev.loop,
        currentStep: 'Step 2 핸드오프 연계 과업 진행 중'
      }
    }));
  };

  // Step 2 최종 제출
  const handleSubmitStep2 = () => {
    if (onStudentOutputChange) {
      onStudentOutputChange(step2Output);
    }
    setFeedbackMsg('🎉 연계 활동 완료! Step 1의 입력 컨텍스트가 Step 2의 완성 산출물로 성공적으로 연결되었습니다.');

    updateHarnessStatus(prev => ({
      ...prev,
      sensor: {
        name: '통합 연계(Integrated Handoff) 완결성 센서',
        currentScore: 98,
        status: 'passed',
        feedback: '우수! 1단계 메모 및 증거를 바탕으로 2단계 복합 과업을 완벽히 완성함.'
      },
      observability: {
        ...prev.observability,
        neisObservationLog: `[${activity.title}] 2단계 연계 활동에서 1단계의 분석적 사고 결과를 2단계 표현 산출물로 유실 없이 통합 전이(Handoff)하는 뛰어난 메타인지 학습 역량을 보임.`
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
            onClick={() => setCurrentStep(1)}
            className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
              currentStep === 1
                ? 'bg-honey-400 text-slateText-title shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>1단계</span>
            {completedHandoff && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
          </button>
          <ArrowRight className="w-3 h-3 text-stone-400" />
          <button
            onClick={() => {
              if (completedHandoff || step1Notes.trim()) setCurrentStep(2);
            }}
            className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
              currentStep === 2
                ? 'bg-honey-400 text-slateText-title shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>2단계 (핸드오프)</span>
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
              <span>📝 1단계 핵심 메모 (Cornell Notes / Evidence Box)</span>
              <span className="text-[11px] text-stone-400">2단계로 전송될 Handoff Packet</span>
            </label>
            <textarea
              rows={4}
              value={step1Notes}
              onChange={(e) => setStep1Notes(e.target.value)}
              placeholder="음원이나 지문에서 파악한 핵심 단어, 5W1H 정보, 인과관계, 찬반 논거 등을 영어 또는 한국어로 자유롭게 정리하세요..."
              className="w-full p-3.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-honey-500 shadow-inner leading-relaxed"
            />
          </div>

          {/* 핸드오프 전환 버튼 */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleHandoff}
              disabled={!step1Notes.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-honey-400 hover:bg-honey-500 disabled:opacity-50 text-slateText-title font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              <span>1단계 메모 저장 및 2단계로 Handoff 전달</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2단계 화면 (핸드오프 데이터 활용 산출물 도출) */}
      {/* ============================================================ */}
      {currentStep === 2 && (
        <div className="space-y-5">
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200">
            <h4 className="font-bold text-xs text-emerald-900 uppercase mb-1">
              {activity.handoffInstruction?.step2Title}
            </h4>
            <p className="text-xs text-emerald-800 leading-relaxed">
              1단계에서 정리한 메모가 하네스 메모리 층에 안전하게 로드되었습니다. 이를 바탕으로 최종 산출물을 완성하세요.
            </p>
          </div>

          {/* 1단계에서 넘어온 Handoff 메모 카드 표시 */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slateText-title flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-honey-600" />
                [Handoff Memory] 1단계에서 전달된 메모 패킷
              </span>
              <button
                onClick={() => setCurrentStep(1)}
                className="text-[11px] text-honey-700 hover:underline flex items-center gap-1"
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
            <label className="block text-xs font-bold text-slateText-title mb-1.5">
              {activity.mode === 'listen-speak'
                ? '🗣️ AI 토론 에이전트에 대응하는 반론 스피치'
                : '✍️ 메모를 종합한 최종 영문 에세이 / 공지문'}
            </label>

            {activity.mode === 'listen-speak' ? (
              <div className="space-y-3">
                <div className="p-3 bg-honey-50 rounded-lg border border-honey-200 text-xs text-honey-900">
                  <strong>🤖 AI 디베이트 파트너:</strong> "{activity.speakingPrompt}"
                </div>
                <textarea
                  rows={4}
                  value={step2Output}
                  onChange={(e) => setStep2Output(e.target.value)}
                  placeholder="위 AI 파트너의 반론에 대응하여 자신의 논거(Claim + Reason + Example)를 영어로 작성하거나 구술하세요..."
                  className="w-full p-3.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-honey-500 leading-relaxed"
                />
              </div>
            ) : (
              <textarea
                rows={6}
                value={step2Output}
                onChange={(e) => setStep2Output(e.target.value)}
                placeholder="1단계 메모의 핵심 어휘와 팩트를 인용하여 완성된 영문 텍스트를 작성하세요..."
                className="w-full p-3.5 text-xs font-mono bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-500 leading-relaxed shadow-inner"
              />
            )}
          </div>

          {/* 최종 제출 및 하네스 검증 */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-stone-400">
              * 완결성 센서가 1단계 메모와 2단계 작문의 연계성을 자동 평가합니다.
            </span>
            <button
              onClick={handleSubmitStep2}
              disabled={!step2Output.trim()}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              연계 활동 최종 제출 및 하네스 검증
            </button>
          </div>

          {feedbackMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium leading-relaxed">
              {feedbackMsg}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
