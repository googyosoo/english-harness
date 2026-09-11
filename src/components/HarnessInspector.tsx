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
                  에이전트 6겹 하네스 실시간 인스펙터 (Harness Inspector)
                </h2>
                <p className="text-xs text-slateText-muted mt-0.5">
                  『에이전트 하네스 워크북』 기준: 모델은 판단을 하고, 6겹 하네스가 안전성과 교육적 비계를 완성합니다.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              전 겹 정상 가동 중
            </span>
          </div>
        </div>

        {/* 6겹 하네스 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {/* 1. 가이드 (Guide) */}
          <div className="p-4 rounded-xl bg-[#FDFBF7] border border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">1</span>
                <span className="font-bold text-sm text-slateText-title">가이드 (Guide)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">미리 막는 층</span>
            </div>
            <p className="text-xs text-slateText-muted mb-2">교육과정 성취기준 & 루브릭</p>
            <div className="text-xs bg-white p-2.5 rounded-lg border border-stone-200/80 space-y-1">
              <p><strong className="text-stone-700">규칙:</strong> {status.guide.rule}</p>
              <p><strong className="text-stone-700">성취기준:</strong> <code className="text-blue-600 font-mono text-[11px]">{status.guide.curriculumCode}</code></p>
              <p><strong className="text-stone-700">루브릭:</strong> {status.guide.rubricCriteria}</p>
            </div>
          </div>

          {/* 2. 센서 (Sensor) */}
          <div className="p-4 rounded-xl bg-[#FDFBF7] border border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">2</span>
                <span className="font-bold text-sm text-slateText-title">센서 (Sensor)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">나중에 잡는 층</span>
            </div>
            <p className="text-xs text-slateText-muted mb-2">문법/어휘/표절/일치도 검증</p>
            <div className="text-xs bg-white p-2.5 rounded-lg border border-stone-200/80 space-y-1">
              <div className="flex justify-between items-center">
                <strong className="text-stone-700">활성 센서:</strong>
                <span className="font-mono text-amber-700">{status.sensor.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <strong className="text-stone-700">현재 점수:</strong>
                <span className="font-bold text-emerald-600">
                  {status.sensor.currentScore !== null ? `${status.sensor.currentScore}점` : '측정 대기'}
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
                <span className="font-bold text-sm text-slateText-title">루프 (Loop)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">한계 안에 가두는 층</span>
            </div>
            <p className="text-xs text-slateText-muted mb-2">자가 수정 및 3단계 스캐폴딩</p>
            <div className="text-xs bg-white p-2.5 rounded-lg border border-stone-200/80 space-y-1.5">
              <div className="flex justify-between items-center">
                <strong className="text-stone-700">시도 횟수:</strong>
                <span className="font-bold text-slateText-title">
                  {status.loop.attempts} / {status.loop.maxAttempts}회 상한
                </span>
              </div>
              <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${(status.loop.attempts / status.loop.maxAttempts) * 100}%` }}
                />
              </div>
              <p className="text-stone-600"><strong className="text-stone-700">단계:</strong> {status.loop.currentStep}</p>
            </div>
          </div>

          {/* 4. 메모리 (Memory) */}
          <div className="p-4 rounded-xl bg-[#FDFBF7] border border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">4</span>
                <span className="font-bold text-sm text-slateText-title">메모리 (Memory)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">상태를 잇는 층</span>
            </div>
            <p className="text-xs text-slateText-muted mb-2">연계 활동 핸드오프 (Handoff State)</p>
            <div className="text-xs bg-white p-2.5 rounded-lg border border-stone-200/80 space-y-1">
              <p><strong className="text-stone-700">핸드오프 패킷:</strong> {status.memory.handoffData ? '데이터 바인딩됨' : '대기 중'}</p>
              <p><strong className="text-stone-700">누적 인사이트:</strong> {status.memory.keyInsights.length}개 기억 중</p>
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
                <span className="font-bold text-sm text-slateText-title">권한 (Permission)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">할 수 있는 일 강제</span>
            </div>
            <p className="text-xs text-slateText-muted mb-2">대필 차단 & 비계 전용 권한</p>
            <div className="text-xs bg-white p-2.5 rounded-lg border border-stone-200/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-stone-700">답안 직접 생성(대필):</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                  {status.permission.allowAnswerGeneration ? '허용' : '원천 차단'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-700">소크라테스식 힌트:</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                  {status.permission.allowScaffolding ? '허용됨' : '제한됨'}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                * 학생의 학습을 대신하지 않고 질문으로 생각을 이끕니다.
              </p>
            </div>
          </div>

          {/* 6. 관측 (Observability) */}
          <div className="p-4 rounded-xl bg-[#FDFBF7] border border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-cyan-100 text-cyan-800 font-bold text-xs flex items-center justify-center">6</span>
                <span className="font-bold text-sm text-slateText-title">관측 (Observability)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-200">무슨 일 있었나 기록</span>
            </div>
            <p className="text-xs text-slateText-muted mb-2">트립와이어 & 생기부 세특 에비던스</p>
            <div className="text-xs bg-white p-2.5 rounded-lg border border-stone-200/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-stone-700">트립와이어(정체감지):</span>
                <span className="font-medium text-emerald-600">정상 (미감지)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-700">활동 소요 시간:</span>
                <span className="font-mono text-stone-600">{status.observability.timeSpentSeconds}초</span>
              </div>
              <p className="text-[11px] text-cyan-800 bg-cyan-50/70 p-1.5 rounded border border-cyan-100 mt-1 line-clamp-2">
                {status.observability.neisObservationLog || '활동 진행 시 세특 증거가 자동 누적됩니다.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
