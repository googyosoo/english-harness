import React from 'react';
import { HarnessLayerStatus, ActivityContent } from '../types/harness';
import { ShieldCheck, Eye, RefreshCw, Cpu, Database, KeyRound, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface HarnessInspectorProps {
  status: HarnessLayerStatus;
  activity: ActivityContent;
  onResetLoop?: () => void;
}

export const HarnessInspector: React.FC<HarnessInspectorProps> = ({
  status,
  activity,
  onResetLoop,
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-4">
      {/* 인스펙터 상단 타이틀 */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-warm-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slateText-title">
                  AI 학습 도우미 6단계 코칭 상태 (Learning Coach)
                </h2>
                <p className="text-xs text-slateText-muted mt-0.5">
                  AI가 답을 대신 써주지 않고, 단계별 질문과 힌트를 통해 학생 스스로 생각을 키워가도록 돕는 6단계 안전망입니다.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              6단계 학습 도우미 정상 작동 중
            </span>
          </div>
        </div>

        {/* 6단계 코칭 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {/* 1. 가이드 (Guide) */}
          <div className="p-4 rounded-xl bg-[#FDFBF7] border border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">1</span>
                <span className="font-bold text-sm text-slateText-title">학습 목표 & 기준 (Guide)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">사전 안내</span>
            </div>
            <p className="text-xs text-slateText-muted mb-2">교육과정 성취기준 & 평가 기준표</p>
            <div className="text-xs bg-white p-2.5 rounded-lg border border-stone-200/80 space-y-1">
              <p><strong className="text-stone-700">학습 원칙:</strong> {status.guide.rule}</p>
              <p><strong className="text-stone-700">성취기준:</strong> <code className="text-blue-600 font-mono text-[11px]">{status.guide.curriculumCode}</code></p>
              <p><strong className="text-stone-700">평가 기준표:</strong> {status.guide.rubricCriteria}</p>
            </div>
          </div>

          {/* 2. 센서 (Sensor) */}
          <div className="p-4 rounded-xl bg-[#FDFBF7] border border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">2</span>
                <span className="font-bold text-sm text-slateText-title">표현 점검 도우미 (Sensor)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">실시간 점검</span>
            </div>
            <p className="text-xs text-slateText-muted mb-2">문법·어휘·다양성·표절 실시간 점검</p>
            <div className="text-xs bg-white p-2.5 rounded-lg border border-stone-200/80 space-y-1">
              <div className="flex justify-between items-center">
                <strong className="text-stone-700">점검 항목:</strong>
                <span className="font-mono text-amber-700">{status.sensor.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <strong className="text-stone-700">성취 점수:</strong>
                <span className="font-bold text-emerald-600">
                  {status.sensor.currentScore !== null ? `${status.sensor.currentScore}점` : '작성 대기 중'}
                </span>
              </div>
              <p className="text-stone-500 italic mt-1">{status.sensor.feedback || '학생 입력 대기 중...'}</p>
            </div>
          </div>

          {/* 3. 루프 (Loop) */}
          <div className="p-4 rounded-xl bg-[#FDFBF7] border border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">3</span>
                <span className="font-bold text-sm text-slateText-title">스스로 고쳐 쓰기 (Loop)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">생각 다듬기</span>
            </div>
            <p className="text-xs text-slateText-muted mb-2">정답 대신 질문 힌트로 스스로 수정 유도</p>
            <div className="text-xs bg-white p-2.5 rounded-lg border border-stone-200/80 space-y-1.5">
              <div className="flex justify-between items-center">
                <strong className="text-stone-700">스스로 고쳐 쓴 횟수:</strong>
                <span className="font-bold text-slateText-title">
                  {status.loop.attempts}회 (권장 최대 {status.loop.maxAttempts}회)
                </span>
              </div>
              <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (status.loop.attempts / status.loop.maxAttempts) * 100)}%` }}
                />
              </div>
              <p className="text-stone-600"><strong className="text-stone-700">진행 단계:</strong> {status.loop.currentStep}</p>
            </div>
          </div>

          {/* 4. 메모리 (Memory) */}
          <div className="p-4 rounded-xl bg-[#FDFBF7] border border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">4</span>
                <span className="font-bold text-sm text-slateText-title">생각 이어쓰기 (Memory)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">단계 연결</span>
            </div>
            <p className="text-xs text-slateText-muted mb-2">1단계 메모·근거가 2단계 작문으로 전달</p>
            <div className="text-xs bg-white p-2.5 rounded-lg border border-stone-200/80 space-y-1">
              <p><strong className="text-stone-700">1단계 내용 연결:</strong> {status.memory.handoffData ? '✅ 연결 완료됨' : '작성 대기 중'}</p>
              <p><strong className="text-stone-700">정리된 핵심 생각:</strong> {status.memory.keyInsights.length}개 보존 중</p>
              {status.memory.keyInsights.length > 0 && (
                <ul className="list-disc pl-4 text-stone-500 text-[11px] space-y-0.5 mt-1">
                  {status.memory.keyInsights.map((insight, idx) => (
                    <li key={idx} className="line-clamp-1">{insight}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* 5. 권한 (Permission) */}
          <div className="p-4 rounded-xl bg-[#FDFBF7] border border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center">5</span>
                <span className="font-bold text-sm text-slateText-title">자기주도 학습 보호 (Permission)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">대필 방지</span>
            </div>
            <p className="text-xs text-slateText-muted mb-2">AI 답안 대필 차단 및 생각 유도 보장</p>
            <div className="text-xs bg-white p-2.5 rounded-lg border border-stone-200/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-stone-700">AI가 답 대신 써주기:</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                  {status.permission.allowAnswerGeneration ? '허용' : '원천 차단'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-700">스스로 생각 돕는 힌트:</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                  {status.permission.allowScaffolding ? '항상 지원' : '제한됨'}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                * AI가 학생의 숙제를 대신하지 않고 질문으로 생각을 이끕니다.
              </p>
            </div>
          </div>

          {/* 6. 관측 (Observability) */}
          <div className="p-4 rounded-xl bg-[#FDFBF7] border border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-cyan-100 text-cyan-800 font-bold text-xs flex items-center justify-center">6</span>
                <span className="font-bold text-sm text-slateText-title">학습 과정 기록 (Observability)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-200">성장 기록</span>
            </div>
            <p className="text-xs text-slateText-muted mb-2">학습 시간 & 생기부 세특 기록 연동</p>
            <div className="text-xs bg-white p-2.5 rounded-lg border border-stone-200/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-stone-700">학습 정체(막힘) 감지:</span>
                <span className="font-medium text-emerald-600">원활하게 진행 중</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-700">학습 몰입 시간:</span>
                <span className="font-mono text-stone-600">{status.observability.timeSpentSeconds}초</span>
              </div>
              <p className="text-[11px] text-cyan-800 bg-cyan-50/70 p-1.5 rounded border border-cyan-100 mt-1 line-clamp-2">
                {status.observability.neisObservationLog || '활동을 진행하면 스스로 고민하고 수정한 과정이 생기부 세특에 자동 기록됩니다.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
