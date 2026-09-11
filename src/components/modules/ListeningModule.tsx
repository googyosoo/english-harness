import React, { useState } from 'react';
import { ActivityContent, HarnessLayerStatus } from '../../types/harness';
import { AudioPlayer } from '../common/AudioPlayer';
import { Headphones, CheckCircle2, AlertCircle, Sparkles, HelpCircle, Lock } from 'lucide-react';

interface ListeningModuleProps {
  activity: ActivityContent;
  updateHarnessStatus: (updater: (prev: HarnessLayerStatus) => HarnessLayerStatus) => void;
}

export const ListeningModule: React.FC<ListeningModuleProps> = ({
  activity,
  updateHarnessStatus,
}) => {
  const [userInputs, setUserInputs] = useState<string[]>(
    new Array(activity.dictationTarget?.length || 0).fill('')
  );
  const [checked, setChecked] = useState(false);
  const [passed, setPassed] = useState(false);
  const [revealedHint, setRevealedHint] = useState(false);

  const targets = activity.dictationTarget || [];

  const handleInputChange = (index: number, val: string) => {
    const updated = [...userInputs];
    updated[index] = val;
    setUserInputs(updated);
  };

  const handleCheck = () => {
    let correctCount = 0;
    targets.forEach((target, i) => {
      const userClean = (userInputs[i] || '').trim().toLowerCase().replace(/[.,!?]/g, '');
      const targetClean = target.toLowerCase().replace(/[.,!?]/g, '');
      if (userClean === targetClean) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / targets.length) * 100);
    const isPass = score >= 75;
    setChecked(true);
    setPassed(isPass);

    updateHarnessStatus(prev => ({
      ...prev,
      sensor: {
        name: '청취 딕테이션 WER 일치율 센서',
        currentScore: score,
        status: isPass ? 'passed' : 'warning',
        feedback: isPass 
          ? `우수! ${targets.length}개 중 ${correctCount}개 핵심 청킹 일치 (${score}점)` 
          : `주의: ${targets.length}개 중 ${correctCount}개 일치. 다시 듣고 스펠링과 연음을 확인하세요.`
      },
      loop: {
        ...prev.loop,
        attempts: prev.loop.attempts + 1,
        currentStep: isPass ? '듣기 완료' : `재시도 ${prev.loop.attempts + 1}회차`,
      },
      observability: {
        ...prev.observability,
        neisObservationLog: `영어 듣기 활동에서 ${score}점의 청취 정확도를 기록하며 핵심 정보를 정확히 파악함.`
      }
    }));
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-warm-sm">
      {/* 모듈 헤더 */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slateText-title flex items-center gap-2">
              {activity.title}
              <span className="text-xs font-normal px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                듣기 & 청킹 딕테이션
              </span>
            </h3>
            <p className="text-xs text-slateText-muted">{activity.subTitle}</p>
          </div>
        </div>
      </div>

      {/* 오디오 플레이어 */}
      <div className="mb-6">
        <label className="block text-xs font-bold text-slateText-title mb-1.5">
          🎧 원어민 음원 청취 (배속 조절 가능)
        </label>
        <AudioPlayer script={activity.audioScript || ''} duration={activity.audioDuration} />
      </div>

      {/* 딕테이션 챌린지 */}
      <div className="bg-[#FDFBF7] p-5 rounded-xl border border-stone-200 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-sm text-slateText-title flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-honey-500" />
            핵심 의미 청킹(Chunking) 빈칸 채우기
          </h4>
          <span className="text-xs text-stone-500">
            총 {targets.length}개 빈칸
          </span>
        </div>
        <p className="text-xs text-slateText-muted mb-4">
          음원을 집중해서 듣고 아래 제시된 핵심 구문을 받아쓰세요. (철자와 대소문자에 유의)
        </p>

        <div className="space-y-3">
          {targets.map((target, idx) => {
            const isCorrect = checked && (userInputs[idx] || '').trim().toLowerCase().replace(/[.,!?]/g, '') === target.toLowerCase().replace(/[.,!?]/g, '');
            return (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 bg-white p-3 rounded-lg border border-stone-200">
                <span className="text-xs font-bold text-honey-700 min-w-[60px]">
                  빈칸 #{idx + 1}:
                </span>
                <input
                  type="text"
                  value={userInputs[idx]}
                  onChange={(e) => handleInputChange(idx, e.target.value)}
                  placeholder="들리는 단어 또는 어구를 입력하세요"
                  className="flex-1 px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:border-honey-500"
                />
                {checked && (
                  <div className="flex items-center gap-1 text-xs">
                    {isCorrect ? (
                      <span className="flex items-center text-emerald-600 font-bold gap-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 정답
                      </span>
                    ) : (
                      <span className="flex items-center text-rose-600 font-bold gap-0.5">
                        <AlertCircle className="w-3.5 h-3.5" /> 불일치
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 채점 및 비계 힌트 버튼 */}
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => setRevealedHint(!revealedHint)}
            className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {revealedHint ? '힌트 숨기기' : '하네스 스캐폴딩 힌트 보기'}
          </button>
          <button
            onClick={handleCheck}
            className="px-4 py-2 bg-honey-400 hover:bg-honey-500 text-slateText-title font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            하네스 센서 일치도 채점하기
          </button>
        </div>

        {/* 힌트 영역 */}
        {revealedHint && (
          <div className="mt-3 p-3 bg-honey-50/60 border border-honey-200 rounded-lg text-xs text-stone-700 space-y-1">
            <p className="font-bold text-honey-800">💡 하네스 첫 글자 힌트:</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {targets.map((t, i) => (
                <span key={i} className="px-2 py-0.5 bg-white rounded border border-honey-200 font-mono text-[11px]">
                  #{i+1}: {t.slice(0, 3)}...
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 하네스 권한 잠금 안내 */}
      <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs text-stone-500">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-stone-400" />
          <span>전체 스크립트 전문은 딕테이션 75% 이상 통과 시 해금됩니다.</span>
        </div>
        {passed && (
          <span className="text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> 권한 잠금 해제됨
          </span>
        )}
      </div>

      {passed && (
        <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 leading-relaxed">
          <strong className="block font-bold mb-1">[해금된 전체 스크립트]</strong>
          {activity.audioScript}
        </div>
      )}
    </div>
  );
};
