// [청록] CalendarView.tsx - 저장한 활동 달력 뷰 (Bento Grid 스타일: 전체 / 곧 마감 / 이번 주 / 완료 필터 탭 및 월간 일정 캘린더)

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { Activity } from '../types';
import { useApp } from '../context/AppContext';

interface CalendarViewProps {
  activities: Activity[];
  filterTab: 'all' | 'due_soon' | 'this_week' | 'completed';
  setFilterTab: (tab: 'all' | 'due_soon' | 'this_week' | 'completed') => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  activities,
  filterTab,
  setFilterTab,
}) => {
  const { setSelectedActivity, userProfile } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // 2026년 8월 기준
  const [selectedDay, setSelectedDay] = useState<number | null>(25);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed (7 = 8월, 8 = 9월)

  // 월 이동
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  // 해당 월의 시작 요일 & 마지막 날짜 계산
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanksArray = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  // 날짜별 활동 매핑 (해당 월의 YYYY-MM-DD 포맷)
  const getActivitiesForDay = (day: number) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

    return activities.filter((act) => {
      // 신청 마감일 또는 활동 시작/진행일 매칭
      const isApplicationEnd = act.applicationPeriod.end === dateStr;
      const isActivityStart = act.activityPeriod.start === dateStr;
      const isActivityWithin =
        dateStr >= act.activityPeriod.start && dateStr <= act.activityPeriod.end;

      return isApplicationEnd || isActivityStart || isActivityWithin;
    });
  };

  const selectedDayActivities = selectedDay ? getActivitiesForDay(selectedDay) : [];

  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden p-6 sm:p-8">
      {/* 달력 상단 필터 탭 & 월 네비게이션 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        {/* 필터 탭 (전체 / 곧 마감 / 이번 주 / 완료) */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl w-fit flex-wrap">
          <button
            id="cal-tab-all"
            onClick={() => setFilterTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              filterTab === 'all'
                ? 'bg-white text-emerald-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            전체 ({activities.length})
          </button>
          <button
            id="cal-tab-due-soon"
            onClick={() => setFilterTab('due_soon')}
            className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              filterTab === 'due_soon'
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            곧 마감
          </button>
          <button
            id="cal-tab-this-week"
            onClick={() => setFilterTab('this_week')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              filterTab === 'this_week'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            이번 주 활동
          </button>
          <button
            id="cal-tab-completed"
            onClick={() => setFilterTab('completed')}
            className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              filterTab === 'completed'
                ? 'bg-stone-800 text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            완료
          </button>
        </div>

        {/* 월 네비게이션 */}
        <div className="flex items-center gap-3">
          <h3 className="text-base sm:text-lg font-black text-stone-900">
            {year}년 {month + 1}월
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 transition-colors"
              aria-label="이전 달"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 transition-colors"
              aria-label="다음 달"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 달력 그리드 & 선택된 일자 상세 2열 Bento 레이아웃 */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 달력 그리드 (2열 차지) */}
        <div className="lg:col-span-2">
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 text-center font-extrabold text-xs text-stone-400 mb-2">
            <span className="text-rose-500">일</span>
            <span>월</span>
            <span>화</span>
            <span>수</span>
            <span>목</span>
            <span>금</span>
            <span className="text-blue-500">토</span>
          </div>

          {/* 일자 셀 그리드 */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {blanksArray.map((_, i) => (
              <div key={`blank-${i}`} className="h-16 sm:h-22 bg-stone-50/50 rounded-2xl" />
            ))}

            {daysArray.map((day) => {
              const dayActs = getActivitiesForDay(day);
              const isSelected = selectedDay === day;
              const hasDue = dayActs.some((a) => a.isUrgent);

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => setSelectedDay(day)}
                  className={`h-16 sm:h-22 p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-300 shadow-xs'
                      : dayActs.length > 0
                      ? 'bg-white border-stone-300/90 hover:border-emerald-400 shadow-2xs'
                      : 'bg-white border-stone-100 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-extrabold ${
                        isSelected
                          ? 'text-emerald-900'
                          : dayActs.length > 0
                          ? 'text-stone-900'
                          : 'text-stone-400'
                      }`}
                    >
                      {day}
                    </span>
                    {hasDue && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="마감 임박" />
                    )}
                  </div>

                  {/* 일정 인디케이터 배지 */}
                  {dayActs.length > 0 && (
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-bold px-1.5 py-0.5 rounded-lg bg-emerald-600 text-white truncate shadow-2xs">
                        {dayActs[0].title}
                      </div>
                      {dayActs.length > 1 && (
                        <span className="text-[9px] text-stone-500 font-bold pl-1">
                          +{dayActs.length - 1}개 더
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 선택된 일자의 활동 카드 패널 (Bento Box) */}
        <div className="bg-stone-50 rounded-3xl p-6 border border-stone-200/90 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-stone-200">
              <h4 className="text-sm font-extrabold text-stone-900 flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-emerald-600" />
                {selectedDay ? `${month + 1}월 ${selectedDay}일 일정` : '날짜를 선택하세요'}
              </h4>
              <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                {selectedDayActivities.length}건
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {selectedDayActivities.length === 0 ? (
                <div className="py-12 text-center text-stone-400 text-xs">
                  선택한 날짜에 예정된 마감 또는 활동 일정이 없습니다.
                </div>
              ) : (
                selectedDayActivities.map((act) => (
                  <div
                    key={act.id}
                    onClick={() => setSelectedActivity(act)}
                    className="p-4 bg-white rounded-2xl border border-stone-200/90 hover:border-emerald-500 shadow-2xs transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900">
                        {act.category}
                      </span>
                      <span className="text-[10px] font-extrabold text-rose-600">
                        마감: {act.applicationPeriod.end}
                      </span>
                    </div>
                    <h5 className="text-xs sm:text-sm font-extrabold text-stone-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                      {act.title}
                    </h5>
                    <p className="text-[11px] text-stone-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      {act.region.city} · {act.format}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-stone-200 text-[11px] text-stone-500 leading-relaxed">
            💡 찜한 활동의 신청 마감 3일 전에는 카카오톡 및 웹 푸시로 마감 브리핑이 발송됩니다.
          </div>
        </div>
      </div>
    </div>
  );
};

