import React from 'react';
import { GradeLevel, ActivityMode } from '../types/harness';
import { UserProfile } from '../types/auth';
import { 
  ShieldCheck, Sparkles, BookOpen, GraduationCap, Headphones, 
  Mic, PenTool, Layers, Search, LogOut, UserCheck, LayoutDashboard 
} from 'lucide-react';

interface HeaderProps {
  currentGrade: GradeLevel | 'ALL';
  onSelectGrade: (grade: GradeLevel | 'ALL') => void;
  currentMode: ActivityMode;
  onSelectMode: (mode: ActivityMode) => void;
  activeTab: 'studio' | 'inspector' | 'teacher' | 'studentDashboard';
  setActiveTab: (tab: 'studio' | 'inspector' | 'teacher' | 'studentDashboard') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenExamBank: () => void;
  lastSavedAt?: string;
  onResetProgress?: () => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
  onOpenLoginModal: () => void;
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
  lastSavedAt,
  onResetProgress,
  currentUser,
  onLogout,
  onOpenLoginModal,
}) => {
  return (
    <header className="w-full bg-[#FDFBF7] border-b border-[#E9E2D2]/60 pt-4 pb-5 px-4 sm:px-8 sticky top-0 z-30 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto">
        {/* 상단 1열: 로고 및 메인 네비게이션 탭 */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-3">
          {/* 브랜드 로고 */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('studio')}>
            <div className="w-10 h-10 rounded-xl bg-honey-400 flex items-center justify-center shadow-sm border border-honey-500/20 text-slateText-title font-bold text-lg">
              <span className="text-xl">🐝</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slateText-title font-sans">
                  바이브 <span className="text-honey-600 font-extrabold">영어 학습 스튜디오</span>
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold bg-honey-100 text-honey-700 rounded-full border border-honey-200">
                  AI 자기주도 코칭
                </span>
              </div>
              <p className="text-xs text-slateText-muted">
                듣기·읽기·말하기·쓰기를 스스로 완성하는 6단계 AI 학습 안전망
              </p>
            </div>
          </div>

          {/* 우측 도구 및 네비게이션 */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* 자동 저장 표시 및 다시 쓰기 */}
            {lastSavedAt && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>자동 저장됨 ({lastSavedAt})</span>
              </div>
            )}

            {onResetProgress && (
              <button
                onClick={onResetProgress}
                className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 text-[11px] font-medium border border-stone-200 transition-colors cursor-pointer"
                title="작성 중인 모든 내용을 처음 상태로 되돌립니다"
              >
                🔄 다시 쓰기
              </button>
            )}

            <button
              onClick={onOpenExamBank}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-honey-400 hover:bg-honey-500 text-slateText-title font-bold text-xs shadow-xs border border-honey-500/30 transition-all cursor-pointer"
            >
              <span>📚 기출 문제은행</span>
              <span className="px-1.5 py-0.2 bg-black/10 rounded-full text-[10px]">2,250문항</span>
            </button>

            {/* 네비게이션 탭 그룹 */}
            <div className="flex items-center bg-[#F3EFE6] p-1 rounded-xl border border-[#E2D9C8]">
              <button
                onClick={() => setActiveTab('studio')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'inspector'
                    ? 'bg-white text-slateText-title shadow-sm font-semibold'
                    : 'text-slateText-muted hover:text-slateText-body'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                🛡️ AI 6단계 코칭
              </button>

              {/* 학생 대시보드 탭 */}
              <button
                onClick={() => setActiveTab('studentDashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'studentDashboard'
                    ? 'bg-white text-emerald-800 shadow-sm font-semibold'
                    : 'text-slateText-muted hover:text-slateText-body'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
                📊 학생 대시보드
              </button>

              {/* 교사 대시보드 탭 */}
              <button
                onClick={() => setActiveTab('teacher')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'teacher'
                    ? 'bg-white text-indigo-900 shadow-sm font-semibold'
                    : 'text-slateText-muted hover:text-slateText-body'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                🎓 교사 관제 & 세특
              </button>
            </div>

            {/* 사용자 로그인 프로필 / 로그아웃 */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
                <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-xl border border-stone-200 shadow-xs">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-full object-cover border border-stone-200"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-[11px] font-bold text-slateText-title leading-tight">
                      {currentUser.name}
                    </span>
                    <span className="text-[9px] text-stone-400 leading-tight">
                      {currentUser.role === 'teacher' ? '선생님' : '학생'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="로그아웃 / 계정 전환"
                  className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="px-3 py-1.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Google 로그인</span>
              </button>
            )}
          </div>
        </div>

        {/* 안내 마이크로 바 */}
        <div className="bg-honey-50/70 border border-honey-200/80 rounded-xl px-4 py-2 my-2.5 flex flex-wrap items-center justify-between text-xs text-slateText-body gap-2">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-honey-200 text-honey-700 flex items-center justify-center font-bold text-[10px]">!</span>
            <span>
              <strong>전국 학력평가 & 수능 기출 연동:</strong> AI가 답을 대신 써주지 않고, 단계별 힌트와 어휘·문법 점검을 통해 스스로 생각하고 완성할 수 있도록 돕습니다.
            </span>
          </div>
          <div className="flex items-center gap-2 text-slateText-muted">
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px] border border-emerald-200">
              실시간 자동 보존 중
            </span>
            <span className="text-gray-300">|</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-mono shadow-xs">Space</kbd>
            <span>음성 말하기</span>
          </div>
        </div>

        {/* 상단 2열: 학년 필터 & 활동 영역 칩 (Pills) */}
        {activeTab === 'studio' && (
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
                  className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer ${
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
                { id: 'listen-speak', label: '🔗 듣고 말하기 (찬반 토론)' },
                { id: 'read-write', label: '🔗 읽고 쓰기 (지문 종합 에세이)' },
                { id: 'listen-write', label: '🔗 듣고 쓰기 (핵심 요약)' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => onSelectMode(mode.id as any)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
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
        )}
      </div>
    </header>
  );
};
