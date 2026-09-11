import React from 'react';
import { SmartSensorReportData } from '../../utils/sensorEngine';
import { Sparkles, ShieldCheck, AlertTriangle, BookOpen, CheckCircle2, ArrowRight, Lightbulb, Link2 } from 'lucide-react';

interface IntelligentSensorReportProps {
  report: SmartSensorReportData;
  onApplySuggestion?: (original: string, replacement: string) => void;
}

export const IntelligentSensorReport: React.FC<IntelligentSensorReportProps> = ({
  report,
  onApplySuggestion,
}) => {
  const { vocabulary, grammar, plagiarism, transitions, overallScore, status, feedbackSummary } = report;

  return (
    <div className="mt-4 p-5 rounded-2xl bg-[#FDFBF7] border-2 border-honey-300/80 shadow-warm-sm space-y-5">
      {/* 1. 상단 종합 요약 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-honey-200 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-honey-400 text-slateText-title flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4 text-slateText-title" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-slateText-title">
                AI 지능형 표현 & 어휘 정밀 진단 리포트
              </h4>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  status === 'passed'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : status === 'warning'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {status === 'passed' ? '✅ 기준 통과' : status === 'warning' ? '⚠️ 보완 권고' : '🚫 수정 필요'}
              </span>
            </div>
            <p className="text-xs text-slateText-muted mt-0.5">{feedbackSummary}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-stone-500 block">종합 표현 지수</span>
            <span className="text-xl font-extrabold text-honey-700 font-mono">{overallScore}점</span>
          </div>
        </div>
      </div>

      {/* 2. 핵심 4대 지표 요약 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* 어휘 다양도 (TTR) */}
        <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] text-stone-500 block mb-0.5">다양한 어휘 사용률 (TTR)</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-slateText-title font-mono">{vocabulary.ttr}%</span>
            <span className="text-[10px] text-emerald-600 font-medium">({vocabulary.uniqueWords}/{vocabulary.totalWords}단어)</span>
          </div>
          <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div className="bg-emerald-500 h-full" style={{ width: `${vocabulary.ttr}%` }} />
          </div>
        </div>

        {/* 원문 복사율 */}
        <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] text-stone-500 block mb-0.5">원문 복사율 (패러프레이징)</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-lg font-bold font-mono ${
              plagiarism.status === 'safe' ? 'text-emerald-600' : plagiarism.status === 'warning' ? 'text-amber-600' : 'text-rose-600'
            }`}>
              {plagiarism.copyRate}%
            </span>
            <span className="text-[10px] text-stone-400">
              {plagiarism.status === 'safe' ? '(안전)' : plagiarism.status === 'warning' ? '(주의)' : '(위험)'}
            </span>
          </div>
          <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div 
              className={`h-full ${plagiarism.status === 'safe' ? 'bg-emerald-500' : plagiarism.status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'}`} 
              style={{ width: `${Math.min(100, plagiarism.copyRate * 2.5)}%` }} 
            />
          </div>
        </div>

        {/* 학술 어휘(AWL) 비중 */}
        <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] text-stone-500 block mb-0.5">학술 어휘 (AWL 570)</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-indigo-700 font-mono">
              {vocabulary.levels.awl.percentage}%
            </span>
            <span className="text-[10px] text-indigo-500 font-medium">({vocabulary.levels.awl.count}개 사용)</span>
          </div>
          <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div className="bg-indigo-500 h-full" style={{ width: `${Math.min(100, vocabulary.levels.awl.percentage * 3)}%` }} />
          </div>
        </div>

        {/* 논리 연결성 */}
        <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] text-stone-500 block mb-0.5">논리 연결사 결속도</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-amber-700 font-mono">{transitions.score}점</span>
            <span className="text-[10px] text-stone-400">({transitions.foundTransitions.length}개 발견)</span>
          </div>
          <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div className="bg-amber-500 h-full" style={{ width: `${transitions.score}%` }} />
          </div>
        </div>
      </div>

      {/* 3. CEFR 어휘 레벨 프로파일 (누적 가로 막대 차트) */}
      <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slateText-title flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-honey-600" />
            CEFR 국제 어휘 기준 분포 프로파일
          </span>
          <span className="text-[11px] text-stone-400">수능 권장: B2 이상 어휘 30% 이상</span>
        </div>

        {/* 복합 누적 프로그레스 바 */}
        <div className="w-full h-3.5 bg-stone-100 rounded-full overflow-hidden flex">
          <div 
            style={{ width: `${vocabulary.levels.basic.percentage}%` }}
            className="bg-blue-400 transition-all"
            title={`A1~A2 기본 어휘: ${vocabulary.levels.basic.percentage}%`}
          />
          <div 
            style={{ width: `${vocabulary.levels.intermediate.percentage}%` }}
            className="bg-emerald-400 transition-all"
            title={`B1~B2 핵심 학술어: ${vocabulary.levels.intermediate.percentage}%`}
          />
          <div 
            style={{ width: `${vocabulary.levels.advanced.percentage}%` }}
            className="bg-purple-500 transition-all"
            title={`C1~C2 심화 학술어: ${vocabulary.levels.advanced.percentage}%`}
          />
        </div>

        {/* 범례 */}
        <div className="flex flex-wrap items-center justify-between text-[11px] pt-1 text-stone-600">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-400"></span>
            <span>A1~A2 기본 일상어 ({vocabulary.levels.basic.percentage}%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400"></span>
            <span>B1~B2 핵심 어휘 ({vocabulary.levels.intermediate.percentage}%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-purple-500"></span>
            <span>C1~C2 심화 어휘 ({vocabulary.levels.advanced.percentage}%)</span>
          </div>
        </div>

        {/* 발견된 우수 어휘 칩 */}
        {(vocabulary.awlWordsFound.length > 0 || vocabulary.advancedWordsFound.length > 0) && (
          <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-stone-500">발견된 고급·학술 단어:</span>
            {Array.from(new Set([...vocabulary.awlWordsFound, ...vocabulary.advancedWordsFound])).map((w, i) => (
              <span key={i} className="px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-purple-800 text-[11px] font-mono">
                {w}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 4. 학술 어휘 업그레이드 제안 (Academic Paraphrasing Helper) */}
      {vocabulary.suggestions.length > 0 && (
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            학술 어휘 업그레이드 추천 (쉬운 단어를 격식 있는 학술어로 교체해보세요)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {vocabulary.suggestions.map((s, idx) => (
              <div key={idx} className="bg-white p-2.5 rounded-lg border border-amber-200/80 text-xs flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-stone-500 line-through mr-1.5">{s.original}</span>
                  <span className="text-stone-400 mr-1.5">➔</span>
                  <span className="font-mono font-bold text-emerald-700">{s.better.slice(0, 2).join(', ')}</span>
                </div>
                {onApplySuggestion && (
                  <button
                    onClick={() => onApplySuggestion(s.original, s.better[0])}
                    className="text-[10px] px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded font-semibold transition-colors cursor-pointer"
                  >
                    대체 적용
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. 문법 및 표현 개선 권고사항 */}
      {grammar.length > 0 && (
        <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slateText-title">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            문법 및 표현 다듬기 권고사항 ({grammar.length}건)
          </div>
          <div className="space-y-1.5">
            {grammar.map((item, idx) => (
              <div key={idx} className="bg-white p-2.5 rounded-lg border border-stone-200 text-xs flex items-start gap-2">
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold mt-0.5 ${
                  item.severity === 'warning' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {item.rule}
                </span>
                <div className="flex-1">
                  <p className="text-stone-700">{item.message}</p>
                  {item.example && (
                    <p className="text-[11px] text-emerald-700 font-mono mt-0.5">
                      권장 표현: <strong>{item.example}</strong>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. 사용된 논리 연결사 목록 */}
      {transitions.foundTransitions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-stone-500">
          <span className="font-bold text-stone-700 flex items-center gap-1">
            <Link2 className="w-3.5 h-3.5 text-honey-600" />
            포착된 논리 연결어:
          </span>
          {transitions.foundTransitions.map((t, idx) => (
            <span key={idx} className="px-2 py-0.5 rounded bg-white border border-stone-200 text-stone-700 text-[11px] font-mono">
              {t.word} ({t.type === 'contrast' ? '대조' : t.type === 'causeEffect' ? '인과' : t.type === 'addition' ? '추가' : t.type === 'example' ? '예시' : '결론'})
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
