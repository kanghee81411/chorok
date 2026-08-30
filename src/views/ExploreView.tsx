// [청록] ExploreView.tsx - 청록 통합 메인 탐색 & 큐레이션 화면 (상세 필터 간소화 토글, 실시간 구글 & 1365 공공데이터 연동, 지역 실시간 반영)

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  MapPin,
  Coins,
  Sparkles,
  LayoutGrid,
  ListFilter,
  MessageSquarePlus,
  Compass,
  Layers,
  RefreshCw,
  Loader2,
  Globe2,
  ChevronDown,
  ChevronUp,
  Filter,
  Check,
  Building2,
  Calendar,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivityCard } from '../components/ActivityCard';
import { Activity, ActivityCategory, DataCollectionStrategy } from '../types';
import { koreanRegions } from '../data/initialData';
import {
  fetchVltrSearchWordList,
  fetchGoogleSmartActivities,
  mapVltrItemToActivity,
} from '../services/volunteerApi';
import { curateActivitiesForUser } from '../utils/curationEngine';

const ALL_CATEGORIES: (ActivityCategory | '전체')[] = [
  '전체',
  '과학/환경',
  '코딩',
  '창업',
  '봉사',
  '진로',
];

const STRATEGIES: { id: string; label: string; desc: string }[] = [
  { id: '전체', label: '전체 수집 채널', desc: '모든 출처' },
  { id: '경쟁형', label: '공모전·대회·연구 (경쟁형)', desc: '공식 포털 & 구글 연동' },
  { id: '비경쟁형', label: '동아리·캠프·특강 (비경쟁형)', desc: '사용자/운영자 제보' },
  { id: '참여형', label: '청소년의회·멘토링 (참여형)', desc: '지자체·기관 직접제휴' },
];

const FEE_OPTIONS = [
  { value: 1000000, label: '비용 무관' },
  { value: 0, label: '무료만' },
  { value: 10000, label: '1만원 이하' },
  { value: 30000, label: '3만원 이하' },
  { value: 50000, label: '5만원 이하' },
  { value: 100000, label: '10만원 이하' },
];

export const ExploreView: React.FC = () => {
  const {
    activities: baseActivities,
    searchFilter,
    setSearchFilter,
    resetSearchFilter,
    setIsRequestModalOpen,
    setIsOnboardingOpen,
    userProfile,
    updateUserProfile,
    showToast,
  } = useApp();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  // [사용자 요청] 상세 검색 설정 간소화 토글 상태 (기본은 접힘, 버튼 클릭 시 펼침)
  const [isFilterExpanded, setIsFilterExpanded] = useState<boolean>(false);

  // 실시간 공공데이터 및 구글 스마트 검색 API 상태
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const [apiItems, setApiItems] = useState<Activity[]>([]);
  const [googleItems, setGoogleItems] = useState<Activity[]>([]);
  const [dataSource, setDataSource] = useState<'all' | 'live_only' | 'preset_only'>('all');

  // 종합 검색 실행 함수 (1365 공공데이터 + 구글 스마트 검색 통합)
  const handleComprehensiveSearch = async (
    kwOverride?: string,
    catOverride?: ActivityCategory[],
    filterOverride?: Partial<typeof searchFilter>
  ) => {
    setApiLoading(true);

    const kw = kwOverride !== undefined ? kwOverride : searchFilter.keyword;
    const cats = catOverride !== undefined ? catOverride : searchFilter.categories;
    const province = filterOverride?.province !== undefined ? filterOverride.province : searchFilter.province;
    const city = filterOverride?.city !== undefined ? filterOverride.city : searchFilter.city;
    const maxFee = filterOverride?.maxFee !== undefined ? filterOverride.maxFee : searchFilter.maxFee;

    try {
      const [vltrRes, googleRes] = await Promise.allSettled([
        fetchVltrSearchWordList({
          keyword: kw.trim() || undefined,
          schSido: province !== '전체' ? province : undefined,
          schSigngu: city !== '전체' ? city : undefined,
          yngbgsPosblAt: 'Y',
          numOfRows: 30,
        }),
        fetchGoogleSmartActivities({
          keyword: kw.trim() || undefined,
          category: cats.length === 1 ? cats[0] : (cats.length > 1 ? cats.join(',') : undefined),
          province: province !== '전체' ? province : undefined,
          city: city !== '전체' ? city : undefined,
          maxFee: maxFee,
        }),
      ]);

      if (vltrRes.status === 'fulfilled' && vltrRes.value?.data?.items) {
        const mapped = vltrRes.value.data.items.map(mapVltrItemToActivity);
        setApiItems(mapped);
      }

      if (googleRes.status === 'fulfilled' && googleRes.value?.data?.items) {
        setGoogleItems(googleRes.value.data.items);
      }
    } catch (err: any) {
      console.warn('Comprehensive search notice:', err);
    } finally {
      setApiLoading(false);
    }
  };

  // 마운트 시 최초 1회 종합 연동 시도
  useEffect(() => {
    handleComprehensiveSearch();
  }, []);

  // 사용 가능한 시/군/구 목록
  const availableCities =
    searchFilter.province !== '전체'
      ? koreanRegions[searchFilter.province] || []
      : [];

  // 카테고리 클릭 시 단일 카테고리 전용 전환 (재클릭 시 전체보기)
  const selectCategory = (cat: ActivityCategory | '전체') => {
    let nextCategories: ActivityCategory[];
    if (cat === '전체') {
      nextCategories = [];
    } else if (searchFilter.categories.length === 1 && searchFilter.categories[0] === cat) {
      nextCategories = [];
    } else {
      nextCategories = [cat];
    }
    setSearchFilter((prev) => ({
      ...prev,
      categories: nextCategories,
    }));
    handleComprehensiveSearch(undefined, nextCategories);
  };

  // 결합된 전체 활동 목록 (구글 검색 결과 + 실시간 1365 API + 기본 등록 활동)
  const combinedActivities = useMemo(() => {
    let rawList: Activity[] = [];
    if (dataSource === 'live_only') {
      rawList = [...googleItems, ...apiItems];
    } else if (dataSource === 'preset_only') {
      rawList = baseActivities;
    } else {
      const existingIds = new Set<string>();
      const combined: Activity[] = [];
      for (const item of [...googleItems, ...apiItems, ...baseActivities]) {
        if (!existingIds.has(item.id)) {
          existingIds.add(item.id);
          combined.push(item);
        }
      }
      rawList = combined;
    }
    return curateActivitiesForUser(rawList, userProfile);
  }, [apiItems, googleItems, baseActivities, dataSource, userProfile]);

  // 필터링 및 정렬 로직 (지역 변경 시 즉각적이고 정확한 매칭)
  const filteredActivities = useMemo(() => {
    return combinedActivities
      .filter((act) => {
        // 1. 키워드 검색
        if (searchFilter.keyword.trim()) {
          const kw = searchFilter.keyword.toLowerCase();
          const matchTitle = act.title.toLowerCase().includes(kw);
          const matchSummary = act.summary.toLowerCase().includes(kw);
          const matchOrg = act.hostOrg.toLowerCase().includes(kw);
          const matchDesc = act.description.toLowerCase().includes(kw);
          const matchCat = act.category.toLowerCase().includes(kw);
          const matchTag = act.tags.some((t) => t.toLowerCase().includes(kw));
          if (!matchTitle && !matchSummary && !matchOrg && !matchDesc && !matchCat && !matchTag) return false;
        }

        // 2. 시/도 지역 필터 (선택된 시/도 일치 or 전국 or 온라인 활동)
        if (searchFilter.province !== '전체') {
          const isNational = act.region.province === '전국' || act.region.city === '전국';
          const isOnline = act.format === '온라인' || act.region.city === '온라인';
          const isSameProvince = act.region.province === searchFilter.province;

          if (!isNational && !isOnline && !isSameProvince) {
            return false;
          }
        }

        // 3. 시/군/구 필터 (선택된 시/군/구 일치 or 시 전체 or 전국 or 온라인)
        if (searchFilter.city !== '전체') {
          const isNational = act.region.province === '전국' || act.region.city === '전국';
          const isOnline = act.format === '온라인' || act.region.city === '온라인';
          const isCityWide = act.region.city === '전체' || act.region.city === '지역';
          const isSameCity =
            act.region.city === searchFilter.city ||
            act.region.city.includes(searchFilter.city) ||
            searchFilter.city.includes(act.region.city);

          if (!isNational && !isOnline && !isCityWide && !isSameCity) {
            return false;
          }
        }

        // 4. 카테고리 분야 필터
        if (
          searchFilter.categories.length > 0 &&
          !searchFilter.categories.includes(act.category)
        ) {
          return false;
        }

        // 5. 비용 필터
        if (searchFilter.maxFee === 0 && act.fee > 0) {
          return false;
        } else if (act.fee > searchFilter.maxFee) {
          return false;
        }

        // 6. 활동 형태 (온/오프라인)
        if (searchFilter.format !== '전체') {
          if (searchFilter.format === '온라인' && act.format !== '온라인' && act.format !== '온/오프라인 혼합') return false;
          if (searchFilter.format === '오프라인' && act.format === '온라인') return false;
        }

        // 7. 데이터 수집 전략
        if (
          searchFilter.strategy !== '전체' &&
          act.collectionStrategy !== searchFilter.strategy
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (searchFilter.sortBy === 'recommend') return b.matchScore - a.matchScore;
        if (searchFilter.sortBy === 'deadline')
          return a.applicationPeriod.end.localeCompare(b.applicationPeriod.end);
        if (searchFilter.sortBy === 'distance') return a.distanceKm - b.distanceKm;
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [combinedActivities, searchFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleComprehensiveSearch(searchFilter.keyword);
    showToast(`"${searchFilter.keyword || '전체'}" 검색 결과입니다.`);
  };

  // 상세 필터 내에서 지역 변경 시 사용자 프로필도 함께 동기화
  const handleProvinceChange = (newProvince: string) => {
    const defaultCity = newProvince === '전체' ? '전체' : (koreanRegions[newProvince]?.[0] || '전체');
    setSearchFilter((prev) => ({
      ...prev,
      province: newProvince,
      city: '전체',
    }));
    if (newProvince !== '전체') {
      updateUserProfile({
        region: {
          province: newProvince,
          city: defaultCity === '전체' ? userProfile.region.city : defaultCity,
        },
      });
    }
    handleComprehensiveSearch(undefined, undefined, { province: newProvince, city: '전체' });
  };

  const handleCityChange = (newCity: string) => {
    setSearchFilter((prev) => ({ ...prev, city: newCity }));
    if (newCity !== '전체' && searchFilter.province !== '전체') {
      updateUserProfile({
        region: {
          province: searchFilter.province,
          city: newCity,
        },
      });
    }
    handleComprehensiveSearch(undefined, undefined, { city: newCity });
  };

  // 활성화된 필터 개수 계산 (버튼 뱃지용)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchFilter.province !== '전체') count++;
    if (searchFilter.city !== '전체') count++;
    if (searchFilter.format !== '전체') count++;
    if (searchFilter.maxFee < 1000000) count++;
    if (searchFilter.strategy !== '전체') count++;
    return count;
  }, [searchFilter]);

  return (
    <div className="space-y-6 pb-16 selection:bg-emerald-200 selection:text-emerald-950">
      {/* 1. 맞춤 브리핑 & 검색 헤더 */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800 shrink-0">
                <Compass className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
                  <span>맞춤 활동 탐색</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    실시간 큐레이션
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-stone-500 mt-1 flex flex-wrap items-center gap-1.5 font-medium">
                  <span>🌿 {userProfile.name}님을 위한 맞춤 추천</span>
                  <span className="text-stone-300">•</span>
                  <span className="text-emerald-700 font-bold">
                    {userProfile.region.province} {userProfile.region.city} ({userProfile.grade})
                  </span>
                  <button
                    onClick={() => setIsOnboardingOpen(true)}
                    className="ml-1 text-[11px] font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                  >
                    지역/학년 변경
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* 통합 검색창 */}
          <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-[440px] flex items-center">
            <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              id="explore-search-input"
              type="text"
              value={searchFilter.keyword}
              onChange={(e) =>
                setSearchFilter((prev) => ({ ...prev, keyword: e.target.value }))
              }
              placeholder="프로그램명, 카테고리(코딩,생명과학), 주최기관 검색..."
              className="w-full pl-10 pr-24 py-3 rounded-2xl border border-stone-300 bg-stone-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-2xs font-medium"
            />
            <button
              id="explore-search-submit-btn"
              type="submit"
              className="absolute right-2 px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <Search className="w-3.5 h-3.5" />
              <span>검색</span>
            </button>
          </form>
        </div>

        {/* 분야별 퀵 탭 (전체, 과학/환경, 코딩, 창업, 봉사, 진로) */}
        <div className="mt-5 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-black text-stone-700 mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              분야 선택:
            </span>
            {ALL_CATEGORIES.map((cat) => {
              const isSelected =
                cat === '전체'
                  ? searchFilter.categories.length === 0
                  : searchFilter.categories.length === 1 && searchFilter.categories[0] === cat;
              return (
                <button
                  key={cat}
                  onClick={() => selectCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs font-black ring-2 ring-emerald-700/20'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {cat === '전체' ? '전체 분야' : cat}
                </button>
              );
            })}
          </div>

          {/* [사용자 요청] 상세 검색 설정 간소화 토글 버튼 */}
          <button
            id="toggle-filter-btn"
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 border cursor-pointer ${
              isFilterExpanded || activeFilterCount > 0
                ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
            <span>상세 검색 설정 / 지역 필터</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center font-black">
                {activeFilterCount}
              </span>
            )}
            {isFilterExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* [사용자 요청] 버튼을 눌렀을 때만 나타나는 자세한 상세 검색 설정 패널 */}
        {isFilterExpanded && (
          <div className="mt-5 pt-5 border-t border-stone-200/80 bg-stone-50/80 rounded-2xl p-5 border border-stone-200 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200/80">
              <div className="flex items-center gap-1.5 text-xs font-black text-stone-800">
                <Filter className="w-3.5 h-3.5 text-emerald-600" />
                <span>상세 조건 및 지역 설정</span>
              </div>
              <button
                onClick={resetSearchFilter}
                className="text-xs text-stone-500 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>조건 전체 초기화</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. 지역 선택 (시/도 및 시/군/구) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-stone-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  지역 선택 (시/도 & 시/군)
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <select
                    value={searchFilter.province}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-stone-300 text-xs bg-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="전체">전국 전체</option>
                    {Object.keys(koreanRegions).map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>

                  <select
                    value={searchFilter.city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-stone-300 text-xs bg-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="전체">시/군 전체</option>
                    {availableCities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. 활동 방식 */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-stone-700">활동 방식</label>
                <div className="grid grid-cols-3 gap-1">
                  {['전체', '오프라인', '온라인'].map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setSearchFilter((prev) => ({ ...prev, format: fmt }))}
                      className={`py-2 px-1.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                        searchFilter.format === fmt
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs font-extrabold'
                          : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. 참가 비용 */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-stone-700 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-600" />
                    참가 비용
                  </span>
                  <span className="text-[11px] text-emerald-700 font-bold">
                    {searchFilter.maxFee === 0
                      ? '무료만'
                      : searchFilter.maxFee >= 1000000
                      ? '비용 무관'
                      : `${(searchFilter.maxFee / 10000).toLocaleString()}만원 이하`}
                  </span>
                </label>
                <select
                  value={searchFilter.maxFee}
                  onChange={(e) =>
                    setSearchFilter((prev) => ({
                      ...prev,
                      maxFee: Number(e.target.value),
                    }))
                  }
                  className="w-full px-2.5 py-2 rounded-xl border border-stone-300 text-xs bg-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {FEE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. 데이터 수집 출처 */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-stone-700 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-stone-500" />
                  수집 출처
                </label>
                <select
                  value={searchFilter.strategy}
                  onChange={(e) =>
                    setSearchFilter((prev) => ({
                      ...prev,
                      strategy: e.target.value,
                    }))
                  }
                  className="w-full px-2.5 py-2 rounded-xl border border-stone-300 text-xs bg-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {STRATEGIES.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 필터 적용 버튼 */}
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  handleComprehensiveSearch();
                  setIsFilterExpanded(false);
                  showToast('필터 조건이 성공적으로 적용되었습니다.');
                }}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>설정 완료 및 결과 보기</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 실시간 API 로딩 배너 */}
      {apiLoading && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs text-emerald-900 animate-pulse">
          <div className="flex items-center gap-2.5">
            <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
            <span className="font-bold">
              구글 실시간 검색 및 행정안전부 1365 공공데이터 프로그램을 동기화하고 있습니다...
            </span>
          </div>
        </div>
      )}

      {/* 2. 활동 목록 결과 영역 */}
      <div className="space-y-4">
        {/* 결과 개수 및 정렬 바 */}
        <div className="bg-white rounded-3xl border border-stone-200/90 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="text-xs sm:text-sm font-black text-stone-900">
              총 <span className="text-emerald-700 font-extrabold text-base">{filteredActivities.length}</span>개의 활동
            </div>
            {searchFilter.province !== '전체' && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                📍 {searchFilter.province} {searchFilter.city !== '전체' ? searchFilter.city : ''}
              </span>
            )}
            {googleItems.length > 0 && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <Globe2 className="w-3 h-3 text-emerald-600" />
                구글 연동 {googleItems.length}건
              </span>
            )}
            {apiItems.length > 0 && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                1365 실시간 {apiItems.length}건
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* 실시간 새로고침 */}
            <button
              onClick={() => handleComprehensiveSearch()}
              disabled={apiLoading}
              className="p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 text-xs font-bold flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
              title="실시간 새로고침"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${apiLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">새로고침</span>
            </button>

            {/* 정렬 셀렉트 */}
            <select
              value={searchFilter.sortBy}
              onChange={(e) =>
                setSearchFilter((prev) => ({
                  ...prev,
                  sortBy: e.target.value as any,
                }))
              }
              className="px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-stone-50 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="recommend">추천 적합도순</option>
              <option value="deadline">마감 임박순</option>
              <option value="distance">가까운 거리순</option>
              <option value="latest">최신 등록순</option>
            </select>

            {/* 뷰 모드 토글 (그리드 / 리스트) */}
            <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-stone-100">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-stone-400 hover:text-stone-700'
                }`}
                aria-label="그리드 보기"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'list' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-stone-400 hover:text-stone-700'
                }`}
                aria-label="리스트 보기"
              >
                <ListFilter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 결과가 없을 때 */}
        {filteredActivities.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-stone-300 p-10 sm:p-16 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <Compass className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-extrabold text-stone-900">
                {apiLoading ? '정보를 검색하고 있습니다...' : '해당 지역 및 조건에 맞는 활동이 아직 등록되지 않았습니다.'}
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
                원하는 활동이 없으신가요? 청록의 <strong>[우리 동네에도 만들어주세요]</strong>를 통해 지자체와 기업에 원하는 프로그램을 직접 요청해 보세요!
              </p>
            </div>

            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <button
                id="empty-open-request-btn"
                onClick={() => setIsRequestModalOpen(true)}
                className="px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-700/20 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <MessageSquarePlus className="w-4 h-4" />
                <span>우리 동네 활동 개설 요청하기</span>
              </button>
              <button
                onClick={resetSearchFilter}
                className="px-4 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
              >
                필터 전체 초기화
              </button>
            </div>
          </div>
        ) : (
          /* 활동 카드 그리드 또는 리스트 */
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {filteredActivities.map((act) => (
              <ActivityCard
                key={act.id}
                activity={act}
                layout={viewMode === 'list' ? 'horizontal' : 'grid'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
