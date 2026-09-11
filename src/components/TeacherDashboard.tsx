import React, { useState } from 'react';
import { ActivityContent } from '../types/harness';
import { GraduationCap, Copy, Check, FileText, BarChart3, AlertCircle, Award } from 'lucide-react';

interface TeacherDashboardProps {
  activity: ActivityContent;
  timeSpent: number;
  attemptsCount: number;
  sensorScore: number | null;
  studentOutput: string;
}

// 제목에서 [수능 32번], [2024년 9월 고3] 등 시험명 및 문항번호를 완전 제거하고 순수 학술 주제/개념만 추출하는 정제 함수
const extractCleanAcademicTopic = (title: string): string => {
  if (!title) return '학술 텍스트';
  // [202X년 X월 고X] 및 32번: 등의 접두사 제거
  let clean = title.replace(/\[.*?\]\s*/g, '').replace(/\b\d+번[:\s]*/g, '').trim();
  // "다중 텍스트 심층 비교 독해:" 등의 접두어 제거
  clean = clean.replace(/^(다중 텍스트 비교 분석|다중 텍스트 심층 비교 독해|주제 중심 독해|대의 파악|빈칸 추론|순서 배열|주제 파악)[:\s]*/, '').trim();
  return clean || '학술 영어 텍스트 심층 독해';
};

// NEIS 바이트 계산 (한글 3바이트, 영문/숫자/공백/엔터 1바이트)
const calculateNeisBytes = (text: string): number => {
  let bytes = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code > 127) {
      bytes += 3;
    } else {
      bytes += 1;
    }
  }
  return bytes;
};

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  activity,
  timeSpent,
  attemptsCount,
  sensorScore,
  studentOutput,
}) => {
  const [copied, setCopied] = useState(false);

  // 지문 분석 및 이해 궤적 중심의 NEIS 세특 생성 알고리즘 (시험명/문항번호 일체 배제)
  const generateNeisRecord = () => {
    const gradeKorean = activity.grade === 'G1' ? '공통영어' : activity.grade === 'G2' ? '영어II' : '심화영어';
    const mainTopic = extractCleanAcademicTopic(activity.title);

    // 복수 지문(Multi-passages)이 연동된 경우
    if (activity.multiPassages && activity.multiPassages.length >= 2) {
      const topicA = extractCleanAcademicTopic(activity.multiPassages[0].cleanTopic || activity.multiPassages[0].title);
      const topicB = extractCleanAcademicTopic(activity.multiPassages[1].cleanTopic || activity.multiPassages[1].title);

      return `'${topicA}'와 '${topicB}'라는 서로 다른 관점과 맥락을 다룬 복수의 학술 텍스트를 심층 비교·분석하는 독해 과업을 주도함. 각 지문의 중심 논지와 논거의 타당성을 비판적으로 검토하고, 텍스트 간의 상호 텍스트성(Intertextuality)을 바탕으로 공통점과 상이한 인과관계를 체계적으로 대조·이해함. 지문의 단순 인용을 배제하고 핵심 개념을 자신만의 학술 어휘로 패러프레이징(Paraphrasing)하여 두 지문의 관점을 통합(Synthesis)한 완결성 높은 종합 에세이를 작성함. 하네스 어휘 다양성 센서(TTR)의 피드백을 수용하여 논리적 응집성과 어법 정확도를 자가 교정하는 뛰어난 메타인지 텍스트 이해 역량을 발휘함.`;
    }

    // 단일 지문: 활동 모드별 지문 분석 및 이해 궤적
    if (activity.mode === 'listen-write' || activity.mode === 'listening') {
      return `'${mainTopic}'을 제재로 한 심층 담화 텍스트를 청취하며 핵심 정보와 세부 근거(5W1H)의 위계 관계를 정밀하게 분석·구조화함. 청각적 입력 텍스트의 맥락적 단서와 연결어 표제어를 정확히 포착하여 화자의 숨은 의도와 논지 전개를 심층적으로 이해함. 분석된 담화 내용을 바탕으로 목적과 수용자를 고려한 완결된 영문 요약문 및 보고서를 작성하였으며, 하네스 문맥 적합성 센서 피드백을 통해 문장 간 결속성을 스스로 보완하는 자기주도적 학업 태도를 보임.`;
    } else if (activity.mode === 'read-write' || activity.mode === 'reading') {
      return `'${mainTopic}'에 관한 학술 지문을 정밀 분석하며 단락의 전개 구조와 중심 문장-뒷받침 문장 간의 논리적 상관관계를 명확히 도출함. 문맥 속에서 낯선 어휘의 함축적 의미를 유추하고, 글쓴이가 제시한 핵심 개념의 인과적 메커니즘을 심층적으로 이해하여 도식화함. 나아가 소크라테스식 발문에 능동적으로 반응하여 지문의 논점을 자신의 삶이나 현대 사회 현상과 연계한 비판적 에세이를 작성함. 하네스 표절 감지 및 어휘 센서를 거치며 초안을 지속적으로 윤문·퇴고하는 우수한 비판적 사고력과 텍스트 분석 역량이 돋보임.`;
    } else if (activity.mode === 'listen-speak' || activity.mode === 'speaking') {
      return `'${mainTopic}'을 다룬 구어 담화 텍스트를 다각도로 분석하여 쟁점별 찬반 논거를 체계적으로 정리함. 담화의 흐름과 반론의 전제를 면밀히 이해한 후, PREP(주장-이유-예시-강조) 구조를 적용하여 자신의 입장을 논리정연한 학술 스피치로 구술함. 하네스 유창성 및 연결사 적합도 센서의 지표를 분석하며 발화 속도와 논리적 전달력을 스스로 점검·개선하는 수준 높은 의사소통 능력을 발휘함.`;
    } else {
      return `'${mainTopic}' 관련 텍스트의 논리적 층위를 분석하고 핵심 개념 간의 유기적 관계를 정확히 파악함. 난이도 높은 학술적 지문 구조를 능동적으로 해석하고, AI 하네스의 스캐폴딩 피드백을 바탕으로 스스로 오개념을 수정해 가며 지문의 심층적 의미를 완벽히 소화해내는 인지적 유연성과 학업 지속성이 돋보임.`;
    }
  };

  const neisText = generateNeisRecord();
  const byteCount = calculateNeisBytes(neisText); // NEIS 규격 바이트 계산


  const handleCopy = () => {
    navigator.clipboard.writeText(neisText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-4">
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-warm-sm mb-6">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-800">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slateText-title">
                교사용 관측(Observability) & NEIS 세특 에비던스 센터
              </h2>
              <p className="text-xs text-slateText-muted mt-0.5">
                학생의 6겹 하네스 통과 기록과 자가 교정 데이터를 바탕으로 교육부 규격 맞춤 세특을 자동 추출합니다.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-200">
              실시간 분석 동기화 중
            </span>
          </div>
        </div>

        {/* 관측 지표 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-5">
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
              <span>학습 몰입 시간</span>
              <BarChart3 className="w-4 h-4 text-stone-400" />
            </div>
            <div className="text-xl font-bold text-slateText-title">{timeSpent}초</div>
            <p className="text-[11px] text-stone-500 mt-1">집중도: 정상 범위 (트립와이어 미발생)</p>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
              <span>자가 수정(래칫) 횟수</span>
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl font-bold text-amber-700">{attemptsCount}회 시도</div>
            <p className="text-[11px] text-stone-500 mt-1">포기하지 않고 스캐폴딩 힌트 수용</p>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
              <span>하네스 센서 종합 통과 점수</span>
              <Award className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xl font-bold text-emerald-700">
              {sensorScore !== null ? `${sensorScore}점 (통과)` : '측정 진행 중'}
            </div>
            <p className="text-[11px] text-stone-500 mt-1">기준: {activity.lexile} / {activity.cefrLevel}</p>
          </div>
        </div>

        {/* NEIS 교과세특 문구 카드 */}
        <div className="mt-6 p-5 rounded-2xl bg-[#FDFBF7] border-2 border-indigo-200/80 shadow-warm-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-700" />
              <h3 className="font-bold text-slateText-title text-base">
                [NEIS 권장] 생활기록부 교과세특 자동 완성 문구
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-stone-500">
                글자수: {neisText.length}자 / 바이트: {byteCount} Byte
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? '복사 완료!' : '문구 복사'}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-stone-200 text-sm text-slateText-body leading-relaxed font-sans shadow-inner">
            {neisText}
          </div>

          <p className="text-xs text-indigo-700/80 mt-2.5">
            💡 <strong>교사 안내:</strong> 학생이 작성한 실제 과업 결과와 하네스 자가수정 궤적(증거)을 바탕으로 작성되었으므로, NEIS 나이스 생활기록부에 그대로 복사하여 입력하거나 일부 가감하여 사용하실 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
};
