import React, { useState, useEffect, useRef } from 'react';
import { ActivityContent, HarnessLayerStatus } from '../../types/harness';
import { Mic, MicOff, Volume2, Sparkles, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

interface SpeakingModuleProps {
  activity: ActivityContent;
  updateHarnessStatus: (updater: (prev: HarnessLayerStatus) => HarnessLayerStatus) => void;
}

export const SpeakingModule: React.FC<SpeakingModuleProps> = ({
  activity,
  updateHarnessStatus,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [analyzed, setAnalyzed] = useState(false);
  const [wpm, setWpm] = useState<number>(0);
  const [currentFeedbackTier, setCurrentFeedbackTier] = useState<'basic' | 'natural' | 'academic'>('natural');
  const recognitionRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let current = '';
        for (let i = 0; i < event.results.length; i++) {
          current += event.results[i][0].transcript + ' ';
        }
        setSpokenTranscript(current.trim());
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleToggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);

      // 발화 분석 센서 계산
      const durationMin = Math.max(0.1, (Date.now() - startTimeRef.current) / 60000);
      const wordCount = spokenTranscript.trim().split(/\s+/).filter(Boolean).length;
      const calculatedWpm = Math.round(wordCount / durationMin);
      setWpm(calculatedWpm);
      setAnalyzed(true);

      const targetWpm = activity.grade === 'G1' ? 120 : activity.grade === 'G2' ? 135 : 150;
      const isGoodFluency = calculatedWpm >= targetWpm * 0.75;

      updateHarnessStatus(prev => ({
        ...prev,
        sensor: {
          name: '발화 유창성 및 WPM 센서',
          currentScore: Math.min(100, Math.round((calculatedWpm / targetWpm) * 100)),
          status: isGoodFluency ? 'passed' : 'warning',
          feedback: `발화 속도: ${calculatedWpm} WPM (기준: ${targetWpm} WPM). ${wordCount}단어 구술 완료.`
        },
        loop: {
          ...prev.loop,
          attempts: prev.loop.attempts + 1,
          currentStep: '발화 피드백 수렴',
        },
        observability: {
          ...prev.observability,
          neisObservationLog: `영어 구술 평가에서 ${calculatedWpm} WPM의 안정적인 발화 유창성을 발휘하며 논리적 의견을 제시함.`
        }
      }));
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsRecording(true);
          setSpokenTranscript('');
          setAnalyzed(false);
          startTimeRef.current = Date.now();
        } catch (err) {
          console.warn(err);
        }
      } else {
        // 음성인식 미지원 브라우저 대비 시뮬레이션
        setIsRecording(true);
        startTimeRef.current = Date.now();
        setTimeout(() => {
          setSpokenTranscript(activity.sampleAnswerSteps?.basic || "We should reduce plastic because it's good for nature.");
        }, 1500);
      }
    }
  };

  const playTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-warm-sm">
      {/* 모듈 헤더 */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slateText-title flex items-center gap-2">
              {activity.title}
              <span className="text-xs font-normal px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                실시간 음성 발화
              </span>
            </h3>
            <p className="text-xs text-slateText-muted">{activity.subTitle}</p>
          </div>
        </div>
      </div>

      {/* 발화 프롬프트 */}
      <div className="bg-[#FDFBF7] p-5 rounded-xl border border-stone-200 mb-6">
        <div className="text-xs font-bold text-stone-500 uppercase mb-1">🎯 Speaking Prompt</div>
        <p className="text-base font-bold text-slateText-title mb-2">
          {activity.speakingPrompt}
        </p>
        <p className="text-xs text-honey-700 font-medium">
          상황 맥락: {activity.roleplayScenario}
        </p>
      </div>

      {/* 마이크 녹음 컨트롤러 */}
      <div className="flex flex-col items-center justify-center p-6 bg-stone-50 rounded-xl border border-stone-200 mb-6">
        <button
          onClick={handleToggleRecording}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-md ${
            isRecording
              ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-300'
              : 'bg-honey-400 hover:bg-honey-500 text-slateText-title'
          }`}
        >
          {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
        </button>

        <p className="text-xs font-bold text-slateText-title mt-3">
          {isRecording ? '듣고 있어요! 영어로 말씀하세요... (클릭하여 정지)' : '마이크 버튼을 누르고 말씀하세요'}
        </p>
        <p className="text-[11px] text-stone-400 mt-0.5">
          (Web Speech API 실시간 음성인식 작동)
        </p>

        {/* 실시간 STT 텍스트 프리뷰 */}
        <div className="w-full mt-4 p-3.5 bg-white rounded-lg border border-stone-200 min-h-[60px] text-xs text-slateText-body">
          {spokenTranscript || (
            <span className="text-stone-400 italic">
              음성을 인식하면 여기에 실시간으로 표시됩니다.
            </span>
          )}
        </div>
      </div>

      {/* 발화 분석 센서 결과 */}
      {analyzed && (
        <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-xl mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-xs text-purple-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-600" />
              하네스 발화 분석 센서 결과
            </h4>
            <span className="text-xs font-mono font-bold text-purple-700">
              속도: {wpm} WPM
            </span>
          </div>

          <p className="text-xs text-purple-800 mb-3">
            총 {spokenTranscript.split(/\s+/).filter(Boolean).length}단어를 구술했습니다.
          </p>

          {/* 3단계 스캐폴딩 (Basic -> Natural -> Academic) */}
          <div className="bg-white p-3.5 rounded-lg border border-purple-200/80">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-stone-100">
              <span className="text-xs font-bold text-slateText-title">
                하네스 3단계 표현 레벨업 피드백:
              </span>
              <div className="flex gap-1">
                {(['basic', 'natural', 'academic'] as const).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setCurrentFeedbackTier(tier)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      currentFeedbackTier === tier
                        ? 'bg-purple-600 text-white'
                        : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-start justify-between gap-3 text-xs text-slateText-body">
              <p className="italic font-serif flex-1">
                "{activity.sampleAnswerSteps?.[currentFeedbackTier]}"
              </p>
              <button
                onClick={() => playTTS(activity.sampleAnswerSteps?.[currentFeedbackTier] || '')}
                className="p-1.5 bg-stone-100 hover:bg-honey-100 text-stone-600 hover:text-honey-700 rounded-md transition-colors"
                title="원어민 발음 듣기"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
