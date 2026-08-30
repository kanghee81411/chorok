// [청록] OnboardingModal.tsx - 학생 온보딩 및 맞춤 추천 조건 설정 모달 (학년, 지역, 관심분야, 가능요일, 이동시간, 비용범위)

import React, { useState } from 'react';
import {
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  Coins,
  GraduationCap,
  Heart,
  X,
  ArrowRight,
  CheckCircle2,
  Globe2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivityCategory, UserProfile } from '../types';
import { koreanRegions } from '../data/initialData';

const CATEGORY_OPTIONS: ActivityCategory[] = [
  '과학/환경',
  '코딩',
  '창업',
  '봉사',
  '진로',
];

const GRADE_OPTIONS: UserProfile['grade'][] = [
  '중1',
  '중2',
  '중3',
  '고1',
  '고2',
  '고3',
  '학교 밖 청소년',
];

const DAYS_OF_WEEK = ['월', '화', '수', '목', '금', '토', '일'];

const COMMUTE_OPTIONS = [
  { label: '30분 이내 (도보/자전거/마을버스)', value: 30 },
  { label: '1시간 이내 (시내버스/인근 시군)', value: 60 },
  { label: '1시간 30분 이내 (시외버스/기차)', value: 90 },
  { label: '2시간 이상 (원거리 이동 가능)', value: 120 },
];

const BUDGET_OPTIONS = [
  { label: '0원 (전액 무료 프로그램만)', value: 0 },
  { label: '30,000원 이하 (재료비 수준)', value: 30000 },
  { label: '50,000원 이하', value: 50000 },
  { label: '비용 무관', value: 200000 },
];

export const OnboardingModal: React.FC = () => {
  const { isOnboardingOpen, setIsOnboardingOpen, userProfile, completeOnboarding } = useApp();

  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState(userProfile.name);
  const [grade, setGrade] = useState<UserProfile['grade']>(userProfile.grade);
  const [province, setProvince] = useState(userProfile.region.province || '충청남도');
  const [city, setCity] = useState(userProfile.region.city || '논산시');
  const [interestedCategories, setInterestedCategories] = useState<ActivityCategory[]>(
    userProfile.interestedCategories
  );
  const [availableDays, setAvailableDays] = useState<string[]>(userProfile.availableDays);
  const [maxCommuteTimeMinutes, setMaxCommuteTimeMinutes] = useState(
    userProfile.maxCommuteTimeMinutes
  );
  const [preferOnline, setPreferOnline] = useState<boolean>(
    userProfile.preferOnline ?? false
  );
  const [maxFeeBudget, setMaxFeeBudget] = useState(userProfile.maxFeeBudget);

  if (!isOnboardingOpen) return null;

  const availableCities = koreanRegions[province] || [];

  const toggleCategory = (cat: ActivityCategory) => {
    if (interestedCategories.includes(cat)) {
      setInterestedCategories(interestedCategories.filter((c) => c !== cat));
    } else {
      setInterestedCategories([...interestedCategories, cat]);
    }
  };

  const toggleDay = (day: string) => {
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter((d) => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const handleFinish = () => {
    const updatedProfile: UserProfile = {
      ...userProfile,
      name: name.trim() || '청소년',
      grade,
      region: {
        province,
        city: city || availableCities[0] || '중심지',
      },
      interestedCategories: interestedCategories.length > 0 ? interestedCategories : ['미디어', '코딩'],
      availableDays: availableDays.length > 0 ? availableDays : ['토', '일'],
      maxCommuteTimeMinutes,
      preferOnline,
      maxFeeBudget,
    };

    completeOnboarding(updatedProfile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* 온보딩 헤더 */}
        <div className="px-6 py-5 border-b border-stone-200 bg-linear-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white p-1 shadow-sm flex items-center justify-center font-bold overflow-hidden">
              <img
                src="/cheongnok-logo.png"
                alt="청록 로고"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">청록 맞춤 조건 설정</h2>
              <p className="text-xs text-emerald-100 mt-0.5">
                지방 및 비수도권 청소년의 이동 거리와 관심사를 고려한 1:1 맞춤 추천 엔진
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOnboardingOpen(false)}
            className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 진행 스텝 인디케이터 */}
        <div className="px-6 py-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs font-semibold text-stone-600">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step === 1 ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              1
            </span>
            <span className={step === 1 ? 'text-emerald-700 font-bold' : ''}>기본 정보 및 지역</span>
          </div>
          <span className="text-stone-300">───</span>
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step === 2 ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              2
            </span>
            <span className={step === 2 ? 'text-emerald-700 font-bold' : ''}>관심 분야 및 활동 조건</span>
          </div>
        </div>

        {/* 온보딩 입력 폼 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {step === 1 ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* 이름 */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  이름 (또는 닉네임)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 이지우"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium"
                />
              </div>

              {/* 학년 선택 */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  현재 학년
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {GRADE_OPTIONS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGrade(g)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                        grade === g
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:border-emerald-300'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* 거주 지역 선택 (시/도 + 시/군/구) */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  거주 지역 (시/도 및 시/군/구)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] font-semibold text-stone-500 mb-1 block">시/도</span>
                    <select
                      value={province}
                      onChange={(e) => {
                        const newProv = e.target.value;
                        setProvince(newProv);
                        const firstCity = koreanRegions[newProv]?.[0] || '';
                        setCity(firstCity);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      {Object.keys(koreanRegions).map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-stone-500 mb-1 block">시/군/구</span>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      {availableCities.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-[11px] text-stone-500 mt-2">
                  📍 선택한 지역을 기준으로 프로그램과의 실제 거리 및 대중교통 이동시간이 계산됩니다.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* 관심 분야 다중 선택 */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-emerald-600" />
                  관심 분야 (복수 선택 가능)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {CATEGORY_OPTIONS.map((cat) => {
                    const isSelected = interestedCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-stone-700 border-stone-200 hover:border-emerald-300'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        <span>{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 참여 가능한 요일 */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  참여 가능한 요일
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = availableDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`w-10 h-10 rounded-xl text-xs font-bold transition-all border flex items-center justify-center ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-stone-700 border-stone-200 hover:border-emerald-300'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 최대 이동 가능 시간 */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  최대 이동 가능 시간 (편도 기준)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {COMMUTE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setMaxCommuteTimeMinutes(opt.value)}
                      className={`p-3 rounded-xl text-xs font-medium text-left border transition-all ${
                        maxCommuteTimeMinutes === opt.value
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-500 font-bold ring-2 ring-emerald-500/20'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 온라인 위주 활동 참여 선호 설정 (분리된 단독 설정) */}
              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                      <Globe2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-emerald-950 block">
                        온라인·비대면 활동 우선 추천
                      </span>
                      <p className="text-[11px] text-emerald-800/80 mt-0.5">
                        지리적 제약 없는 비대면 특강, 화상 멘토링, 온라인 해커톤 등을 우선적으로 추천받습니다.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreferOnline(!preferOnline)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      preferOnline ? 'bg-emerald-600' : 'bg-stone-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        preferOnline ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* 참가 비용 범위 */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  희망 참가 비용 범위
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {BUDGET_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setMaxFeeBudget(opt.value)}
                      className={`p-2.5 rounded-xl text-xs font-semibold text-center border transition-all ${
                        maxFeeBudget === opt.value
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 모달 푸터 버튼 */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-200 transition-colors"
            >
              이전 단계
            </button>
          ) : (
            <span className="text-xs text-stone-400">1단계 / 총 2단계</span>
          )}

          {step === 1 ? (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all"
            >
              <span>다음 조건 설정</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md shadow-emerald-700/20 transition-all active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>맞춤 추천 시작하기</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
