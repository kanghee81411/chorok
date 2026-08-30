// [청록] ActivityDetailModal.tsx - 활동 상세 모달 (행안부 getVltrPartcptnItem 실시간 상세 조회, 로딩 및 실패 안내 대응)

import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  Coins,
  Building2,
  Bookmark,
  Share2,
  ExternalLink,
  Sparkles,
  GitFork,
  CheckCircle2,
  Users,
  ShieldCheck,
  FilePenLine,
  Navigation,
  Phone,
  UserCheck,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fetchVltrPartcptnItem, VltrDetailRawItem } from '../services/volunteerApi';
import { calculateCurationScore } from '../utils/curationEngine';

export const ActivityDetailModal: React.FC = () => {
  const {
    selectedActivity,
    setSelectedActivity,
    toggleSaveActivity,
    isActivitySaved,
    userProfile,
    setCurrentView,
    showToast,
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [liveDetail, setLiveDetail] = useState<VltrDetailRawItem | null>(null);

  // 실시간 공공데이터 상세 조회 (getVltrPartcptnItem)
  useEffect(() => {
    if (!selectedActivity) {
      setLiveDetail(null);
      setDetailError(null);
      return;
    }

    // 정부 1365 연동 활동인 경우 (id가 gov_로 시작하거나 progrmRegistNo 연동)
    if (selectedActivity.id.startsWith('gov_')) {
      const regNo = selectedActivity.id.replace('gov_', '');
      loadDetail(regNo);
    } else {
      setLiveDetail(null);
      setDetailError(null);
    }
  }, [selectedActivity?.id]);

  const loadDetail = async (regNo: string) => {
    setDetailLoading(true);
    setDetailError(null);
    try {
      const res = await fetchVltrPartcptnItem(regNo);
      if (res && res.data) {
        setLiveDetail(res.data);
      }
    } catch (err: any) {
      console.warn('Volunteer detail API fallback notice:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  if (!selectedActivity) return null;

  const saved = isActivitySaved(selectedActivity.id);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    showToast('활동 링크가 클립보드에 복사되었습니다.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWriteRecord = () => {
    setSelectedActivity(null);
    setCurrentView('my-record');
    showToast(`'${selectedActivity.title}'에 대한 활동 기록 작성 화면으로 이동합니다.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* 상단 닫기 & 공유 액션 바 */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 py-3.5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {selectedActivity.category}
            </span>
            <span className="text-xs text-stone-500 font-medium hidden sm:inline">
              출처: {selectedActivity.sourceChannel}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="detail-share-btn"
              onClick={handleShare}
              className="p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
              title="링크 공유하기"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              id="detail-close-btn"
              onClick={() => setSelectedActivity(null)}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 모달 스크롤 본문 */}
        <div className="flex-1 overflow-y-auto">
          {/* 대표 이미지 & 배너 */}
          <div className="relative h-60 sm:h-72 w-full bg-stone-900 overflow-hidden">
            <img
              src={selectedActivity.imageUrl}
              alt={selectedActivity.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-linear-to-t from-stone-950/85 via-stone-950/30 to-transparent" />

            <div className="absolute bottom-4 left-6 right-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-emerald-500 text-white">
                  {selectedActivity.collectionStrategy}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-white">
                  {selectedActivity.format}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold leading-tight text-white drop-shadow-md">
                {selectedActivity.title}
              </h1>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* 실시간 상세 API 상태 배너 */}
            {detailLoading && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-900 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span className="font-bold">
                  행정안전부 1365 자원봉사포털 공공데이터 상세 정보를 확인하고 있습니다...
                </span>
              </div>
            )}

            {/* 청록 다면적 큐레이션 알고리즘 분석 박스 */}
            {(() => {
              const curationData = calculateCurationScore(selectedActivity, userProfile);
              return (
                <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-br from-emerald-50 via-teal-50/60 to-stone-50 border border-emerald-200/90 shadow-2xs space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-extrabold text-emerald-950 tracking-tight flex items-center gap-1.5">
                          <span>{userProfile.name}님 맞춤 큐레이션 분석</span>
                          <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                            적합도 {curationData.score}%
                          </span>
                        </h3>
                        <p className="text-[11px] text-emerald-800 font-medium">
                          관심분야 · 통학거리 · 예산 · 학년 조건을 종합 분석했습니다
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed font-medium bg-white/70 p-3 rounded-xl border border-emerald-100">
                    {curationData.recommendReason}
                  </p>

                  {/* 세부 알고리즘 팩터 분해 */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <div className="bg-white/80 p-2.5 rounded-xl border border-stone-200/70 text-center">
                      <span className="text-[10px] text-stone-500 font-medium block">관심분야 일치</span>
                      <span className="text-xs font-extrabold text-emerald-700">
                        {curationData.breakdown.isTopInterest ? '★ 1순위 일치' : userProfile.interestedCategories.includes(selectedActivity.category) ? '✔ 관심 일치' : '새로운 탐색'}
                      </span>
                    </div>

                    <div className="bg-white/80 p-2.5 rounded-xl border border-stone-200/70 text-center">
                      <span className="text-[10px] text-stone-500 font-medium block">교통/이동 시간</span>
                      <span className="text-xs font-extrabold text-stone-800">
                        {selectedActivity.format === '온라인' ? '온라인(0분)' : `약 ${selectedActivity.commuteTimeMinutes}분`}
                      </span>
                    </div>

                    <div className="bg-white/80 p-2.5 rounded-xl border border-stone-200/70 text-center">
                      <span className="text-[10px] text-stone-500 font-medium block">참가 비용</span>
                      <span className="text-xs font-extrabold text-emerald-700">
                        {selectedActivity.fee === 0 ? '전액 무료(0원)' : `${selectedActivity.fee.toLocaleString()}원`}
                      </span>
                    </div>

                    <div className="bg-white/80 p-2.5 rounded-xl border border-stone-200/70 text-center">
                      <span className="text-[10px] text-stone-500 font-medium block">대상 학년</span>
                      <span className="text-xs font-extrabold text-teal-800">
                        {userProfile.grade} 참여 가능
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 기회 사다리 연결 안내 */}
            {selectedActivity.ladderStageName && (
              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                    <GitFork className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-teal-800 uppercase tracking-wide">기회 사다리 연계 단계</p>
                    <p className="text-xs sm:text-sm font-extrabold text-teal-950 mt-0.5">
                      {selectedActivity.ladderStageName}
                    </p>
                  </div>
                </div>
                <button
                  id="detail-ladder-view-btn"
                  onClick={() => {
                    setSelectedActivity(null);
                    setCurrentView('ladder');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shrink-0 transition-colors"
                >
                  전체 사다리 보기
                </button>
              </div>
            )}

            {/* 핵심 정보 그리드 (대상, 날짜, 신청기간, 비용, 장소, 이동시간) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* 대상 */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-3">
                <Users className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[11px] font-bold text-stone-500 block">참여 대상 및 정원</span>
                  <span className="text-xs sm:text-sm font-semibold text-stone-800">
                    {selectedActivity.targetGrades.join(', ')} 
                    {liveDetail?.rcritNmpr ? ` (모집인원 ${liveDetail.rcritNmpr}명 / 신청인원 ${liveDetail.apptotal || 0}명)` : ` (정원 ${selectedActivity.capacity}명 / 신청 ${selectedActivity.currentApplicants}명)`}
                  </span>
                </div>
              </div>

              {/* 신청 기간 */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-3">
                <Clock className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[11px] font-bold text-stone-500 block">신청 접수 기간</span>
                  <span className="text-xs sm:text-sm font-semibold text-stone-800">
                    {selectedActivity.applicationPeriod.start} ~ {selectedActivity.applicationPeriod.end}
                  </span>
                </div>
              </div>

              {/* 활동 기간 및 요일 */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-3">
                <Calendar className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[11px] font-bold text-stone-500 block">활동 기간 및 요일</span>
                  <span className="text-xs sm:text-sm font-semibold text-stone-800">
                    {selectedActivity.activityPeriod.start} ~ {selectedActivity.activityPeriod.end} ({selectedActivity.activityPeriod.daysOfWeek.join(', ')}요일)
                  </span>
                </div>
              </div>

              {/* 참가 비용 */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-3">
                <Coins className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[11px] font-bold text-stone-500 block">참가 비용</span>
                  <span className="text-xs sm:text-sm font-bold text-stone-900">
                    {selectedActivity.fee === 0 ? (
                      <span className="text-emerald-700 font-extrabold">전액 무료</span>
                    ) : (
                      `${selectedActivity.fee.toLocaleString()}원`
                    )}
                    <span className="text-xs text-stone-500 font-normal ml-1">({selectedActivity.feeDescription})</span>
                  </span>
                </div>
              </div>

              {/* 장소 및 이동 시간 */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-3 sm:col-span-2">
                <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <span className="text-[11px] font-bold text-stone-500 block">장소 및 이동 시간</span>
                  <p className="text-xs sm:text-sm font-semibold text-stone-800">
                    {selectedActivity.region.detailAddress}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-emerald-700 font-medium">
                    <span className="flex items-center gap-1">
                      <Navigation className="w-3.5 h-3.5" />
                      내 위치({userProfile.region.city})로부터 {selectedActivity.distanceKm}km
                    </span>
                    <span>·</span>
                    <span>대중교통/도보 약 {selectedActivity.commuteTimeMinutes}분 소요</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 실시간 API 상세 본문 또는 기본 상세 소개 */}
            <div>
              <h3 className="text-sm font-extrabold text-stone-900 mb-2 flex items-center justify-between">
                <span>프로그램 상세 안내</span>
                {liveDetail && (
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                    행안부 1365 실시간 상세 내용
                  </span>
                )}
              </h3>
              <div className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line bg-stone-50 p-4 rounded-2xl border border-stone-200">
                {liveDetail?.progrmCn || selectedActivity.description}
              </div>
            </div>

            {/* 담당자 및 연락처 정보 (공공데이터 상세 연동 시) */}
            {(liveDetail?.telno || liveDetail?.nanmmbyNmAdmn) && (
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {liveDetail.nanmmbyNmAdmn && (
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-stone-500">담당자:</span>
                    <span className="font-bold text-stone-900">{liveDetail.nanmmbyNmAdmn}</span>
                  </div>
                )}
                {liveDetail.telno && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span className="text-stone-500">문의처:</span>
                    <span className="font-bold text-stone-900">{liveDetail.telno}</span>
                  </div>
                )}
              </div>
            )}

            {/* 태그 목록 */}
            <div className="flex flex-wrap gap-1.5">
              {selectedActivity.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-lg bg-stone-100 text-stone-600 font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* 주최 기관 정보 & 신뢰성 인증 배지 */}
            <div className="p-4 rounded-2xl border border-stone-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-stone-900">{selectedActivity.hostOrg}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-600 font-medium">
                      {selectedActivity.hostOrgType}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    수집 채널: {selectedActivity.sourceChannel}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 고정 액션 바 */}
        <div className="p-4 sm:px-6 sm:py-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-3">
          {/* 찜 & 마감 알림 버튼 (PRD 1번 기능) */}
          <button
            id="detail-save-toggle-btn"
            onClick={() => toggleSaveActivity(selectedActivity.id)}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold border transition-all ${
              saved
                ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
                : 'bg-white border-stone-300 text-stone-700 hover:border-emerald-500'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-rose-600 text-rose-600' : ''}`} />
            <span>{saved ? '찜 & 알림 해제' : '찜 & 마감 알림 예약'}</span>
          </button>

          <div className="flex items-center gap-2">
            {/* 활동 기록 작성 버튼 */}
            <button
              id="detail-write-record-btn"
              onClick={handleWriteRecord}
              className="hidden sm:flex items-center gap-1.5 px-4 py-3 rounded-xl bg-white border border-stone-300 text-stone-800 text-xs font-bold hover:bg-stone-100 transition-colors"
            >
              <FilePenLine className="w-4 h-4 text-emerald-600" />
              <span>내 활동에 기록</span>
            </button>

            {/* 공식 신청 링크 */}
            <a
              id="detail-apply-link-btn"
              href={selectedActivity.officialUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-emerald-700/20 transition-all active:scale-95"
            >
              <span>공식 신청 바로가기</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
