import React, { useState, useEffect, useMemo } from 'react';
import { ActivityContent, HarnessLayerStatus } from '../../types/harness';
import { 
  PenTool, Sparkles, BookOpen, CheckCircle2, AlertCircle, 
  ArrowRight, FileText, BarChart3, HelpCircle, Check,
  Bot, Wand2, Zap, RefreshCw, Lightbulb
} from 'lucide-react';
import { loadStudentProgress, saveStudentProgress } from '../../utils/storage';
import { loadCurrentUser, saveSubmission } from '../../utils/authStorage';
import { runFullSmartSensorInspection, SmartSensorReportData } from '../../utils/sensorEngine';
import { IntelligentSensorReport } from '../common/IntelligentSensorReport';
import { inspectWritingWithSolar, SolarWritingInspection } from '../../utils/upstageService';

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

  // Upstage Solar AI 첨삭 상태
  const [solarResult, setSolarResult] = useState<SolarWritingInspection | null>(null);
  const [isSolarLoading, setIsSolarLoading] = useState(false);
  const [solarError, setSolarError] = useState<string | null>(null);

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

  // 4. Upstage Solar AI 실시간 첨삭 및 패러프레이징 요청 핸들러
  const handleRequestSolarInspection = async () => {
    const currentInput = activeMission === 'topic' ? topicAnswer : activeMission === 'blank' ? blankAnswer : summaryAnswer;
    if (!currentInput.trim()) {
      alert('첨삭을 요청할 문장을 먼저 작성해 주세요.');
      return;
    }

    setIsSolarLoading(true);
    setSolarError(null);
    try {
      const result = await inspectWritingWithSolar(currentInput.trim(), passageText, activeMission);
      setSolarResult(result);
    } catch (err: any) {
      setSolarError('Upstage Solar AI 첨삭 중 오류가 발생했습니다: ' + (err.message || '잠시 후 다시 시도해 주세요.'));
    } finally {
      setIsSolarLoading(false);
    }
  };

  // 패러프레이징 추천 문장을 내 답안에 즉시 덮어쓰기
  const handleApplyParaphrase = (newSentence: string) => {
    if (activeMission === 'topic') setTopicAnswer(newSentence);
    else if (activeMission === 'blank') setBlankAnswer(newSentence);
    else if (activeMission === 'summary') setSummaryAnswer(newSentence);
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
              setSolarResult(null);
              setSolarError(null);
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
              setSolarResult(null);
              setSolarError(null);
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
              setSolarResult(null);
              setSolarError(null);
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

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <span className="text-[11px] text-stone-400">
                💡 지문 문장을 그대로 베끼지 않고 자신의 단어로 표현하면 높은 센서 점수를 받습니다.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRequestSolarInspection}
                  disabled={isSolarLoading || !topicAnswer.trim()}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isSolarLoading ? 'Solar 분석 중...' : '⚡ Solar AI 실시간 첨삭'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCheckTopic}
                  disabled={!topicAnswer.trim()}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>검사 및 제출</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
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
                onClick={handleRequestSolarInspection}
                disabled={isSolarLoading || !blankAnswer.trim()}
                className="px-3.5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Solar 분석</span>
              </button>
              <button
                type="button"
                disabled={!blankAnswer.trim()}
                onClick={handleCheckBlank}
                className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-amber-950 font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>정답 확인</span>
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

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <span className="text-[11px] text-emerald-700/80">
                💡 인과 접속사(Because, Therefore, Consequently 등)를 활용하면 유창성 점수가 올라갑니다.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRequestSolarInspection}
                  disabled={isSolarLoading || !summaryAnswer.trim()}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isSolarLoading ? 'Solar 분석 중...' : '⚡ Solar AI 실시간 첨삭'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCheckSummary}
                  disabled={!summaryAnswer.trim()}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>채점 및 제출</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upstage Solar AI 실시간 첨삭 및 패러프레이징 결과 카드 */}
        {isSolarLoading && (
          <div className="p-4 bg-purple-50/90 border border-purple-200 rounded-2xl flex items-center justify-center gap-3 animate-pulse">
            <RefreshCw className="w-4 h-4 text-purple-600 animate-spin" />
            <span className="text-xs font-bold text-purple-900">
              Upstage Solar Pro 모델이 작성된 문맥을 분석하고 원어민 수준의 패러프레이징 및 첨삭을 생성 중입니다...
            </span>
          </div>
        )}

        {solarError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{solarError}</span>
          </div>
        )}

        {solarResult && (
          <div className="p-5 bg-linear-to-br from-purple-50/90 via-indigo-50/40 to-white border-2 border-purple-200 rounded-2xl shadow-sm space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-600 text-white rounded-lg shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-purple-950 flex items-center gap-1.5">
                    Upstage Solar Pro 실시간 정밀 첨삭
                    <span className="px-2 py-0.5 bg-purple-200 text-purple-900 text-[10px] font-mono font-bold rounded-md">
                      Score: {solarResult.overallScore}점
                    </span>
                  </h4>
                  <p className="text-[11px] text-purple-700/80">고교 수능/학평 평가 기준 원어민 패러프레이징 및 문맥 논리 검증</p>
                </div>
              </div>
            </div>

            {/* 1. 원어민식 자연스러운 추천 문장 (Native Polish) */}
            <div className="p-3.5 bg-white border border-purple-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <Wand2 className="w-4 h-4 text-purple-600" />
                  원어민 추천 세련된 패러프레이징 문장
                </span>
                <button
                  type="button"
                  onClick={() => handleApplyParaphrase(solarResult.revisedSentence)}
                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3 h-3" />
                  <span>내 답안에 바로 적용하기</span>
                </button>
              </div>
              <p className="text-xs sm:text-sm font-serif italic text-purple-950 bg-purple-50/50 p-2.5 rounded-lg border border-purple-100 leading-relaxed">
                "{solarResult.revisedSentence}"
              </p>
            </div>

            {/* 2. 다양한 고급 대체 표현 목록 */}
            {solarResult.alternativeExpressions && solarResult.alternativeExpressions.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-stone-700 flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  상황별 학술 표현 (클릭하여 적용):
                </span>
                <div className="flex flex-wrap gap-2">
                  {solarResult.alternativeExpressions.map((expr, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyParaphrase(expr)}
                      className="text-left px-3 py-1.5 bg-white hover:bg-purple-50 border border-stone-200 hover:border-purple-300 rounded-lg text-xs font-serif text-stone-800 transition-all cursor-pointer shadow-2xs"
                    >
                      • {expr}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. 문법 및 어휘 오류 분석 */}
            {solarResult.grammarIssues && solarResult.grammarIssues.length > 0 && (
              <div className="p-3 bg-rose-50/60 border border-rose-100 rounded-xl space-y-2">
                <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  세부 문법 및 어휘 교정 포인트
                </span>
                <div className="space-y-1.5">
                  {solarResult.grammarIssues.map((issue, idx) => (
                    <div key={idx} className="text-[11px] leading-relaxed text-stone-700 pl-2 border-l-2 border-rose-300">
                      <span className="line-through text-rose-700 mr-2">{issue.original}</span>
                      <span className="font-bold text-emerald-700">➔ {issue.corrected}</span>
                      <p className="text-stone-600 mt-0.5">{issue.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. 지문 맥락 논리성 & 총평 */}
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-1">
              <div className="font-bold text-stone-800 flex items-center gap-1.5">
                <span>💡 맥락 논리 평가:</span>
              </div>
              <p className="text-stone-700 leading-relaxed">{solarResult.logicFeedback}</p>
              <p className="text-purple-900 font-medium pt-1 border-t border-stone-200/60 mt-1">{solarResult.evaluationSummary}</p>
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
