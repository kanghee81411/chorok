// [청록] SavedView.tsx - 저장한 활동 화면 (Bento Grid 스타일: PRD ① 찜 & 마감 일정 관리 - 전체 / 곧 마감 / 이번 주 / 완료를 달력 및 리스트 형태로 제공)

import React, { useState } from 'react';
import {
  Bookmark,
  Calendar as CalendarIcon,
  List,
  Clock,
  CheckCircle2,
  AlertCircle,
  Compass,
  BellRing,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CalendarView } from '../components/CalendarView';
import { ActivityCard } from '../components/ActivityCard';

export const SavedView: React.FC = () => {
  const { activities, userProfile, setCurrentView } = useApp();

  const [filterTab, setFilterTab] = useState<'all' | 'due_soon' | 'this_week' | 'completed'>(
    'all'
  );
  const [displayMode, setDisplayMode] = useState<'calendar' | 'list'>('calendar');

  // 사용자가 찜한 활동들
  const savedActivities = activities.filter((a) =>
    userProfile.savedActivityIds.includes(a.id)
  );

  // 탭 필터링
  const filteredActivities = savedActivities.filter((act) => {
    if (filterTab === 'due_soon') {
      return act.isUrgent;
    }
    if (filterTab === 'this_week') {
      // 이번 주 활동 (간단한 날짜 비교)
      return act.activityPeriod.daysOfWeek.includes('토') || act.activityPeriod.daysOfWeek.includes('일');
    }
    if (filterTab === 'completed') {
      return userProfile.completedActivityIds.includes(act.id);
    }
    return true;
  });

  const urgentCount = savedActivities.filter((a) => a.isUrgent).length;

  return (
    <div className="space-y-6 pb-16">
      {/* 1. 상단 벤토 헤더 & 알림 안내 바 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 헤더 타이틀 & 모드 스위처 (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-700">
                <Bookmark className="w-5 h-5 fill-rose-600" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                  PRD 핵심 기능 ①
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight mt-1">
                  저장한 활동 & 마감 일정 캘린더
                </h1>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-2 leading-relaxed">
              관심 등록한 <strong>{savedActivities.length}개 활동</strong>의 마감 일정과 실시간 진행 현황을 달력 및 목록 뷰로 손쉽게 관리하세요.
            </p>
          </div>

          {/* 달력 / 목록 스위치 */}
          <div className="mt-6 pt-5 border-t border-stone-100 flex items-center justify-between flex-wrap gap-3">
            <div className="text-xs font-bold text-stone-600">
              보기 모드 선택:
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl">
              <button
                id="saved-mode-calendar-btn"
                onClick={() => setDisplayMode('calendar')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  displayMode === 'calendar'
                    ? 'bg-white text-emerald-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <CalendarIcon className="w-4 h-4 text-emerald-600" />
                <span>달력 뷰</span>
              </button>
              <button
                id="saved-mode-list-btn"
                onClick={() => setDisplayMode('list')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  displayMode === 'list'
                    ? 'bg-white text-emerald-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <List className="w-4 h-4 text-emerald-600" />
                <span>목록 뷰</span>
              </button>
            </div>
          </div>
        </div>

        {/* 마감 임박 알림 벤토 타일 (4 cols) */}
        <div className="lg:col-span-4 bg-linear-to-br from-amber-500 to-amber-600 text-white rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between text-amber-100 text-xs font-extrabold mb-3">
              <span className="flex items-center gap-1.5">
                <BellRing className="w-4 h-4 text-white" />
                마감 알림 현황
              </span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-[11px] font-bold">
                D-3 이내
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white">
              {urgentCount}건 <span className="text-sm font-semibold text-amber-100">마감 임박</span>
            </h3>

            <p className="text-xs text-amber-100 mt-2 leading-relaxed">
              찜한 활동의 신청 마감 3일 전과 당일에 카카오 알림톡 및 인앱 알림 센터로 마감 브리핑이 발송됩니다.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-amber-400/40 text-[11px] text-amber-100 flex items-center justify-between">
            <span>놓치지 말고 신청서를 접수하세요!</span>
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      </div>

      {/* 2. 본문 콘텐츠: 달력 뷰 or 리스트 뷰 */}
      {savedActivities.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-stone-300 p-12 sm:p-16 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
            <Bookmark className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-stone-900">
              아직 저장한 관심 활동이 없습니다.
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-md mx-auto leading-relaxed">
              활동 카드의 북마크 아이콘을 누르면 마감 알림과 상세 일정이 내 달력에 즉시 등록됩니다.
            </p>
          </div>
          <button
            onClick={() => setCurrentView('explore')}
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-700/20 inline-flex items-center gap-2 active:scale-95 transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>맞춤 활동 탐색하러 가기</span>
          </button>
        </div>
      ) : displayMode === 'calendar' ? (
        <CalendarView
          activities={savedActivities}
          filterTab={filterTab}
          setFilterTab={setFilterTab}
        />
      ) : (
        <div className="space-y-4">
          {/* 필터 탭 바 (Bento Capsule) */}
          <div className="bg-white rounded-3xl border border-stone-200/90 p-4 flex items-center gap-2 flex-wrap shadow-xs">
            {(['all', 'due_soon', 'this_week', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${
                  filterTab === tab
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {tab === 'all'
                  ? `전체 (${savedActivities.length})`
                  : tab === 'due_soon'
                  ? `곧 마감 (${urgentCount})`
                  : tab === 'this_week'
                  ? '이번 주 활동'
                  : '참여 완료'}
              </button>
            ))}
          </div>

          {/* 목록 카드 렌더링 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((act) => (
              <ActivityCard key={act.id} activity={act} layout="grid" />
            ))}
          </div>
        </div>
      )}
      {/* 3. 놓치지 말아야 할 전체 마감 임박 활동 (D-3 이내) 브리핑 섹션 */}
      {activities.filter((a) => a.isUrgent).length > 0 && (
        <div className="mt-10 pt-8 border-t border-stone-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-stone-900">
                  🔥 놓치면 마감되는 실시간 임박 활동
                </h3>
                <p className="text-xs text-stone-500">
                  현재 접수 마감이 3일 이내로 임박한 전체 추천 공고입니다.
                </p>
              </div>
            </div>
            <button
              onClick={() => setCurrentView('explore')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              전체 공고 보기 →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {activities
              .filter((a) => a.isUrgent)
              .map((urgentAct) => (
                <ActivityCard key={`urgent-${urgentAct.id}`} activity={urgentAct} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

