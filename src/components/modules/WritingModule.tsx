import React, { useState, useEffect } from 'react';
import { ActivityContent, HarnessLayerStatus } from '../../types/harness';
import { PenTool, Sparkles } from 'lucide-react';
import { loadStudentProgress, saveStudentProgress } from '../../utils/storage';
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
  // 로컬 저장소에서 이전 작성 내용 복원
  const [essayText, setEssayText] = useState(() => {
    const saved = loadStudentProgress();
    return saved.writingDrafts[activity.id] || saved.studentOutput || '';
  });
  const [smartReport, setSmartReport] = useState<SmartSensorReportData | null>(null);

  // 과업 변경 시 해당 과업의 저장된 글 복원
  useEffect(() => {
    const saved = loadStudentProgress();
    const draft = saved.writingDrafts[activity.id] || '';
    setEssayText(draft);
    if (draft && onStudentOutputChange) {
      onStudentOutputChange(draft);
    }
    setSmartReport(null);
  }, [activity.id]);

  const minWords = activity.minWords || 50;
  const words = essayText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const handleTextChange = (text: string) => {
    setEssayText(text);
    if (onStudentOutputChange) onStudentOutputChange(text);

    // 로컬 스토리지에 실시간 보존
    const progress = loadStudentProgress();
    saveStudentProgress({
      writingDrafts: {
        ...progress.writingDrafts,
        [activity.id]: text,
      },
      studentOutput: text,
    });
  };

  // 학술 대체어 원클릭 치환 함수
  const handleApplySuggestion = (original: string, replacement: string) => {
    const regex = new RegExp(`\\b${original}\\b`, 'i');
    const newText = essayText.replace(regex, replacement);
    handleTextChange(newText);

    // 바로 센서 재분석 실행
    const report = runFullSmartSensorInspection(newText, activity.readingPassage, minWords);
    setSmartReport(report);
  };

  // 지능형 센서 정밀 검사 실행
  const handleInspectWriting = () => {
    const report = runFullSmartSensorInspection(essayText, activity.readingPassage, minWords);
    setSmartReport(report);

    const isPassed = report.status === 'passed';
    const vocab = report.vocabulary;
    const awlList = vocab.awlWordsFound.slice(0, 3).join(', ');

    updateHarnessStatus(prev => ({
      ...prev,
      sensor: {
        name: 'CEFR 어휘 프로파일러 & 다차원 문법·표현 센서',
        currentScore: report.overallScore,
        status: report.status,
        feedback: report.feedbackSummary,
      },
      loop: {
        ...prev.loop,
        attempts: prev.loop.attempts + 1,
        currentStep: isPassed ? '작문 검증 완료' : '추천 표현 수용 및 글 다듬기 진행 중',
      },
      observability: {
        ...prev.observability,
        failureClass: report.plagiarism.status === 'danger' ? '원문 단순 복사' : report.grammar.length > 0 ? '문법/표현 개선 권고' : null,
        neisObservationLog: `영어 서술형 논증문 작성에서 어휘 다양성(TTR ${vocab.ttr}%) 및 CEFR B2~C2 심화 학술어(${vocab.levels.advanced.percentage + vocab.levels.awl.percentage}%)${awlList ? `(${awlList} 등)` : ''}를 논리적으로 구사하여 ${wordCount}단어의 완성도 높은 학술 에세이를 도출함.`
      }
    }));
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-warm-sm">
      {/* 모듈 헤더 */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <PenTool className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slateText-title flex items-center gap-2">
              {activity.title}
              <span className="text-xs font-normal px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                자기주도 글쓰기
              </span>
            </h3>
            <p className="text-xs text-slateText-muted">{activity.subTitle}</p>
          </div>
        </div>
      </div>

      {/* 프롬프트 */}
      <div className="bg-[#FDFBF7] p-5 rounded-xl border border-stone-200 mb-6">
        <div className="text-xs font-bold text-stone-500 uppercase mb-1">✍️ 작문 과제 (Writing Prompt)</div>
        <p className="text-sm font-bold text-slateText-title mb-2">
          {activity.writingPrompt}
        </p>
        <div className="flex flex-wrap gap-1.5 items-center mt-2">
          <span className="text-[11px] font-bold text-stone-500">활용 권장 핵심 어휘:</span>
          {activity.targetKeywords?.map((kw, i) => (
            <span key={i} className="px-2 py-0.5 bg-white border border-stone-200 rounded text-[11px] text-emerald-700 font-mono">
              {kw}
            </span>
          ))}
        </div>
      </div>

      {/* 텍스트 에디터 */}
      <div className="mb-4">
        <div className="flex justify-between items-center text-xs text-slateText-muted mb-1.5">
          <span>영문 작성 공간 (자동 저장 중)</span>
          <span className={`font-mono font-bold ${wordCount >= minWords ? 'text-emerald-600' : 'text-amber-600'}`}>
            단어 수: {wordCount} / 권장 {minWords}단어
          </span>
        </div>
        <textarea
          rows={7}
          value={essayText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="여기에 영문 에세이를 작성하세요... (작성한 내용은 실시간으로 자동 저장됩니다)"
          className="w-full p-4 text-xs font-mono bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 leading-relaxed shadow-inner"
        />
      </div>

      {/* 검증 실행 버튼 */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-[11px] text-stone-400">
          * AI가 학생 대신 쓰지 않고 스스로 어휘와 문법을 점검하도록 돕습니다.
        </span>
        <button
          onClick={handleInspectWriting}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          AI 글 다듬기 점검 (어휘·문법·표현)
        </button>
      </div>

      {/* 지능형 센서 검사 피드백 결과 리포트 */}
      {smartReport && (
        <IntelligentSensorReport
          report={smartReport}
          onApplySuggestion={handleApplySuggestion}
        />
      )}
    </div>
  );
};
