import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../../types/auth';
import { 
  User, GraduationCap, AlertCircle, Settings, CheckCircle2, 
  ShieldCheck, ArrowRight, Loader2 
} from 'lucide-react';
import { 
  signInWithGooglePopup, loadSavedFirebaseConfig, 
  saveFirebaseConfig, FirebaseConfigOptions 
} from '../../utils/firebaseAuth';

interface LoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (user: UserProfile) => void;
}

// 교사 허용 계정 목록 (정확한 이메일 일치 검증)
const ALLOWED_TEACHER_EMAILS = new Set([
  'kiparang999@gmail.com',
  'honginwoo@simin.hs.kr',
  'english1@simin.hs.kr',
]);

// 학생 허용 도메인 (반드시 @simin.hs.kr)
const STUDENT_ALLOWED_DOMAIN = '@simin.hs.kr';

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // 파이어베이스 설정 상태
  const [savedConfig, setSavedConfig] = useState<FirebaseConfigOptions | null>(() => loadSavedFirebaseConfig());
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configInputText, setConfigInputText] = useState('');

  if (!isOpen) return null;

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
        if (!email.endsWith(STUDENT_ALLOWED_DOMAIN)) {
          setLoginError(
            `학생 로그인은 학교 공식 구글 계정(@simin.hs.kr)으로만 입장 가능합니다. (시도한 계정: ${email})`
          );
          setIsSigningIn(false);
          return;
        }
      }

      // 4. 인증 통과 시 사용자 프로필 구성
      const actualUser: UserProfile = {
        id: `fb_${fbUser.uid}`,
        name: fbUser.displayName || (selectedRole === 'teacher' ? '교사' : '학생'),
        email: email,
        avatar:
          fbUser.photoURL ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fbUser.displayName || 'User')}`,
        role: selectedRole,
        schoolName: '시민고등학교',
        grade: 'G2',
        classNumber: '1반',
        studentNumber: selectedRole === 'student' ? email.split('@')[0] : undefined,
      };

      setIsSigningIn(false);
      onLoginSuccess(actualUser);
    } catch (err: any) {
      setIsSigningIn(false);

      if (err.message === 'FIREBASE_CONFIG_MISSING') {
        setLoginError('파이어베이스 설정 정보가 아직 등록되지 않았습니다. 아래 [파이어베이스 설정] 버튼을 눌러 프로젝트 설정을 등록해 주세요.');
        setShowConfigModal(true);
        return;
      }

      if (err.code === 'auth/popup-closed-by-user') {
        setLoginError('로그인 창이 닫혔습니다. 다시 시도해 주세요.');
        return;
      }

      if (err.code === 'auth/unauthorized-domain') {
        setLoginError('Firebase 콘솔의 [Authentication > Settings > 승인된 도메인]에 현재 도메인(예: localhost 등)을 추가해야 합니다.');
        return;
      }

      setLoginError(`Google 로그인 중 오류가 발생했습니다: ${err.message || err.code}`);
    }
  };

  // 파이어베이스 설정 저장
  const handleSaveFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // JSON 객체 또는 firebaseConfig 객체 파싱 지원
      let parsed: any;
      const trimmed = configInputText.trim();

      if (trimmed.startsWith('{')) {
        parsed = JSON.parse(trimmed);
      } else {
        // const firebaseConfig = { ... } 형태의 코드 붙여넣기 지원
        const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          // JS 객체 리터럴 문자열을 유효한 JSON으로 변환
          const cleanJson = jsonMatch[0]
            .replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":')
            .replace(/'/g, '"')
            .replace(/,\s*\}/g, '}');
          parsed = JSON.parse(cleanJson);
        } else {
          throw new Error('유효한 Firebase 설정 객체 형태가 아닙니다.');
        }
      }

      if (!parsed.apiKey || !parsed.projectId) {
        throw new Error('apiKey 및 projectId가 포함되어 있어야 합니다.');
      }

      saveFirebaseConfig(parsed);
      setSavedConfig(parsed);
      setShowConfigModal(false);
      setLoginError(null);
      alert('Firebase 설정이 성공적으로 저장되었습니다! 이제 구글 로그인을 진행할 수 있습니다.');
    } catch (err: any) {
      alert(`설정 파싱 실패: ${err.message}\nFirebase 콘솔의 firebaseConfig 객체를 그대로 붙여넣어 주세요.`);
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
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2 animate-in shake">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{loginError}</div>
            </div>
          )}

          {/* Firebase 연동 완료 상태 안내 */}
          <div className="pt-2">
            <div className="flex items-center justify-between px-3 py-2 bg-emerald-50/90 border border-emerald-200 rounded-xl text-xs text-emerald-800">
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Firebase 연동 완료: <strong className="font-mono text-emerald-900">harness-english</strong></span>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(!showConfigModal)}
                className="text-[11px] text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1 cursor-pointer"
              >
                <Settings className="w-3 h-3" />
                <span>{showConfigModal ? '닫기' : '설정 변경'}</span>
              </button>
            </div>

            {/* 설정 변경 클릭 시에만 노출되는 토글 창 */}
            {showConfigModal && (
              <div className="mt-2.5 p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2.5 animate-in fade-in">
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  새로운 Firebase 프로젝트 키로 교체하려면 아래에 붙여넣고 저장하세요.
                </p>
                <form onSubmit={handleSaveFirebaseConfig} className="space-y-2">
                  <textarea
                    rows={3}
                    required
                    value={configInputText}
                    onChange={(e) => setConfigInputText(e.target.value)}
                    placeholder={`const firebaseConfig = {\n  apiKey: "...",\n  projectId: "..."\n};`}
                    className="w-full p-2 bg-white border border-stone-300 rounded-lg font-mono text-[10px] text-stone-800 focus:outline-none focus:ring-1 focus:ring-honey-500 shadow-inner"
                  />
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    설정 업데이트
                  </button>
                </form>
              </div>
            )}
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
