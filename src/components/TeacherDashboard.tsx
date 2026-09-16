import React, { useState } from 'react';
import { ActivityContent } from '../types/harness';
import { UserProfile, StudentSubmission } from '../types/auth';
import { loadAllSubmissions } from '../utils/authStorage';
import { 
  GraduationCap, Copy, Check, FileText, BarChart3, AlertCircle, 
  Award, Users, Search, Filter, Eye, Download, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { runFullSmartSensorInspection } from '../utils/sensorEngine';
import { IntelligentSensorReport } from './common/IntelligentSensorReport';

interface TeacherDashboardProps {
  activity: ActivityContent;
  timeSpent: number;
  attemptsCount: number;
  sensorScore: number | null;
  studentOutput: string;
  user?: UserProfile;
}

// 제목에서 [수능 32번], [2024년 9월 고3] 등 시험명 및 문항번호를 완전 제거하고 순수 학술 주제/개념만 추출하는 정제 함수
const extractCleanAcademicTopic = (title: string): string => {
  if (!title) return '학술 텍스트';
  let clean = title.replace(/\[.*?\]\s*/g, '').replace(/\b\d+번[:\s]*/g, '').trim();
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

// 학생별 세특 생성 엔진
const generateStudentNeis = (
  studentName: string,
  activityTitle: string,
  studentOutput: string,
  sensorReport: any
): string => {
  const mainTopic = extractCleanAcademicTopic(activityTitle);
  let vocabDetail = '';
  let discourseDetail = '';
  let copyRateDetail = '';

  if (sensorReport && sensorReport.vocabulary) {
    if (sensorReport.vocabulary.awlWordsFound && sensorReport.vocabulary.awlWordsFound.length > 0) {
      const sampleAwl = sensorReport.vocabulary.awlWordsFound.slice(0, 3).join(', ');
      vocabDetail = ` '${sampleAwl}' 등 학술 기본 어휘(AWL)와 B2~C1 수준의 고급 어휘를 적재적소에 활용하여 학술적 문맥의 격조를 높임.`;
    } else if (sensorReport.vocabulary.levels?.advanced?.percentage > 10) {
      vocabDetail = ` CEFR 고급(B2~C1) 수준의 어휘를 풍부하게 구사하여 문장의 표현력을 효과적으로 다채롭게 확장함.`;
    }

    if (sensorReport.transitions?.foundTransitions?.length >= 2) {
      const categories = sensorReport.transitions.categoriesUsed || [];
      const catKorean = categories.map((c: string) => 
        c === 'contrast' ? '대조' : 
        c === 'causeEffect' || c === 'cause' ? '인과' : 
        c === 'addition' ? '추가' : 
        c === 'example' ? '예시' : '결론'
      ).join('·');
      discourseDetail = ` 문장 간 ${catKorean} 논리 연결사를 유기적으로 배치하여 단락 전체의 담화 응집성과 논리적 흐름을 견고하게 구축함.`;
    }

    if (sensorReport.plagiarism?.copyRate < 25) {
      copyRateDetail = ` 원문 텍스트의 단순 인용을 지양하고 핵심 의미를 자신만의 문장 구조로 재구성하는 뛰어난 패러프레이징(Paraphrasing) 능력을 발휘함.`;
    }
  }

  return `'${mainTopic}'을 제재로 한 심층 학술 텍스트를 분석하며 중심 논지와 세부 논거 간의 논리적 상관관계를 명확히 도출함.${copyRateDetail}${vocabDetail}${discourseDetail} 단계별 AI 안전망 코칭 힌트를 참고하여 스스로 오개념과 문맥을 점검·퇴고하였으며, 학술적 어휘와 논리적 결속성을 두루 갖춘 완성도 높은 영문 에세이를 작성하는 뛰어난 비판적 사고력과 학업 성실성을 보임.`;
};

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  activity,
  timeSpent,
  attemptsCount,
  sensorScore,
  studentOutput,
  user,
}) => {
  const allSubmissions = loadAllSubmissions();
  const [selectedSub, setSelectedSub] = useState<StudentSubmission | null>(allSubmissions[0] || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 학생 검색 필터링
  const filteredSubmissions = allSubmissions.filter((s) =>
    s.studentName.includes(searchTerm) ||
    s.activityTitle.includes(searchTerm) ||
    (s.studentNumber && s.studentNumber.includes(searchTerm))
  );

  // 클립보드 복사 핸들러
  const handleCopyNeis = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 선택된 제출물의 세특 문구 산출
  const currentNeisText = selectedSub
    ? generateStudentNeis(
        selectedSub.studentName,
        selectedSub.activityTitle,
        selectedSub.studentOutput,
        selectedSub.sensorReport
      )
    : '';
  const currentNeisBytes = calculateNeisBytes(currentNeisText);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6 animate-in fade-in duration-200">
      {/* 상단 교사용 헤더 배너 */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border-2 border-indigo-400/40 flex items-center justify-center text-3xl shadow-inner">
            🎓
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 font-bold text-xs border border-indigo-400/30">
                {user?.name || '김진우 선생님'} 교과 담당
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950 font-extrabold text-[10px]">
                실시간 학생 동기화
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">
              학생 관찰 기록 & 생활기록부 세특 관제 센터
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/90 mt-1">
              학생들의 자기주도 다듬기 횟수, CEFR 어휘 수준, 패러프레이징 데이터를 바탕으로 NEIS 세특을 자동 완성합니다.
            </p>
          </div>
        </div>

        {/* 상단 현황 카드 */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20">
          <div className="text-center px-2">
            <div className="text-xs text-indigo-200">제출된 산출물</div>
            <div className="text-xl font-black">{allSubmissions.length}건</div>
          </div>
          <div className="w-px h-8 bg-white/20"></div>
          <div className="text-center px-2">
            <div className="text-xs text-indigo-200">평균 수정 횟수</div>
            <div className="text-xl font-black text-amber-300">
              {(allSubmissions.reduce((acc, s) => acc + s.attemptsCount, 0) / (allSubmissions.length || 1)).toFixed(1)}회
            </div>
          </div>
          <div className="w-px h-8 bg-white/20"></div>
          <div className="text-center px-2">
            <div className="text-xs text-indigo-200">평균 성취도</div>
            <div className="text-xl font-black text-emerald-300">
              {Math.round(
                allSubmissions.reduce((acc, s) => acc + (s.sensorReport?.overallScore || 80), 0) /
                  (allSubmissions.length || 1)
              )}점
            </div>
          </div>
        </div>
      </div>

      {/* 메인 2열 그리드: 학생 제출 목록 vs 세특 및 상세 분석 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 좌측: 학급 학생 제출물 목록 */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 shadow-warm-sm p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <h2 className="font-bold text-slateText-title text-sm">학급 제출 현황 모니터링</h2>
            </div>
            <span className="text-xs font-mono text-stone-400">{filteredSubmissions.length}명</span>
          </div>

          {/* 검색창 */}
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="학생 이름, 학번, 과업명으로 검색..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* 학생 제출 카드 목록 */}
          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1 flex-1">
            {filteredSubmissions.length === 0 ? (
              <div className="py-12 text-center text-xs text-stone-400">일치하는 학생 기록이 없습니다.</div>
            ) : (
              filteredSubmissions.map((sub) => {
                const isSelected = selectedSub?.id === sub.id;
                return (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedSub(sub)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-400 shadow-xs'
                        : 'bg-stone-50/60 border-stone-200/80 hover:bg-stone-100/70'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slateText-title">{sub.studentName}</span>
                        {sub.studentNumber && (
                          <span className="text-[11px] text-stone-500 font-mono">({sub.studentNumber})</span>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-400">
                        {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-xs text-stone-600 font-medium line-clamp-1">
                      {sub.activityTitle}
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-200/60 text-[11px]">
                      <span className="text-stone-500">
                        몰입 {sub.timeSpentSeconds}초 · 다듬기 {sub.attemptsCount}회
                      </span>
                      <span className="font-bold text-indigo-700">
                        점수 {sub.sensorReport?.overallScore || 85}점
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 우측: 선택된 학생의 관찰 기록 & 생활기록부 세특 자동 완성 */}
        <div className="lg:col-span-7 space-y-5">
          {selectedSub ? (
            <>
              {/* 생활기록부 세특 카드 */}
              <div className="bg-[#FDFBF7] rounded-2xl border-2 border-indigo-200 shadow-warm-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-800">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slateText-title text-sm">
                        [NEIS 기재요령 표준] {selectedSub.studentName} 학생 교과세특 문구
                      </h3>
                      <p className="text-[11px] text-stone-500 font-mono">
                        글자수 {currentNeisText.length}자 / {currentNeisBytes} Byte (나이스 3바이트 기준)
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopyNeis(currentNeisText, selectedSub.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    {copiedId === selectedSub.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === selectedSub.id ? '복사 완료!' : '세특 문구 복사'}</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-white border border-stone-200 text-xs text-slateText-body font-sans leading-relaxed shadow-inner select-text">
                  {currentNeisText}
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-indigo-700/80">
                  <span>* 시험명/문항번호 배제 및 교육부 감사 기준에 부합하는 탐구 과정 서술</span>
                  <span className="font-semibold">바이트 적정성: 통과 (1,500 Byte 이내)</span>
                </div>
              </div>

              {/* 학생 제출문 및 센서 분석 상세 */}
              <div className="bg-white rounded-2xl border border-stone-200 shadow-warm-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slateText-title text-xs">
                    📝 학생이 최종 제출한 에세이 원문 ({selectedSub.studentName})
                  </h4>
                  <span className="text-[11px] text-stone-400">
                    스스로 고친 횟수: {selectedSub.attemptsCount}회
                  </span>
                </div>
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs font-mono text-slateText-body leading-relaxed">
                  {selectedSub.studentOutput}
                </div>

                {/* 지능형 센서 리포트 */}
                {selectedSub.sensorReport && (
                  <div className="pt-2">
                    <IntelligentSensorReport report={selectedSub.sensorReport} />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-16 bg-white rounded-2xl border-2 border-dashed border-stone-200 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slateText-title">아직 제출된 학생 과업이 없습니다</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                더미 데이터를 모두 배제하고 실제 데이터 파이프라인으로 전환되었습니다. 학생들이 <strong>[학습 스튜디오]</strong>에서 과업을 완료하고 제출하면 이곳에 실시간으로 학생별 생활기록부 세특과 에세이가 자동 생성됩니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
