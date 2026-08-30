// [청록 - 청소년들의 기록] App.tsx - 10년차 시니어 프론트엔드 개발자 아키텍처: 1440px PC 다열 데스크톱 & 모바일 1열 반응형 웹앱 메인 엔트리포인트

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { LoginView } from './views/LoginView';
import { HomeView } from './views/HomeView';
import { ExploreView } from './views/ExploreView';
import { LadderView } from './views/LadderView';
import { SavedView } from './views/SavedView';
import { CommunityRequestsView } from './views/CommunityRequestsView';
import { MyRecordView } from './views/MyRecordView';
import { OnboardingModal } from './components/OnboardingModal';
import { NotificationModal } from './components/NotificationModal';
import { ActivityDetailModal } from './components/ActivityDetailModal';
import { CommunityRequestModal } from './components/CommunityRequestModal';
import { InstitutionAdminModal } from './components/InstitutionAdminModal';
import {
  Compass,
  GitFork,
  Bookmark,
  MessageSquarePlus,
  BookOpenCheck,
  Building2,
  Sparkles,
  Heart,
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentView, toastMessage, setCurrentView, setIsAdminModalOpen, isAuthenticated } = useApp();

  // 로그인하지 않은 경우 로그인 화면을 최우선 렌더링
  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950">
      {/* 1. 상단 글로벌 네비게이션 헤더 (PC 데스크톱 가로 메뉴 + 모바일 햄버거 메뉴) */}
      <Header />

      {/* 2. 메인 콘텐츠 영역 (PC 1440px 기준 다열 배치 및 패딩) */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {(currentView === 'home' || currentView === 'explore') && <ExploreView />}
        {currentView === 'ladder' && <LadderView />}
        {currentView === 'saved' && <SavedView />}
        {currentView === 'requests' && <CommunityRequestsView />}
        {currentView === 'my-record' && <MyRecordView />}
      </main>

      {/* 3. 모바일 하단 빠른 탭바 (태블릿/모바일 전용 바텀 네비게이션) */}
      <nav
        id="mobile-bottom-nav"
        className="md:hidden sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200 px-2 py-2 flex items-center justify-around text-[10px] font-bold"
      >
        <button
          onClick={() => setCurrentView('explore')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl ${
            currentView === 'home' || currentView === 'explore' ? 'text-emerald-700' : 'text-stone-400'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>활동 탐색</span>
        </button>

        <button
          onClick={() => setCurrentView('ladder')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl ${
            currentView === 'ladder' ? 'text-emerald-700' : 'text-stone-400'
          }`}
        >
          <GitFork className="w-5 h-5" />
          <span>기회 사다리</span>
        </button>

        <button
          onClick={() => setCurrentView('saved')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl ${
            currentView === 'saved' ? 'text-emerald-700' : 'text-stone-400'
          }`}
        >
          <Bookmark className="w-5 h-5" />
          <span>저장·달력</span>
        </button>

        <button
          onClick={() => setCurrentView('requests')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl ${
            currentView === 'requests' ? 'text-emerald-700' : 'text-stone-400'
          }`}
        >
          <MessageSquarePlus className="w-5 h-5" />
          <span>동네 요청</span>
        </button>

        <button
          onClick={() => setCurrentView('my-record')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl ${
            currentView === 'my-record' ? 'text-emerald-700' : 'text-stone-400'
          }`}
        >
          <BookOpenCheck className="w-5 h-5" />
          <span>내 기록장</span>
        </button>
      </nav>

      {/* 4. 푸터 */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-10 px-4 sm:px-8">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-white p-0.5 shadow-2xs border border-emerald-100 flex items-center justify-center overflow-hidden">
                <img
                  src="/cheongnok-logo.png"
                  alt="청록 로고"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <span className="font-extrabold text-sm text-stone-900">
                청록 (청소년들의 기록)
              </span>
              <span className="text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                비수도권 청소년 성장 인프라
              </span>
            </div>
            <p className="text-xs text-stone-500 max-w-xl leading-relaxed">
              청록은 교과 및 비교과 정보가 흩어져 어려움을 겪는 지역 청소년을 위해, 공공기관 공문 수집·운영자 제보·직접 제휴 데이터를 융합하여 기회 사다리와 맞춤 활동을 연결하는 공익 웹앱입니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 font-semibold">
            <button
              onClick={() => setCurrentView('requests')}
              className="hover:text-emerald-700 flex items-center gap-1"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>우리 동네 요청</span>
            </button>
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="hover:text-emerald-700 flex items-center gap-1"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>기관용 관리자 포털</span>
            </button>
            <span className="text-stone-400">© 2026 청록 Team. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {/* 5. 토스트 알림 메시지 팝업 */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-8 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="px-4 py-3 rounded-2xl bg-stone-900/95 text-white text-xs font-bold shadow-2xl backdrop-blur-md flex items-center gap-2.5 border border-stone-700">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 6. 글로벌 모달 컴포넌트 목록 */}
      <OnboardingModal />
      <NotificationModal />
      <ActivityDetailModal />
      <CommunityRequestModal />
      <InstitutionAdminModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
