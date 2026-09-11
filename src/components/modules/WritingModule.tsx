import React, { useState } from 'react';
import { ActivityContent, HarnessLayerStatus } from '../../types/harness';
import { PenTool, ShieldAlert, CheckCircle2, Sparkles, AlertCircle, SpellCheck, Copy } from 'lucide-react';

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
  const [essayText, setEssayText] = useState('');
  const [analyzed, setAnalyzed] = useState(false);
  const [plagiarismWarning, setPlagiarismWarning] = useState(false);
  const [ttrScore, setTtrScore] = useState<number>(0);
  const [lintErrors, setLintErrors] = useState<string[]>([]);

  const minWords = activity.minWords || 50;
  const words = essayText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const handleTextChange = (text: string) => {
    setEssayText(text);
    if (onStudentOutputChange) onStudentOutputChange(text);
  };

  const handleInspectWriting = () => {
    // 1. 표절 센서: 본문 지문 연속 복사 감지
    let isPlagiarized = false;
    if (activity.readingPassage) {
      const cleanPassage = activity.readingPassage.toLowerCase().replace(/[^a-z0-9\s]/g, '');
      // 5단어 이상 연속 일치 검색
      for (let i = 0; i <= words.length - 5; i++) {
        const chunk = words.slice(i, i + 5).join(' ').toLowerCase().replace(/[^a-z0-9\s]/g, '');
        if (cleanPassage.includes(chunk)) {
          isPlagiarized = true;
          break;
        }
      }
    }
    setPlagiarismWarning(isPlagiarized);

    // 2. 어휘 다양성(TTR) 센서 계산
    const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^a-z]/g, '')));
    const calculatedTtr = wordCount > 0 ? Math.round((uniqueWords.size / wordCount) * 100) : 0;
    setTtrScore(calculatedTtr);

    // 3. 기본 문법 린터 센서 (간이 검사)
    const errs: string[] = [];
    const lower = essayText.toLowerCase();
    if (/\b(he|she|it)\s+(go|do|have|make|take)\b/.test(lower)) {
      errs.push('3인칭 단수 주어 뒤 일반동사 원형 사용 (수일치 점검 필요)');
    }
    if (/\ba\s+[aeiou]/i.test(essayText)) {
      errs.push('모음으로 시작하는 단어 앞 관사 "a" 사용 ("an" 권장)');
    }
    if (wordCount < minWords) {
      errs.push(`최소 분량 미달: 현재 ${wordCount}단어 (권장 최소: ${minWords}단어)`);
    }
    setLintErrors(errs);
    setAnalyzed(true);

    const isPassed = !isPlagiarized && errs.length === 0 && calculatedTtr >= 50;

    updateHarnessStatus(prev => ({
      ...prev,
      sensor: {
        name: '영작문 표절·TTR·문법 통합 린터 센서',
        currentScore: isPassed ? 95 : isPlagiarized ? 30 : 65,
        status: isPassed ? 'passed' : 'warning',
        feedback: isPlagiarized
          ? '경고: 원문 지문 연속 복사 감지! 자신만의 언어로 패러프레이징하세요.'
          : errs.length > 0
          ? `주의: ${errs.length}개 수정 권고사항 발견 (TTR 다양성: ${calculatedTtr}%)`
          : `우수! 어휘 다양성 ${calculatedTtr}%로 기준을 통과했습니다.`
      },
      loop: {
        ...prev.loop,
        attempts: prev.loop.attempts + 1,
        currentStep: isPassed ? '작문 검증 통과' : '린터 오류 자가 수정',
      },
      observability: {
        ...prev.observability,
        failureClass: isPlagiarized ? '원문 단순 복사(표절)' : errs.length > 0 ? '문법/분량 미달' : null,
        neisObservationLog: `영어 서술형 논증문 작성에서 어휘 다양성(TTR ${calculatedTtr}%)을 갖추며 ${wordCount}단어의 완성도 높은 에세이를 도출함.`
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
                프로세스 글쓰기
              </span>
            </h3>
            <p className="text-xs text-slateText-muted">{activity.subTitle}</p>
          </div>
        </div>
      </div>

      {/* 프롬프트 */}
      <div className="bg-[#FDFBF7] p-5 rounded-xl border border-stone-200 mb-6">
        <div className="text-xs font-bold text-stone-500 uppercase mb-1">✍️ Writing Prompt</div>
        <p className="text-sm font-bold text-slateText-title mb-2">
          {activity.writingPrompt}
        </p>
        <div className="flex flex-wrap gap-1.5 items-center mt-2">
          <span className="text-[11px] font-bold text-stone-500">필수 권장 키워드:</span>
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
          <span>작문 에디터 (영어로 작성)</span>
          <span className={`font-mono font-bold ${wordCount >= minWords ? 'text-emerald-600' : 'text-amber-600'}`}>
            단어 수: {wordCount} / 권장 {minWords}단어
          </span>
        </div>
        <textarea
          rows={7}
          value={essayText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="여기에 영문 에세이를 작성하세요... (원문을 그대로 베끼면 하네스 표절 센서가 감지합니다)"
          className="w-full p-4 text-xs font-mono bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 leading-relaxed shadow-inner"
        />
      </div>

      {/* 하네스 검증 실행 버튼 */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-[11px] text-stone-400">
          * AI 대필이 차단된 안전한 환경에서 린터와 어휘 다양성 검사가 수행됩니다.
        </span>
        <button
          onClick={handleInspectWriting}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
        >
          하네스 3대 센서(표절·TTR·문법) 정밀 검사
        </button>
      </div>

      {/* 센서 검사 피드백 결과 */}
      {analyzed && (
        <div className="space-y-3">
          {/* 표절 센서 경고 */}
          {plagiarismWarning && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
              <ShieldAlert className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong>[하네스 표절 센서 감지]</strong> 지문의 문장을 5단어 이상 연속으로 복사하여 붙여넣은 흔적이 발견되었습니다. 지문의 주장을 자신만의 표현으로 패러프레이징(Paraphrasing)하세요!
              </div>
            </div>
          )}

          {/* 문법 및 분량 린터 */}
          {lintErrors.length > 0 ? (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                하네스 린터 권고사항 ({lintErrors.length}건):
              </div>
              <ul className="list-disc pl-5 space-y-0.5 text-amber-800 text-[11px]">
                {lintErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          ) : !plagiarismWarning && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              문법 및 수일치 린터 정상 통과! 어휘 다양성 지수(TTR): {ttrScore}%
            </div>
          )}
        </div>
      )}
    </div>
  );
};
