// [청록] MyRecordView.tsx - 내 활동·성장기록장 (Bento Grid 스타일: 참여한 활동 수 및 진로/봉사/교육 비율 통계, 학생부·포트폴리오 기록 작성, 프로필·알림설정·회원탈퇴 및 기관 관리자)

import React, { useState } from 'react';
import {
  BookOpenCheck,
  PlusCircle,
  Award,
  Sparkles,
  PieChart,
  FileText,
  Share2,
  Trash2,
  Edit3,
  Calendar,
  Clock,
  CheckCircle2,
  Settings,
  AlertTriangle,
  Building2,
  Download,
  SlidersHorizontal,
  GraduationCap,
  Heart,
  MapPin,
  Flame,
  LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivityRecord, ActivityCategory } from '../types';

const RECORD_TYPES: ActivityRecord['recordType'][] = ['진로', '봉사', '교육', '자율'];

const CATEGORIES: ActivityCategory[] = [
  '과학/환경',
  '코딩',
  '창업',
  '봉사',
  '진로',
];

export const MyRecordView: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    resetAccount,
    logout,
    activityRecords,
    addActivityRecord,
    deleteActivityRecord,
    setIsOnboardingOpen,
    setIsNotificationModalOpen,
    setIsAdminModalOpen,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'records' | 'stats' | 'portfolio' | 'settings'>('records');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // 기록 작성 폼 상태
  const [activityTitle, setActivityTitle] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('미디어');
  const [recordType, setRecordType] = useState<ActivityRecord['recordType']>('진로');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [role, setRole] = useState('');
  const [content, setContent] = useState('');
  const [reflection, setReflection] = useState('');
  const [hoursSpent, setHoursSpent] = useState(4);
  const [ladderTrackName, setLadderTrackName] = useState('청소년 미디어 크리에이터 & 방송 콘텐츠 전문가 경로');

  // 통계 계산: 진로 / 봉사 / 교육 / 자율 비율
  const totalCount = activityRecords.length;
  const careerCount = activityRecords.filter((r) => r.recordType === '진로').length;
  const volunteerCount = activityRecords.filter((r) => r.recordType === '봉사').length;
  const educationCount = activityRecords.filter((r) => r.recordType === '교육').length;
  const selfCount = activityRecords.filter((r) => r.recordType === '자율').length;

  const careerRatio = totalCount ? Math.round((careerCount / totalCount) * 100) : 0;
  const volunteerRatio = totalCount ? Math.round((volunteerCount / totalCount) * 100) : 0;
  const educationRatio = totalCount ? Math.round((educationCount / totalCount) * 100) : 0;
  const selfRatio = totalCount ? Math.round((selfCount / totalCount) * 100) : 0;

  const totalHours = activityRecords.reduce((sum, r) => sum + (r.hoursSpent || 0), 0);

  const handleAddRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityTitle.trim() || !content.trim() || !reflection.trim()) {
      alert('활동명과 활동 내용, 느낀 점(배운 점)을 모두 입력해 주세요.');
      return;
    }

    addActivityRecord({
      activityTitle: activityTitle.trim(),
      category,
      recordType,
      date,
      role: role.trim() || '참가자',
      content: content.trim(),
      reflection: reflection.trim(),
      hoursSpent: Number(hoursSpent),
      ladderTrackName,
      isVerified: true,
    });

    setShowAddModal(false);
    // 리셋
    setActivityTitle('');
    setContent('');
    setReflection('');
    setRole('');
  };

  // 학생부 포트폴리오 텍스트 복사 헬퍼
  const handleCopyPortfolioText = () => {
    const text = activityRecords
      .map(
        (r, i) =>
          `[활동 ${i + 1}] ${r.activityTitle} (${r.date} / ${r.recordType}활동 / ${r.hoursSpent || 0}시간)\n- 역할: ${r.role}\n- 주요 활동: ${r.content}\n- 배운 점 및 학생부 기재용 요약: ${r.reflection}\n`
      )
      .join('\n----------------------------------------\n\n');

    navigator.clipboard.writeText(text);
    showToast('학생부/포트폴리오 내용 전체가 클립보드에 복사되었습니다.');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. 상단 프로필 & 통계 벤토 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 프로필 타일 (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-emerald-700/20 shrink-0">
              {userProfile.name.slice(0, 1)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                  {userProfile.name}님의 성장기록장
                </h1>
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                  {userProfile.grade}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-500 mt-1 flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1 font-semibold text-stone-700">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {userProfile.region.province} {userProfile.region.city}
                </span>
                <span>·</span>
                <span>관심분야: {userProfile.interestedCategories.join(', ')}</span>
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>충남 청소년 맞춤 성장 포트폴리오</span>
            <span className="font-bold text-emerald-700">인증 기록장 활성화됨</span>
          </div>
        </div>

        {/* 활동 건수 통계 타일 (2 cols) */}
        <div className="lg:col-span-2 bg-emerald-50/80 border border-emerald-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between text-center">
          <span className="text-xs font-extrabold text-emerald-800">기록한 활동</span>
          <div className="text-3xl sm:text-4xl font-black text-emerald-950 my-1">
            {totalCount}<span className="text-base font-bold text-emerald-700">건</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700">학생부 인정</span>
        </div>

        {/* 누적 시간 통계 타일 (2 cols) */}
        <div className="lg:col-span-2 bg-stone-100 border border-stone-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between text-center">
          <span className="text-xs font-extrabold text-stone-600">총 누적 시간</span>
          <div className="text-3xl sm:text-4xl font-black text-stone-900 my-1">
            {totalHours}<span className="text-base font-bold text-stone-500">시간</span>
          </div>
          <span className="text-[11px] font-semibold text-stone-500">역량 축적</span>
        </div>

        {/* 새 기록 작성 액션 타일 (2 cols) */}
        <div className="lg:col-span-2 bg-emerald-600 text-white rounded-3xl p-6 shadow-xs flex flex-col justify-between text-center">
          <span className="text-xs font-bold text-emerald-100">새로운 성장</span>
          <button
            id="open-add-record-btn"
            onClick={() => setShowAddModal(true)}
            className="w-full py-3 rounded-2xl bg-white text-emerald-900 hover:bg-emerald-50 font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <span>기록 작성</span>
          </button>
          <span className="text-[10px] text-emerald-200">1분 안에 기록 완료</span>
        </div>
      </div>

      {/* 2. 탭 네비게이션 (Bento Capsule) */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-2 sm:p-2.5 flex items-center gap-1.5 overflow-x-auto shadow-xs">
        <button
          id="record-tab-records"
          onClick={() => setActiveTab('records')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
            activeTab === 'records'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <BookOpenCheck className="w-4 h-4" />
          <span>활동 기록 목록 ({totalCount})</span>
        </button>

        <button
          id="record-tab-stats"
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
            activeTab === 'stats'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>진로/봉사/교육 비율 통계</span>
        </button>

        <button
          id="record-tab-portfolio"
          onClick={() => setActiveTab('portfolio')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
            activeTab === 'portfolio'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>학생부·포트폴리오 출력</span>
        </button>

        <button
          id="record-tab-settings"
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>프로필 & 계정 관리</span>
        </button>
      </div>

      {/* 3. 탭 1: 활동 기록 목록 */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          {activityRecords.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-stone-300 p-12 sm:p-16 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                <BookOpenCheck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-stone-900">
                  작성된 활동 기록이 없습니다.
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-md mx-auto leading-relaxed">
                  참여한 동아리, 캠프, 봉사활동을 기록하면 학생부 기재 및 대학 입시 포트폴리오로 즉시 활용할 수 있습니다.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-2xl shadow-md shadow-emerald-700/20 active:scale-95 transition-all"
              >
                첫 활동 기록 작성하기
              </button>
            </div>
          ) : (
            activityRecords.map((rec) => (
              <div
                key={rec.id}
                id={`record-card-${rec.id}`}
                className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-7 shadow-xs hover:border-emerald-500 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-extrabold px-3 py-1 rounded-xl ${
                        rec.recordType === '진로'
                          ? 'bg-purple-100 text-purple-900 border border-purple-200'
                          : rec.recordType === '봉사'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          : rec.recordType === '교육'
                          ? 'bg-blue-100 text-blue-900 border border-blue-200'
                          : 'bg-stone-100 text-stone-900 border border-stone-200'
                      }`}
                    >
                      {rec.recordType}활동
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-stone-100 text-stone-700 border border-stone-200">
                      {rec.category}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-stone-900">
                      {rec.activityTitle}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-stone-500">
                    <span className="flex items-center gap-1 font-semibold text-stone-600">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      {rec.date}
                    </span>
                    {rec.hoursSpent && (
                      <span className="flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        {rec.hoursSpent}시간 인정
                      </span>
                    )}
                    <button
                      onClick={() => deleteActivityRecord(rec.id)}
                      className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="기록 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 역할 및 활동 내용 요약 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-stone-50/80 border border-stone-100 space-y-2">
                  <div className="text-xs font-extrabold text-stone-700">
                    맡은 역할: <span className="text-emerald-800 font-bold">{rec.role}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line font-medium">
                    {rec.content}
                  </p>
                </div>

                {/* 느낀 점 및 배운 점 (학생부 기재용 서술) */}
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/90">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-950 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>배운 점 & 학교생활기록부 종합 전형 기재용 서술</span>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed font-medium">
                    {rec.reflection}
                  </p>
                </div>

                {rec.ladderTrackName && (
                  <div className="text-[11px] text-stone-500 font-medium flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    연계 기회 사다리: {rec.ladderTrackName}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* 4. 탭 2: 진로/봉사/교육 비율 통계 (Bento Grid) */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-xs">
            <h3 className="text-lg font-black text-stone-900 mb-1">
              활동 역량 밸런스 분석
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 mb-6">
              참여한 활동을 진로, 봉사, 교육, 자율 4가지 영역으로 분석하여 균형 잡힌 성장을 돕습니다.
            </p>

            {/* 비율 시각화 프로그레스 바 */}
            <div className="space-y-4">
              <div className="h-7 w-full bg-stone-100 rounded-full overflow-hidden flex shadow-inner">
                <div
                  style={{ width: `${careerRatio}%` }}
                  className="bg-purple-600 h-full transition-all duration-500 flex items-center justify-center text-[11px] text-white font-extrabold"
                  title={`진로: ${careerRatio}%`}
                >
                  {careerRatio > 10 ? `${careerRatio}%` : ''}
                </div>
                <div
                  style={{ width: `${volunteerRatio}%` }}
                  className="bg-emerald-500 h-full transition-all duration-500 flex items-center justify-center text-[11px] text-white font-extrabold"
                  title={`봉사: ${volunteerRatio}%`}
                >
                  {volunteerRatio > 10 ? `${volunteerRatio}%` : ''}
                </div>
                <div
                  style={{ width: `${educationRatio}%` }}
                  className="bg-blue-500 h-full transition-all duration-500 flex items-center justify-center text-[11px] text-white font-extrabold"
                  title={`교육: ${educationRatio}%`}
                >
                  {educationRatio > 10 ? `${educationRatio}%` : ''}
                </div>
                <div
                  style={{ width: `${selfRatio}%` }}
                  className="bg-stone-400 h-full transition-all duration-500 flex items-center justify-center text-[11px] text-white font-extrabold"
                  title={`자율: ${selfRatio}%`}
                >
                  {selfRatio > 10 ? `${selfRatio}%` : ''}
                </div>
              </div>

              {/* 4영역 통계 Bento 카드 그리드 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="p-5 rounded-3xl bg-purple-50/80 border border-purple-200">
                  <span className="text-xs font-extrabold text-purple-900 block">진로활동</span>
                  <div className="text-2xl font-black text-purple-950 mt-1">{careerCount}건 ({careerRatio}%)</div>
                  <span className="text-[11px] text-purple-700 mt-1 block font-medium">전공 적합성 탐구</span>
                </div>

                <div className="p-5 rounded-3xl bg-emerald-50/80 border border-emerald-200">
                  <span className="text-xs font-extrabold text-emerald-900 block">봉사활동</span>
                  <div className="text-2xl font-black text-emerald-950 mt-1">{volunteerCount}건 ({volunteerRatio}%)</div>
                  <span className="text-[11px] text-emerald-700 mt-1 block font-medium">1365 나눔 실천</span>
                </div>

                <div className="p-5 rounded-3xl bg-blue-50/80 border border-blue-200">
                  <span className="text-xs font-extrabold text-blue-900 block">교육/캠프</span>
                  <div className="text-2xl font-black text-blue-950 mt-1">{educationCount}건 ({educationRatio}%)</div>
                  <span className="text-[11px] text-blue-700 mt-1 block font-medium">전문 기술 습득</span>
                </div>

                <div className="p-5 rounded-3xl bg-stone-100 border border-stone-200">
                  <span className="text-xs font-extrabold text-stone-800 block">자율활동</span>
                  <div className="text-2xl font-black text-stone-900 mt-1">{selfCount}건 ({selfRatio}%)</div>
                  <span className="text-[11px] text-stone-600 mt-1 block font-medium">학교 축제·동아리</span>
                </div>
              </div>
            </div>

            {/* 피드백 및 조언 카드 */}
            <div className="mt-6 p-5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-700 leading-relaxed">
              <strong>💡 청록 AI 맞춤 성장 조언:</strong> {userProfile.name}님은 현재 [{careerCount > volunteerCount ? '진로' : '봉사'}] 분야의 경험이 풍부합니다! 학생부 종합 전형에서 균형을 맞추기 위해 다음 단계로 <strong>기회 사다리 3단계 지역 프로젝트</strong>에 도전해보는 것을 권장합니다.
            </div>
          </div>
        </div>
      )}

      {/* 5. 탭 3: 학생부·포트폴리오 출력 모드 */}
      {activeTab === 'portfolio' && (
        <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
            <div>
              <h3 className="text-lg font-black text-stone-900">
                학교생활기록부·포트폴리오 양식
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                선생님 상담, 교내 학생부 작성, 대학 수시 입학사정관 제출용 포트폴리오 서식입니다.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="copy-portfolio-btn"
                onClick={handleCopyPortfolioText}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-2xs"
              >
                <FileText className="w-4 h-4" />
                <span>전체 텍스트 복사</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all"
              >
                <Download className="w-4 h-4" />
                <span>인쇄/PDF 저장</span>
              </button>
            </div>
          </div>

          {/* 출력 양식 본문 프리뷰 */}
          <div className="p-6 sm:p-8 rounded-3xl bg-stone-50 border border-stone-300 font-mono text-xs text-stone-800 space-y-6">
            <div className="text-center pb-4 border-b border-stone-300">
              <h2 className="text-base font-black">청소년 대외활동 및 창의적 체험활동 성장 포트폴리오</h2>
              <p className="text-[11px] text-stone-500 mt-1">
                성명: {userProfile.name} | 학년: {userProfile.grade} | 소속 지역: {userProfile.region.province} {userProfile.region.city}
              </p>
            </div>

            <div className="space-y-4">
              {activityRecords.map((r, idx) => (
                <div key={r.id} className="p-4 bg-white rounded-2xl border border-stone-200 space-y-1.5">
                  <div className="font-extrabold text-stone-900">
                    [{idx + 1}] {r.activityTitle} ({r.date} / {r.recordType} / {r.hoursSpent || 0}시간)
                  </div>
                  <div>- 수행 역할: {r.role}</div>
                  <div>- 활동 내용: {r.content}</div>
                  <div className="text-emerald-950 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                    - 학생부 특기사항 연계 요약: {r.reflection}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. 탭 4: 프로필 & 계정 관리 */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* 관심분야 & 지역 설정 카드 (Bento Box) */}
          <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
                맞춤 추천 조건 & 관심 분야
              </h3>
              <button
                id="settings-edit-profile-btn"
                onClick={() => setIsOnboardingOpen(true)}
                className="px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-extrabold border border-emerald-200 transition-all cursor-pointer"
              >
                조건 재설정
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
                <span className="text-stone-500 font-bold block">거주 지역</span>
                <span className="font-black text-stone-800 text-sm mt-1 block">
                  {userProfile.region.province} {userProfile.region.city}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
                <span className="text-stone-500 font-bold block">관심 활동 분야</span>
                <span className="font-black text-stone-800 text-sm mt-1 block">
                  {userProfile.interestedCategories.join(', ')}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
                <span className="text-stone-500 font-bold block">참여 가능 요일</span>
                <span className="font-black text-stone-800 text-sm mt-1 block">
                  {userProfile.availableDays.join(', ')}요일
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
                <span className="text-stone-500 font-bold block">최대 이동시간 / 예산</span>
                <span className="font-black text-stone-800 text-sm mt-1 block">
                  편도 {userProfile.maxCommuteTimeMinutes}분 이내 / {userProfile.maxFeeBudget === 0 ? '무료만' : `${userProfile.maxFeeBudget.toLocaleString()}원 이하`}
                </span>
              </div>
            </div>
          </div>

          {/* 알림 및 기관 관리자 포털 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-xs flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-stone-900">알림 센터 & 푸시 설정</h4>
                <p className="text-xs text-stone-500 mt-1">마감 3일 전 알림 및 유사 프로그램 알림 관리</p>
              </div>
              <button
                onClick={() => setIsNotificationModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-extrabold transition-all"
              >
                설정 열기
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-xs flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-stone-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  기관용 관리자 화면
                </h4>
                <p className="text-xs text-stone-500 mt-1">수집 전략 프로그램 등록 및 청소년 수요 분석</p>
              </div>
              <button
                id="settings-admin-modal-btn"
                onClick={() => setIsAdminModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-2xs"
              >
                관리자 열기
              </button>
            </div>

            {/* 로그아웃 */}
            <div className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-xs flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-stone-900 flex items-center gap-1.5">
                  <LogOut className="w-4 h-4 text-stone-600" />
                  로그아웃
                </h4>
                <p className="text-xs text-stone-500 mt-1">현재 기기에서 안전하게 로그아웃하고 로그인 화면으로 이동합니다.</p>
              </div>
              <button
                id="settings-logout-btn"
                onClick={logout}
                className="px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-extrabold transition-all cursor-pointer"
              >
                로그아웃
              </button>
            </div>
          </div>

          {/* 회원 탈퇴 / 계정 초기화 */}
          <div className="bg-rose-50/60 rounded-3xl border border-rose-200/90 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-black text-rose-950 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  회원 탈퇴 및 개인 데이터 삭제
                </h4>
                <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                  탈퇴 시 찜한 활동, 작성된 모든 성장 기록장 및 동네 활동 요청 데이터가 영구히 초기화됩니다.
                </p>
              </div>
              <button
                id="account-reset-btn"
                onClick={() => {
                  if (confirm('정말로 회원 탈퇴 및 모든 데이터를 초기화하시겠습니까?')) {
                    resetAccount();
                  }
                }}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shrink-0 transition-colors shadow-2xs cursor-pointer"
              >
                회원 탈퇴
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 신규 활동 기록 추가 모달 (Bento Style Modal) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4.5 border-b border-stone-200 bg-stone-50/80 flex items-center justify-between">
              <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                <BookOpenCheck className="w-5 h-5 text-emerald-600" />
                새로운 활동 기록 작성
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-xl text-stone-400 hover:text-stone-700 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddRecordSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-extrabold text-stone-700 mb-1">활동명</label>
                <input
                  type="text"
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  placeholder="예: 제4회 충남 청소년 영상제 출품작 제작"
                  className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-extrabold text-stone-700 mb-1">활동 영역</label>
                  <select
                    value={recordType}
                    onChange={(e) => setRecordType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {RECORD_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}활동
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-stone-700 mb-1">카테고리</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-stone-700 mb-1">활동일</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-extrabold text-stone-700 mb-1">나의 역할</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="예: 촬영 총괄 및 기획"
                    className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-stone-700 mb-1">참여 인정 시간</label>
                  <input
                    type="number"
                    value={hoursSpent}
                    onChange={(e) => setHoursSpent(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-stone-700 mb-1">
                  진행한 활동 내용 요약
                </label>
                <textarea
                  rows={2}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="팀원 3명과 함께 논산의 전통시장을 주제로 3분 단편 다큐멘터리를 기획 및 촬영함..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-stone-700 mb-1">
                  느낀 점 및 배운 점 (학생부 기재용 문장 서술)
                </label>
                <textarea
                  rows={3}
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="현장 인터뷰를 진행하며 소통 역량을 기르고, 영상 편집 툴을 활용한 미디어 전달력의 중요성을 체감하여 다음 단계인 지자체 홍보 프로젝트로 성장하겠다는 진로 동기를 다짐..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-700/20 active:scale-95 transition-all"
                >
                  기록 저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

