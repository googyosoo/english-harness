import { ActivityContent } from '../types/harness';
import { CURRICULUM_DATA } from '../data/curriculumData';

const ACTIVITIES_STORAGE_KEY = 'vibe_english_custom_activities_v1';

/**
 * 스튜디오 문항 목록 로드 (로컬 저장소에 저장된 문항이 있으면 로드, 없으면 기본 CURRICULUM_DATA 사용)
 */
export const loadActivities = (): ActivityContent[] => {
  try {
    const raw = localStorage.getItem(ACTIVITIES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(CURRICULUM_DATA));
      return CURRICULUM_DATA;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : CURRICULUM_DATA;
  } catch (error) {
    console.error('Failed to load activities:', error);
    return CURRICULUM_DATA;
  }
};

/**
 * 스튜디오 문항 목록 저장
 */
export const saveActivities = (activities: ActivityContent[]): void => {
  try {
    localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities));
  } catch (error) {
    console.error('Failed to save activities:', error);
  }
};

/**
 * 특정 단일 문항 삭제
 */
export const deleteActivityById = (activityId: string): ActivityContent[] => {
  const current = loadActivities();
  const updated = current.filter((item) => item.id !== activityId);
  saveActivities(updated);
  return updated;
};

/**
 * 복수 문항 일괄 삭제
 */
export const deleteActivitiesByIds = (activityIds: string[]): ActivityContent[] => {
  const current = loadActivities();
  const idSet = new Set(activityIds);
  const updated = current.filter((item) => !idSet.has(item.id));
  saveActivities(updated);
  return updated;
};

/**
 * 스튜디오 전체 문항 삭제 (비우기)
 */
export const clearAllActivities = (): ActivityContent[] => {
  saveActivities([]);
  return [];
};

/**
 * 기본 교육과정 문항으로 복구
 */
export const resetToDefaultActivities = (): ActivityContent[] => {
  saveActivities(CURRICULUM_DATA);
  return CURRICULUM_DATA;
};

/**
 * 스튜디오 목록에 새로운 문항(단일 또는 복수) 추가 (기존 문항과 ID 중복 시 업데이트, 없으면 맨 앞에 추가)
 */
export const addActivitiesToStudio = (newActivities: ActivityContent[]): ActivityContent[] => {
  const current = loadActivities();
  const currentMap = new Map(current.map((item) => [item.id, item]));

  for (const act of newActivities) {
    currentMap.set(act.id, act);
  }

  // 최신 추가된 문항이 앞쪽으로 오도록 정렬
  const updated = Array.from(currentMap.values());
  saveActivities(updated);
  return updated;
};

