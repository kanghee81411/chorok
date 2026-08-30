// [청록] CommunityRequestsView.tsx - PRD ③ '우리 동네에도 만들어주세요' 청소년 요청 및 커뮤니티 청원 보드 화면 (Bento Grid 스타일)

import React, { useState } from 'react';
import {
  MessageSquarePlus,
  ThumbsUp,
  MapPin,
  Calendar,
  Coins,
  Send,
  Building,
  CheckCircle2,
  Sparkles,
  Search,
  Filter,
  Users,
  Target,
  FileCheck2,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivityCategory } from '../types';

export const CommunityRequestsView: React.FC = () => {
  const {
    communityRequests,
    toggleSupportRequest,
    deleteCommunityRequest,
    setIsRequestModalOpen,
    userProfile,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const filteredRequests = communityRequests
    .filter(
      (r) =>
        !r.title.includes('느금마') &&
        !r.description.includes('느금마') &&
        !r.authorName.includes('느금마')
    )
    .filter((req) => {
      if (selectedCategory !== '전체' && req.category !== selectedCategory) return false;
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase();
        const matchTitle = req.title.toLowerCase().includes(kw);
        const matchCity = req.region.city.toLowerCase().includes(kw);
        const matchDesc = req.description.toLowerCase().includes(kw);
        if (!matchTitle && !matchCity && !matchDesc) return false;
      }
      return true;
    });

  const totalSupportSum = communityRequests.reduce((sum, r) => sum + r.supportCount, 0);
  const deliveredCount = communityRequests.filter((r) => r.status === '지자체/기업전달' || r.status === '개설완료').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case '수렴중':
        return 'bg-blue-50 text-blue-800 border-blue-200 font-bold';
      case '검토중':
        return 'bg-amber-50 text-amber-900 border-amber-300 font-bold';
      case '지자체/기업전달':
        return 'bg-emerald-50 text-emerald-950 border-emerald-400 font-black shadow-2xs';
      case '개설완료':
        return 'bg-purple-50 text-purple-900 border-purple-300 font-black shadow-2xs';
      default:
        return 'bg-stone-50 text-stone-600 border-stone-200';
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. 상단 벤토 그리드 헤더 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 메인 히어로 타일 (8 cols) */}
        <div className="lg:col-span-8 bg-linear-to-br from-emerald-800 via-teal-900 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-extrabold border border-white/15 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>PRD 핵심 기능 ③ 커뮤니티 청원</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              우리 동네에도 만들어주세요!
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed mt-2 max-w-2xl">
              지방이라 배움과 체험 기회가 부족했던 청소년들의 목소리를 모읍니다. 같은 지역 친구들의 요청이 <strong>20명 이상</strong> 모이면 지자체 청소년재단 및 협력 기업에 공식 프로그램 제안서로 전달됩니다.
            </p>
          </div>

          <div className="relative z-10 mt-6 pt-5 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs text-emerald-100">
              <span className="flex items-center gap-1.5 font-bold">
                <Users className="w-4 h-4 text-emerald-300" />
                누적 지지: {totalSupportSum}표
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5 font-bold">
                <FileCheck2 className="w-4 h-4 text-emerald-300" />
                지자체 전달 완료: {deliveredCount}건
              </span>
            </div>

            <button
              id="request-open-create-modal-btn"
              onClick={() => setIsRequestModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-stone-950 text-xs sm:text-sm font-black shadow-md shadow-emerald-950/20 shrink-0 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>새로운 활동 개설 요청하기</span>
            </button>
          </div>
        </div>

        {/* 개설 절차 안내 벤토 타일 (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-stone-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-xs font-extrabold text-stone-900 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-600" />
                제안서 전달 프로세스
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                공식 연계
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3 text-xs">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center shrink-0 text-[10px]">
                  1
                </span>
                <p className="text-stone-600 text-[11px] leading-snug">
                  학생이 희망 지역, 분야, 일정, 예산을 작성하여 등록
                </p>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center shrink-0 text-[10px]">
                  2
                </span>
                <p className="text-stone-600 text-[11px] leading-snug">
                  지역 친구 20명 지지 달성 시 <strong className="text-stone-800">정식 제안서 자동 생성</strong>
                </p>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center shrink-0 text-[10px]">
                  3
                </span>
                <p className="text-stone-600 text-[11px] leading-snug">
                  충남도청·지자체 청소년진흥원 및 협력 강사진에 직접 전달 & 개설
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 text-[10px] text-stone-400">
            청록 운영진이 매주 금요일 접수된 청원을 검토합니다.
          </div>
        </div>
      </div>

      {/* 2. 필터 및 검색 바 (Bento Capsule) */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['전체', '코딩', '미디어', '디자인', '창업', '진로', '봉사'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="지역(논산, 공주 등), 키워드 검색..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 text-xs bg-stone-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
          />
        </div>
      </div>

      {/* 3. 요청 목록 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRequests.map((req) => {
          const hasSupported = req.supportedByUserIds.includes(userProfile.id);
          const progressPercent = Math.min(
            100,
            Math.round((req.supportCount / req.targetCount) * 100)
          );

          return (
            <div
              key={req.id}
              id={`community-request-card-${req.id}`}
              className="bg-white rounded-3xl border border-stone-200/90 hover:border-emerald-500 p-6 sm:p-7 shadow-xs flex flex-col justify-between transition-all group"
            >
              <div className="space-y-3">
                {/* 상단 메타 바 */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-200/80">
                      {req.category}
                    </span>
                    <span className="text-xs font-bold text-stone-700 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      {req.region.province} {req.region.city}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                        req.status
                      )}`}
                    >
                      {req.status}
                    </span>

                    {(req.userId === userProfile.id || userProfile.isAdmin) && (
                      <button
                        title="요청 삭제하기"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('이 활동 개설 요청을 삭제하시겠습니까?')) {
                            deleteCommunityRequest(req.id);
                          }
                        }}
                        className="p-1 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 제목 및 내용 */}
                <h3 className="text-base sm:text-lg font-black text-stone-900 leading-snug group-hover:text-emerald-800 transition-colors">
                  {req.title}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-line bg-stone-50/70 p-4 rounded-2xl border border-stone-100 font-medium">
                  {req.description}
                </p>

                {/* 상태 진행 코멘트 */}
                {req.statusComment && (
                  <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 text-xs text-teal-950 flex items-start gap-2.5">
                    <Building className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                    <p className="leading-snug font-semibold">{req.statusComment}</p>
                  </div>
                )}

                {/* 조건 요약 (요일, 예산) */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 pt-1">
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    희망 요일: {req.preferredDays.join(', ')}요일
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-medium">
                    <Coins className="w-3.5 h-3.5 text-stone-400" />
                    희망 예산: {req.preferredBudget}
                  </span>
                </div>
              </div>

              {/* 하단 지지(투표) 바 및 액션 */}
              <div className="mt-6 pt-4 border-t border-stone-100 space-y-3">
                {/* 게이지 바 */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-stone-700">
                      지역 청소년 <strong className="text-emerald-700 font-black">{req.supportCount}명</strong> 지지
                    </span>
                    <span className="text-stone-500 text-[11px] font-bold">
                      목표 {req.targetCount}명 ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* 지지하기 버튼 */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-stone-400 font-medium">
                    작성자: {req.authorName} ({req.authorGrade})
                  </span>

                  <button
                    id={`support-btn-${req.id}`}
                    onClick={() => toggleSupportRequest(req.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all active:scale-95 cursor-pointer ${
                      hasSupported
                        ? 'bg-emerald-600 text-white shadow-2xs ring-2 ring-emerald-300'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${hasSupported ? 'fill-white' : ''}`} />
                    <span>{hasSupported ? '나도 함께 개설 지지함' : '개설 지지하기 (+1)'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

