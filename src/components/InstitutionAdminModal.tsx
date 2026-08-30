// [청록] InstitutionAdminModal.tsx - 기관용 관리자 화면 (PRD 데이터 수집 전략 3분류 관리: 경쟁형·비경쟁형·참여형 프로그램 등록 및 지역 학생 수요 집계 분석)

import React, { useState } from 'react';
import {
  Building2,
  X,
  PlusCircle,
  BarChart3,
  ShieldCheck,
  Globe,
  Users,
  Award,
  Sparkles,
  FileCheck,
  Send,
  MapPin,
  Calendar,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivityCategory, DataCollectionStrategy, ActivityFormat } from '../types';
import { koreanRegions } from '../data/initialData';

export const InstitutionAdminModal: React.FC = () => {
  const {
    isAdminModalOpen,
    setIsAdminModalOpen,
    addNewActivity,
    communityRequests,
    userProfile,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'register' | 'demands' | 'strategies'>('register');

  // 신규 프로그램 등록 폼 상태
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('코딩');
  const [collectionStrategy, setCollectionStrategy] =
    useState<DataCollectionStrategy>('참여형');
  const [sourceChannel, setSourceChannel] = useState('지자체·기관 공식 업무 협약');
  const [hostOrg, setHostOrg] = useState('논산시청소년행복재단');
  const [hostOrgType, setHostOrgType] = useState<
    '공공기관/지자체' | '비영리단체' | '대학/연구소' | '기업/사회공헌'
  >('공공기관/지자체');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80'
  );
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [province, setProvince] = useState('충청남도');
  const [city, setCity] = useState('논산시');
  const [detailAddress, setDetailAddress] = useState('충남 논산시 시민로 123 청소년수련관');
  const [distanceKm, setDistanceKm] = useState(3.5);
  const [commuteTimeMinutes, setCommuteTimeMinutes] = useState(20);
  const [format, setFormat] = useState<ActivityFormat>('오프라인');
  const [fee, setFee] = useState(0);
  const [appStart, setAppStart] = useState('2026-08-25');
  const [appEnd, setAppEnd] = useState('2026-09-15');
  const [actStart, setActStart] = useState('2026-09-20');
  const [actEnd, setActEnd] = useState('2026-10-10');
  const [capacity, setCapacity] = useState(25);
  const [ladderStageName, setLadderStageName] = useState('3단계: 실전 프로젝트');

  if (!isAdminModalOpen) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) {
      alert('프로그램명과 요약을 입력해 주세요.');
      return;
    }

    addNewActivity({
      title: title.trim(),
      category,
      collectionStrategy,
      sourceChannel,
      hostOrg,
      hostOrgType,
      imageUrl,
      summary: summary.trim(),
      description: description.trim() || summary.trim(),
      targetGrades: ['중학생 전체', '고등학생 전체'],
      region: {
        province,
        city,
        detailAddress,
      },
      distanceKm: Number(distanceKm),
      commuteTimeMinutes: Number(commuteTimeMinutes),
      format,
      fee: Number(fee),
      feeDescription: Number(fee) === 0 ? '전액 무료 지원' : `${Number(fee).toLocaleString()}원`,
      applicationPeriod: {
        start: appStart,
        end: appEnd,
      },
      activityPeriod: {
        start: actStart,
        end: actEnd,
        daysOfWeek: ['토'],
      },
      recommendReason: `${city} 지역 학생들을 위해 새로 개설된 [${category}] 분야의 실무 참여 프로그램입니다.`,
      ladderStageName,
      tags: [category, city, collectionStrategy, '신규등록'],
      capacity: Number(capacity),
      currentApplicants: 0,
      isUrgent: false,
    });

    setIsAdminModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* 헤더 */}
        <div className="px-6 py-5 border-b border-stone-200 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight">기관 및 공공 파트너 관리자 화면</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  수집 전략 통제 센터
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                지자체·대학·기업 프로그램 직접 등록 및 지역 청소년 요청 수요 분석
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAdminModalOpen(false)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-stone-200 bg-stone-50">
          <button
            id="admin-tab-register"
            onClick={() => setActiveTab('register')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'register'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-200'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>신규 프로그램 등록</span>
          </button>
          <button
            id="admin-tab-demands"
            onClick={() => setActiveTab('demands')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'demands'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>지역 학생 수요 요청 집계 ({communityRequests.length})</span>
          </button>
          <button
            id="admin-tab-strategies"
            onClick={() => setActiveTab('strategies')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'strategies'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>화면별 데이터 수집 전략</span>
          </button>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'strategies' && (
            /* PRD 화면별 데이터 수집 전략 상세 설명 카드 */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-blue-900">
                      1. 경쟁형 (공모전·대회·연구)
                    </h4>
                    <p className="text-xs text-blue-800 mt-1 leading-relaxed">
                      <strong>수집 전략:</strong> 참가자 제보 유인이 없으므로, 주최 기관 공식 채널(공문, 공공데이터포털, 대회 홈페이지 API)에서 크롤링 및 다이렉트 수집.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-900">
                      2. 비경쟁형 (동아리·캠프·특강)
                    </h4>
                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                      <strong>수집 전략:</strong> 정보 공유 저항이 없으므로, 사용자(학생·동아리장) 제보와 운영자 자율 등록을 병행하여 폭넓게 확보.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900">
                      3. 참여형 (청소년의회·멘토링·정책기획)
                    </h4>
                    <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                      <strong>수집 전략:</strong> 기관의 참여자 확대 목적과 정확히 일치하므로, 지자체·청소년재단·공공기관과 직접 업무 협약(MOU) 제휴를 통해 독점/우선 공급.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'demands' && (
            /* 우리 동네에도 만들어주세요 학생 수요 분석 대시보드 */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-stone-900">
                    지역별 청소년 프로그램 개설 청원 현황
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    학생들의 요청이 모이면 지자체 청소년 예산 편성 및 기업 사회공헌 매칭에 활용됩니다.
                  </p>
                </div>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  총 {communityRequests.length}건 접수
                </span>
              </div>

              <div className="space-y-3">
                {communityRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl border border-stone-200 bg-white hover:border-emerald-400 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {req.category}
                        </span>
                        <span className="text-xs font-bold text-stone-900">{req.region.province} {req.region.city}</span>
                      </div>
                      <span className="text-xs font-extrabold text-emerald-700">
                        {req.supportCount}명 지지 / 목표 {req.targetCount}명
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-stone-900">{req.title}</h5>
                    <p className="text-xs text-stone-600 line-clamp-2">{req.description}</p>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                      <span>작성자: {req.authorName} ({req.authorGrade})</span>
                      <span className="font-semibold text-teal-700">상태: {req.status} ({req.statusComment})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'register' && (
            /* 신규 활동 등록 폼 */
            <form onSubmit={handleRegister} className="space-y-4">
              {/* 데이터 수집 전략 선택 */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  데이터 수집 전략 분류 (PRD 3분류)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['경쟁형', '비경쟁형', '참여형'] as DataCollectionStrategy[]).map((strat) => (
                    <button
                      key={strat}
                      type="button"
                      onClick={() => {
                        setCollectionStrategy(strat);
                        if (strat === '경쟁형') setSourceChannel('공공데이터포털 및 주최 공식 공문');
                        if (strat === '비경쟁형') setSourceChannel('학생 제보 및 운영자 자율 등록');
                        if (strat === '참여형') setSourceChannel('지자체·기관 공식 업무 협약');
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        collectionStrategy === strat
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-stone-50 text-stone-700 border-stone-200'
                      }`}
                    >
                      {strat}
                    </button>
                  ))}
                </div>
              </div>

              {/* 프로그램명 */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">프로그램명</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 논산시 청소년 로봇 & AI 메이커 부트캠프"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* 카테고리 및 주최기관 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">카테고리</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ActivityCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-medium bg-white"
                  >
                    {['과학/환경', '코딩', '창업', '봉사', '진로'].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">주최/주관 기관명</label>
                  <input
                    type="text"
                    value={hostOrg}
                    onChange={(e) => setHostOrg(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-medium"
                    required
                  />
                </div>
              </div>

              {/* 요약 */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">한 줄 요약</label>
                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="예: 주말 2일간 청소년센터에서 진행되는 로봇 코딩 및 센서 제어 실습"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-medium"
                  required
                />
              </div>

              {/* 지역 및 형태 */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">시/도</label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                  >
                    {Object.keys(koreanRegions).map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">시/군/구</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">비용 (0=무료)</label>
                  <input
                    type="number"
                    value={fee}
                    onChange={(e) => setFee(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>
              </div>

              {/* 사다리 단계 연결 */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  연계할 기회 사다리 단계명
                </label>
                <input
                  type="text"
                  value={ladderStageName}
                  onChange={(e) => setLadderStageName(e.target.value)}
                  placeholder="예: 2단계: 지역 청소년 SW 해커톤 캠프"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              {/* 제출 버튼 */}
              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>공식 활동 데이터 등록 및 지역 청소년 피드 발행</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
