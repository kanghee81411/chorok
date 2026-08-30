// [청록] Header.tsx - 미니멀하고 심플한 상단 네비게이션 헤더

import React, { useState } from 'react';
import {
  Sparkles,
  Compass,
  GitFork,
  Bookmark,
  BookOpenCheck,
  Bell,
  MapPin,
  Menu,
  X,
  MessageSquarePlus,
  Building2,
  LogOut,
} from 'lucide-react';
import { useApp, AppView } from '../context/AppContext';

export const Header: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    userProfile,
    unreadNotificationCount,
    setIsNotificationModalOpen,
    setIsOnboardingOpen,
    setIsRequestModalOpen,
    setIsAdminModalOpen,
    logout,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: AppView; label: string; icon: React.ReactNode }[] = [
    { id: 'explore', label: '활동 탐색', icon: <Compass className="w-4 h-4" /> },
    { id: 'ladder', label: '기회 사다리', icon: <GitFork className="w-4 h-4" /> },
    { id: 'saved', label: '보관함·달력', icon: <Bookmark className="w-4 h-4" /> },
    { id: 'requests', label: '동네 개설 요청', icon: <MessageSquarePlus className="w-4 h-4" /> },
    { id: 'my-record', label: '내 기록', icon: <BookOpenCheck className="w-4 h-4" /> },
  ];

  const handleNavClick = (view: AppView) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* 좌측: 청록 공식 브랜드 로고 */}
          <div className="flex items-center gap-3">
            <button
              id="header-logo-btn"
              onClick={() => handleNavClick('explore')}
              className="flex items-center gap-2.5 text-left group focus:outline-none transition-transform active:scale-95"
            >
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white p-0.5 shadow-sm border border-emerald-100 flex items-center justify-center overflow-hidden group-hover:border-emerald-300 group-hover:shadow-md transition-all">
                <img
                  src="/cheongnok-logo.png"
                  alt="청록 로고"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg sm:text-xl tracking-tight text-emerald-800 group-hover:text-emerald-600 transition-colors">
                    청록
                  </span>
                  <span className="hidden xl:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    기회 사다리
                  </span>
                </div>
              </div>
            </button>

            {/* 지역 미니 뱃지 */}
            <button
              id="header-user-region-chip"
              onClick={() => setIsOnboardingOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-medium transition-colors"
              title="지역 및 학년 설정 변경"
            >
              <MapPin className="w-3 h-3 text-emerald-600" />
              <span>{userProfile.region.city}</span>
              <span className="text-stone-300">·</span>
              <span>{userProfile.grade}</span>
            </button>
          </div>

          {/* 중앙: 단순하고 세련된 세그먼트 메뉴 */}
          <nav className="hidden md:flex items-center p-1 rounded-full bg-stone-100/90 border border-stone-200/60">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-desktop-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white text-emerald-700 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
                  }`}
                >
                  <span className={isActive ? 'text-emerald-600' : 'text-stone-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* 우측: 필수 유틸리티 (알림 & 프로필) */}
          <div className="flex items-center gap-1.5">
            {/* 알림 벨 */}
            <button
              id="header-notification-btn"
              onClick={() => setIsNotificationModalOpen(true)}
              className="relative p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              title="알림"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>

            {/* 프로필 아바타 */}
            <button
              id="header-profile-quick-btn"
              onClick={() => handleNavClick('my-record')}
              className="p-1 rounded-full hover:ring-2 hover:ring-emerald-500/30 transition-all"
              title="내 프로필 및 기록"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs border border-emerald-300">
                {userProfile.name.slice(0, 1)}
              </div>
            </button>

            {/* 로그아웃 버튼 */}
            <button
              id="header-logout-btn"
              onClick={logout}
              className="hidden sm:flex p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="로그아웃"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* 모바일 햄버거 토글 */}
            <button
              id="header-mobile-hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              aria-label="메뉴 열기"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 간결한 드롭다운 메뉴 */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 px-4 py-3 space-y-1 animate-in slide-in-from-top-2 duration-150">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive ? 'bg-emerald-50 text-emerald-700' : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <span className={isActive ? 'text-emerald-600' : 'text-stone-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
          
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 px-2">
            <button
              onClick={() => {
                setIsOnboardingOpen(true);
                setMobileMenuOpen(false);
              }}
              className="hover:text-emerald-700 font-medium flex items-center gap-1"
            >
              <MapPin className="w-3 h-3 text-emerald-600" />
              <span>{userProfile.region.city} ({userProfile.grade}) 조건 변경</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="text-rose-600 font-bold hover:underline"
            >
              로그아웃
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
