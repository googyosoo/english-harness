import React, { useState } from 'react';
import { ActivityContent } from '../types/harness';
import { 
  ArrowUpRight, Sparkles, Trash2, CheckSquare, Square, 
  RotateCcw, AlertTriangle, Check 
} from 'lucide-react';

interface DashboardCardsProps {
  activities: ActivityContent[];
  onSelectActivity: (activity: ActivityContent) => void;
  selectedActivityId?: string;
  onDeleteActivity?: (activityId: string) => void;
  onDeleteMultipleActivities?: (activityIds: string[]) => void;
  onClearAllActivities?: () => void;
  onResetDefaultActivities?: () => void;
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({
  activities,
  onSelectActivity,
  selectedActivityId,
  onDeleteActivity,
  onDeleteMultipleActivities,
  onClearAllActivities,
  onResetDefaultActivities,
}) => {
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 체크박스 토글
  const handleToggleSelect = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // 전체 선택 / 해제
  const handleSelectAll = () => {
    if (selectedIds.size === activities.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(activities.map((a) => a.id)));
    }
  };

  // 개별 삭제
  const handleDeleteSingle = (e: React.MouseEvent, item: ActivityContent) => {
    e.stopPropagation();
    if (window.confirm(`'${item.title}' 문항을 스튜디오에서 삭제하시겠습니까?`)) {
      if (onDeleteActivity) onDeleteActivity(item.id);
    }
  };

  // 선택 문항 삭제
  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`선택한 ${selectedIds.size}개 문항을 스튜디오에서 삭제하시겠습니까?`)) {
      if (onDeleteMultipleActivities) {
        onDeleteMultipleActivities(Array.from(selectedIds));
        setSelectedIds(new Set());
        setIsSelectMode(false);
      }
    }
  };

  // 전체 삭제
  const handleClearAll = () => {
    if (activities.length === 0) return;
    if (window.confirm('현재 스튜디오에 등록된 모든 문항을 삭제하시겠습니까?\n(필요 시 "기본 문항 복구" 버튼으로 언제든 되돌릴 수 있습니다)')) {
      if (onClearAllActivities) onClearAllActivities();
      setSelectedIds(new Set());
      setIsSelectMode(false);
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6">
      {/* 섹션 타이틀 및 문항 관리 툴바 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slateText-title font-sans flex items-center gap-2">
            처음이라면 이것부터
            <Sparkles className="w-5 h-5 text-honey-500" />
          </h2>
          <p className="text-sm text-slateText-muted mt-0.5">
            학년별 수능·내신 연계 활동과 스스로 생각을 키워주는 6단계 AI 학습 도우미를 경험해보세요.
          </p>
        </div>

        {/* 문항 삭제 및 관리 액션 버튼 모음 */}
        <div className="flex flex-wrap items-center gap-2">
          {activities.length > 0 && (
            <>
              {isSelectMode ? (
                <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-xl border border-stone-200">
                  <button
                    onClick={handleSelectAll}
                    className="px-2.5 py-1 text-xs font-semibold text-stone-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
                  >
                    {selectedIds.size === activities.length ? '선택 해제' : '전체 선택'}
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    disabled={selectedIds.size === 0}
                    className="flex items-center gap-1 px-3 py-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>선택 삭제 ({selectedIds.size})</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsSelectMode(false);
                      setSelectedIds(new Set());
                    }}
                    className="px-2 py-1 text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsSelectMode(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold border border-stone-200 transition-colors cursor-pointer"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-stone-500" />
                  <span>문항 선택 삭제</span>
                </button>
              )}

              <button
                onClick={handleClearAll}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
                title="스튜디오에 등록된 모든 문항 삭제"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>전체 삭제</span>
              </button>
            </>
          )}

          {/* 기본 문항 복구 버튼 (문항이 비었거나 초기화 원할 때) */}
          {onResetDefaultActivities && (
            <button
              onClick={onResetDefaultActivities}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition-colors cursor-pointer"
              title="기본 교육과정 8개 문항 다시 불러오기"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span>기본 문항 복구</span>
            </button>
          )}

          <div className="text-xs text-slateText-muted pl-1">
            <span>총 {activities.length}개 활동</span>
          </div>
        </div>
      </div>

      {/* 문항이 하나도 없을 때 비어있음 안내 */}
      {activities.length === 0 ? (
        <div className="py-16 bg-white rounded-3xl border-2 border-dashed border-stone-300 text-center space-y-3 p-6">
          <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
          </div>
          <h3 className="text-base font-bold text-slateText-title">등록된 문항이 없습니다</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            문항이 모두 삭제되었습니다. 상단의 <strong>[📚 기출 문제은행]</strong>에서 새로운 문항을 스튜디오로 추가하거나, <strong>[기본 문항 복구]</strong>를 클릭하세요.
          </p>
          {onResetDefaultActivities && (
            <button
              onClick={onResetDefaultActivities}
              className="px-4 py-2 bg-honey-400 hover:bg-honey-500 text-slateText-title font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              기본 문항 즉시 복구하기
            </button>
          )}
        </div>
      ) : (
        /* 카드 그리드 */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {activities.map((item, index) => {
            const isSelected = selectedActivityId === item.id;
            const isChecked = selectedIds.has(item.id);

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (isSelectMode) {
                    const next = new Set(selectedIds);
                    if (next.has(item.id)) next.delete(item.id);
                    else next.add(item.id);
                    setSelectedIds(next);
                  } else {
                    onSelectActivity(item);
                  }
                }}
                className={`group relative p-5 rounded-2xl bg-white border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                  isChecked
                    ? 'border-rose-400 ring-2 ring-rose-400/30 bg-rose-50/20'
                    : isSelected
                    ? 'border-honey-500 ring-2 ring-honey-400/30 shadow-warm-md bg-honey-50/20'
                    : 'border-[#E2E8F0] hover:border-honey-300 hover:shadow-warm-md'
                }`}
              >
                <div>
                  {/* 상단 뱃지 번호 & 삭제/화살표 버튼 */}
                  <div className="flex items-center justify-between mb-3.5">
                    {isSelectMode ? (
                      <div
                        onClick={(e) => handleToggleSelect(e, item.id)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                          isChecked ? 'bg-rose-600 text-white' : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                        }`}
                      >
                        {isChecked ? <Check className="w-4 h-4 stroke-[3]" /> : <Square className="w-4 h-4" />}
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-honey-400 text-slateText-title font-bold text-xs flex items-center justify-center shadow-xs">
                        {index + 1}
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      {/* 개별 문항 삭제 버튼 */}
                      {onDeleteActivity && !isSelectMode && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSingle(e, item)}
                          title="이 문항 삭제"
                          className="w-7 h-7 rounded-full opacity-0 group-hover:opacity-100 hover:bg-rose-100 text-stone-400 hover:text-rose-600 flex items-center justify-center transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <div className="w-7 h-7 rounded-full bg-stone-100 group-hover:bg-honey-100 text-stone-500 group-hover:text-honey-700 flex items-center justify-center transition-colors">
                        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
