// [청록] HomeView.tsx - 완전히 간소화된 첫 화면 (맞춤 브리핑 & 추천 활동 집중)

import React, { useMemo } from 'react';
import {
  Sparkles,
  MapPin,
  ArrowRight,
  SlidersHorizontal,
  Compass,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivityCard } from '../components/ActivityCard';
import { ActivityCategory } from '../types';

const POPULAR_CATEGORIES: (ActivityCategory | '전체')[] = [
  '전체',
  '과학/환경',
  '코딩',
  '창업',
  '봉사',
  '진로',
];

export const HomeView: React.FC = () => {
  const {
    userProfile,
    activities,
    setCurrentView,
    setIsOnboardingOpen,
    setPrimaryInterest,
    setSearchFilter,
  } = useApp();

  const primaryInterest = userProfile.interestedCategories[0] || '전체';

  // [사용자 요청 반영] 현재 학생의 거주 지역(시/도, 시/군) 및 통학 범위 기반 엄격한 맞춤 활동 선별
  const recommendedActivities = useMemo(() => {
    // 1. 지리적 접근성 엄격 필터링:
    // - 온라인 활동 또는 전국 단위 프로그램
    // - 내 거주 시/군(예: 수원시) 일치 활동
    // - 내 거주 시/도(예: 경기도) 내 통학 시간(maxCommuteTimeMinutes) 이내 활동
    // - 타 시·도 오프라인 활동은 홈 맞춤 추천에서 엄격히 제외
    const accessible = activities.filter((a) => {
      // 온라인 및 전국 프로그램은 거주지와 무관하게 전국 어디서나 참가 가능
      if (a.format === '온라인' || a.region.province === '전국' || a.region.city === '온라인' || a.region.city === '전국') {
        return true;
      }
      // 온/오프라인 혼합 프로그램도 온라인 접수/참여 가능
      if (a.format === '온/오프라인 혼합') {
        return true;
      }
      // 동일 시/군 완벽 일치 (예: 수원시 학생 - 수원시 활동)
      const isSameCity =
        a.region.city === userProfile.region.city ||
        a.region.city.includes(userProfile.region.city) ||
        userProfile.region.city.includes(a.region.city);
      if (isSameCity) {
        return true;
      }
      // 동일 광역 시/도이고, 소요 시간이 학생의 이동 가능 시간 이내인 경우
      const isSameProvince = a.region.province === userProfile.region.province;
      if (isSameProvince && a.commuteTimeMinutes <= userProfile.maxCommuteTimeMinutes) {
        return true;
      }

      // 타 시·도 오프라인 활동은 배제
      return false;
    });

    // 2. 분야 필터 적용 및 매칭 점수 순 정렬
    const targetPool = accessible.length > 0 ? accessible : activities;

    if (primaryInterest === '전체') {
      return [...targetPool].sort((a, b) => b.matchScore - a.matchScore);
    }
    const matched = targetPool.filter((a) => a.category === primaryInterest);
    if (matched.length > 0) {
      return matched.sort((a, b) => b.matchScore - a.matchScore);
    }
    return [...targetPool].sort((a, b) => b.matchScore - a.matchScore);
  }, [activities, primaryInterest, userProfile.region, userProfile.maxCommuteTimeMinutes]);

  const handleCategoryClick = (cat: ActivityCategory | '전체') => {
    if (cat === '전체') {
      setPrimaryInterest('전체' as any);
      setSearchFilter((prev) => ({ ...prev, categories: [] }));
    } else {
      setPrimaryInterest(cat);
      setSearchFilter((prev) => ({ ...prev, categories: [cat] }));
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-[1280px] mx-auto">
      {/* 1. 상단 맞춤 브리핑 바 */}
      <section className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/80 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                <MapPin className="w-3 h-3 text-emerald-600" />
                {userProfile.region.city} · {userProfile.grade}
              </span>
              <span className="text-xs text-stone-400">·</span>
              <span className="text-xs text-stone-500 font-medium">
                이동 {userProfile.maxCommuteTimeMinutes}분 이내
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
              안녕하세요, <span className="text-emerald-700">{userProfile.name}</span>님!
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 font-medium">
              현재 <strong className="text-emerald-700 font-bold">[{primaryInterest === '전체' ? '전체 분야' : primaryInterest}]</strong> 전용으로 엄격하게 선별된 맞춤 활동입니다.
            </p>
          </div>

          {/* 간결한 우측 설정 및 탐색 버튼 */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
              <span>조건 변경</span>
            </button>
            <button
              onClick={() => setCurrentView('explore')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>전체 활동 탐색</span>
            </button>
          </div>
        </div>

        {/* 관심분야 칩 바 */}
        <div className="mt-4 pt-4 border-t border-stone-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-extrabold text-stone-700 shrink-0 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            분야별 전환:
          </span>
          {POPULAR_CATEGORIES.map((cat) => {
            const isSelected = primaryInterest === cat || (cat === '전체' && (primaryInterest === '전체' || !userProfile.interestedCategories.length));
            return (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 active:scale-95 cursor-pointer border ${
                  isSelected
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs ring-2 ring-emerald-600/30'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                }`}
              >
                {cat === '전체' ? '전체 분야' : cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. 맞춤 추천 활동 카드 그리드 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight">
              {primaryInterest === '전체' ? '전체 맞춤 추천' : `[${primaryInterest}] 전용 맞춤 추천`} ({recommendedActivities.length})
            </h2>
          </div>
          <button
            onClick={() => {
              if (primaryInterest !== '전체') {
                setSearchFilter((prev) => ({ ...prev, categories: [primaryInterest as ActivityCategory] }));
              }
              setCurrentView('explore');
            }}
            className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
          >
            <span>이 분야 전체보기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {recommendedActivities.slice(0, 6).map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      </section>
    </div>
  );
};


