/**
 * 2인 대화(M/W) 지능형 파싱 및 남녀 성우 교차 발화 유틸리티
 * - 'M:', 'W:', 'Man:', 'Woman:', 'Boy:', 'Girl:' 라벨을 감지하여 성우 성별(남/여) 배정
 * - 실제 발화 텍스트에서는 'M', 'W' 라벨을 완전히 제거하고 순수 대사만 추출
 * - 브라우저 SpeechSynthesis 음성 목록 중 en-US 남성 및 여성 보이스를 자동 감지하여 매칭
 */

export interface DialogueLine {
  speaker: 'M' | 'W' | 'N'; // M=Male, W=Female, N=Neutral (독백/담화)
  text: string;
}

/**
 * 스크립트 문자열을 발화자별 대사 단위로 파싱
 */
export const parseDialogueScript = (script: string): DialogueLine[] => {
  if (!script || !script.trim()) return [];

  // 1. M:, W:, Man:, Woman:, Boy:, Girl: 태그 패턴
  // 예: "W: Hey, Jake. M: Yeah, Mom." 또는 "Woman: Hello. Man: Hi."
  const speakerRegex = /\b(M|W|Man|Woman|Boy|Girl)\s*:\s*/gi;

  // 태그가 존재하는지 확인
  if (!speakerRegex.test(script)) {
    // 2인 대화 태그가 없는 일반 독백 담화인 경우
    return [{ speaker: 'N', text: script.trim() }];
  }

  // 매칭 위치 기반으로 텍스트 분할
  const lines: DialogueLine[] = [];
  const regex = /\b(M|W|Man|Woman|Boy|Girl)\s*:\s*/gi;
  let lastIndex = 0;
  let currentSpeaker: 'M' | 'W' | 'N' = 'N';
  let match: RegExpExecArray | null;

  while ((match = regex.exec(script)) !== null) {
    const prevText = script.slice(lastIndex, match.index).trim();
    if (prevText && currentSpeaker !== 'N') {
      // 이전 대사 저장 (라벨 없이 순수 대사만)
      lines.push({ speaker: currentSpeaker, text: prevText });
    }

    const speakerTag = match[1].toUpperCase();
    if (speakerTag === 'M' || speakerTag === 'MAN' || speakerTag === 'BOY') {
      currentSpeaker = 'M';
    } else if (speakerTag === 'W' || speakerTag === 'WOMAN' || speakerTag === 'GIRL') {
      currentSpeaker = 'W';
    } else {
      currentSpeaker = 'N';
    }

    lastIndex = regex.lastIndex;
  }

  // 마지막 대사 처리
  const remainingText = script.slice(lastIndex).trim();
  if (remainingText) {
    lines.push({ speaker: currentSpeaker, text: remainingText });
  }

  return lines.length > 0 ? lines : [{ speaker: 'N', text: script.trim() }];
};

/**
 * 브라우저에서 사용할 수 있는 남성 및 여성 영어 음성 찾기
 */
export const getGenderVoices = (): {
  maleVoice: SpeechSynthesisVoice | null;
  femaleVoice: SpeechSynthesisVoice | null;
} => {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return { maleVoice: null, femaleVoice: null };
  }

  const voices = window.speechSynthesis.getVoices();
  const englishVoices = voices.filter((v) => v.lang.startsWith('en'));

  // 남성 음성 탐색 (Google US English Male, David, George, Guy, Mark, Daniel, Natural 등)
  const maleKeywords = ['male', 'david', 'george', 'guy', 'mark', 'daniel', 'richard', 'james', 'en-us-guy'];
  let maleVoice = englishVoices.find((v) =>
    maleKeywords.some((k) => v.name.toLowerCase().includes(k))
  ) || null;

  // 여성 음성 탐색 (Google US English Female, Zira, Samantha, Victoria, Jenny, Karen, Aria, Natural 등)
  const femaleKeywords = ['female', 'zira', 'samantha', 'victoria', 'jenny', 'karen', 'aria', 'lisa', 'en-us-jenny'];
  let femaleVoice = englishVoices.find((v) =>
    femaleKeywords.some((k) => v.name.toLowerCase().includes(k))
  ) || null;

  // 남녀가 동일하거나 하나를 못 찾았을 때의 대체 로직
  if (!femaleVoice && englishVoices.length > 0) {
    femaleVoice = englishVoices[0];
  }
  if (!maleVoice && englishVoices.length > 1) {
    maleVoice = englishVoices[1];
  } else if (!maleVoice && englishVoices.length > 0) {
    maleVoice = englishVoices[0];
  }

  return { maleVoice, femaleVoice };
};
