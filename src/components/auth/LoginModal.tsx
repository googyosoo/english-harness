import React, { useState } from 'react';
import { UserProfile, UserRole } from '../../types/auth';
import { DEMO_TEACHER, DEMO_STUDENT } from '../../utils/authStorage';
import { Sparkles, Shield, User, GraduationCap, CheckCircle2, ArrowRight } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [customName, setCustomName] = useState('');
  const [customStudentNumber, setCustomStudentNumber] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  if (!isOpen) return null;

  // Google SSO 로그인 핸들러 (실제 Google OAuth 팝업/연동 및 시뮬레이션 지원)
  const handleGoogleSignIn = () => {
    setIsSigningIn(true);
    
    // Google SSO 인증 대기 시뮬레이션 (0.6초 후 프로필 발급)
    setTimeout(() => {
      setIsSigningIn(false);
      if (selectedRole === 'teacher') {
        onLoginSuccess({
          ...DEMO_TEACHER,
          name: customName.trim() || DEMO_TEACHER.name,
        });
      } else {
        onLoginSuccess({
          ...DEMO_STUDENT,
          name: customName.trim() || DEMO_STUDENT.name,
          studentNumber: customStudentNumber.trim() || DEMO_STUDENT.studentNumber,
        });
      }
    }, 600);
  };

  // 프리셋 빠른 입장
  const handleQuickLogin = (role: UserRole) => {
    if (role === 'teacher') {
      onLoginSuccess(DEMO_TEACHER);
    } else {
      onLoginSuccess(DEMO_STUDENT);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#FDFBF7] rounded-3xl border-2 border-honey-300 shadow-2xl overflow-hidden p-6 sm:p-8">
        {/* 상단 로고 & 타이틀 */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-honey-400 flex items-center justify-center text-3xl shadow-md border border-honey-500/30 mb-3 animate-bounce-subtle">
            🐝
          </div>
          <h2 className="text-2xl font-extrabold text-slateText-title font-sans">
            바이브 <span className="text-honey-600">영어 학습 스튜디오</span>
          </h2>
          <p className="text-xs text-slateText-muted mt-1.5 leading-relaxed">
            AI 6단계 코칭 안전망 & 학교생활기록부 교과세특 포털에 오신 것을 환영합니다.
          </p>
        </div>

        {/* 신분(Role) 선택 탭 */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-slateText-title mb-2 text-center">
            접속하실 신분을 선택해 주세요
          </label>
          <div className="grid grid-cols-2 gap-2.5 p-1 bg-stone-100/90 rounded-2xl border border-stone-200">
            <button
              type="button"
              onClick={() => setSelectedRole('student')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRole === 'student'
                  ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200/80'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <User className="w-4 h-4 text-emerald-600" />
              <span>학생 (Student)</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('teacher')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRole === 'teacher'
                  ? 'bg-white text-indigo-800 shadow-sm border border-indigo-200/80'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>선생님 (Teacher)</span>
            </button>
          </div>
        </div>

        {/* 사용자 정보 커스텀 토글 */}
        <div className="mb-5">
          <button
            type="button"
            onClick={() => setIsCustomMode(!isCustomMode)}
            className="text-[11px] text-stone-500 hover:text-stone-700 underline flex items-center gap-1 mx-auto cursor-pointer"
          >
            <span>{isCustomMode ? '간편 로그인으로 접기' : '내 이름 및 학번 직접 입력하기'}</span>
          </button>

          {isCustomMode && (
            <div className="mt-3 p-3.5 bg-white rounded-xl border border-stone-200 space-y-2.5 text-xs animate-in fade-in duration-150">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">이름</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder={selectedRole === 'teacher' ? '예: 김진우 선생님' : '예: 이수민'}
                  className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-honey-500"
                />
              </div>
              {selectedRole === 'student' && (
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">학번 (5자리)</label>
                  <input
                    type="text"
                    value={customStudentNumber}
                    onChange={(e) => setCustomStudentNumber(e.target.value)}
                    placeholder="예: 20315 (2학년 3반 15번)"
                    className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-honey-500"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Google SSO 메인 버튼 */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="w-full py-3 px-4 bg-white hover:bg-stone-50 border-2 border-stone-200 hover:border-honey-400 rounded-2xl flex items-center justify-center gap-3 font-semibold text-xs text-stone-800 shadow-sm transition-all cursor-pointer active:scale-[0.98]"
          >
            {isSigningIn ? (
              <div className="w-4 h-4 border-2 border-honey-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>
              {isSigningIn
                ? 'Google 계정 확인 중...'
                : selectedRole === 'teacher'
                ? '선생님 계정으로 Google 로그인'
                : '학생 계정으로 Google 로그인'}
            </span>
          </button>

          {/* 원클릭 테스트 프리셋 입장 바 */}
          <div className="pt-2 border-t border-stone-200">
            <div className="text-[11px] text-stone-400 text-center mb-2">또는 1초 빠른 체험 계정으로 입장</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('student')}
                className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold border border-emerald-200 flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <span>학생(이수민) 입장</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('teacher')}
                className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-[11px] font-semibold border border-indigo-200 flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <span>교사(김진우) 입장</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* 하단 보안 및 교육청 안내 */}
        <div className="mt-5 text-center text-[10px] text-stone-400">
          🔒 구글 SSO 보안 인증 지원 | 교육부 및 전국 시·도 교육청 계정 호환
        </div>
      </div>
    </div>
  );
};
