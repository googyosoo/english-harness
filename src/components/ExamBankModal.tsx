import React, { useState, useMemo, useEffect } from 'react';
import { ExamBankItem, INITIAL_EXAM_BANK_SAMPLES } from '../data/examBank';
import { 
  Search, Filter, BookOpen, Headphones, PenTool, Sparkles, 
  X, Check, ArrowRight, Layers, Loader2, ChevronDown, ChevronUp, 
  Eye, FileText, CheckCircle2 
} from 'lucide-react';

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
  // 원문 전체 펼쳐보기(아코디언/확장) 상태 관리 (펼쳐진 문항 ID Set)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

// 검색 키워드 하이라이트 렌더러 함수
const renderHighlightedText = (text: string, query: string) => {
  if (!query.trim() || !text) return <>{text}</>;

  const trimmed = query.trim();
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const isShortAlpha = /^[a-zA-Z]{1,4}$/.test(trimmed);

  let regex: RegExp;
  if (isShortAlpha) {
    regex = new RegExp(`(\\b${escaped}\\b)`, 'gi');
  } else {
    regex = new RegExp(`(${escaped})`, 'gi');
  }

  // ai 검색 시 artificial intelligence 도 하이라이트
  if (trimmed.toLowerCase() === 'ai') {
    regex = new RegExp(`(\\bAI\\b|\\bartificial intelligence\\b)`, 'gi');
  }

  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, idx) => {
        if (!part) return null;
        const isMatch = regex.test(part);
        // regex 상태 리셋
        regex.lastIndex = 0;
        return isMatch ? (
          <mark
            key={idx}
            className="bg-amber-300 text-amber-950 font-bold px-1 py-0.5 rounded shadow-xs"
          >
            {part}
          </mark>
        ) : (
          <React.Fragment key={idx}>{part}</React.Fragment>
        );
      })}
    </>
  );
};

// 검색어가 포함된 문맥 스니펫 추출
const getContextSnippet = (text: string, query: string): string => {
  if (!query.trim() || !text) {
    return text.slice(0, 180) + (text.length > 180 ? '...' : '');
  }
  const q = query.trim().toLowerCase();
  const lower = text.toLowerCase();
  let idx = lower.indexOf(q);

  // ai 검색 시 artificial intelligence 위치도 탐색
  if (idx === -1 && q === 'ai') {
    idx = lower.indexOf('artificial intelligence');
  }

  if (idx === -1) {
    return text.slice(0, 180) + (text.length > 180 ? '...' : '');
  }

  const start = Math.max(0, idx - 60);
  const end = Math.min(text.length, idx + q.length + 100);
  const prefix = start > 0 ? '... ' : '';
  const suffix = end < text.length ? ' ...' : '';
  return `${prefix}${text.slice(start, end)}${suffix}`;
};

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

  // 원문 펼치기/접기 토글 함수
  const toggleExpand = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedIds(prev => {
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

  // 키워드 및 필터링 검색 (단어 경계 매칭 및 정확도 가중치 정렬)
  const filtered = useMemo(() => {
    const rawFiltered = items.filter(item => {
      if (showOnlySelected && !selectedIds.has(item.id)) return false;
      if (selectedGrade !== '전체' && item.grade !== selectedGrade) return false;
      if (selectedYear !== '전체' && item.year !== selectedYear) return false;
      if (selectedCategory !== '전체' && item.category !== selectedCategory) return false;
      return true;
    });

    const q = searchWord.trim().toLowerCase();
    if (!q) return rawFiltered;

    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // 영문 1~4글자 단어(예: ai, art, car, law, eco)는 단어 경계(\b) 매칭을 적용해 said, again, start 등 오탐 방지
    const isShortAlpha = /^[a-z]{1,4}$/.test(q);
    const wordBoundaryRegex = new RegExp(`\\b${escaped}\\b`, 'i');

    // 특수 키워드 확장 (ai 검색 시 artificial intelligence 자동 포괄)
    const isAiQuery = q === 'ai' || q === '인공지능';

    const scored = rawFiltered.map(item => {
      const pText = item.passage || item.script || '';
      const pTextLower = pText.toLowerCase();
      const titleLower = item.title.toLowerCase();
      const typeLower = item.type.toLowerCase();
      const wordsLower = (item.words || []).map(w => `${w.word} ${w.meaning}`).join(' ').toLowerCase();

      let score = 0;
      let matched = false;

      // 1. AI 특별 검색 지원
      if (isAiQuery) {
        if (/\b(ai|artificial intelligence)\b/i.test(pText)) {
          matched = true;
          score += 100;
        }
      }

      // 2. 지문 본문(passage/script) 검사
      if (isShortAlpha) {
        if (wordBoundaryRegex.test(pText)) {
          matched = true;
          score += 60;
        }
      } else {
        if (pTextLower.includes(q)) {
          matched = true;
          score += 40;
          if (wordBoundaryRegex.test(pText)) score += 30;
        }
      }

      // 3. 제목이나 유형, 어휘 목록 매칭
      if (titleLower.includes(q) || typeLower.includes(q)) {
        matched = true;
        score += 30;
      }
      if (wordsLower.includes(q)) {
        matched = true;
        score += 25;
      }

      return { item, score, matched };
    });

    return scored
      .filter(s => s.matched)
      .sort((a, b) => b.score - a.score)
      .map(s => s.item);
  }, [items, selectedGrade, selectedYear, selectedCategory, searchWord, showOnlySelected, selectedIds]);

  // 복수 문항 일괄 스튜디오 로드 실행
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* 모달 상단 헤더 */}
        <div className="p-5 sm:p-6 bg-[#FDFBF7] border-b border-stone-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="w-8 h-8 rounded-xl bg-honey-400 text-slateText-title flex items-center justify-center font-bold text-sm shadow-xs">
                📚
              </span>
              <h3 className="text-xl font-extrabold text-slateText-title font-sans">
                2020~2026 기출문항 탐색기 & 지문 뷰어
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {isLoading ? '문항 데이터 불러오는 중...' : `총 ${items.length.toLocaleString()}문항 보유`}
              </span>
              {selectedIds.size > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-xs">
                  {selectedIds.size}개 문항 선택됨
                </span>
              )}
            </div>
            <p className="text-xs text-slateText-muted">
              키워드로 지문을 실시간 검색하고, <strong>카드를 클릭하여 지문 전체 원문을 확인</strong>한 뒤 원하는 문항을 스튜디오로 추가할 수 있습니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 필터 바 (키워드 검색창, 학년, 연도, 영역 필터) */}
        <div className="p-4 bg-stone-50/90 border-b border-stone-200 space-y-3">
          {/* 1열: 키워드 검색창 및 학년 필터 */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                placeholder="지문 속 단어, 핵심 주제, 키워드(예: artificial intelligence, ethical, sleep 등) 검색..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-honey-500 shadow-inner"
              />
              {searchWord && (
                <button
                  onClick={() => setSearchWord('')}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 text-xs cursor-pointer"
                >
                  지우기
                </button>
              )}
            </div>

            {/* 학년 칩 */}
            <div className="flex items-center gap-1">
              {(['전체', '고1', '고2', '고3'] as const).map(g => (
                <button
                  key={g}
                  onClick={() => setSelectedGrade(g)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                  className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
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
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
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
                  className={`ml-2 px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
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
                    : `${selectedIds.size}개 문항이 선택되었습니다. (다중 텍스트 비교 대조 & Synthesis 작문 지원)`}
                </span>
                <button
                  onClick={clearSelection}
                  className="text-stone-400 hover:text-stone-700 underline text-[11px] ml-1 cursor-pointer"
                >
                  선택 초기화
                </button>
              </div>

              <button
                onClick={handleLoadSelectedBatch}
                className="w-full sm:w-auto px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-honey-300" />
                <span>선택한 {selectedIds.size}개 문항 스튜디오로 넣기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* 문항 목록 리스트 */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-honey-500 animate-spin mx-auto" />
              <p className="text-xs text-stone-500">기출문항 데이터베이스를 탐색하는 중입니다...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <p className="text-sm font-bold text-stone-600">검색 조건에 일치하는 문항이 없습니다.</p>
              <p className="text-xs text-stone-400">다른 키워드로 검색하거나 필터를 초기화해 보세요.</p>
            </div>
          ) : (
            filtered.map((item) => {
              const isSelected = selectedIds.has(item.id);
              const isExpanded = expandedIds.has(item.id);
              const rawText = item.script || item.passage || '';

              return (
                <div
                  key={item.id}
                  onClick={() => toggleExpand(item.id)}
                  className={`p-4 rounded-2xl transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/40 border-indigo-300 shadow-xs'
                      : isExpanded
                      ? 'bg-amber-50/20 border-honey-300 shadow-sm'
                      : 'hover:bg-stone-50/80 border-stone-200'
                  }`}
                >
                  {/* 상단 라인: 체크박스 + 메타 뱃지 + 액션 버튼 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      {/* 선택 체크박스 */}
                      <div 
                        className="pt-1"
                        onClick={(e) => toggleSelect(item.id, e)}
                      >
                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-indigo-600 border-indigo-600 text-white' 
                            : 'bg-white border-stone-300 hover:border-indigo-400'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>

                      {/* 정보 영역 */}
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
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

                        <h4 className="font-bold text-sm text-slateText-title flex items-center gap-2">
                          <span>{renderHighlightedText(item.title, searchWord)}</span>
                          <span className="text-xs text-honey-600 font-normal flex items-center gap-0.5">
                            {isExpanded ? (
                              <span className="flex items-center text-stone-400 text-[11px]">
                                접기 <ChevronUp className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <span className="flex items-center text-honey-600 text-[11px] font-medium">
                                원문 전체 보기 <ChevronDown className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </span>
                        </h4>
                      </div>
                    </div>

                    {/* 우측 버튼: 스튜디오 추가 */}
                    <div className="flex items-center gap-2 shrink-0 sm:self-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onLoadExamItem(item);
                          onClose();
                        }}
                        className="px-3.5 py-2 bg-honey-400 hover:bg-honey-500 text-slateText-title font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>스튜디오에 넣기</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 지문 내용: 접혀있을 때는 검색 키워드 중심 스니펫, 펼쳐졌을 때는 원문 전체 및 하이라이트 표시 */}
                  <div className="mt-2.5 pl-8">
                    {isExpanded ? (
                      <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-inner space-y-3 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                          <span className="text-xs font-bold text-slateText-title flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-honey-600" />
                            {item.category === 'listening' ? '듣기 원어민 대본 전체 원문' : '독해 지문 전체 원문'}
                          </span>
                          <span className="text-[11px] text-stone-400 font-mono">
                            총 {rawText.split(/\s+/).filter(Boolean).length}단어
                          </span>
                        </div>
                        
                        <div className="text-xs text-slateText-body leading-relaxed font-serif whitespace-pre-line select-text">
                          {renderHighlightedText(rawText, searchWord)}
                        </div>

                        {/* 단어장이 있을 경우 단어 목록 표시 */}
                        {item.words && item.words.length > 0 && (
                          <div className="pt-2 border-t border-stone-100">
                            <span className="text-[11px] font-bold text-stone-500 mb-1.5 block">
                              핵심 어휘 목록
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {item.words.map((w, wIdx) => (
                                <span
                                  key={wIdx}
                                  className="px-2 py-0.5 bg-stone-50 border border-stone-200 rounded text-[11px] text-stone-700 font-mono"
                                >
                                  <strong>{renderHighlightedText(w.word, searchWord)}</strong>: {w.meaning}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-slateText-body/80 line-clamp-2 leading-relaxed font-serif">
                        {renderHighlightedText(getContextSnippet(rawText, searchWord), searchWord)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 하단 푸터 바 */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-slateText-muted">
          <div className="flex items-center gap-2">
            <span>검색 결과: <strong>{filtered.length}</strong>개 문항</span>
            {selectedIds.size > 0 && (
              <span className="text-indigo-600 font-bold">({selectedIds.size}개 선택 중)</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <button
                onClick={handleLoadSelectedBatch}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
              >
                선택한 {selectedIds.size}개 스튜디오로 넣기
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl font-medium text-stone-700 cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
