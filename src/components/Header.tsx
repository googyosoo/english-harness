import React from 'react';
import { GradeLevel, ActivityMode } from '../types/harness';
import { ShieldCheck, Sparkles, BookOpen, GraduationCap, Headphones, Mic, PenTool, Layers, Search } from 'lucide-react';

interface HeaderProps {
  currentGrade: GradeLevel | 'ALL';
  onSelectGrade: (grade: GradeLevel | 'ALL') => void;
  currentMode: ActivityMode;
  onSelectMode: (mode: ActivityMode) => void;
  activeTab: 'studio' | 'inspector' | 'teacher';
  setActiveTab: (tab: 'studio' | 'inspector' | 'teacher') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenExamBank: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentGrade,
  onSelectGrade,
  currentMode,
  onSelectMode,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onOpenExamBank,
}) => {
  return (
    <header className="w-full bg-[#FDFBF7] border-b border-[#E9E2D2]/60 pt-4 pb-5 px-4 sm:px-8 sticky top-0 z-30 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto">
        {/* 상단 1열: 로고 및 메인 네비게이션 탭 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3">
          {/* 브랜드 로고 */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('studio')}>
            <div className="w-10 h-10 rounded-xl bg-honey-400 flex items-center justify-center shadow-sm border border-honey-500/20 text-slateText-title font-bold text-lg">
              <span className="text-xl">🐝</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slateText-title font-sans">
                  Vibe <span className="text-honey-600 font-extrabold">English Harness</span>
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold bg-honey-100 text-honey-700 rounded-full border border-honey-200">
                  Agentic Studio
                </span>
              </div>
              <p className="text-xs text-slateText-muted">
                고등학교 영어과 4기능 및 연계 활동을 위한 6겹 하네스 AI 에이전트
              </p>
            </div>
          </div>

          {/* 뷰 전환 탭 버튼 및 기출 문제은행 버튼 */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenExamBank}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-honey-400 hover:bg-honey-500 text-slateText-title font-bold text-xs shadow-xs border border-honey-500/30 transition-all cursor-pointer animate-bounce-subtle"
            >
              <span>📚 2020~2026 기출 문제은행</span>
              <span className="px-1.5 py-0.2 bg-black/10 rounded-full text-[10px]">2,250문항</span>
            </button>

            <div className="flex items-center bg-[#F3EFE6] p-1 rounded-xl border border-[#E2D9C8]">
              <button
                onClick={() => setActiveTab('studio')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'studio'
                    ? 'bg-white text-slateText-title shadow-sm font-semibold'
                    : 'text-slateText-muted hover:text-slateText-body'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-honey-500" />
                학습 스튜디오
              </button>
              <button
                onClick={() => setActiveTab('inspector')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'inspector'
                    ? 'bg-white text-slateText-title shadow-sm font-semibold'
                    : 'text-slateText-muted hover:text-slateText-body'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                하네스 6겹
              </button>
              <button
                onClick={() => setActiveTab('teacher')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'teacher'
                    ? 'bg-white text-slateText-title shadow-sm font-semibold'
                    : 'text-slateText-muted hover:text-slateText-body'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                교사 관측/세특
              </button>
            </div>
          </div>
        </div>

        {/* 안내 마이크로 바 (첨부 이미지 스타일) */}
        <div className="bg-honey-50/70 border border-honey-200/80 rounded-xl px-4 py-2 my-2.5 flex flex-wrap items-center justify-between text-xs text-slateText-body gap-2">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-honey-200 text-honey-700 flex items-center justify-center font-bold text-[10px]">!</span>
            <span>
              <strong>호랭이닷컴 공인 기출 연동:</strong> 고1·고2 학력평가 및 <strong>대학수학능력시험 실전 지문·대본</strong>이 탑재되어 있으며, 6겹 하네스를 통해 안전하게 자가 성장을 유도합니다.
            </span>
          </div>
          <div className="flex items-center gap-2 text-slateText-muted">
            <span className="px-2 py-0.5 bg-honey-100 text-honey-800 font-bold rounded text-[10px] border border-honey-200">
              호랭이닷컴 DB 연계됨
            </span>
            <span className="text-gray-300">|</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-mono shadow-xs">Space</kbd>
            <span>음성 STT</span>
          </div>
        </div>

        {/* 상단 2열: 학년 필터 & 활동 영역 칩 (Pills) */}
        <div className="pt-2 flex flex-wrap items-center gap-2">
          {/* 학년 선택 (고1, 고2, 고3) */}
          <div className="flex items-center gap-1.5 pr-2 border-r border-stone-300">
            <span className="text-xs font-semibold text-slateText-muted mr-1">수준:</span>
            {[
              { id: 'ALL', label: '전체' },
              { id: 'G1', label: '고1 · 기초입문 (820L)' },
              { id: 'G2', label: '고2 · 논리확장 (1050L)' },
              { id: 'G3', label: '고3 · 수능실전 (1280L)' },
            ].map((grade) => (
              <button
                key={grade.id}
                onClick={() => onSelectGrade(grade.id as any)}
                className={`px-3 py-1 rounded-full text-xs transition-all ${
                  currentGrade === grade.id
                    ? 'bg-honey-400 text-slateText-title font-bold shadow-xs border border-honey-500/40'
                    : 'bg-white text-slateText-muted hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {grade.label}
              </button>
            ))}
          </div>

          {/* 활동 영역 및 연계 필터 칩 */}
          <div className="flex items-center flex-wrap gap-1.5">
            {[
              { id: 'all', label: '전체 활동' },
              { id: 'listening', label: '🎧 듣기', icon: Headphones },
              { id: 'reading', label: '📖 읽기', icon: BookOpen },
              { id: 'speaking', label: '🗣️ 말하기', icon: Mic },
              { id: 'writing', label: '✍️ 쓰기', icon: PenTool },
              { id: 'listen-speak', label: '🔗 듣기-말하기 (디베이트)' },
              { id: 'read-write', label: '🔗 읽기-쓰기 (Synthesis)' },
              { id: 'listen-write', label: '🔗 듣기-쓰기 (코넬요약)' },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => onSelectMode(mode.id as any)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  currentMode === mode.id
                    ? 'bg-[#1E293B] text-white font-semibold shadow-xs'
                    : 'bg-white text-slateText-body hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
