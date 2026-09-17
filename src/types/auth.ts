import { ActivityMode, GradeLevel } from './harness';
import { SmartSensorReportData } from '../utils/sensorEngine';

export type UserRole = 'teacher' | 'student';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  schoolName?: string;
  grade?: GradeLevel;
  classNumber?: string;
  studentNumber?: string;
}

export interface StudentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  studentNumber?: string;
  activityId: string;
  activityTitle: string;
  grade: GradeLevel;
  mode: ActivityMode;
  submittedAt: string; // ISO string
  timeSpentSeconds: number;
  attemptsCount: number;
  studentOutput: string;
  notes?: string;
  sensorReport: SmartSensorReportData;
  isCorrect?: boolean;
  selectedOptionIndex?: number;
}
