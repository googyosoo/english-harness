/**
 * Upstage API Service
 * - Solar Pro LLM: 서술형 쓰기 실시간 AI 첨삭, 패러프레이징 제안, 논리 평가
 * - Document Parse API: PDF/이미지 시험지 지문 텍스트 자동 파싱 및 구조화
 */

const DEFAULT_UPSTAGE_KEY = 'up_TTPnpY9lJNMpfDjZlpryXBCO8F36I';
const STORAGE_KEY = 'upstage_api_key';

export const getUpstageApiKey = (): string => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved.trim()) return saved.trim();
  } catch (e) {
    // ignore
  }
  return DEFAULT_UPSTAGE_KEY;
};

export const saveUpstageApiKey = (key: string): void => {
  try {
    localStorage.setItem(STORAGE_KEY, key.trim());
  } catch (e) {
    // ignore
  }
};

// ==========================================
// 1. [기능 A] Solar LLM 서술형 첨삭 인터페이스
// ==========================================

export interface SolarGrammarIssue {
  original: string;
  corrected: string;
  explanation: string;
}

export interface SolarWritingInspection {
  overallScore: number; // 0 ~ 100
  revisedSentence: string; // 원어민식 자연스러운 모범 영작문
  alternativeExpressions: string[]; // CEFR B2/C1 수준의 고급 패러프레이징 표현 2~3개
  grammarIssues: SolarGrammarIssue[];
  logicFeedback: string; // 지문 맥락 및 문제 요구조건과의 논리적 부합도
  evaluationSummary: string; // 총평
}

/**
 * Solar Pro 모델을 호출하여 서술형 답안을 첨삭 및 패러프레이징합니다.
 */
export const inspectWritingWithSolar = async (
  studentDraft: string,
  passageContext: string,
  missionType: 'topic' | 'blank' | 'summary'
): Promise<SolarWritingInspection> => {
  const apiKey = getUpstageApiKey();
  const missionName =
    missionType === 'topic'
      ? '지문 주제/제목/요지 영작'
      : missionType === 'blank'
      ? '핵심 빈칸 추론 완성'
      : '지문 핵심 요약문 완성';

  const systemPrompt = `You are an elite SAT/CSAT English writing specialist and native English evaluator.
Your goal is to inspect a Korean high school student's English writing answer and provide detailed, supportive feedback and native-level paraphrasing.

Return ONLY a valid JSON object strictly matching this schema, without any markdown formatting backticks:
{
  "overallScore": 88,
  "revisedSentence": "The most natural, academic native-level polished version of the student's answer",
  "alternativeExpressions": ["Alternative phrasing 1 (academic)", "Alternative phrasing 2 (concise)"],
  "grammarIssues": [
    {
      "original": "part of student text with error or awkwardness",
      "corrected": "corrected version",
      "explanation": "Korean explanation of why this change is needed"
    }
  ],
  "logicFeedback": "Korean explanation of how well the student's answer captures the context and logic of the reading passage",
  "evaluationSummary": "Friendly, encouraging Korean summary feedback"
}`;

  const userPrompt = `[지문 본문 (Reading Passage)]
${passageContext.slice(0, 2000)}

[서술형 평가 미션]
${missionName}

[학생이 작성한 답안]
${studentDraft}

위 지문과 학생의 답안을 분석하여 고품질의 JSON 피드백을 제공해 주세요.`;

  try {
    const res = await fetch('https://api.upstage.ai/v1/solar/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'solar-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Upstage API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content || '{}';

    // JSON 추출
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Upstage 응답에서 JSON을 추출할 수 없습니다.');
    }

    const parsed: SolarWritingInspection = JSON.parse(jsonMatch[0]);
    return {
      overallScore: Math.min(100, Math.max(0, Number(parsed.overallScore) || 85)),
      revisedSentence: parsed.revisedSentence || studentDraft,
      alternativeExpressions: Array.isArray(parsed.alternativeExpressions)
        ? parsed.alternativeExpressions
        : [],
      grammarIssues: Array.isArray(parsed.grammarIssues) ? parsed.grammarIssues : [],
      logicFeedback: parsed.logicFeedback || '지문의 핵심 논지에 부합합니다.',
      evaluationSummary: parsed.evaluationSummary || '우수한 작문 결과입니다.',
    };
  } catch (error: any) {
    console.error('inspectWritingWithSolar failed:', error);
    throw error;
  }
};

// ==========================================
// 2. [기능 C] Document Parse 시험지 자동 파싱
// ==========================================

export interface ParsedPassageResult {
  title: string;
  passageText: string;
  suggestedGrade: '고1' | '고2' | '고3';
  category: 'reading' | 'listening';
  cefrLevel: string;
  wordCount: number;
  extractedElementsCount: number;
}

/**
 * Upstage Document Parse API를 호출하여 PDF 또는 이미지 파일에서 지문 텍스트를 파싱합니다.
 */
export const parseDocumentWithUpstage = async (file: File): Promise<ParsedPassageResult> => {
  const apiKey = getUpstageApiKey();
  const formData = new FormData();
  formData.append('document', file);

  try {
    const res = await fetch('https://api.upstage.ai/v1/document-ai/document-parse', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Document Parse API 호출 실패 (${res.status}): ${errText}`);
    }

    const data = await res.json();
    
    // 1. 텍스트 추출: html 파싱 또는 elements 단락 수집
    let extractedText = '';

    if (data.elements && Array.isArray(data.elements) && data.elements.length > 0) {
      extractedText = data.elements
        .filter((el: any) => el.category === 'paragraph' || el.category === 'text' || el.category === 'list')
        .map((el: any) => {
          if (el.content?.text) return el.content.text;
          if (el.content?.html) {
            // 태그 제거
            return el.content.html.replace(/<[^>]*>?/gm, ' ').trim();
          }
          return '';
        })
        .filter((t: string) => t.length > 0)
        .join('\n\n');
    } else if (data.content?.html) {
      extractedText = data.content.html.replace(/<[^>]*>?/gm, ' ').trim();
    } else if (data.content?.text) {
      extractedText = data.content.text;
    }

    if (!extractedText.trim()) {
      throw new Error('문서에서 텍스트를 추출하지 못했습니다. 선명한 파일인지 확인해 주세요.');
    }

    // 2. Solar LLM을 활용해 지문 정제 및 메타데이터 자동 추출
    const meta = await cleanAndExtractPassageMeta(extractedText);

    return {
      title: meta.title || file.name.replace(/\.[^/.]+$/, ''),
      passageText: meta.cleanedPassage || extractedText,
      suggestedGrade: (meta.grade as '고1' | '고2' | '고3') || '고2',
      category: (meta.category as 'reading' | 'listening') || 'reading',
      cefrLevel: meta.cefrLevel || 'B2',
      wordCount: (meta.cleanedPassage || extractedText).split(/\s+/).filter(Boolean).length,
      extractedElementsCount: data.elements?.length || 1,
    };
  } catch (error: any) {
    console.error('parseDocumentWithUpstage failed:', error);
    throw error;
  }
};

/**
 * Solar Pro를 통해 추출된 원시 텍스트에서 불필요한 번호표/안내문을 제거하고
 * 순수 영어 지문 본문과 추천 메타데이터를 정제합니다.
 */
async function cleanAndExtractPassageMeta(rawText: string) {
  const apiKey = getUpstageApiKey();
  const prompt = `You are an AI assistant parsing an English exam sheet into a clean reading passage for high school students.
From the raw OCR text below, extract:
1. title: A concise Korean or English title reflecting the main topic (e.g. "인공지능과 교육의 미래" or "The Evolution of Altruism")
2. cleanedPassage: The clean English passage text (strip exam question numbers like [21번], page headers, footers, or extraneous noise, but keep the full English body intact)
3. grade: One of "고1", "고2", "고3" based on difficulty
4. category: "reading" or "listening"
5. cefrLevel: CEFR level (e.g., "B1", "B2", "C1")

Return ONLY a JSON object:
{
  "title": string,
  "cleanedPassage": string,
  "grade": "고1" | "고2" | "고3",
  "category": "reading" | "listening",
  "cefrLevel": string
}

Raw Text:
${rawText.slice(0, 3000)}`;

  try {
    const res = await fetch('https://api.upstage.ai/v1/solar/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'solar-pro',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || '{}';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }
  } catch (e) {
    console.warn('Metadata refinement failed, using fallback:', e);
  }

  return {
    title: '새로 추출된 시험 지문',
    cleanedPassage: rawText,
    grade: '고2' as const,
    category: 'reading' as const,
    cefrLevel: 'B2',
  };
}
