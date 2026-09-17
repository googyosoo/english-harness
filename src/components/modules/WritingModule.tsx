import React, { useState, useEffect, useMemo } from 'react';
import { ActivityContent, HarnessLayerStatus } from '../../types/harness';
import { 
  PenTool, Sparkles, BookOpen, CheckCircle2, AlertCircle, 
  ArrowRight, FileText, BarChart3, HelpCircle, Check 
} from 'lucide-react';
import { loadStudentProgress, saveStudentProgress } from '../../utils/storage';
import { loadCurrentUser, saveSubmission } from '../../utils/authStorage';
import { runFullSmartSensorInspection, SmartSensorReportData } from '../../utils/sensorEngine';
import { IntelligentSensorReport } from '../common/IntelligentSensorReport';

interface WritingModuleProps {
  activity: ActivityContent;
  updateHarnessStatus: (updater: (prev: HarnessLayerStatus) => HarnessLayerStatus) => void;
  onStudentOutputChange?: (output: string) => void;
}

export const WritingModule: React.FC<WritingModuleProps> = ({
  activity,
  updateHarnessStatus,
  onStudentOutputChange,
}) => {
  const passageText = activity.readingPassage || activity.audioScript || '';

  // 3대 서술형 미션 탭
  const [activeMission, setActiveMission] = useState<'blank' | 'topic' | 'summary'>('topic');

  // 미션별 학생 입력 상태
  const [blankAnswer, setBlankAnswer] = useState('');
  const [topicAnswer, setTopicAnswer] = useState('');
  const [summaryAnswer, setSummaryAnswer] = useState('');

  // 채점 및 센서 리포트 상태
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [smartReport, setSmartReport] = useState<SmartSensorReportData | null>(null);
  const [showPassageHint, setShowPassageHint] = useState(false);

  // 지문 기반 빈칸 추론 문제 자동 추출/생성
  const blankMissionData = useMemo(() => {
    const words = (activity.targetKeywords && activity.targetKeywords.length > 0)
      ? activity.targetKeywords
      : ['important', 'critical', 'solution', 'responsibility', 'strategic', 'essential'];
    const targetWord = words[0];

    // 지문에서 해당 단어가 포함된 문장 탐색
    const sentences = passageText.split(/(?<=[.?!])\s+/).filter(Boolean);
    const targetSentence = sentences.find(s => s.toLowerCase().includes(targetWord.toLowerCase())) 
      || (sentences.length > 1 ? sentences[1] : sentences[0] || 'Learning requires conscious effort and critical thinking.');

    // 빈칸화
    const maskedSentence = targetSentence.replace(new RegExp(`\\b${targetWord}\\b`, 'gi'), '[ 빈칸 (Blank) _________ ]');

    return {
      sentence: maskedSentence,
      answer: targetWord,
      hint: `첫 글자: '${targetWord[0]}', 총 ${targetWord.length}글자 영단어`,
      originalSentence: targetSentence,
    };
  }, [passageText, activity.targetKeywords]);

  // 과업 변경 시 초기화
  useEffect(() => {
    const saved = loadStudentProgress();
    const draft = saved.writingDrafts[activity.id] || '';
    setTopicAnswer(draft);
    setBlankAnswer('');
    setSummaryAnswer('');
    setIsSubmitted(false);
    setSmartReport(null);
  }, [activity.id]);

  // 1. 빈칸 추론 제출 핸들러
  const handleCheckBlank = () => {
    const isCorrect = blankAnswer.trim().toLowerCase() === blankMissionData.answer.toLowerCase();
    setIsSubmitted(true);
    const score = isCorrect ? 100 : 40;

    const fullOutput = `[지문 기반 빈칸 추론 작성] 입력: "${blankAnswer.trim()}" (정답: ${blankMissionData.answer}) ➔ ${isCorrect ? '정답' : '보완 필요'}`;
    if (onStudentOutputChange) onStudentOutputChange(fullOutput);

    // 대시보드 저장
    saveToDashboard('blank', fullOutput, score, isCorrect);
  };

  // 2. 주제/제목/요지 영작 제출 핸들러
  const handleCheckTopic = () => {
    const trimmed = topicAnswer.trim();
    if (!trimmed) return;
    setIsSubmitted(true);

    // 스마트 센서 검사 (최소 10단어)
    const report = runFullSmartSensorInspection(trimmed, passageText, 10);
    setSmartReport(report);

    const fullOutput = `[지문 주제/제목/요지 영작] ${trimmed}`;
    if (onStudentOutputChange) onStudentOutputChange(fullOutput);

    // 대시보드 저장
    saveToDashboard('topic', fullOutput, report.overallScore, report.status === 'passed', report);
  };

  // 3. 요약문 작성 제출 핸들러
  const handleCheckSummary = () => {
    const trimmed = summaryAnswer.trim();
    if (!trimmed) return;
    setIsSubmitted(true);

    const report = runFullSmartSensorInspection(trimmed, passageText, 15);
    setSmartReport(report);

    const fullOutput = `[지문 핵심 요약문(Summary) 작성] ${trimmed}`;
    if (onStudentOutputChange) onStudentOutputChange(fullOutput);

    // 대시보드 저장
    saveToDashboard('summary', fullOutput, report.overallScore, report.status === 'passed', report);
  };

  // 공통 대시보드 및 하네스 저장 함수
  const saveToDashboard = (
    missionType: 'blank' | 'topic' | 'summary',
    output: string,
    score: number,
    isPassed: boolean,
    customReport?: SmartSensorReportData
  ) => {
    const currentUser = loadCurrentUser();
    const missionName = missionType === 'blank' ? '빈칸 추론 완성' : missionType === 'topic' ? '주제/요지 영작' : '핵심 요약문 작성';

    const defaultReport: SmartSensorReportData = customReport || (() => {
      const generated = runFullSmartSensorInspection(output, passageText, 5);
      generated.overallScore = score;
      generated.status = isPassed ? 'passed' : 'warning';
      generated.feedbackSummary = isPassed
        ? `[서술형 ${missionName} 우수] 지문의 중심 논거를 영어로 논리정연하게 작성함 (${score}점).`
        : `[서술형 ${missionName} 보완] 어휘와 문맥적 연결성을 확인하고 표현을 다듬어 보세요.`;
      return generated;
    })();

    saveSubmission({
      studentId: currentUser?.id || 'guest_student',
      studentName: currentUser?.name || '학생',
      studentNumber: currentUser?.studentNumber || '2026-S1',
      activityId: activity.id,
      activityTitle: activity.title,
      grade: activity.grade,
      mode: 'writing',
      timeSpentSeconds: 60,
      attemptsCount: 1,
      studentOutput: output,
      isCorrect: isPassed,
      notes: `서술형 미션: ${missionName}`,
      sensorReport: defaultReport
    });

    // 하네스 센서 상태 갱신
    updateHarnessStatus(prev => ({
      ...prev,
      sensor: {
        name: `지문 기반 서술형 쓰기 센서 (${missionName})`,
        currentScore: score,
        status: isPassed ? 'passed' : 'warning',
        feedback: defaultReport.feedbackSummary
      },
      loop: {
        ...prev.loop,
        attempts: prev.loop.attempts + 1,
        currentStep: `${missionName} 작성 및 피드백 완료`,
      },
      observability: {
        ...prev.observability,
        failureClass: isPassed ? null : '서술형 표현 개선 권고',
        neisObservationLog: `영어 독해 지문(${activity.title})을 심층 분석하여 '${missionName}' 과업을 수행하고, ${score}점의 학술적 표현력과 논리적 진술 역량을 입증함.`
      }
    }));
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* 1. 상단 모듈 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
              ✍️
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              실전 지문 기반 서술형 쓰기
            </span>
            <span className="text-xs text-stone-500 font-mono">
              {activity.lexile} | {activity.cefrLevel}
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slateText-title">
            {activity.title}
          </h2>
          <p className="text-xs text-slateText-muted mt-0.5">
            실제 읽기 지문을 확인하고, <strong>빈칸추론·주제/요지 영작·요약문 완성</strong>을 직접 간단하게 작성해 보세요.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 font-semibold">
          <BarChart3 className="w-4 h-4 text-amber-600" />
          <span>서술형 성취도 대시보드 연동</span>
        </div>
      </div>

      {/* 2. 실제 읽기 지문 원문 뷰어 */}
      <div className="p-5 bg-[#FDFBF7] rounded-2xl border border-stone-200 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slateText-title flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-honey-600" />
            실제 평가원/기출 독해 지문 원문 (Reading Passage)
          </span>
          <span className="text-[11px] text-stone-400 font-mono">
            총 {passageText.split(/\s+/).filter(Boolean).length}단어
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-stone-200 max-h-56 overflow-y-auto text-xs sm:text-sm font-serif leading-relaxed text-slateText-body select-text shadow-inner">
          {passageText || '지문 데이터가 로드되지 않았습니다.'}
        </div>
      </div>

      {/* 3. 3대 서술형 미션 탭 바 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-1.5 bg-stone-100/80 rounded-2xl border border-stone-200">
          <button
            type="button"
            onClick={() => {
              setActiveMission('topic');
              setIsSubmitted(false);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeMission === 'topic'
                ? 'bg-white text-indigo-900 shadow-sm border border-indigo-200'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>🎯 1. 주제/제목/요지 영작</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMission('blank');
              setIsSubmitted(false);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeMission === 'blank'
                ? 'bg-white text-amber-900 shadow-sm border border-amber-200'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>🧩 2. 빈칸추론 직접 채우기</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMission('summary');
              setIsSubmitted(false);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeMission === 'summary'
                ? 'bg-white text-emerald-900 shadow-sm border border-emerald-200'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>📝 3. 핵심 요약문 작성</span>
          </button>
        </div>

        {/* 미션 1: 주제/제목/요지 영작 */}
        {activeMission === 'topic' && (
          <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slateText-title flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                지문을 읽고, 글의 중심 생각(주제 또는 요지)을 1~2문장의 영어로 직접 진술하세요.
              </label>
              <span className="text-[11px] text-stone-500 font-mono">
                {topicAnswer.trim().split(/\s+/).filter(Boolean).length}단어 작성됨
              </span>
            </div>

            <textarea
              rows={3}
              value={topicAnswer}
              onChange={(e) => setTopicAnswer(e.target.value)}
              placeholder="예시: This passage emphasizes that variation in human minds is essential for the survival and adaptation of our species."
              className="w-full p-3.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm font-serif leading-relaxed text-slateText-body focus:outline-none focus:border-indigo-500 shadow-inner"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-stone-400">
                💡 지문 문장을 그대로 베끼지 않고 자신의 단어로 표현하면 높은 센서 점수를 받습니다.
              </span>
              <button
                type="button"
                onClick={handleCheckTopic}
                disabled={!topicAnswer.trim()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>검사 및 제출하기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* 미션 2: 빈칸추론 직접 완성 */}
        {activeMission === 'blank' && (
          <div className="p-5 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-4 animate-in fade-in">
            <div>
              <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                지문의 핵심 문맥 문장입니다. 빈칸에 들어갈 알맞은 영단어를 입력하세요.
              </span>
              <div className="p-3.5 bg-white rounded-xl border border-amber-300 text-xs sm:text-sm font-serif leading-relaxed text-stone-800">
                "{blankMissionData.sentence}"
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={blankAnswer}
                onChange={(e) => setBlankAnswer(e.target.value)}
                placeholder="빈칸에 들어갈 단어 입력 (예: critical)"
                className="w-full sm:flex-1 px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-xs sm:text-sm font-mono text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassageHint(!showPassageHint)}
                className="text-xs text-amber-800 hover:text-amber-950 underline flex items-center gap-1 cursor-pointer shrink-0"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showPassageHint ? '힌트 닫기' : '힌트 보기'}</span>
              </button>
              <button
                type="button"
                disabled={!blankAnswer.trim()}
                onClick={handleCheckBlank}
                className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-amber-950 font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>정답 확인 및 제출</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {showPassageHint && (
              <div className="p-2.5 bg-white/90 rounded-lg border border-amber-200 text-xs text-amber-900 animate-in fade-in">
                💡 <strong>단어 힌트:</strong> {blankMissionData.hint}
              </div>
            )}

            {isSubmitted && (
              <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs animate-in fade-in ${
                blankAnswer.trim().toLowerCase() === blankMissionData.answer.toLowerCase()
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                <div className="flex items-center gap-2">
                  {blankAnswer.trim().toLowerCase() === blankMissionData.answer.toLowerCase() ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>완벽합니다! 정답: <strong>{blankMissionData.answer}</strong> (+100점 대시보드 저장 완료)</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>아쉽습니다. 입력하신 값: "{blankAnswer}" ➔ 원문 정답: <strong>{blankMissionData.answer}</strong></span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 미션 3: 핵심 요약문 작성 */}
        {activeMission === 'summary' && (
          <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                지문의 인과관계 또는 핵심 논거를 2~3문장의 Summary 에세이로 직접 완성하세요.
              </label>
              <span className="text-[11px] text-emerald-700 font-mono">
                {summaryAnswer.trim().split(/\s+/).filter(Boolean).length}단어
              </span>
            </div>

            <textarea
              rows={4}
              value={summaryAnswer}
              onChange={(e) => setSummaryAnswer(e.target.value)}
              placeholder="예시: In conclusion, the author argues that... because... Therefore, we should..."
              className="w-full p-3.5 bg-white border border-emerald-300 rounded-xl text-xs sm:text-sm font-serif leading-relaxed text-slateText-body focus:outline-none focus:border-emerald-500 shadow-inner"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-emerald-700/80">
                💡 인과 접속사(Because, Therefore, Consequently 등)를 활용하면 유창성 점수가 올라갑니다.
              </span>
              <button
                type="button"
                onClick={handleCheckSummary}
                disabled={!summaryAnswer.trim()}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>요약문 채점 및 제출</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. 지능형 센서 검사 리포트 노출 */}
      {smartReport && (
        <div className="pt-2 animate-in fade-in">
          <IntelligentSensorReport report={smartReport} />
        </div>
      )}

    </div>
  );
};
