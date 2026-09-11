// 학생 학습 데이터 로컬 저장소 유틸리티 (LocalStorage 기반 자동 보존 및 복원)

export interface IntegratedDraft {
  step1Notes: string;
  evidence: string[];
  stance: 'pro' | 'con' | '';
  step2Output: string;
  currentStep: 1 | 2;
}

export interface StudentProgressData {
  lastSavedAt: string;
  timeSpent: number;
  attemptsCount: number;
  studentOutput: string;
  selectedActivityId: string;
  // 과업 ID별 세부 작성 내용
  writingDrafts: Record<string, string>;
  integratedDrafts: Record<string, IntegratedDraft>;
  moduleDrafts: Record<string, { notes?: string; answers?: Record<string, string>; text?: string }>;
}

const STORAGE_KEY = 'vibe_english_student_progress_v1';

// 기본 초기값
export const DEFAULT_STUDENT_PROGRESS: StudentProgressData = {
  lastSavedAt: '',
  timeSpent: 0,
  attemptsCount: 0,
  studentOutput: '',
  selectedActivityId: '',
  writingDrafts: {},
  integratedDrafts: {},
  moduleDrafts: {},
};

/**
 * 저장된 학생 학습 데이터 불러오기
 */
export const loadStudentProgress = (): StudentProgressData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STUDENT_PROGRESS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STUDENT_PROGRESS,
      ...parsed,
    };
  } catch (error) {
    console.error('Failed to load student progress from localStorage:', error);
    return DEFAULT_STUDENT_PROGRESS;
  }
};

/**
 * 학생 학습 데이터 저장 (디바운스 처리를 고려한 동기 저장)
 */
export const saveStudentProgress = (data: Partial<StudentProgressData>): void => {
  try {
    const current = loadStudentProgress();
    const updated: StudentProgressData = {
      ...current,
      ...data,
      lastSavedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save student progress to localStorage:', error);
  }
};

/**
 * 학생 학습 데이터 전체 초기화 (처음부터 다시 시작)
 */
export const clearStudentProgress = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear student progress:', error);
  }
};
