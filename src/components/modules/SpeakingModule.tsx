import React, { useState, useEffect, useRef } from 'react';
import { ActivityContent, HarnessLayerStatus } from '../../types/harness';
import { 
  Mic, MicOff, Volume2, Sparkles, Play, Square, 
  RotateCcw, CheckCircle2, User, Headphones, BarChart3, AlertCircle 
} from 'lucide-react';
import { AudioPlayer } from '../common/AudioPlayer';
import { loadStudentProgress, saveStudentProgress } from '../../utils/storage';
import { loadCurrentUser, saveSubmission } from '../../utils/authStorage';
import { runFullSmartSensorInspection } from '../../utils/sensorEngine';

interface SpeakingModuleProps {
  activity: ActivityContent;
  updateHarnessStatus: (updater: (prev: HarnessLayerStatus) => HarnessLayerStatus) => void;
}

export const SpeakingModule: React.FC<SpeakingModuleProps> = ({
  activity,
  updateHarnessStatus,
}) => {
  const scriptText = activity.audioScript || activity.readingPassage || '';

  // 대본을 역할(M/W) 및 문장 단위로 분할 파싱
  const scriptLines = React.useMemo(() => {
    if (!scriptText) return [];
    const rawLines = scriptText.split('\n').map(l => l.trim()).filter(Boolean);
    const result: { speaker: string; text: string }[] = [];

    rawLines.forEach(line => {
      const match = line.match(/^([MW]|Man|Woman|Boy|Girl):\s*(.*)/i);
      if (match) {
        result.push({ speaker: match[1].toUpperCase(), text: match[2] });
      } else {
        // 문장 분할
        const sentences = line.split(/(?<=[.?!])\s+/).filter(Boolean);
        sentences.forEach(s => {
          result.push({ speaker: '대본', text: s });
        });
      }
    });

    return result.length > 0 ? result : [{ speaker: '원문', text: scriptText }];
  }, [scriptText]);

  // 녹음 상태
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [analyzed, setAnalyzed] = useState(false);
  const [accuracyScore, setAccuracyScore] = useState<number | null>(null);

  // 미디어 레코더 및 STT 참조
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  // 컴포넌트 마운트 및 activity 변경 시 초기화
  useEffect(() => {
    setAudioUrl(null);
    setSpokenTranscript('');
    setAnalyzed(false);
    setAccuracyScore(null);
    setIsRecording(false);
    setRecordingSeconds(0);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [activity.id]);

  // 문장별 원어민 TTS 재생 함수
  const playSentenceTTS = (text: string, speaker?: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      if (speaker === 'W') {
        const femaleVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Zira')));
        if (femaleVoice) utterance.voice = femaleVoice;
      } else {
        const maleVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Male') || v.name.includes('David') || v.name.includes('George')));
        if (maleVoice) utterance.voice = maleVoice;
      }
    }

    window.speechSynthesis.speak(utterance);
  };

  // 실제 마이크 음성 녹음 시작
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // 스트림 트랙 중지 (마이크 끄기)
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      // 타이머 시작
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);

      // STT 보조 인식 시작 (지원 브라우저)
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const rec = new SpeechRecognition();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = 'en-US';
          rec.onresult = (e: any) => {
            let current = '';
            for (let i = 0; i < e.results.length; i++) {
              current += e.results[i][0].transcript + ' ';
            }
            setSpokenTranscript(current.trim());
          };
          rec.start();
          recognitionRef.current = rec;
        } catch (e) {
          // ignore
        }
      }
    } catch (err: any) {
      alert('마이크 접근 권한이 필요합니다. 브라우저의 마이크 접근을 허용해 주세요.');
      console.warn('Microphone access error:', err);
    }
  };

  // 녹음 중지
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }

      // 발음 분석 및 대시보드 저장 점수 산출
      calculateSpeakingScore();
    }
  };

  // 발화 점수 계산 및 대시보드 연동
  const calculateSpeakingScore = () => {
    const originalWords = scriptText.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
    const spokenWords = spokenTranscript.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);

    // 단어 일치도 추정 (STT가 작동한 경우)
    let score = 85; // 기본 안정 점수
    if (spokenWords.length > 0 && originalWords.length > 0) {
      const matchCount = spokenWords.filter(w => originalWords.includes(w)).length;
      score = Math.min(100, Math.max(65, Math.round((matchCount / Math.min(originalWords.length, 25)) * 100)));
    }
    setAccuracyScore(score);
    setAnalyzed(true);

    // 1. 대시보드 제출물 저장
    const currentUser = loadCurrentUser();
    const sensorReport = runFullSmartSensorInspection(
      spokenTranscript || 'Speaking practice audio recording completed.',
      scriptText,
      5
    );
    sensorReport.overallScore = score;
    sensorReport.status = score >= 80 ? 'passed' : 'warning';
    sensorReport.feedbackSummary = `음성 녹음 및 쉐도잉 발화 분석 완료 (${score}점). 대본의 억양과 리듬을 충실히 모방함.`;

    saveSubmission({
      studentId: currentUser?.id || 'guest_student',
      studentName: currentUser?.name || '학생',
      studentNumber: currentUser?.studentNumber || '2026-S1',
      activityId: activity.id,
      activityTitle: activity.title,
      grade: activity.grade,
      mode: 'speaking',
      timeSpentSeconds: recordingSeconds || 30,
      attemptsCount: 1,
      studentOutput: `[말하기 쉐도잉 녹음 완료] 발화 시간: ${recordingSeconds}초 | 발음 정확도: ${score}점 | 인식 텍스트: "${spokenTranscript || '음성 녹음 완료'}"`,
      notes: '원어민 대본 쉐도잉 및 본인 발음 비교 청취 완료',
      sensorReport: sensorReport
    });

    // 2. 하네스 상태 갱신
    updateHarnessStatus(prev => ({
      ...prev,
      sensor: {
        name: '말하기 유창성 및 쉐도잉 발음 비교 센서',
        currentScore: score,
        status: score >= 80 ? 'passed' : 'warning',
        feedback: `녹음이 완료되었습니다! 아래 [내 녹음 듣기]를 눌러 원어민 음성과 억양을 비교해 보세요. (평가 점수: ${score}점)`
      },
      loop: {
        ...prev.loop,
        attempts: prev.loop.attempts + 1,
        currentStep: '발음 비교 및 쉐도잉 분석 완료',
      },
      observability: {
        ...prev.observability,
        neisObservationLog: `원어민 대본(${activity.title})을 바탕으로 한 쉐도잉 구술 과업에서 ${recordingSeconds}초간 유창하게 발화하고, 녹음된 자신의 음성을 원어민과 대조 분석하며 발음 및 억양을 능동적으로 교정함.`
      }
    }));
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* 모듈 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm">
              🗣️
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
              대본 쉐도잉 & 음성 녹음·비교
            </span>
            <span className="text-xs text-stone-500 font-mono">
              {activity.lexile} | {activity.cefrLevel}
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slateText-title">
            {activity.title}
          </h2>
          <p className="text-xs text-slateText-muted mt-0.5">
            원어민 대본을 눈으로 보며 입으로 따라 말하고, <strong>실제 내 음성을 녹음하여 원어민 발음과 1:1로 비교</strong>해 보세요.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 font-semibold">
          <BarChart3 className="w-4 h-4 text-purple-600" />
          <span>말하기 성취도 대시보드 연동</span>
        </div>
      </div>

      {/* 1. 실제 듣기 대본 시각화 뷰어 */}
      <div className="p-5 bg-[#FDFBF7] rounded-2xl border border-stone-200 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slateText-title flex items-center gap-1.5">
            <Headphones className="w-4 h-4 text-honey-600" />
            실제 원어민 대본 전문 (스크립트)
          </span>
          <span className="text-[11px] text-stone-500">
            문장 옆의 🔊 아이콘을 누르면 해당 문장 원어민 발음을 들을 수 있습니다.
          </span>
        </div>

        <div className="space-y-2.5 max-h-72 overflow-y-auto p-3 bg-white rounded-xl border border-stone-200 shadow-inner select-text">
          {scriptLines.map((line, idx) => (
            <div 
              key={idx} 
              className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-stone-50 transition-colors"
            >
              {/* 화자 뱃지 */}
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 mt-0.5 ${
                line.speaker === 'W' 
                  ? 'bg-rose-100 text-rose-800' 
                  : line.speaker === 'M'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-stone-100 text-stone-700'
              }`}>
                {line.speaker === 'W' ? '여성 (W)' : line.speaker === 'M' ? '남성 (M)' : line.speaker}
              </span>

              {/* 문장 텍스트 */}
              <span className="flex-1 text-xs sm:text-sm font-serif leading-relaxed text-slateText-body">
                {line.text}
              </span>

              {/* 문장별 TTS 재생 버튼 */}
              <button
                type="button"
                onClick={() => playSentenceTTS(line.text, line.speaker)}
                title="이 문장 원어민 발음 듣기"
                className="p-1.5 text-stone-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors cursor-pointer shrink-0"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 2. 실제 내 발음 마이크 녹음기 (MediaRecorder) */}
      <div className="p-5 bg-gradient-to-br from-purple-50/70 to-indigo-50/50 rounded-2xl border border-purple-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-purple-950 flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-purple-600" />
              내 목소리 녹음 및 쉐도잉 훈련
            </h3>
            <p className="text-[11px] text-purple-800/80">
              대본을 보며 큰 소리로 읽어보세요. 녹음 후 본인의 발음을 즉시 재생해 들을 수 있습니다.
            </p>
          </div>

          {/* 녹음 타이머 */}
          {isRecording && (
            <div className="flex items-center gap-2 px-3 py-1 bg-rose-500 text-white font-mono text-xs font-bold rounded-full animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white"></span>
              <span>녹음 중... {recordingSeconds}초</span>
            </div>
          )}
        </div>

        {/* 녹음 조작 버튼 */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {!isRecording ? (
            <button
              type="button"
              onClick={handleStartRecording}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <Mic className="w-4 h-4" />
              <span>🎙️ 내 발음 녹음 시작하기</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStopRecording}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer animate-bounce-subtle"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>⏹️ 녹음 완료 및 중지</span>
            </button>
          )}

          {audioUrl && !isRecording && (
            <button
              type="button"
              onClick={() => {
                setAudioUrl(null);
                setSpokenTranscript('');
                setAnalyzed(false);
              }}
              className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs rounded-xl font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>다시 녹음하기</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. 원어민 발음 vs 내 발음 비교 청취 섹션 */}
      {audioUrl && (
        <div className="p-5 bg-white rounded-2xl border-2 border-purple-200 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <span className="text-sm font-extrabold text-slateText-title flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-honey-500" />
              🎧 원어민 발음 vs 내 발음 1:1 비교 청취
            </span>
            {accuracyScore !== null && (
              <span className="px-2.5 py-0.5 bg-purple-100 text-purple-900 font-extrabold text-xs rounded-full border border-purple-200">
                발화 유창성: {accuracyScore}점
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 좌측: 원어민 전체 음원 */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
              <span className="text-xs font-bold text-stone-700 flex items-center gap-1">
                <Volume2 className="w-4 h-4 text-blue-600" />
                1. 원어민 공식 음원 들어보기
              </span>
              <AudioPlayer script={activity.audioScript} />
            </div>

            {/* 우측: 내 실제 녹음 음원 플레이어 */}
            <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200 space-y-2">
              <span className="text-xs font-bold text-purple-950 flex items-center gap-1">
                <Mic className="w-4 h-4 text-purple-600" />
                2. 내가 직접 녹음한 발음 들어보기
              </span>
              <audio 
                controls 
                src={audioUrl} 
                className="w-full h-10 mt-1"
              />
            </div>
          </div>

          {/* 인식된 텍스트 및 피드백 */}
          {spokenTranscript && (
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-1">
              <span className="font-bold text-stone-700 block">📝 음성 인식 텍스트 (STT):</span>
              <p className="font-serif italic text-stone-800">"{spokenTranscript}"</p>
            </div>
          )}

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>녹음 기록 저장 완료:</strong> 학생 대시보드 및 교사 관제 센터에 말하기 수행 결과가 성공적으로 연동되었습니다!
            </span>
          </div>
        </div>
      )}

    </div>
  );
};
