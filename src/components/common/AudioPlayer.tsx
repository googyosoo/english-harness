import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, Gauge, User, Users } from 'lucide-react';
import { parseDialogueScript, getGenderVoices, DialogueLine } from '../../utils/audioDialogue';

interface AudioPlayerProps {
  script: string;
  duration?: string;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  script,
  duration = '0:40',
  onPlayStart,
  onPlayEnd,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [progress, setProgress] = useState<number>(0);
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);
  const [currentSpeaker, setCurrentSpeaker] = useState<'M' | 'W' | 'N'>('N');

  // 대화 파싱 결과
  const dialogueLines = useRef<DialogueLine[]>([]);
  const isPlayingRef = useRef<boolean>(false);
  const currentLineIndexRef = useRef<number>(0);
  const playbackRateRef = useRef<number>(playbackRate);

  // 음성 로드 감지
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  useEffect(() => {
    playbackRateRef.current = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    // 음성 목록 로딩 리스너
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const updateVoices = () => {
        setVoicesLoaded(true);
      };
      window.speechSynthesis.onvoiceschanged = updateVoices;
      updateVoices();
    }

    return () => {
      stopPlayback();
    };
  }, []);

  // 스크립트가 변경되면 파싱 갱신
  useEffect(() => {
    dialogueLines.current = parseDialogueScript(script);
    setCurrentLineIndex(0);
    currentLineIndexRef.current = 0;
    setProgress(0);
    setIsPlaying(false);
    isPlayingRef.current = false;
  }, [script]);

  const stopPlayback = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    isPlayingRef.current = false;
  };

  // 순차 대사 발화 재귀 함수
  const speakLine = (index: number) => {
    if (!isPlayingRef.current || index >= dialogueLines.current.length) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      setProgress(100);
      if (onPlayEnd) onPlayEnd();
      return;
    }

    const line = dialogueLines.current[index];
    currentLineIndexRef.current = index;
    setCurrentLineIndex(index);
    setCurrentSpeaker(line.speaker);

    // 전체 진행률 계산
    const pct = Math.round((index / dialogueLines.current.length) * 100);
    setProgress(pct);

    const utterance = new SpeechSynthesisUtterance(line.text);
    utterance.lang = 'en-US';
    utterance.rate = playbackRateRef.current;

    const { maleVoice, femaleVoice } = getGenderVoices();

    // 2인 대화 성별 음성 매칭
    if (line.speaker === 'M') {
      if (maleVoice) utterance.voice = maleVoice;
      utterance.pitch = 0.92; // 남성 음성 톤 (약간 낮춤)
    } else if (line.speaker === 'W') {
      if (femaleVoice) utterance.voice = femaleVoice;
      utterance.pitch = 1.08; // 여성 음성 톤 (자연스러운 고음)
    } else {
      // 독백 담화인 경우 기본 영어 음성
      if (femaleVoice) utterance.voice = femaleVoice;
      utterance.pitch = 1.0;
    }

    utterance.onend = () => {
      if (isPlayingRef.current) {
        // 다음 대사로 넘어가기 전 자연스러운 0.25초 호흡 딜레이
        setTimeout(() => {
          if (isPlayingRef.current) {
            speakLine(index + 1);
          }
        }, 250);
      }
    };

    utterance.onerror = () => {
      if (isPlayingRef.current) {
        speakLine(index + 1);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePlayToggle = () => {
    if (!window.speechSynthesis) {
      alert('이 브라우저는 음성 합성을 지원하지 않습니다.');
      return;
    }

    if (isPlaying) {
      stopPlayback();
    } else {
      stopPlayback();
      isPlayingRef.current = true;
      setIsPlaying(true);
      if (onPlayStart) onPlayStart();

      // 시작 위치
      const startIndex = currentLineIndexRef.current >= dialogueLines.current.length ? 0 : currentLineIndexRef.current;
      speakLine(startIndex);
    }
  };

  const handleReset = () => {
    stopPlayback();
    currentLineIndexRef.current = 0;
    setCurrentLineIndex(0);
    setCurrentSpeaker('N');
    setProgress(0);
  };

  const changeRate = (rate: number) => {
    setPlaybackRate(rate);
    playbackRateRef.current = rate;
    if (isPlaying) {
      // 속도 변경 시 현재 문장부터 다시 재생
      stopPlayback();
      setTimeout(() => {
        isPlayingRef.current = true;
        setIsPlaying(true);
        speakLine(currentLineIndexRef.current);
      }, 150);
    }
  };

  const hasDialogue = dialogueLines.current.some((l) => l.speaker === 'M' || l.speaker === 'W');

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-warm-sm flex flex-col gap-3">
      {/* 상단: 상태 및 배지 */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isPlaying ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600'}`}>
            <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <span className="font-bold text-slateText-title">원어민 발화 오디오</span>
            <span className="text-[11px] text-stone-400 ml-1.5 font-mono">
              ({duration || '약 40초'})
            </span>
          </div>
        </div>

        {/* 2인 대화 감지 표시 칩 */}
        <div className="flex items-center gap-1.5">
          {hasDialogue ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold">
              <Users className="w-3 h-3" />
              <span>2인 대화 (남녀 성우 분리)</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-medium">
              단독 담화
            </span>
          )}

          {isPlaying && hasDialogue && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold animate-pulse ${
                currentSpeaker === 'M'
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : currentSpeaker === 'W'
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {currentSpeaker === 'M' ? '👨 남성 성우 발화 중' : currentSpeaker === 'W' ? '👩 여성 성우 발화 중' : '발화 중'}
            </span>
          )}
        </div>
      </div>

      {/* 프로그레스 바 */}
      <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden border border-stone-200/50">
        <div
          className="bg-honey-500 h-full transition-all duration-300 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 대화 미리보기 (재생 중일 때 현재 대사 하이라이트) */}
      {hasDialogue && dialogueLines.current.length > 0 && isPlaying && (
        <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs flex items-start gap-2 animate-in fade-in">
          <span
            className={`px-1.5 py-0.2 rounded text-[10px] font-bold mt-0.5 ${
              currentSpeaker === 'M'
                ? 'bg-blue-600 text-white'
                : 'bg-rose-600 text-white'
            }`}
          >
            {currentSpeaker === 'M' ? '남성' : '여성'}
          </span>
          <p className="font-mono text-stone-700 leading-relaxed italic line-clamp-2">
            "{dialogueLines.current[currentLineIndex]?.text}"
          </p>
        </div>
      )}

      {/* 하단 컨트롤러 */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-stone-100">
        {/* 재생 / 일시정지 / 리셋 */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayToggle}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
                : 'bg-honey-400 hover:bg-honey-500 text-slateText-title'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>일시정지</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>듣기 시작</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs transition-colors cursor-pointer"
            title="처음부터 다시 듣기"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 배속 조절 버튼들 */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
          <span className="text-[10px] text-stone-400 px-1 font-semibold flex items-center gap-0.5">
            <Gauge className="w-3 h-3" />
            배속
          </span>
          {[0.8, 1.0, 1.2].map((rate) => (
            <button
              key={rate}
              onClick={() => changeRate(rate)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                playbackRate === rate
                  ? 'bg-white text-honey-700 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
