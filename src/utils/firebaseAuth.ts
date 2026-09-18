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
  measurementId?: string;
}

// 기본 내장 Firebase 프로젝트 설정 (harness-english)
export const DEFAULT_FIREBASE_CONFIG: FirebaseConfigOptions = {
  apiKey: "AIzaSyDAXcc5VxGncQGA6rKJrkvu-CaC7NW5I94",
  authDomain: "harness-english.firebaseapp.com",
  projectId: "harness-english",
  storageBucket: "harness-english.firebasestorage.app",
  messagingSenderId: "930413095196",
  appId: "1:930413095196:web:f4ba6035cf11952a73f2d9",
  measurementId: "G-4VTGEV6N91"
};

// 저장된 설정 불러오기 (없으면 내장된 DEFAULT_FIREBASE_CONFIG 사용)
export const loadSavedFirebaseConfig = (): FirebaseConfigOptions => {
  try {
    const raw = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.apiKey) return parsed;
    }
  } catch (e) {
    // ignore
  }
  return DEFAULT_FIREBASE_CONFIG;
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
  provider.addScope('email');
  provider.addScope('profile');
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
