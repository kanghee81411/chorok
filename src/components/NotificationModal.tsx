// [청록] NotificationModal.tsx - PRD ① 찜 & 마감 알림, 1365 스타일 푸시 알림 및 유사 프로그램 지역 추천 알림 센터

import React, { useState } from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  GitFork,
  MessageSquarePlus,
  Send,
  Settings,
  ShieldCheck,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NotificationItem } from '../types';

export const NotificationModal: React.FC = () => {
  const {
    isNotificationModalOpen,
    setIsNotificationModalOpen,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    triggerSimulatedPush,
    userProfile,
    updateUserProfile,
    activities,
    setSelectedActivity,
    setCurrentView,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'deadline' | 'settings'>('all');

  if (!isNotificationModalOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'deadline') return n.type === 'deadline';
    return true;
  });

  const handleNotificationClick = (item: NotificationItem) => {
    markNotificationAsRead(item.id);
    if (item.activityId) {
      const target = activities.find((a) => a.id === item.activityId);
      if (target) {
        setSelectedActivity(target);
        setIsNotificationModalOpen(false);
      }
    } else if (item.ladderId) {
      setCurrentView('ladder');
      setIsNotificationModalOpen(false);
    } else if (item.requestId) {
      setCurrentView('requests');
      setIsNotificationModalOpen(false);
    }
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'deadline':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'similar_program':
        return <Sparkles className="w-5 h-5 text-emerald-600" />;
      case 'ladder_step':
        return <GitFork className="w-5 h-5 text-teal-600" />;
      case 'request_update':
        return <MessageSquarePlus className="w-5 h-5 text-indigo-600" />;
      default:
        return <Bell className="w-5 h-5 text-stone-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* 모달 상단 헤더 */}
        <div className="px-6 py-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                알림 센터 & 마감 브리핑
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  1365 푸시 연동형
                </span>
              </h2>
              <p className="text-xs text-stone-500">찜한 활동 마감 3일 전, 유사 신규 활동 등록 알림</p>
            </div>
          </div>
          <button
            id="notif-close-btn"
            onClick={() => setIsNotificationModalOpen(false)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex items-center justify-between px-6 pt-3 pb-2 border-b border-stone-100 bg-white">
          <div className="flex items-center gap-1.5">
            <button
              id="notif-tab-all"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              전체 알림 ({notifications.length})
            </button>
            <button
              id="notif-tab-deadline"
              onClick={() => setActiveTab('deadline')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'deadline'
                  ? 'bg-emerald-600 text-white'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              ⏳ 마감 임박 알림
            </button>
            <button
              id="notif-tab-settings"
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'settings'
                  ? 'bg-emerald-600 text-white'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>알림 설정</span>
            </button>
          </div>

          {activeTab !== 'settings' && notifications.some((n) => !n.isRead) && (
            <button
              id="notif-mark-all-read-btn"
              onClick={markAllNotificationsAsRead}
              className="text-xs text-stone-500 hover:text-emerald-700 font-medium flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              모두 읽음
            </button>
          )}
        </div>

        {/* 탭 본문 내용 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {activeTab === 'settings' ? (
            /* 알림 환경 설정 */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900">1365 자원봉사 스타일의 검증된 푸시 알림</h4>
                    <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                      공공 자원봉사 승인 및 활동일 마감 알림 선례처럼, 지역 청소년이 시기를 놓치지 않도록 적시에 필수 알림을 제공합니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between p-3.5 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors cursor-pointer">
                  <div>
                    <p className="text-xs font-bold text-stone-800">찜한 활동 마감 임박 알림 (3일전, 1일전)</p>
                    <p className="text-[11px] text-stone-500 mt-0.5">관심 등록한 프로그램의 서류 제출 및 신청 마감 전 푸시</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={userProfile.notificationSettings.deadlineAlerts}
                    onChange={(e) =>
                      updateUserProfile({
                        notificationSettings: {
                          ...userProfile.notificationSettings,
                          deadlineAlerts: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors cursor-pointer">
                  <div>
                    <p className="text-xs font-bold text-stone-800">내 지역 맞춤 신규 프로그램 등록 알림</p>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      예: "지난번 저장했던 코딩 캠프와 비슷한 프로그램이 {userProfile.region.city}에서 등록됐어요"
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={userProfile.notificationSettings.similarProgramAlerts}
                    onChange={(e) =>
                      updateUserProfile({
                        notificationSettings: {
                          ...userProfile.notificationSettings,
                          similarProgramAlerts: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors cursor-pointer">
                  <div>
                    <p className="text-xs font-bold text-stone-800">기회 사다리 다음 성장 단계 알림</p>
                    <p className="text-[11px] text-stone-500 mt-0.5">활동 기록 작성 후 이어지는 상위 단계 기회 안내</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={userProfile.notificationSettings.ladderNextStepAlerts}
                    onChange={(e) =>
                      updateUserProfile({
                        notificationSettings: {
                          ...userProfile.notificationSettings,
                          ladderNextStepAlerts: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </label>
              </div>

              {/* 시뮬레이션 테스트 푸시 발송 버튼 */}
              <div className="pt-4 border-t border-stone-200">
                <p className="text-xs font-semibold text-stone-700 mb-2">💡 알림 기능 실시간 테스트</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="simulate-deadline-push-btn"
                    onClick={() =>
                      triggerSimulatedPush(
                        '⏳ [마감 알림] 영상 제작 캠프 접수 마감 3일 전',
                        '이지우님, 찜해두신 영상 제작 캠프가 3일 뒤 마감됩니다. 지금 바로 신청 링크를 확인하세요!',
                        'deadline'
                      )
                    }
                    className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 text-xs font-medium"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    마감 알림 수신 테스트
                  </button>

                  <button
                    id="simulate-similar-push-btn"
                    onClick={() =>
                      triggerSimulatedPush(
                        `💡 [${userProfile.region.city}] 신규 코딩 캠프 등록`,
                        `지난번 저장했던 코딩 캠프와 비슷한 프로그램이 ${userProfile.region.city} 건양대에서 등록됐어요!`,
                        'similar_program'
                      )
                    }
                    className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 text-xs font-medium"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    유사 프로그램 알림 테스트
                  </button>
                </div>
              </div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center mb-3">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-stone-700">도착한 알림이 없습니다.</p>
              <p className="text-xs text-stone-500 mt-1">관심 있는 활동을 찜하면 마감 알림이 발송됩니다.</p>
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  item.isRead
                    ? 'bg-white border-stone-200 hover:border-stone-300'
                    : 'bg-emerald-50/40 border-emerald-300 shadow-xs hover:bg-emerald-50/70'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-stone-200 shadow-xs flex items-center justify-center shrink-0">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-xs font-bold text-stone-900 truncate">{item.title}</h4>
                      <span className="text-[10px] text-stone-400 shrink-0 font-medium">{item.createdAt}</span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">{item.message}</p>
                    {(item.activityId || item.ladderId || item.requestId) && (
                      <div className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800">
                        <span>해당 항목 바로 확인하기</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 모달 하단 푸터 */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs text-stone-500">
          <span className="flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-stone-400" />
            웹 푸시 & 브라우저 실시간 알림 지원
          </span>
          <button
            onClick={() => setIsNotificationModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
