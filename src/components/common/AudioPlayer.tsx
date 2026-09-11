import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, Gauge } from 'lucide-react';

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
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handlePlayToggle = () => {
    if (!window.speechSynthesis) {
      alert('이 브라우저는 음성 합성을 지원하지 않습니다.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(script);
      utterance.lang = 'en-US';
      utterance.rate = playbackRate;

      // 가능한 원어민 음성 선택
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('David')));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      utterance.onstart = () => {
        setIsPlaying(true);
        if (onPlayStart) onPlayStart();
        setProgress(0);
        const startTime = Date.now();
        const estDuration = (script.split(' ').length / (2.2 * playbackRate)) * 1000;
        
        intervalRef.current = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const pct = Math.min(100, Math.round((elapsed / estDuration) * 100));
          setProgress(pct);
          if (pct >= 100) {
            clearInterval(intervalRef.current);
          }
        }, 100);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setProgress(100);
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (onPlayEnd) onPlayEnd();
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleReset = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const changeRate = (rate: number) => {
    setPlaybackRate(rate);
    if (isPlaying) {
      handlePlayToggle(); // 정지 후 재시작 유도
    }
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-3.5 shadow-warm-sm">
      <div className="flex items-center justify-between gap-3">
        {/* 재생/정지 버튼 */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayToggle}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-xs ${
              isPlaying
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-honey-400 text-slateText-title hover:bg-honey-500'
            }`}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <button
            onClick={handleReset}
            className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 flex items-center justify-center transition-colors"
            title="다시 처음부터"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* 재생 바 */}
        <div className="flex-1 px-2">
          <div className="flex justify-between text-[11px] text-slateText-muted mb-1 font-mono">
            <span className="flex items-center gap-1 text-honey-700 font-semibold">
              <Volume2 className="w-3.5 h-3.5" />
              {isPlaying ? '재생 중...' : '원어민 TTS 음원'}
            </span>
            <span>{duration}</span>
          </div>
          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-honey-500 h-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 배속 조절 칩 */}
        <div className="flex items-center gap-1 bg-[#F8F6F0] p-1 rounded-lg border border-stone-200">
          <Gauge className="w-3.5 h-3.5 text-stone-400 ml-1 mr-0.5" />
          {[0.8, 1.0, 1.2].map((r) => (
            <button
              key={r}
              onClick={() => changeRate(r)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                playbackRate === r
                  ? 'bg-white text-slateText-title shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {r}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
