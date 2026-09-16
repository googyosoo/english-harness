import { UserProfile, StudentSubmission } from '../types/auth';

const AUTH_USER_KEY = 'vibe_english_current_user_v1';
const SUBMISSIONS_KEY = 'vibe_english_student_submissions_v1';

// 실제 초기 상태: 더미데이터 없는 빈 제출물 목록
const INITIAL_SUBMISSIONS: StudentSubmission[] = [];

/**
 * 현재 로그인 사용자 로드
 */
export const loadCurrentUser = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load user from localStorage', e);
    return null;
  }
};

/**
 * 로그인 사용자 저장
 */
export const saveCurrentUser = (user: UserProfile): void => {
  try {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save user', e);
  }
};

/**
 * 로그아웃
 */
export const logoutUser = (): void => {
  try {
    localStorage.removeItem(AUTH_USER_KEY);
  } catch (e) {
    console.error('Failed to logout', e);
  }
};

/**
 * 전체 학생 제출물 로드 (실데이터만 유지)
 */
export const loadAllSubmissions = (): StudentSubmission[] => {
  try {
    const raw = localStorage.getItem(SUBMISSIONS_KEY);
    if (!raw) {
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(INITIAL_SUBMISSIONS));
      return INITIAL_SUBMISSIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load submissions', e);
    return INITIAL_SUBMISSIONS;
  }
};

/**
 * 특정 학생의 제출물만 로드
 */
export const loadSubmissionsByStudentId = (studentId: string): StudentSubmission[] => {
  const all = loadAllSubmissions();
  return all.filter((s) => s.studentId === studentId);
};

/**
 * 새 제출물 저장 (실제 학생 산출물만 기록)
 */
export const saveSubmission = (submission: Omit<StudentSubmission, 'id' | 'submittedAt'>): StudentSubmission => {
  const all = loadAllSubmissions();
  const newSubmission: StudentSubmission = {
    ...submission,
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    submittedAt: new Date().toISOString(),
  };

  // 동일 학생 & 동일 활동인 경우 이전 제출 업데이트 또는 신규 추가
  const existingIdx = all.findIndex(
    (s) => s.studentId === newSubmission.studentId && s.activityId === newSubmission.activityId
  );

  let updatedList: StudentSubmission[];
  if (existingIdx >= 0) {
    updatedList = [...all];
    updatedList[existingIdx] = newSubmission;
  } else {
    updatedList = [newSubmission, ...all];
  }

  try {
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(updatedList));
  } catch (e) {
    console.error('Failed to save submission', e);
  }

  return newSubmission;
};

/**
 * 전체 제출 기록 초기화
 */
export const clearAllSubmissions = (): void => {
  try {
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify([]));
  } catch (e) {
    console.error('Failed to clear submissions', e);
  }
};
