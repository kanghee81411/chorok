// [청록] CommunityRequestModal.tsx - PRD ③ '우리 동네에도 만들어주세요' 활동 개설 요청 모달 (카테고리, 지역, 요일, 예산, 요청 내용)

import React, { useState } from 'react';
import {
  MessageSquarePlus,
  X,
  MapPin,
  Calendar,
  Coins,
  Sparkles,
  Send,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivityCategory } from '../types';
import { koreanRegions } from '../data/initialData';

const CATEGORIES: ActivityCategory[] = [
  '과학/환경',
  '코딩',
  '창업',
  '봉사',
  '진로',
];

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

const BUDGET_OPTIONS = [
  '무료 희망 (공공기관 지원)',
  '3만원 이하 (재료비 수준)',
  '5만원 이하',
  '상관없음',
];

export const CommunityRequestModal: React.FC = () => {
  const { isRequestModalOpen, setIsRequestModalOpen, userProfile, createCommunityRequest } =
    useApp();

  const [category, setCategory] = useState<ActivityCategory>('코딩');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [province, setProvince] = useState(userProfile.region.province || '충청남도');
  const [city, setCity] = useState(userProfile.region.city || '논산시');
  const [preferredDays, setPreferredDays] = useState<string[]>(['토', '일']);
  const [preferredBudget, setPreferredBudget] = useState(BUDGET_OPTIONS[0]);

  if (!isRequestModalOpen) return null;

  const availableCities = koreanRegions[province] || [];

  const toggleDay = (day: string) => {
    if (preferredDays.includes(day)) {
      setPreferredDays(preferredDays.filter((d) => d !== day));
    } else {
      setPreferredDays([...preferredDays, day]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('프로그램 제목과 구체적인 개설 희망 이유를 작성해 주세요.');
      return;
    }

    if (title.includes('느금마') || description.includes('느금마')) {
      alert('부적절하거나 비속어가 포함된 내용은 등록할 수 없습니다. 바른 말을 사용해 주세요.');
      return;
    }

    createCommunityRequest({
      title: title.trim(),
      category,
      description: description.trim(),
      province,
      city: city || availableCities[0] || '중심지',
      preferredDays: preferredDays.length > 0 ? preferredDays : ['토'],
      preferredBudget,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* 헤더 */}
        <div className="px-6 py-5 border-b border-stone-200 bg-linear-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center font-bold">
              <MessageSquarePlus className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">우리 동네에도 만들어주세요</h2>
              <p className="text-xs text-emerald-100 mt-0.5">
                원하는 활동을 정부·지자체·기업에 제안하고 지역 학생들과 지지를 모아보세요
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsRequestModalOpen(false)}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 폼 본문 */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* PRD 안내 팁 배너 */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>학생 수요 집계 시스템:</strong> 이 요청에 지역 학생 20명 이상이 지지하면, 해당 시·군 지자체 청소년재단 및 협력 기업에 공식 프로그램 개설 제안서가 전달됩니다.
            </p>
          </div>

          {/* 희망 카테고리 (코딩/디자인/스포츠/진로/봉사/음악/창업/기타) */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              활동 분야 (카테고리)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border text-center ${
                    category === cat
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 개설 희망 지역 */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              개설 희망 지역
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={province}
                onChange={(e) => {
                  const newProv = e.target.value;
                  setProvince(newProv);
                  setCity(koreanRegions[newProv]?.[0] || '');
                }}
                className="px-3 py-2 rounded-xl border border-stone-300 text-xs font-medium bg-white"
              >
                {Object.keys(koreanRegions).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>

              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="px-3 py-2 rounded-xl border border-stone-300 text-xs font-medium bg-white"
              >
                {availableCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 프로그램 명 (제목) */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              희망 프로그램 제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 논산 청소년 주말 AI 웹앱 만들기 해커톤 캠프 개설 요청"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
              required
            />
          </div>

          {/* 구체적 개설 요청 내용 및 필요성 */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              구체적인 활동 내용 및 개설이 필요한 이유
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="우리 지역에는 코딩이나 미디어 장비를 다룰 공간이 부족합니다. 청소년문화의집에서 주말마다 팀을 이뤄 실제 결과물을 만드는 워크숍이 있으면 좋겠습니다..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs leading-relaxed"
              required
            />
          </div>

          {/* 희망 요일 및 예산 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                참여 희망 요일
              </label>
              <div className="flex gap-1">
                {DAYS.map((day) => {
                  const isSelected = preferredDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-stone-50 text-stone-600 border-stone-200'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-emerald-600" />
                희망 예산/비용
              </label>
              <select
                value={preferredBudget}
                onChange={(e) => setPreferredBudget(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-medium bg-white"
              >
                {BUDGET_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="pt-2">
            <button
              id="submit-community-request-btn"
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>동네 활동 개설 요청 등록하기</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
