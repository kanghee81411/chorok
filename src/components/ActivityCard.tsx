// [청록] ActivityCard.tsx - 프로그램명·적합도·거리·비용·날짜·D-day·데이터수집유형 표시 Bento Grid 스타일 재사용 활동 카드 컴포넌트

import React from 'react';
import {
  MapPin,
  Clock,
  Coins,
  Calendar,
  Bookmark,
  Sparkles,
  GitFork,
  CheckCircle2,
  Building,
  ArrowUpRight,
} from 'lucide-react';
import { Activity } from '../types';
import { useApp } from '../context/AppContext';

interface ActivityCardProps {
  activity: Activity;
  layout?: 'grid' | 'horizontal';
  showMatchScore?: boolean;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  layout = 'grid',
  showMatchScore = true,
}) => {
  const { toggleSaveActivity, isActivitySaved, setSelectedActivity, userProfile } = useApp();

  const saved = isActivitySaved(activity.id);

  // D-Day 계산 헬퍼
  const getDDay = (endDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: '마감', color: 'bg-stone-200 text-stone-600 border-stone-300' };
    if (diffDays === 0) return { text: 'D-Day', color: 'bg-rose-500 text-white border-rose-600 animate-pulse' };
    if (diffDays <= 3) return { text: `D-${diffDays} (마감임박)`, color: 'bg-amber-500 text-white font-extrabold border-amber-600' };
    return { text: `D-${diffDays}`, color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
  };

  const ddayInfo = getDDay(activity.applicationPeriod.end);

  // 데이터 수집 전략 배지 스타일링
  const getStrategyBadge = (strategy: Activity['collectionStrategy']) => {
    switch (strategy) {
      case '경쟁형':
        return {
          label: '공문/포털 공식수집',
          class: 'bg-blue-50 text-blue-800 border-blue-200',
        };
      case '비경쟁형':
        return {
          label: '제보/자율등록',
          class: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      case '참여형':
        return {
          label: '지자체·기관 직접제휴',
          class: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        };
    }
  };

  const strategyBadge = getStrategyBadge(activity.collectionStrategy);

  if (layout === 'horizontal') {
    return (
      <div
        id={`activity-card-h-${activity.id}`}
        onClick={() => setSelectedActivity(activity)}
        className="group relative bg-white rounded-3xl border border-stone-200/90 hover:border-emerald-500/60 hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer flex flex-col sm:flex-row"
      >
        {/* 썸네일 이미지 */}
        <div className="sm:w-60 h-48 sm:h-auto relative shrink-0 overflow-hidden bg-stone-100">
          <img
            src={activity.imageUrl}
            alt={activity.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />

          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border shadow-2xs ${ddayInfo.color}`}>
              {ddayInfo.text}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white border border-white/20">
              {activity.category}
            </span>
          </div>

          {/* 찜하기 버튼 */}
          <button
            id={`bookmark-btn-h-${activity.id}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleSaveActivity(activity.id);
            }}
            className={`absolute top-3 right-3 p-2.5 rounded-2xl backdrop-blur-md transition-transform active:scale-90 ${
              saved
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-black/40 text-white hover:bg-black/60'
            }`}
            title={saved ? '찜 해제' : '찜 & 마감 알림 예약'}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* 본문 정보 */}
        <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${strategyBadge.class}`}>
                {strategyBadge.label}
              </span>
              {showMatchScore && (
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold border border-emerald-200">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{userProfile.name}님 맞춤 {activity.matchScore}%</span>
                </div>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-extrabold text-stone-900 group-hover:text-emerald-700 transition-colors leading-snug line-clamp-2">
              {activity.title}
            </h3>

            <p className="text-xs text-stone-500 mt-1.5 line-clamp-2 leading-relaxed">
              {activity.summary}
            </p>

            {/* 기회 사다리 연결 힌트 */}
            {activity.ladderStageName && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-50 text-teal-900 text-xs font-bold border border-teal-200">
                <GitFork className="w-3.5 h-3.5 text-teal-600" />
                <span>성장 사다리: {activity.ladderStageName}</span>
              </div>
            )}
          </div>

          {/* 메타데이터 (거리, 비용, 날짜) */}
          <div className="pt-4 mt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1 font-semibold text-stone-700">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                {activity.region.city} ({activity.format === '온라인' ? '온라인' : `${activity.distanceKm}km · 약 ${activity.commuteTimeMinutes}분`})
              </span>
              <span className="flex items-center gap-1 font-extrabold">
                <Coins className="w-3.5 h-3.5 text-amber-600" />
                {activity.fee === 0 ? <strong className="text-emerald-700">전액 무료</strong> : `${activity.fee.toLocaleString()}원`}
              </span>
            </div>
            <div className="flex items-center gap-1 text-stone-500 font-medium text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span>활동 시작: {activity.activityPeriod.start}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 기본 Grid 카드 뷰 (Bento Box 스타일)
  return (
    <div
      id={`activity-card-${activity.id}`}
      onClick={() => setSelectedActivity(activity)}
      className="group bg-white rounded-3xl border border-stone-200/90 hover:border-emerald-500/70 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* 썸네일 이미지 & 오버레이 */}
        <div className="h-48 w-full relative overflow-hidden bg-stone-100">
          <img
            src={activity.imageUrl}
            alt={activity.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

          {/* D-Day & 카테고리 태그 */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border shadow-2xs ${ddayInfo.color}`}>
              {ddayInfo.text}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white border border-white/20">
              {activity.category}
            </span>
          </div>

          {/* 찜하기 버튼 */}
          <button
            id={`bookmark-btn-${activity.id}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleSaveActivity(activity.id);
            }}
            className={`absolute top-3 right-3 p-2.5 rounded-2xl backdrop-blur-md transition-transform active:scale-90 ${
              saved
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-black/40 text-white hover:bg-black/60'
            }`}
            title={saved ? '찜 해제' : '찜 & 마감 알림 받기'}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-white' : ''}`} />
          </button>

          {/* 주최 기관 정보 (이미지 하단 오버레이) */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px]">
            <span className="truncate font-medium flex items-center gap-1 drop-shadow-xs">
              <Building className="w-3 h-3 text-emerald-300" />
              {activity.hostOrg}
            </span>
            <span className="shrink-0 text-white/90 font-bold px-1.5 py-0.5 rounded bg-white/20 backdrop-blur-xs text-[10px]">
              {activity.format}
            </span>
          </div>
        </div>

        {/* 카드 본문 */}
        <div className="p-5">
          {/* 수집 출처 및 맞춤 적합도 */}
          <div className="flex items-center justify-between gap-1 mb-2.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${strategyBadge.class}`}>
              {strategyBadge.label}
            </span>

            {showMatchScore && (
              <span className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                적합도 {activity.matchScore}%
              </span>
            )}
          </div>

          <h3 className="text-base font-extrabold text-stone-900 group-hover:text-emerald-700 transition-colors leading-snug line-clamp-2">
            {activity.title}
          </h3>

          <p className="text-xs text-stone-500 mt-2 line-clamp-2 leading-relaxed">
            {activity.summary}
          </p>

          {/* 기회 사다리 연계 단계 */}
          {activity.ladderStageName && (
            <div className="mt-3.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-teal-50 text-teal-900 text-[11px] font-bold border border-teal-200/90">
              <GitFork className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="truncate">{activity.ladderStageName}</span>
            </div>
          )}
        </div>
      </div>

      {/* 카드 하단 메타 바 (거리, 비용, 마감일) */}
      <div className="px-5 py-3.5 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
        <span className="flex items-center gap-1 font-semibold text-stone-700">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          {activity.region.city}
          {activity.format !== '온라인' && (
            <span className="text-stone-400 font-normal">({activity.distanceKm}km)</span>
          )}
        </span>

        <span className="font-extrabold">
          {activity.fee === 0 ? (
            <span className="text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">무료</span>
          ) : (
            <span className="text-stone-900">{activity.fee.toLocaleString()}원</span>
          )}
        </span>
      </div>
    </div>
  );
};

