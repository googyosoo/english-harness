import React, { useState } from 'react';
import { UserProfile, StudentSubmission } from '../../types/auth';
import { loadSubmissionsByStudentId } from '../../utils/authStorage';
import { 
  BookOpen, Clock, Award, CheckCircle2, FileText, ChevronRight, 
  Sparkles, ExternalLink, Calendar, BarChart2, ArrowUpRight 
} from 'lucide-react';
import { IntelligentSensorReport } from '../common/IntelligentSensorReport';

interface StudentDashboardProps {
  user: UserProfile;
  onSelectActivity?: (activityId: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onSelectActivity }) => {
  const submissions: StudentSubmission[] = loadSubmissionsByStudentId(user.id);
  const [selectedSub, setSelectedSub] = useState<StudentSubmission | null>(submissions[0] || null);

  // 총 학습 통계 산출
  const totalSubmissions = submissions.length;
  const totalTimeMinutes = Math.round(submissions.reduce((acc, s) => acc + s.timeSpentSeconds, 0) / 60);
  const avgScore = totalSubmissions > 0 
    ? Math.round(submissions.reduce((acc, s) => acc + (s.sensorReport.overallScore || 0), 0) / totalSubmissions) 
    : 0;

  // 누적 수집된 고유 AWL 단어
  const allAwlWords = Array.from(
    new Set(submissions.flatMap((s) => s.sensorReport.vocabulary.awlWordsFound || []))
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6 animate-in fade-in duration-200">
      {/* 상단 학생 프로필 웰컴 배너 */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-16 h-16 rounded-2xl border-2 border-white/80 object-cover shadow-md bg-white/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-bold text-xs">
                {user.grade === 'G1' ? '고1 공통영어' : user.grade === 'G2' ? '고2 영어II' : '고3 심화영어'}
                {user.studentNumber ? ` · 학번 ${user.studentNumber}` : ''}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950 font-extrabold text-[10px]">
                학생 포트폴리오
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">
              {user.name} 학생의 자기주도 학습 대시보드
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1">
              AI 힌트와 피드백을 통해 스스로 생각하고 다듬은 영문 에세이와 어휘 성장 기록입니다.
            </p>
          </div>
        </div>

        {/* 퀵 뱃지 */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20">
          <div className="text-center px-2">
            <div className="text-xs text-emerald-200">완료한 과업</div>
            <div className="text-xl font-black">{totalSubmissions}건</div>
          </div>
          <div className="w-px h-8 bg-white/20"></div>
          <div className="text-center px-2">
            <div className="text-xs text-emerald-200">총 몰입 시간</div>
            <div className="text-xl font-black">{totalTimeMinutes}분</div>
          </div>
          <div className="w-px h-8 bg-white/20"></div>
          <div className="text-center px-2">
            <div className="text-xs text-emerald-200">평균 센서 점수</div>
            <div className="text-xl font-black text-amber-300">{avgScore}점</div>
          </div>
        </div>
      </div>

      {/* 학습 지표 3대 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-warm-sm">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span className="font-semibold">학술 기본 어휘(AWL) 누적 정복</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slateText-title">
            {allAwlWords.length} <span className="text-sm font-normal text-stone-400">/ 570 단어</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1 max-h-16 overflow-y-auto">
            {allAwlWords.length > 0 ? (
              allAwlWords.map((w) => (
                <span key={w} className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-mono font-medium">
                  {w}
                </span>
              ))
            ) : (
              <span className="text-xs text-stone-400">과업을 제출하면 활용한 학술 어휘가 기록됩니다.</span>
            )}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-warm-sm">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span className="font-semibold">스스로 고쳐 쓴 자기주도 수정 횟수</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">
            {submissions.reduce((acc, s) => acc + s.attemptsCount, 0)}회 누적 시도
          </div>
          <p className="text-xs text-stone-500 mt-2 leading-relaxed">
            틀린 문제나 미흡한 문장을 AI 대신 스스로 고쳐 쓰는 인지적 성장을 이뤄냈습니다.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-warm-sm">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span className="font-semibold">원문 패러프레이징(Paraphrasing) 역량</span>
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-700">우수 (자체 언어로 재구성)</div>
          <p className="text-xs text-stone-500 mt-2 leading-relaxed">
            지문 문장을 단순 복사하지 않고 자신만의 학술 표현과 문장 구조로 전환하였습니다.
          </p>
        </div>
      </div>

      {/* 포트폴리오 메인: 제출물 리스트 & 상세 뷰어 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 좌측: 제출한 과업 리스트 */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 shadow-warm-sm p-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <h2 className="font-bold text-slateText-title text-sm">내가 완성한 과업 포트폴리오</h2>
            </div>
            <span className="text-xs text-stone-400 font-mono">{submissions.length}개의 기록</span>
          </div>

          {submissions.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs">
              아직 제출한 과업이 없습니다. [학습 스튜디오]에서 과업을 완료해 보세요!
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
              {submissions.map((sub) => {
                const isSelected = selectedSub?.id === sub.id;
                return (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedSub(sub)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-400 shadow-xs'
                        : 'bg-stone-50/60 border-stone-200/80 hover:bg-stone-100/80'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
                      <span className="px-2 py-0.2 rounded bg-white border border-stone-200 font-medium">
                        {sub.mode.toUpperCase()}
                      </span>
                      <span>{new Date(sub.submittedAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-bold text-xs text-slateText-title line-clamp-1">
                      {sub.activityTitle}
                    </h3>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-200/50 text-[11px]">
                      <span className="text-stone-500">
                        {sub.timeSpentSeconds}초 소요 · {sub.attemptsCount}회 다듬음
                      </span>
                      <span className="font-bold text-emerald-700">
                        {sub.sensorReport.overallScore}점
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 우측: 선택된 제출물 상세 보기 & 지능형 센서 결과 */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 shadow-warm-sm p-6">
          {selectedSub ? (
            <div className="space-y-5">
              {/* 상단 헤더 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                <div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    제출 완료 산출물
                  </span>
                  <h2 className="text-base font-bold text-slateText-title mt-1.5">
                    {selectedSub.activityTitle}
                  </h2>
                  <p className="text-xs text-stone-400 mt-0.5">
                    제출 시각: {new Date(selectedSub.submittedAt).toLocaleString()}
                  </p>
                </div>

                {onSelectActivity && (
                  <button
                    onClick={() => onSelectActivity(selectedSub.activityId)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>이 과업 다시 풀기</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* 학생이 제출한 영문 본문 */}
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-2">
                  ✍️ 내가 작성한 최종 완성 에세이
                </label>
                <div className="p-4 rounded-xl bg-stone-50/70 border border-stone-200 text-xs text-slateText-body font-mono leading-relaxed shadow-inner">
                  {selectedSub.studentOutput}
                </div>
              </div>

              {/* 메모가 있는 경우 */}
              {selectedSub.notes && (
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-2">
                    💡 1단계 사전 생각 정리 및 근거 메모
                  </label>
                  <div className="p-3 bg-amber-50/50 border border-amber-200/80 rounded-xl text-xs text-stone-700">
                    {selectedSub.notes}
                  </div>
                </div>
              )}

              {/* 지능형 센서 진단 리포트 */}
              <div className="pt-2">
                <IntelligentSensorReport report={selectedSub.sensorReport} />
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-stone-400 text-xs">
              왼쪽 목록에서 확인하고 싶은 과업을 선택해 주세요.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
