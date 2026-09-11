import { UserProfile, StudentSubmission } from '../types/auth';
import { runFullSmartSensorInspection } from './sensorEngine';

const AUTH_USER_KEY = 'vibe_english_current_user_v1';
const SUBMISSIONS_KEY = 'vibe_english_student_submissions_v1';

// 기본 데모 프로필
export const DEMO_TEACHER: UserProfile = {
  id: 'teacher_demo_01',
  name: '김진우 선생님',
  email: 'jinwoo.teacher@school.ed.kr',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'teacher',
  schoolName: '한국고등학교',
  grade: 'G2',
  classNumber: '3반',
};

export const DEMO_STUDENT: UserProfile = {
  id: 'student_demo_01',
  name: '이수민',
  email: 'sumin.lee@student.school.kr',
  avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  role: 'student',
  schoolName: '한국고등학교',
  grade: 'G2',
  classNumber: '3반',
  studentNumber: '20315',
};

// 교사 대시보드 시뮬레이션용 초기 제출 데이터셋
const INITIAL_SAMPLE_SUBMISSIONS: StudentSubmission[] = [
  {
    id: 'sub_001',
    studentId: 'student_demo_01',
    studentName: '이수민',
    studentNumber: '20315',
    activityId: 'g2-read-01',
    activityTitle: '2024년 9월 고2 34번: 인공지능과 창의적 사고의 상호작용',
    grade: 'G2',
    mode: 'read-write',
    submittedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45분 전
    timeSpentSeconds: 420,
    attemptsCount: 2,
    studentOutput: `Artificial intelligence can significantly facilitate human problem-solving, but it does not completely replace intrinsic human creativity. Furthermore, empirical research demonstrates that collaborative interaction between AI systems and thinkers establishes novel perspectives. Therefore, we must cultivate critical judgment while utilizing computational tools.`,
    notes: `인공지능과 인간의 협력적 문제 해결 메커니즘 도식화`,
    sensorReport: runFullSmartSensorInspection(
      `Artificial intelligence can significantly facilitate human problem-solving, but it does not completely replace intrinsic human creativity. Furthermore, empirical research demonstrates that collaborative interaction between AI systems and thinkers establishes novel perspectives. Therefore, we must cultivate critical judgment while utilizing computational tools.`,
      `Artificial intelligence systems are rapidly evolving to assist human cognition. Many researchers argue whether machines can truly possess creativity or merely simulate it. Empirical studies indicate that the synergy between human intuition and machine computation leads to unprecedented scientific breakthroughs. However, excessive reliance on automated algorithms may diminish original thought.`,
      60
    )
  },
  {
    id: 'sub_002',
    studentId: 'student_002',
    studentName: '박준형',
    studentNumber: '20308',
    activityId: 'g2-read-01',
    activityTitle: '2024년 9월 고2 34번: 인공지능과 창의적 사고의 상호작용',
    grade: 'G2',
    mode: 'read-write',
    submittedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 90분 전
    timeSpentSeconds: 580,
    attemptsCount: 3,
    studentOutput: `The author highlights that modern technology can help people find good solutions. However, we should be careful not to depend too much on computers. In addition, creative thinking requires human emotions and diverse real-world experiences. Ultimately, balance is vital for sustainable progress.`,
    notes: `지문 속 3가지 핵심 논거 정리 완료`,
    sensorReport: runFullSmartSensorInspection(
      `The author highlights that modern technology can help people find good solutions. However, we should be careful not to depend too much on computers. In addition, creative thinking requires human emotions and diverse real-world experiences. Ultimately, balance is vital for sustainable progress.`,
      `Artificial intelligence systems are rapidly evolving to assist human cognition. Many researchers argue whether machines can truly possess creativity or merely simulate it.`,
      60
    )
  },
  {
    id: 'sub_003',
    studentId: 'student_003',
    studentName: '정다은',
    studentNumber: '20321',
    activityId: 'g2-write-01',
    activityTitle: '2024년 6월 고2 29번: 심리적 프레이밍 효과와 의사결정 편향',
    grade: 'G2',
    mode: 'writing',
    submittedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    timeSpentSeconds: 610,
    attemptsCount: 1,
    studentOutput: `Psychological framing profoundly alters how individuals perceive risk and evaluate economic alternatives. When a dilemma is formulated in terms of potential gains, decision-makers exhibit risk-averse behaviors. Conversely, when confronted with explicit losses, they become substantially more inclined toward risk-seeking choices. Hence, understanding these cognitive heuristics is indispensable for rational assessment.`,
    sensorReport: runFullSmartSensorInspection(
      `Psychological framing profoundly alters how individuals perceive risk and evaluate economic alternatives. When a dilemma is formulated in terms of potential gains, decision-makers exhibit risk-averse behaviors. Conversely, when confronted with explicit losses, they become substantially more inclined toward risk-seeking choices. Hence, understanding these cognitive heuristics is indispensable for rational assessment.`,
      `Cognitive psychology has consistently shown that human decision-making is not purely objective. The manner in which options are presented—known as the framing effect—causes noticeable shifts in preference.`,
      60
    )
  },
  {
    id: 'sub_004',
    studentId: 'student_004',
    studentName: '최민재',
    studentNumber: '20304',
    activityId: 'g1-listen-01',
    activityTitle: '2025년 3월 고1 13번: 지속 가능한 도시 생태계와 녹색 인프라',
    grade: 'G1',
    mode: 'listen-write',
    submittedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    timeSpentSeconds: 310,
    attemptsCount: 2,
    studentOutput: `Urban planners should incorporate green spaces into architectural designs because plants improve air quality and provide psychological relief. For example, vertical gardens and rooftop vegetation effectively mitigate the urban heat island effect.`,
    sensorReport: runFullSmartSensorInspection(
      `Urban planners should incorporate green spaces into architectural designs because plants improve air quality and provide psychological relief. For example, vertical gardens and rooftop vegetation effectively mitigate the urban heat island effect.`,
      `Modern cities face rapid environmental deterioration due to heat island effects and air pollution. Experts emphasize that incorporating natural flora into concrete infrastructure creates sustainable living environments.`,
      60
    )
  }
];

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
 * 전체 학생 제출물 로드 (없으면 초기 샘플로 초기화)
 */
export const loadAllSubmissions = (): StudentSubmission[] => {
  try {
    const raw = localStorage.getItem(SUBMISSIONS_KEY);
    if (!raw) {
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(INITIAL_SAMPLE_SUBMISSIONS));
      return INITIAL_SAMPLE_SUBMISSIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load submissions', e);
    return INITIAL_SAMPLE_SUBMISSIONS;
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
 * 새 제출물 저장
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
