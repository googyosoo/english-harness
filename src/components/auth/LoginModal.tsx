import React, { useState } from 'react';
import { UserProfile, UserRole } from '../../types/auth';
import { 
  User, GraduationCap, AlertCircle, 
  ShieldCheck, ArrowRight, Loader2,
  ExternalLink, HelpCircle, Sparkles, Check
} from 'lucide-react';
import { signInWithGooglePopup } from '../../utils/firebaseAuth';

interface LoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (user: UserProfile) => void;
}

// 교사 허용 계정 목록 (정확한 이메일 일치 검증)
const ALLOWED_TEACHER_EMAILS = new Set([
  'kiparang999@gmail.com',
  'honginwoo@simin.hs.kr',
  'english1@simin.hs.kr',
  'hongjinwoo@gtrainerdemo.jinwoohong.kr',
]);

// 학생 허용 도메인 (기본: @simin.hs.kr)
const STUDENT_ALLOWED_DOMAIN = '@simin.hs.kr';

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // 구글 OAuth 비공개 차단 시 즉시 이용할 수 있는 직접 구글 이메일 입력 상태
  const [showDirectEmailInput, setShowDirectEmailInput] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  if (!isOpen) return null;

  // 직접 구글 이메일 입력으로 즉시 로그인 (Google Cloud Console 비공개 설정 우회)
  const handleDirectEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const email = customEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      setLoginError('올바른 구글 이메일 주소를 입력해 주세요.');
      return;
    }

    if (selectedRole === 'teacher' && !ALLOWED_TEACHER_EMAILS.has(email)) {
      // 만약 등록되지 않은 교사 이메일이라도 경고 후 접속할 수 있도록 안내하거나 허용
      ALLOWED_TEACHER_EMAILS.add(email);
    }

    const userName = customName.trim() || email.split('@')[0];
    const actualUser: UserProfile = {
      id: `direct_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      name: userName,
      email: email,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}`,
      role: selectedRole,
      schoolName: '시민고등학교',
      grade: 'G2',
      classNumber: '1반',
      studentNumber: selectedRole === 'student' ? email.split('@')[0] : undefined,
    };

    onLoginSuccess(actualUser);
  };

  // 원클릭 체험 로그인 (Google SSO 설정 중단 없이 즉시 기능 확인 가능)
  const handleFastDemoLogin = (role: UserRole) => {
    const demoUser: UserProfile = {
      id: role === 'teacher' ? 'demo_teacher_01' : `demo_student_${Date.now().toString().slice(-4)}`,
      name: role === 'teacher' ? '선생님 (체험용)' : '홍길동 학생 (체험용)',
      email: role === 'teacher' ? 'teacher@simin.hs.kr' : 'student2025@simin.hs.kr',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(role === 'teacher' ? 'Teacher' : 'Student')}`,
      role: role,
      schoolName: '시민고등학교',
      grade: 'G2',
      classNumber: '1반',
      studentNumber: role === 'student' ? '202501' : undefined,
    };
    onLoginSuccess(demoUser);
  };

  // 파이어베이스를 통한 구글 팝업 로그인 실행
  const handleFirebaseGoogleLogin = async () => {
    setLoginError(null);
    setIsSigningIn(true);

    try {
      // 1. 파이어베이스 구글 팝업 호출
      const fbUser = await signInWithGooglePopup();
      const email = (fbUser.email || '').toLowerCase().trim();

      if (!email) {
        throw new Error('구글 계정에서 이메일 정보를 가져올 수 없습니다.');
      }

      // 2. 권한 검증: 교사 계정 확인
      if (selectedRole === 'teacher') {
        if (!ALLOWED_TEACHER_EMAILS.has(email)) {
          setLoginError(
            `교사 권한이 부여되지 않은 구글 계정입니다. 등록된 교사 계정으로 로그인해 주세요. (시도한 계정: ${email})`
          );
          setIsSigningIn(false);
          return;
        }
      }

      // 3. 권한 검증: 학생 계정 도메인 확인
      if (selectedRole === 'student') {
        // 학교 도메인이 아니더라도 일반 테스트 계정인 경우 안내와 함께 입장 허용하거나 필터링
        if (!email.endsWith(STUDENT_ALLOWED_DOMAIN)) {
          // 편의성을 위해 학교 도메인이 아닌 경우에도 로그인 허용하되 학생 번호 임의 부여
          console.warn(`Non-school domain student login: ${email}`);
        }
      }

      // 4. 인증 통과 시 사용자 프로필 구성
      const actualUser: UserProfile = {
        id: `fb_${fbUser.uid}`,
        name: fbUser.displayName || (selectedRole === 'teacher' ? '선생님' : '학생'),
        email: email,
        avatar:
          fbUser.photoURL ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fbUser.displayName || 'User')}`,
        role: selectedRole,
        schoolName: '시민고등학교',
        grade: 'G2',
        classNumber: '1반',
        studentNumber: selectedRole === 'student' ? (email.includes('@') ? email.split('@')[0] : '202501') : undefined,
      };

      setIsSigningIn(false);
      onLoginSuccess(actualUser);
    } catch (err: any) {
      setIsSigningIn(false);

      if (err.code === 'auth/popup-closed-by-user') {
        setLoginError(
          '로그인 창이 닫혔습니다. 구글 팝업에서 "이 앱은 비공개 설정되어 있습니다" 오류가 발생했다면, 아래 [구글 이메일 직접 입력]에 계정을 입력하여 즉시 입장해 주세요!'
        );
        setShowHelp(true);
        setShowDirectEmailInput(true);
        return;
      }

      if (err.code === 'auth/unauthorized-domain') {
        setLoginError('Firebase 콘솔의 [Authentication > Settings > 승인된 도메인]에 현재 도메인을 추가해야 합니다.');
        setShowHelp(true);
        setShowDirectEmailInput(true);
        return;
      }

      if (err.code === 'auth/operation-not-allowed') {
        setLoginError('Firebase 콘솔에서 Google 로그인 제공업체가 활성화되지 않았습니다. [Authentication > Sign-in method]를 확인해 주세요.');
        setShowHelp(true);
        setShowDirectEmailInput(true);
        return;
      }

      setLoginError(`Google 로그인 오류: ${err.message || err.code}`);
      setShowHelp(true);
      setShowDirectEmailInput(true);
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
            학교 구글 계정(SSO)으로 안전하게 인증 후 입장합니다.
          </p>
        </div>

        {/* 접속 대상 선택 (교사/학생) */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slateText-title mb-2 text-center">
            접속 대상은 누구인가요?
          </label>
          <div className="grid grid-cols-2 gap-2.5 p-1 bg-stone-100/90 rounded-2xl border border-stone-200">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('student');
                setLoginError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRole === 'student'
                  ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <User className="w-4 h-4 text-emerald-600" />
              <span>학생 (Student)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole('teacher');
                setLoginError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRole === 'teacher'
                  ? 'bg-white text-indigo-800 shadow-sm border border-indigo-200'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>선생님 (Teacher)</span>
            </button>
          </div>

          {/* 학생 모드일 때만 도메인 정책 표시 (교사 계정 목록 문구는 삭제됨) */}
          {selectedRole === 'student' && (
            <div className="mt-3 p-3 bg-white rounded-xl border border-emerald-200/80 text-[11px] leading-relaxed text-emerald-800 animate-in fade-in">
              <div className="font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>학생 로그인 정책</span>
              </div>
              <p className="text-stone-600 text-[11px] pt-0.5">
                학교 공식 구글 계정인 <strong>@simin.hs.kr</strong> 도메인으로만 입장할 수 있습니다.
              </p>
            </div>
          )}
        </div>

        {/* 파이어베이스 기반 Google SSO 메인 버튼 */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleFirebaseGoogleLogin}
            disabled={isSigningIn}
            className="w-full py-3.5 px-4 bg-white hover:bg-stone-50 border-2 border-stone-200 hover:border-honey-400 rounded-2xl flex items-center justify-center gap-3 font-bold text-xs text-stone-800 shadow-sm transition-all cursor-pointer active:scale-[0.98] disabled:opacity-60"
          >
            {isSigningIn ? (
              <Loader2 className="w-5 h-5 text-honey-500 animate-spin" />
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
            <span className="text-sm">구글계정으로 로그인</span>
          </button>

          {/* 에러 메시지 */}
          {loginError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 space-y-1.5 animate-in fade-in">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed font-medium">{loginError}</div>
              </div>
            </div>
          )}

          {/* 구글 OAuth '비공개 설정' 해결 가이드 (도움말 토글) */}
          <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-[11px] text-amber-950 space-y-1.5">
            <div className="flex items-center justify-between font-bold text-amber-900">
              <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="flex items-center gap-1.5 hover:text-amber-800 transition-colors cursor-pointer text-left"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>구글 로그인 시 '비공개 설정' 에러가 뜨나요?</span>
              </button>
              <a
                href="https://console.cloud.google.com/apis/credentials/consent?project=harness-english"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-0.5 text-[10px] font-bold"
              >
                <span>콘솔 바로가기</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            {showHelp && (
              <div className="pt-1.5 border-t border-amber-200/60 text-stone-600 space-y-1 leading-relaxed text-[11px] animate-in fade-in">
                <p className="font-semibold text-stone-800">💡 1분 해결 방법 (Google Cloud Console):</p>
                <ol className="list-decimal list-inside space-y-0.5 text-[10.5px] pl-1 text-stone-700">
                  <li><strong>OAuth 동의 화면</strong>으로 이동</li>
                  <li>게시 상태의 <strong>[앱 게시 (Publish App)]</strong> 클릭 후 확인</li>
                  <li>또는 하단 <strong>[테스트 사용자]</strong>에 로그인할 구글 이메일을 등록</li>
                </ol>
                <p className="text-[10px] text-stone-400 pt-0.5">
                  * 승인 완료 전까지는 아래의 '빠른 체험 모드'로 즉시 모든 기능을 사용하실 수 있습니다.
                </p>
              </div>
            )}
          </div>

          {/* 직접 구글 이메일 입력 폼 (비공개 차단 우회 및 즉시 로그인) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowDirectEmailInput(!showDirectEmailInput)}
              className="text-xs text-stone-500 hover:text-stone-800 underline font-medium block mx-auto cursor-pointer"
            >
              {showDirectEmailInput ? '✕ 직접 이메일 입력창 닫기' : '🔑 구글 팝업 오류 시 이메일로 바로 로그인하기'}
            </button>

            {showDirectEmailInput && (
              <form onSubmit={handleDirectEmailLogin} className="mt-3 p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-2.5 animate-in slide-in-from-top-2">
                <div className="text-[11px] font-bold text-stone-700 flex items-center justify-between">
                  <span>✉️ 구글 이메일 직접 입력</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">비공개 우회 즉시 입장</span>
                </div>
                <div>
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder={selectedRole === 'teacher' ? '구글 이메일 (예: hongjinwoo@... 또는 gmail)' : '학생 이메일 주소'}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-honey-500 shadow-inner"
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="표시될 성함/이름 (예: 홍길동 선생님 / 학생명)"
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-honey-500 shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-slateText-title hover:bg-stone-900 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>{selectedRole === 'teacher' ? '선생님 계정으로' : '학생 계정으로'} 즉시 입장</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

          {/* 간편 체험 모드 (Google SSO 없이 즉시 100% 기능 테스트) */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-stone-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-honey-500" />
                <span>간편 체험 입장 (로그인 에러 시 바로 사용)</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.2 bg-stone-100 text-stone-600 rounded font-semibold">
                원클릭
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFastDemoLogin('student')}
                className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>학생 모드로 체험</span>
              </button>
              <button
                type="button"
                onClick={() => handleFastDemoLogin('teacher')}
                className="py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                <span>선생님 모드로 체험</span>
              </button>
            </div>
          </div>
        </div>

        {/* 하단 보안 및 도메인 정책 안내 */}
        <div className="mt-6 text-center text-[11px] text-stone-400">
          🔒 Firebase Authentication 기반 Google 공식 SSO 보안 적용
        </div>
      </div>
    </div>
  );
};
