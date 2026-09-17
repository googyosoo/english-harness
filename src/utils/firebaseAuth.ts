import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const FIREBASE_CONFIG_STORAGE_KEY = 'vibe_english_firebase_config';

export interface FirebaseConfigOptions {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

// 기본 안내용 플레이스홀더 또는 저장된 설정 불러오기
export const loadSavedFirebaseConfig = (): FirebaseConfigOptions | null => {
  try {
    const raw = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

export const saveFirebaseConfig = (config: FirebaseConfigOptions): void => {
  try {
    localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save Firebase config', e);
  }
};

/**
 * Firebase App & Auth 인스턴스 반환
 */
export const getFirebaseAuth = (customConfig?: FirebaseConfigOptions) => {
  const config = customConfig || loadSavedFirebaseConfig();
  if (!config || !config.apiKey) {
    return null;
  }

  const app = getApps().length === 0 ? initializeApp(config) : getApp();
  const auth = getAuth(app);
  return auth;
};

/**
 * Google 팝업 로그인 실행 (Firebase Auth)
 */
export const signInWithGooglePopup = async (customConfig?: FirebaseConfigOptions) => {
  const auth = getFirebaseAuth(customConfig);
  if (!auth) {
    throw new Error('FIREBASE_CONFIG_MISSING');
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account',
  });

  const result = await signInWithPopup(auth, provider);
  return result.user;
};

/**
 * Firebase 로그아웃
 */
export const firebaseSignOut = async () => {
  const auth = getFirebaseAuth();
  if (auth) {
    await signOut(auth);
  }
};
