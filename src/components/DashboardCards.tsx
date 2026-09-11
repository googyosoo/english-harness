import React from 'react';
import { ActivityContent } from '../types/harness';
import { ArrowUpRight, Sparkles, Shield, Tag } from 'lucide-react';

interface DashboardCardsProps {
  activities: ActivityContent[];
  onSelectActivity: (activity: ActivityContent) => void;
  selectedActivityId?: string;
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({
  activities,
  onSelectActivity,
  selectedActivityId,
}) => {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6">
      {/* 섹션 타이틀 (첨부 이미지의 '처음이라면 이것부터' 스타일) */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slateText-title font-sans flex items-center gap-2">
            처음이라면 이것부터
            <Sparkles className="w-5 h-5 text-honey-500" />
          </h2>
          <p className="text-sm text-slateText-muted mt-0.5">
            학년별 수능·내신 연계 활동과 안전한 6겹 하네스 비계를 직접 경험해보세요.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slateText-muted">
          <span>총 {activities.length}개 활동 등록됨</span>
        </div>
      </div>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {activities.map((item, index) => {
          const isSelected = selectedActivityId === item.id;
          return (
            <div
              key={item.id}
              onClick={() => onSelectActivity(item)}
              className={`group relative p-5 rounded-2xl bg-white border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'border-honey-500 ring-2 ring-honey-400/30 shadow-warm-md bg-honey-50/20'
                  : 'border-[#E2E8F0] hover:border-honey-300 hover:shadow-warm-md'
              }`}
            >
              <div>
                {/* 상단 뱃지 번호 & 화살표 */}
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-7 h-7 rounded-lg bg-honey-400 text-slateText-title font-bold text-xs flex items-center justify-center shadow-xs">
                    {index + 1}
                  </div>
                  <div className="w-7 h-7 rounded-full bg-stone-100 group-hover:bg-honey-100 text-stone-500 group-hover:text-honey-700 flex items-center justify-center transition-colors">
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>

                {/* 학년 및 CEFR 뱃지 */}
                <div className="flex items-center gap-1.5 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    item.grade === 'G1' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : item.grade === 'G2'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-purple-50 text-purple-700 border border-purple-200'
                  }`}>
                    {item.grade === 'G1' ? '고1' : item.grade === 'G2' ? '고2' : '고3'}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-600">
                    {item.cefrLevel}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200/50">
                    {item.lexile}
                  </span>
                </div>

                {/* 카드 제목 */}
                <h3 className="font-bold text-base text-slateText-title group-hover:text-honey-700 transition-colors line-clamp-1">
                  {item.title}
                </h3>

                {/* 서브타이틀 및 개요 */}
                <p className="text-xs text-honey-700/90 font-medium mt-1 mb-2 line-clamp-1">
                  {item.subTitle}
                </p>
                <p className="text-xs text-slateText-muted leading-relaxed line-clamp-2">
                  {item.overview}
                </p>
              </div>

              {/* 하단 태그 목록 */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap gap-1">
                {item.tags.slice(0, 2).map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-[#F8F6F0] text-stone-600 border border-stone-200"
                  >
                    #{tag}
                  </span>
                ))}
                {item.tags.length > 2 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] text-stone-400">
                    +{item.tags.length - 2}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
