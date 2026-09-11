import React, { useState, useMemo, useEffect } from 'react';
import { ExamBankItem, INITIAL_EXAM_BANK_SAMPLES } from '../data/examBank';
import { ActivityContent } from '../types/harness';
import { Search, Filter, BookOpen, Headphones, PenTool, Sparkles, X, Check, ArrowRight, Layers, Loader2 } from 'lucide-react';

interface ExamBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  examItems?: ExamBankItem[];
  onLoadExamItem: (item: ExamBankItem) => void;
  onLoadExamItems?: (items: ExamBankItem[]) => void;
}

export const ExamBankModal: React.FC<ExamBankModalProps> = ({
  isOpen,
  onClose,
  examItems = INITIAL_EXAM_BANK_SAMPLES,
  onLoadExamItem,
  onLoadExamItems,
}) => {
  const [items, setItems] = useState<ExamBankItem[]>(examItems);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<'전체' | '고1' | '고2' | '고3'>('전체');
  const [selectedYear, setSelectedYear] = useState<string>('전체');
  const [selectedCategory, setSelectedCategory] = useState<'전체' | 'listening' | 'reading'>('전체');
  const [searchWord, setSearchWord] = useState('');
  
  // 복수 선택된 문항 ID 상태 (Set)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // 선택된 문항만 보기 토글
  const [showOnlySelected, setShowOnlySelected] = useState(false);

  // 전체 기출 데이터 비동기 로드 (/data/exam_bank.json)
  useEffect(() => {
    if (isOpen && items.length <= 15) {
      setIsLoading(true);
      fetch('/data/exam_bank.json')
        .then(res => res.json())
        .then((data: ExamBankItem[]) => {
          setItems(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.warn('Failed to load full exam_bank.json:', err);
          setIsLoading(false);
        });
    }
  }, [isOpen]);

  // 사용 가능한 연도 목록 추출
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(items.map(i => i.year))).sort().reverse();
    return ['전체', ...years];
  }, [items]);

  // 체크박스 토글 함수
  const toggleSelect = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // 전체 선택 해제
  const clearSelection = () => {
    setSelectedIds(new Set());
    setShowOnlySelected(false);
  };

  // 선택된 객체들 목록
  const selectedItemsList = useMemo(() => {
    return items.filter(item => selectedIds.has(item.id));
  }, [items, selectedIds]);

  // 필터링된 기출 목록
  const filtered = useMemo(() => {
    return items.filter(item => {
      if (showOnlySelected && !selectedIds.has(item.id)) return false;
      if (selectedGrade !== '전체' && item.grade !== selectedGrade) return false;
      if (selectedYear !== '전체' && item.year !== selectedYear) return false;
      if (selectedCategory !== '전체' && item.category !== selectedCategory) return false;
      if (searchWord.trim()) {
        const q = searchWord.toLowerCase();
        const text = `${item.title} ${item.script || ''} ${item.passage || ''} ${item.type}`.toLowerCase();
        return text.includes(q);
      }
      return true;
    });
  }, [items, selectedGrade, selectedYear, selectedCategory, searchWord, showOnlySelected, selectedIds]);

  // 복수 문항 일괄 로드 실행
  const handleLoadSelectedBatch = () => {
    if (selectedItemsList.length === 0) return;
    if (onLoadExamItems) {
      onLoadExamItems(selectedItemsList);
    } else if (onLoadExamItem) {
      onLoadExamItem(selectedItemsList[0]);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* 모달 상단 헤더 */}
        <div className="p-5 sm:p-6 bg-[#FDFBF7] border-b border-stone-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="w-8 h-8 rounded-xl bg-honey-400 text-slateText-title flex items-center justify-center font-bold text-sm shadow-xs">
                📚
              </span>
              <h2 className="text-xl font-bold text-slateText-title font-sans">
                2020~2026 기출 문제은행 탐색기
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-honey-100 text-honey-800 border border-honey-200 flex items-center gap-1.5">
                {isLoading && <Loader2 className="w-3 h-3 animate-spin text-honey-600" />}
                총 {items.length}문항 연동됨
              </span>
              {selectedIds.size > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {selectedIds.size}개 문항 선택됨
                </span>
              )}
            </div>
            <p className="text-xs text-slateText-muted">
              체크박스로 복수의 문항을 선택하여 <strong>다중 지문 비교·대조 작문(Synthesis)</strong> 및 통합 연계 학습을 구성하거나, 개별 문항을 즉시 로드할 수 있습니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 필터 바 (태그 칩 & 다중 선택 필터) */}
        <div className="p-4 bg-stone-50/80 border-b border-stone-200 space-y-3">
          {/* 1열: 검색창 및 학년 필터 */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                placeholder="지문 내용, 키워드, 유형 등으로 실시간 검색..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-honey-500 shadow-inner"
              />
            </div>

            {/* 학년 칩 */}
            <div className="flex items-center gap-1">
              {(['전체', '고1', '고2', '고3'] as const).map(g => (
                <button
                  key={g}
                  onClick={() => setSelectedGrade(g)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedGrade === g
                      ? 'bg-honey-400 text-slateText-title shadow-xs'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* 2열: 연도, 영역, 선택문항 모아보기 필터 */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="font-semibold text-stone-500 mr-1">연도:</span>
              {availableYears.map(y => (
                <button
                  key={y}
                  onClick={() => setSelectedYear(y)}
                  className={`px-2 py-0.5 rounded-lg transition-all ${
                    selectedYear === y
                      ? 'bg-slateText-title text-white font-bold shadow-xs'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  {y === '전체' ? '전체' : `${y}년`}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-stone-500 mr-1">영역:</span>
              {[
                { id: '전체', label: '전체' },
                { id: 'listening', label: '🎧 듣기' },
                { id: 'reading', label: '📖 독해' },
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id as any)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    selectedCategory === c.id
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}

              {/* 선택 문항만 필터링 토글 */}
              {selectedIds.size > 0 && (
                <button
                  onClick={() => setShowOnlySelected(!showOnlySelected)}
                  className={`ml-2 px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    showOnlySelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>선택된 {selectedIds.size}개만 보기</span>
                </button>
              )}
            </div>
          </div>

          {/* 복수 선택 일괄 처리 배너 (1개 이상 선택 시 노출) */}
          {selectedIds.size > 0 && (
            <div className="p-3 bg-gradient-to-r from-amber-50 to-indigo-50 rounded-2xl border border-honey-300 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px]">
                  {selectedIds.size}
                </span>
                <span className="font-semibold text-slateText-title">
                  {selectedIds.size === 1 
                    ? '1개 문항이 선택되었습니다.' 
                    : `${selectedIds.size}개 문항이 복수 선택되었습니다. (다중 텍스트 비교 대조 & Synthesis 작문 지원)`}
                </span>
                <button
                  onClick={clearSelection}
                  className="text-stone-400 hover:text-stone-700 underline text-[11px] ml-1"
                >
                  선택 초기화
                </button>
              </div>

              <button
                onClick={handleLoadSelectedBatch}
                className="w-full sm:w-auto px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-honey-300" />
                <span>선택한 {selectedIds.size}개 문항으로 스튜디오 로드</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* 문항 목록 리스트 */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-stone-100 space-y-3">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-stone-400 text-xs">
              선택하신 조건에 해당하는 기출 문항이 없습니다.
            </div>
          ) : (
            filtered.map((item) => {
              const isSelected = selectedIds.has(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleSelect(item.id)}
                  className={`pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/40 border-indigo-300 shadow-xs'
                      : 'hover:bg-honey-50/30 border-stone-100 hover:border-honey-200'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    {/* 체크박스 */}
                    <div 
                      className="pt-0.5"
                      onClick={(e) => toggleSelect(item.id, e)}
                    >
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-indigo-600 border-indigo-600 text-white' 
                          : 'bg-white border-stone-300 hover:border-indigo-400'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          item.grade === '고1' 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : item.grade === '고2'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {item.grade}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-700">
                          {item.year}년 {item.exam} {item.qNumber}번
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {item.type}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {item.lexile} | {item.cefrLevel}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slateText-title mb-1">
                        {item.title}
                      </h4>

                      <p className="text-xs text-slateText-body/80 line-clamp-2 leading-relaxed font-serif">
                        {item.script || item.passage}
                      </p>

                      {/* 어휘 태그 */}
                      {item.words && item.words.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.words.slice(0, 4).map((w, wIdx) => (
                            <span key={wIdx} className="px-1.5 py-0.5 bg-white border border-stone-200 rounded text-[10px] text-stone-600">
                              {w.word}: {w.meaning}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="sm:text-right flex-shrink-0 flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLoadExamItem(item);
                        onClose();
                      }}
                      className="w-full sm:w-auto px-3.5 py-2 bg-honey-400 hover:bg-honey-500 text-slateText-title font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>이 문항만 시작</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 하단 푸터 바 */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-slateText-muted">
          <div className="flex items-center gap-2">
            <span>현재 결과: <strong>{filtered.length}</strong>개 문항</span>
            {selectedIds.size > 0 && (
              <span className="text-indigo-600 font-bold">({selectedIds.size}개 선택 중)</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <button
                onClick={handleLoadSelectedBatch}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs transition-colors"
              >
                선택한 {selectedIds.size}개 일괄 로드
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg font-medium text-stone-700"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

