import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, UserRole } from '../../types/auth';
import { User, GraduationCap, AlertCircle, Settings, CheckCircle2, ShieldCheck } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (user: UserProfile) => void;
}

// 교사 허용 계정 목록 (정확한 이메일 일치)
const ALLOWED_TEACHER_EMAILS = new Set([
  'kiparang999@gmail.com',
  'honginwoo@simin.hs.kr',
  'english1@simin.hs.kr',
]);

// 학생 허용 도메인 (반드시 @simin.hs.kr)
const STUDENT_ALLOWED_DOMAIN = '@simin.hs.kr';

// 구글 JWT credential 디코더 (Base64url 디코딩)
const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse JWT', e);
    return null;
  }
};

const GOOGLE_CLIENT_ID_KEY = 'vibe_english_google_client_id';

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [googleClientId, setGoogleClientId] = useState<string>(() => {
    return localStorage.getItem(GOOGLE_CLIENT_ID_KEY) || '';
  });
  const [showConfig, setShowConfig] = useState(false);
  const [isGsiReady, setIsGsiReady] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const googleButtonRef = useRef<HTMLDivElement>(null);

  // Google GIS 클라이언트 초기화 및 렌더링
  useEffect(() => {
    if (!isOpen) return;

    const checkGsi = () => {
      const google = (window as any).google;
      if (google && google.accounts && google.accounts.id) {
        setIsGsiReady(true);
        if (googleClientId && googleClientId.trim()) {
          try {
            google.accounts.id.initialize({
              client_id: googleClientId.trim(),
              callback: handleGoogleCredentialResponse,
              auto_select: false,
              cancel_on_tap_outside: true,
            });

            if (googleButtonRef.current) {
              googleButtonRef.current.innerHTML = '';
              google.accounts.id.renderButton(googleButtonRef.current, {
                theme: 'outline',
                size: 'large',
                width: 320,
                text: 'continue_with',
                shape: 'pill',
              });
            }
          } catch (err) {
            console.warn('GSI render error:', err);
          }
        }
      } else {
        setTimeout(checkGsi, 200);
      }
    };

    checkGsi();
  }, [isOpen, googleClientId, selectedRole]);

  // Google SSO 인증 응답 처리 및 도메인/이메일 검증
  const handleGoogleCredentialResponse = (response: any) => {
    setLoginError(null);
    if (!response || !response.credential) {
      setLoginError('Google 계정 인증 정보를 수신하지 못했습니다.');
      return;
    }

    const payload = parseJwt(response.credential);
    if (!payload || !payload.email) {
      setLoginError('Google 계정 정보를 읽을 수 없습니다.');
      return;
    }

    const email = payload.email.toLowerCase().trim();

    // 1. 교사 계정 검증
    if (selectedRole === 'teacher') {
      if (!ALLOWED_TEACHER_EMAILS.has(email)) {
        setLoginError(
          `교사 계정 권한이 없습니다. 등록된 교사 이메일(kiparang999@gmail.com, honginwoo@simin.hs.kr, english1@simin.hs.kr)로 로그인해 주세요. (현재 로그인 시도: ${email})`
        );
        return;
      }
    }

    // 2. 학생 계정 검증 (도메인이 @simin.hs.kr 이어야 함)
    if (selectedRole === 'student') {
      if (!email.endsWith(STUDENT_ALLOWED_DOMAIN)) {
        setLoginError(
          `학생 로그인은 반드시 학교 공식 도메인(@simin.hs.kr) 구글 계정만 입장할 수 있습니다. (현재 로그인 시도: ${email})`
        );
        return;
      }
    }

    // 통과 시 실제 UserProfile 생성
    const actualUser: UserProfile = {
      id: `google_${payload.sub}`,
      name: payload.name || (selectedRole === 'teacher' ? '교사' : '학생'),
      email: email,
      avatar:
        payload.picture ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(payload.name || 'User')}`,
      role: selectedRole,
      schoolName: '시민고등학교',
      grade: 'G2',
      classNumber: '1반',
      studentNumber: selectedRole === 'student' ? email.split('@')[0] : undefined,
    };

    onLoginSuccess(actualUser);
  };

  // Google Client ID 저장
  const handleSaveClientId = (id: string) => {
    setGoogleClientId(id);
    localStorage.setItem(GOOGLE_CLIENT_ID_KEY, id.trim());
    setLoginError(null);
  };

  if (!isOpen) return null;

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

          {/* 대상별 로그인 허용 정책 안내 배너 */}
          <div className="mt-3 p-3 bg-white rounded-xl border border-stone-200 text-[11px] leading-relaxed">
            {selectedRole === 'teacher' ? (
              <div className="text-indigo-800 space-y-0.5">
                <div className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>교사 로그인 허용 구글 계정</span>
                </div>
                <ul className="list-disc list-inside text-stone-600 font-mono text-[10px] pt-1 space-y-0.5">
                  <li>kiparang999@gmail.com</li>
                  <li>honginwoo@simin.hs.kr</li>
                  <li>english1@simin.hs.kr</li>
                </ul>
              </div>
            ) : (
              <div className="text-emerald-800 space-y-0.5">
                <div className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>학생 로그인 허용 정책</span>
                </div>
                <p className="text-stone-600 text-[11px] pt-0.5">
                  학교 공식 구글 계정인 <strong>@simin.hs.kr</strong> 도메인으로만 입장할 수 있습니다.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Google SSO 공식 렌더링 컨테이너 */}
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center min-h-[48px] p-2 bg-white rounded-2xl border border-stone-200 shadow-xs">
            {googleClientId ? (
              <div ref={googleButtonRef} className="flex justify-center w-full"></div>
            ) : (
              <div className="text-center py-2 space-y-2">
                <p className="text-xs text-stone-600">
                  Google OAuth 2.0 <strong>Client ID</strong> 등록이 필요합니다.
                </p>
                <button
                  type="button"
                  onClick={() => setShowConfig(!showConfig)}
                  className="px-3 py-1.5 bg-honey-400 hover:bg-honey-500 text-slateText-title text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Google Client ID 설정 열기</span>
                </button>
              </div>
            )}
          </div>

          {/* Client ID 설정 드롭다운 */}
          {showConfig && (
            <div className="p-3.5 bg-white border-2 border-honey-300 rounded-2xl space-y-2 text-xs animate-in fade-in">
              <label className="block text-[11px] font-bold text-stone-700">
                Google Cloud Console OAuth 2.0 Client ID
              </label>
              <input
                type="text"
                value={googleClientId}
                onChange={(e) => handleSaveClientId(e.target.value)}
                placeholder="예: xxxxx.apps.googleusercontent.com"
                className="w-full px-3 py-1.5 border border-stone-200 rounded-xl text-xs font-mono focus:outline-none focus:border-honey-500"
              />
              <p className="text-[10px] text-stone-400 leading-tight">
                * 입력된 Client ID는 브라우저에 안전하게 저장되며 구글 공식 SSO 팝업을 직접 호출합니다.
              </p>
            </div>
          )}

          {/* 인증 거부 에러 메시지 */}
          {loginError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2 animate-in shake">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{loginError}</div>
            </div>
          )}
        </div>

        {/* 하단 보안 및 도메인 정책 안내 */}
        <div className="mt-6 text-center text-[11px] text-stone-400">
          🔒 Google Identity Services 공식 SSO 인증 보안 적용
        </div>
      </div>
    </div>
  );
};
