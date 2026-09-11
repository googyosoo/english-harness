import React, { useState, useEffect } from 'react';
import { ActivityContent, HarnessLayerStatus } from '../../types/harness';
import { BookOpen, Sparkles, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import { loadStudentProgress, saveStudentProgress } from '../../utils/storage';

interface ReadingModuleProps {
  activity: ActivityContent;
  updateHarnessStatus: (updater: (prev: HarnessLayerStatus) => HarnessLayerStatus) => void;
}

export const ReadingModule: React.FC<ReadingModuleProps> = ({
  activity,
  updateHarnessStatus,
}) => {
  const savedState = loadStudentProgress().moduleDrafts[activity.id];

  const [selectedOption, setSelectedOption] = useState<number | null>(() => {
    return savedState?.answers?.['selectedOption'] !== undefined 
      ? Number(savedState.answers['selectedOption']) 
      : null;
  });
  const [isAnswered, setIsAnswered] = useState<boolean>(() => {
    return savedState?.answers?.['selectedOption'] !== undefined;
  });
  const [socraticConversation, setSocraticConversation] = useState<string[]>(() => {
    return savedState?.answers?.['conversation'] ? JSON.parse(savedState.answers['conversation']) : [];
  });
  const [studentQuestion, setStudentQuestion] = useState('');

  const q = activity.comprehensionQuestions?.[0];

  useEffect(() => {
    const s = loadStudentProgress().moduleDrafts[activity.id];
    if (s?.answers?.['selectedOption'] !== undefined) {
      setSelectedOption(Number(s.answers['selectedOption']));
      setIsAnswered(true);
      setSocraticConversation(s.answers['conversation'] ? JSON.parse(s.answers['conversation']) : []);
    } else {
      setSelectedOption(null);
      setIsAnswered(false);
      setSocraticConversation([]);
    }
  }, [activity.id]);

  const handleSelectOption = (idx: number) => {
    setSelectedOption(idx);
    setIsAnswered(true);

    const progress = loadStudentProgress();
    const currentModule = progress.moduleDrafts[activity.id] || {};
    saveStudentProgress({
      moduleDrafts: {
        ...progress.moduleDrafts,
        [activity.id]: {
          ...currentModule,
          answers: {
            ...currentModule.answers,
            selectedOption: String(idx),
          }
        }
      }
    });

    const isCorrect = q ? idx === q.answerIndex : false;
    updateHarnessStatus(prev => ({
      ...prev,
      sensor: {
        name: '지문 대의파악 논리 점검',
        currentScore: isCorrect ? 100 : 50,
        status: isCorrect ? 'passed' : 'warning',
        feedback: isCorrect 
          ? '정답! 신경가소성과 작은 습관의 자동화 메커니즘을 정확히 파악했습니다.' 
          : '다시 한번 살펴볼까요? 아래 생각 돕기 힌트를 읽고 스스로 답을 찾아보세요.'
      },
      loop: {
        ...prev.loop,
        attempts: prev.loop.attempts + 1,
        currentStep: isCorrect ? '독해 완료' : '힌트 참고하여 재검토',
      },
      observability: {
        ...prev.observability,
        neisObservationLog: `영어 독해 지문의 논리적 인과관계를 스스로 추론하여 핵심 주제를 정확히 도출함.`
      }
    }));
  };

  const handleSendSocraticQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentQuestion.trim()) return;

    const userMsg = studentQuestion;
    setStudentQuestion('');

    let aiReply = '';
    if (userMsg.includes('답') || userMsg.includes('정답')) {
      aiReply = 'AI 도우미는 정답을 직접 알려드리지 않고 스스로 생각할 수 있도록 힌트를 드려요! 본문 3번째 문장의 "Neurons that fire together wire together"가 무엇을 뜻하는지 나의 생각으로 먼저 적어보세요.';
    } else {
      aiReply = `좋은 질문이에요! 지문에서 "conscious effort"에서 "automate"로 전환되는 과정이 뇌의 에너지 절약과 어떤 관계가 있는지 주목해보면 해답을 찾을 수 있을 거예요.`;
    }

    const newConversation = [
      ...socraticConversation,
      `🧑‍🎓 학생: ${userMsg}`,
      `🐝 AI 학습 도우미: ${aiReply}`
    ];
    setSocraticConversation(newConversation);

    const progress = loadStudentProgress();
    const currentModule = progress.moduleDrafts[activity.id] || {};
    saveStudentProgress({
      moduleDrafts: {
        ...progress.moduleDrafts,
        [activity.id]: {
          ...currentModule,
          answers: {
            ...currentModule.answers,
            conversation: JSON.stringify(newConversation),
          }
        }
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-warm-sm">
      {/* 모듈 헤더 */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slateText-title flex items-center gap-2">
              {activity.title}
              <span className="text-xs font-normal px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                구조화 독해
              </span>
            </h3>
            <p className="text-xs text-slateText-muted">{activity.subTitle}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-amber-700 font-mono bg-amber-50 px-2 py-1 rounded border border-amber-200">
            {activity.lexile} | {activity.cefrLevel}
          </span>
        </div>
      </div>

      {/* 영어 원문 독해 영역 */}
      <div className="bg-[#FDFBF7] p-5 rounded-xl border border-stone-200 mb-6">
        <h4 className="text-xs font-bold text-slateText-muted uppercase tracking-wider mb-2">
          📖 읽기 지문 (Reading Passage)
        </h4>
        <div className="text-sm text-slateText-body leading-relaxed font-serif bg-white p-4 rounded-lg border border-stone-200 shadow-inner">
          {activity.readingPassage}
        </div>
      </div>

      {/* 이해도 퀴즈 */}
      {q && (
        <div className="bg-white p-5 rounded-xl border border-stone-200 mb-6">
          <h4 className="font-bold text-sm text-slateText-title mb-3 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-honey-500" />
            지문 핵심 내용 이해도 확인
          </h4>
          <p className="text-xs text-stone-600 mb-3">{q.question}</p>

          <div className="space-y-2">
            {q.options.map((opt, oIdx) => {
              const isSelected = selectedOption === oIdx;
              const isCorrect = oIdx === q.answerIndex;
              let btnClass = 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-slateText-body';
              if (isAnswered) {
                if (isSelected && isCorrect) btnClass = 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold';
                else if (isSelected && !isCorrect) btnClass = 'bg-rose-50 border-rose-500 text-rose-800 font-bold';
                else if (isCorrect) btnClass = 'bg-emerald-50 border-emerald-300 text-emerald-800';
              }

              return (
                <button
                  key={oIdx}
                  onClick={() => handleSelectOption(oIdx)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-center justify-between cursor-pointer ${btnClass}`}
                >
                  <span>{oIdx + 1}. {opt}</span>
                  {isAnswered && isSelected && (
                    <span>
                      {isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* 소크라테스 힌트 노출 */}
          {isAnswered && selectedOption !== q.answerIndex && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              <strong>💡 생각 돕기 힌트:</strong> {q.socraticHint}
            </div>
          )}
        </div>
      )}

      {/* AI 질문 창구 */}
      <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
        <h4 className="font-bold text-xs text-slateText-title mb-2 flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-honey-600" />
          AI 도우미에게 질문하기 (정답 대신 생각을 키우는 질문을 던져줍니다)
        </h4>

        {socraticConversation.length > 0 && (
          <div className="space-y-2 mb-3 max-h-48 overflow-y-auto pr-1">
            {socraticConversation.map((msg, i) => (
              <div key={i} className={`p-2.5 rounded-lg text-xs ${
                msg.startsWith('🧑‍🎓') ? 'bg-white border border-stone-200 text-slateText-body' : 'bg-honey-50 border border-honey-200 text-honey-900 font-medium'
              }`}>
                {msg}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSendSocraticQuestion} className="flex gap-2">
          <input
            type="text"
            value={studentQuestion}
            onChange={(e) => setStudentQuestion(e.target.value)}
            placeholder="지문에서 이해하기 어려운 문장이나 단어의 쓰임새를 물어보세요..."
            className="flex-1 px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-honey-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-stone-800 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            질문하기
          </button>
        </form>
      </div>
    </div>
  );
};
