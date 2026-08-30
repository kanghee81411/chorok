// [청록] LadderView.tsx - 키워드 설정 기반 실시간 3종 기회 사다리(성장 로드맵) 탐색 화면

import React, { useState, useEffect, useMemo } from 'react';
import {
  GitFork,
  Sparkles,
  Award,
  Layers,
  CheckCircle2,
  TrendingUp,
  Target,
  ArrowRight,
  Route,
  Search,
  Plus,
  X,
  RefreshCw,
  Loader2,
  ChevronRight,
  Compass,
  MapPin,
  Clock,
  BookOpen,
  ArrowLeft,
  Check,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OpportunityLadderView } from '../components/OpportunityLadderView';
import { OpportunityLadder } from '../types';
import {
  KEYWORD_PRESETS,
  generateOpportunityLadders,
} from '../utils/ladderGenerator';

export const LadderView: React.FC = () => {
  const { activities, userProfile, setSelectedActivity } = useApp();

  // 사용자가 선택한 키워드 목록
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(() => {
    const initial: string[] = [];
    if (userProfile.interestedCategories.includes('코딩')) {
      initial.push('생성형AI·LLM', '파이썬·알고리즘');
    }
    if (userProfile.interestedCategories.includes('과학/환경')) {
      initial.push('생명과학·PCR', '기후변화·탄소중립');
    }
    if (userProfile.interestedCategories.includes('창업')) {
      initial.push('소셜벤처·로컬창업');
    }
    if (userProfile.interestedCategories.includes('봉사')) {
      initial.push('1365디지털튜터');
    }
    if (userProfile.interestedCategories.includes('진로')) {
      initial.push('대학학과심층체험');
    }
    return initial.length > 0 ? initial : ['생성형AI·LLM', '생명과학·PCR', '로컬창업'];
  });

  // 직접 입력 키워드 input
  const [customKeywordInput, setCustomKeywordInput] = useState<string>('');

  // 생성 중 로딩 상태
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // 실시간 생성된 3종 사다리 목록
  const [generatedLadders, setGeneratedLadders] = useState<OpportunityLadder[]>([]);

  // 현재 상세 보기 중인 사다리 ID (null이면 3종 핵심 요약 비교 화면 표시)
  const [inspectedLadderId, setInspectedLadderId] = useState<string | null>(null);

  // 키워드 기반 사다리 실시간 생성 실행
  const handleRunInvestigation = (keywordsToUse = selectedKeywords) => {
    setIsGenerating(true);
    setTimeout(() => {
      const results = generateOpportunityLadders(keywordsToUse, activities, userProfile);
      setGeneratedLadders(results);
      setIsGenerating(false);
    }, 600);
  };

  // 마운트 시 최초 1회 생성
  useEffect(() => {
    handleRunInvestigation(selectedKeywords);
  }, []);

  // 키워드 토글 (프리셋)
  const togglePresetKeyword = (kw: string) => {
    let next: string[];
    if (selectedKeywords.includes(kw)) {
      next = selectedKeywords.filter((k) => k !== kw);
    } else {
      next = [...selectedKeywords, kw];
    }
    setSelectedKeywords(next);
  };

  // 직접 입력 키워드 추가
  const handleAddCustomKeyword = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customKeywordInput.trim();
    if (!trimmed) return;
    if (!selectedKeywords.includes(trimmed)) {
      setSelectedKeywords((prev) => [...prev, trimmed]);
    }
    setCustomKeywordInput('');
  };

  // 키워드 삭제
  const removeKeyword = (kw: string) => {
    setSelectedKeywords((prev) => prev.filter((k) => k !== kw));
  };

  // 현재 상세 보기 중인 사다리 객체
  const activeDetailedLadder = useMemo(() => {
    if (!inspectedLadderId) return null;
    return generatedLadders.find((l) => l.id === inspectedLadderId) || generatedLadders[0] || null;
  }, [inspectedLadderId, generatedLadders]);

  return (
    <div className="space-y-6 pb-20 selection:bg-teal-200 selection:text-teal-950">
      {/* 1. 상단 키워드 설정 & 조사 컨트롤 바 (언제든 재설정 가능) */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="p-2.5 rounded-2xl bg-teal-100 text-teal-800 shrink-0">
                <GitFork className="w-5 h-5 text-teal-700" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  실시간 성장 로드맵 생성기
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight mt-0.5">
                  청소년 기회 사다리 조사 & 맞춤 설계
                </h1>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
              관심 키워드를 설정하면, <strong>{userProfile.region.province} {userProfile.region.city}</strong>의 활동 탐색 데이터와 전국 기회를 연계하여 <strong>3가지 성장 경로(사다리)</strong>를 실시간으로 설계해 드립니다.
            </p>
          </div>

          {/* 사다리 실시간 생성 버튼 */}
          <button
            id="run-ladder-investigation-btn"
            onClick={() => handleRunInvestigation()}
            disabled={isGenerating}
            className="px-6 py-3.5 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-teal-900/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-teal-300" />
                <span>데이터 실시간 조사 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>맞춤 사다리 3종 실시간 생성</span>
              </>
            )}
          </button>
        </div>

        {/* 키워드 설정 영역 */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="text-xs font-black text-stone-800 flex items-center gap-1.5">
              <Route className="w-3.5 h-3.5 text-teal-600" />
              <span>추천 키워드 선택 및 직접 입력 (다중 선택 가능):</span>
            </label>

            {/* 직접 입력 폼 */}
            <form onSubmit={handleAddCustomKeyword} className="flex items-center gap-1.5 w-full sm:w-80">
              <input
                id="custom-keyword-input"
                type="text"
                value={customKeywordInput}
                onChange={(e) => setCustomKeywordInput(e.target.value)}
                placeholder="직접 키워드 입력 (예: 드론, 소논문, 로봇)"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-stone-50 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold shrink-0 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>추가</span>
              </button>
            </form>
          </div>

          {/* 선택된 활성 키워드 뱃지 목록 */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-stone-50 rounded-2xl border border-stone-200 min-h-[48px]">
            <span className="text-[11px] font-extrabold text-stone-500 mr-1">
              선택된 키워드 ({selectedKeywords.length}):
            </span>
            {selectedKeywords.length === 0 ? (
              <span className="text-xs text-stone-400 font-medium">
                아래에서 키워드를 클릭하거나 직접 입력해 주세요.
              </span>
            ) : (
              selectedKeywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-teal-700 text-white text-xs font-black shadow-2xs animate-in zoom-in-95 duration-150"
                >
                  <span>{kw}</span>
                  <button
                    onClick={() => removeKeyword(kw)}
                    className="hover:bg-teal-800 rounded-full p-0.5 transition-colors cursor-pointer"
                    aria-label={`${kw} 삭제`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>

          {/* 분야별 프리셋 키워드 클러스터 */}
          <div className="space-y-2.5 pt-1">
            {KEYWORD_PRESETS.map((preset) => (
              <div key={preset.domain} className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] font-extrabold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-lg shrink-0">
                  {preset.title}
                </span>
                {preset.keywords.map((kw) => {
                  const isSelected = selectedKeywords.includes(kw);
                  return (
                    <button
                      key={kw}
                      type="button"
                      onClick={() => togglePresetKeyword(kw)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-teal-700 text-white border-teal-700 shadow-2xs font-extrabold ring-2 ring-teal-500/20'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {kw}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. 실시간 생성 로딩 인디케이터 */}
      {isGenerating && (
        <div className="bg-teal-50 border border-teal-200 rounded-3xl p-8 text-center space-y-4 shadow-xs animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white mx-auto flex items-center justify-center shadow-md">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-teal-950">
              청록 활동 탐색 DB 및 실시간 데이터를 분석하여 사다리를 구축하고 있습니다...
            </h3>
            <p className="text-xs text-teal-700 font-medium">
              1. 키워드 매칭 분석 → 2. {userProfile.region.city} 지역 거점 프로그램 연계 → 3. 4단계 성장 경로 수립
            </p>
          </div>
        </div>
      )}

      {/* 3. 기회 사다리 화면 (핵심 요약 3종 비교 vs 단일 사다리 상세 보기) */}
      {!isGenerating && generatedLadders.length > 0 && (
        <div>
          {/* ======================================================== */}
          {/* A. 상세 화면 (사용자가 특정 사다리를 클릭했을 때) */}
          {/* ======================================================== */}
          {inspectedLadderId && activeDetailedLadder ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* 상단 네비게이션 바 & 트랙 스위처 */}
              <div className="bg-white rounded-3xl border border-stone-200/90 p-4 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <button
                  id="back-to-overview-btn"
                  onClick={() => setInspectedLadderId(null)}
                  className="px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-black flex items-center gap-2 transition-all cursor-pointer w-fit"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>사다리 3종 비교 목록으로 돌아가기</span>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-stone-500 mr-1">다른 사다리 전환:</span>
                  {generatedLadders.map((lad, idx) => {
                    const isCurrent = lad.id === activeDetailedLadder.id;
                    return (
                      <button
                        key={lad.id}
                        onClick={() => setInspectedLadderId(lad.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border cursor-pointer ${
                          isCurrent
                            ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        사다리 {idx + 1}: {lad.category}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 상세 사다리 인터랙티브 뷰 */}
              <OpportunityLadderView ladder={activeDetailedLadder} />
            </div>
          ) : (
            /* ======================================================== */
            /* B. 핵심 요약 3종 카드 그리드 (처음 들어왔을 때 핵심만 담아 제공) */
            /* ======================================================== */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-teal-600" />
                    <span>실시간 조사 기반 맞춤 성장 사다리 3선</span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5 font-medium">
                    카드를 클릭하면 각 단계별 세부 실천 과제, 필요 역량, 연계 활동 상세 정보를 확인할 수 있습니다.
                  </p>
                </div>
              </div>

              {/* 3종 핵심 요약 벤토 카드 그리드 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {generatedLadders.map((ladder, index) => {
                  const linkedActs = activities.filter((a) =>
                    ladder.nodes.some((n) => n.linkedActivityIds.includes(a.id))
                  );

                  return (
                    <div
                      key={ladder.id}
                      id={`ladder-summary-card-${index}`}
                      onClick={() => setInspectedLadderId(ladder.id)}
                      className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-teal-500/80 transition-all flex flex-col justify-between cursor-pointer group relative overflow-hidden"
                    >
                      {/* 상단 라벨 & 카테고리 */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                            사다리 0{index + 1} · {ladder.category}
                          </span>
                          <span className="text-xs font-bold text-stone-400">
                            총 {ladder.totalStages}단계
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-black text-stone-900 group-hover:text-teal-700 transition-colors leading-snug">
                          {ladder.trackName}
                        </h3>

                        <p className="text-xs text-stone-600 mt-2.5 line-clamp-2 leading-relaxed font-medium">
                          {ladder.description}
                        </p>

                        {/* 키워드 태그 */}
                        {ladder.matchedKeywords && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {ladder.matchedKeywords.map((kw) => (
                              <span
                                key={kw}
                                className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200"
                              >
                                #{kw}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* 4단계 핵심 마일스톤 프리뷰 */}
                        <div className="mt-5 pt-4 border-t border-stone-100 space-y-2">
                          <span className="text-[11px] font-extrabold text-stone-700 flex items-center gap-1">
                            <Route className="w-3 h-3 text-teal-600" />
                            단계별 핵심 마일스톤:
                          </span>
                          <div className="space-y-1.5">
                            {ladder.nodes.map((node) => (
                              <div
                                key={node.id}
                                className="flex items-center gap-2 text-xs bg-stone-50/90 px-3 py-1.5 rounded-xl border border-stone-200/80"
                              >
                                <span className="w-4 h-4 rounded-full bg-teal-700 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                                  {node.stageOrder}
                                </span>
                                <span className="font-bold text-stone-800 truncate">
                                  {node.title.replace(/^\d+단계:\s*/, '')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 최종 도달 목표 요약 */}
                        <div className="mt-4 p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs">
                          <span className="font-extrabold text-amber-900 flex items-center gap-1 mb-0.5">
                            <Award className="w-3.5 h-3.5 text-amber-600" />
                            최종 도달 목표
                          </span>
                          <p className="text-[11px] text-stone-700 font-medium line-clamp-2">
                            {ladder.targetOutcome}
                          </p>
                        </div>
                      </div>

                      {/* 하단 연결 활동 프리뷰 & CTA 버튼 */}
                      <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-stone-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-teal-600" />
                          연계 실전 활동 {linkedActs.length}건
                        </span>

                        <span className="text-xs font-black text-teal-700 group-hover:text-teal-800 flex items-center gap-1">
                          <span>상세 로드맵 보기</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
