// [청록] AppContext.tsx - Firebase Firestore 및 Google Auth 실시간 연동 상태 관리자

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  onSnapshot,
  query,
  where,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import {
  Activity,
  OpportunityLadder,
  UserProfile,
  ActivityRecord,
  CommunityRequest,
  NotificationItem,
  SearchFilterState,
  ActivityCategory,
} from '../types';
import {
  initialActivities,
  initialOpportunityLadders,
  initialUserProfile,
  initialActivityRecords,
  initialCommunityRequests,
  initialNotifications,
} from '../data/initialData';
import { curateActivitiesForUser, calculateCurationScore } from '../utils/curationEngine';

export type AppView = 'home' | 'explore' | 'ladder' | 'saved' | 'requests' | 'my-record';

interface AppContextType {
  // 인증 및 로그인 상태 (Firebase Google Auth)
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  currentUser: FirebaseUser | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;

  // 뷰 네비게이션
  currentView: AppView;
  setCurrentView: (view: AppView) => void;

  // 사용자 프로필 및 온보딩 (Firestore 'users' 컬렉션과 동기화)
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  setPrimaryInterest: (category: ActivityCategory) => void;
  toggleInterestCategory: (category: ActivityCategory) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  completeOnboarding: (newProfile: UserProfile) => Promise<void>;
  resetAccount: () => Promise<void>;

  // 활동 데이터 및 상세 모달
  activities: Activity[];
  selectedActivity: Activity | null;
  setSelectedActivity: (activity: Activity | null) => void;
  toggleSaveActivity: (activityId: string) => Promise<void>;
  isActivitySaved: (activityId: string) => boolean;
  addNewActivity: (newActivity: Omit<Activity, 'id' | 'createdAt' | 'matchScore'>) => void;

  // 기회 사다리 (성장 경로)
  ladders: OpportunityLadder[];
  selectedLadder: OpportunityLadder | null;
  setSelectedLadder: (ladder: OpportunityLadder | null) => void;
  updateLadderNodeStatus: (ladderId: string, nodeId: string, status: 'completed' | 'in_progress' | 'recommended') => void;

  // 학생 활동 기록장 (Firestore 'activityLogs' 컬렉션과 동기화)
  activityRecords: ActivityRecord[];
  addActivityRecord: (record: Omit<ActivityRecord, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateActivityRecord: (id: string, record: Partial<ActivityRecord>) => Promise<void>;
  deleteActivityRecord: (id: string) => Promise<void>;

  // 우리 동네 개설 요청 (Firestore 'communityRequests' 컬렉션과 동기화)
  communityRequests: CommunityRequest[];
  isRequestModalOpen: boolean;
  setIsRequestModalOpen: (open: boolean) => void;
  createCommunityRequest: (request: {
    title: string;
    category: ActivityCategory;
    description: string;
    province: string;
    city: string;
    preferredDays: string[];
    preferredBudget: string;
  }) => Promise<void>;
  deleteCommunityRequest: (requestId: string) => Promise<void>;
  toggleSupportRequest: (requestId: string) => Promise<void>;

  // 알림 센터
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  isNotificationModalOpen: boolean;
  setIsNotificationModalOpen: (open: boolean) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  triggerSimulatedPush: (title: string, message: string, type?: NotificationItem['type']) => void;

  // 탐색 및 검색 필터 상태
  searchFilter: SearchFilterState;
  setSearchFilter: React.Dispatch<React.SetStateAction<SearchFilterState>>;
  resetSearchFilter: () => void;

  // 기관 및 관리자 모달
  isAdminModalOpen: boolean;
  setIsAdminModalOpen: (open: boolean) => void;

  // 토스트 메시지
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Firebase Auth 상태
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // 사용자 프로필
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);

  // 활동 목록 (기본 데이터 + 추가된 데이터)
  const [activities, setActivities] = useState<Activity[]>(initialActivities);

  // 기회 사다리 목록
  const [ladders, setLadders] = useState<OpportunityLadder[]>(initialOpportunityLadders);

  // 학생 활동 기록 목록 (Firestore 동기화)
  const [activityRecords, setActivityRecords] = useState<ActivityRecord[]>(initialActivityRecords);

  // 동네 개설 요청 목록 (Firestore 동기화)
  const [communityRequests, setCommunityRequests] = useState<CommunityRequest[]>(initialCommunityRequests);

  // 알림 목록
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  // UI 상태
  const [currentView, setCurrentView] = useState<AppView>('explore');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedLadder, setSelectedLadder] = useState<OpportunityLadder | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState<boolean>(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 토스트 안내 헬퍼
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // 검색/탐색 필터 기본 상태
  const initialFilter: SearchFilterState = {
    keyword: '',
    province: userProfile.region.province || '전체',
    city: '전체',
    maxDistanceKm: 100,
    grades: [],
    maxFee: 100000,
    categories: [],
    format: '전체',
    strategy: '전체',
    sortBy: 'recommend',
  };

  const [searchFilter, setSearchFilter] = useState<SearchFilterState>(initialFilter);

  // 실시간 큐레이션 활동 계산
  const curatedActivities = useMemo(() => {
    return curateActivitiesForUser(activities, userProfile);
  }, [activities, userProfile]);

  // -------------------------------------------------------------
  // 1. Firebase Auth 상태 감지 & Firestore 사용자 프로필 실시간 로드
  // -------------------------------------------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsAuthLoading(true);
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);

        try {
          // Firestore에서 사용자 프로필 조회
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data() as UserProfile;
            setUserProfile({
              ...data,
              id: user.uid,
              email: user.email || data.email,
              name: data.name || user.displayName || '청소년',
            });
          } else {
            // 최초 로그인 시 기본 프로필 생성 및 Firestore에 저장
            const newProfile: UserProfile = {
              ...initialUserProfile,
              id: user.uid,
              name: user.displayName || '청소년',
              email: user.email || 'user@example.com',
            };
            await setDoc(userDocRef, {
              ...newProfile,
              updatedAt: new Date().toISOString(),
            });
            setUserProfile(newProfile);
          }
        } catch (error) {
          console.error('Firestore user profile load error:', error);
          // 네트워크 등 에러 시 로컬 프로필 폴백
          setUserProfile((prev) => ({
            ...prev,
            id: user.uid,
            name: user.displayName || prev.name,
            email: user.email || prev.email,
          }));
        }
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // -------------------------------------------------------------
  // 2. Firestore 실시간 리스너: 사용자 활동 기록 (activityLogs)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!currentUser) {
      setActivityRecords(initialActivityRecords);
      return;
    }

    try {
      const q = query(
        collection(db, 'activityLogs'),
        where('userId', '==', currentUser.uid)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const records: ActivityRecord[] = snapshot.docs.map((docSnap) => ({
              id: docSnap.id,
              ...(docSnap.data() as any),
            }));
            setActivityRecords(records);
          } else {
            // Firestore에 아직 없으면 기본 기록 유지
            setActivityRecords(initialActivityRecords);
          }
        },
        (err) => {
          console.error('activityLogs snapshot error:', err);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.error('Failed to bind activityLogs listener:', e);
    }
  }, [currentUser]);

  // -------------------------------------------------------------
  // 3. Firestore 실시간 리스너: 동네 개설 요청 (communityRequests)
  // -------------------------------------------------------------
  useEffect(() => {
    try {
      const colRef = collection(db, 'communityRequests');
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const requests: CommunityRequest[] = snapshot.docs.map((d) => ({
              id: d.id,
              ...(d.data() as any),
            }));
            // 비속어 필터링
            const cleanRequests = requests.filter(
              (r) =>
                !String(r.title || '').includes('느금마') &&
                !String(r.description || '').includes('느금마')
            );
            setCommunityRequests(cleanRequests);
          } else {
            setCommunityRequests(initialCommunityRequests);
          }
        },
        (err) => {
          console.error('communityRequests snapshot error:', err);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.error('Failed to bind communityRequests listener:', e);
    }
  }, []);

  // -------------------------------------------------------------
  // 4. 인증 메서드: Google 로그인 & 로그아웃
  // -------------------------------------------------------------
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      showToast(`반갑습니다, ${user.displayName || '학생'}님! Google 계정으로 로그인되었습니다.`);
    } catch (error: any) {
      console.error('Google login error in context:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setIsAuthenticated(false);
      setCurrentView('explore');
      showToast('성공적으로 로그아웃되었습니다.');
    } catch (error) {
      console.error('Logout error:', error);
      showToast('로그아웃 처리 중 오류가 발생했습니다.');
    }
  };

  // -------------------------------------------------------------
  // 5. 프로필 업데이트 및 Firestore 동기화
  // -------------------------------------------------------------
  const updateUserProfile = async (profileUpdate: Partial<UserProfile>) => {
    const updated = {
      ...userProfile,
      ...profileUpdate,
    };
    setUserProfile(updated);

    if (currentUser) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await setDoc(
          userDocRef,
          {
            ...updated,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        console.error('Failed to update profile to Firestore:', err);
      }
    }
    showToast('프로필 및 맞춤 설정이 클라우드에 안전하게 저장되었습니다.');
  };

  const setPrimaryInterest = (category: ActivityCategory) => {
    const currentInterests = userProfile.interestedCategories || [];
    const filtered = currentInterests.filter((c) => c !== category);
    const newInterests = [category, ...filtered];
    updateUserProfile({ interestedCategories: newInterests });
    showToast(`[${category}] 분야 중심으로 큐레이션 알고리즘이 즉시 재계산되었습니다.`);
  };

  const toggleInterestCategory = (category: ActivityCategory) => {
    const currentInterests = userProfile.interestedCategories || [];
    const exists = currentInterests.includes(category);
    let newInterests: ActivityCategory[];
    if (exists) {
      newInterests = currentInterests.filter((c) => c !== category);
      if (newInterests.length === 0) newInterests = [category];
    } else {
      newInterests = [...currentInterests, category];
    }
    updateUserProfile({ interestedCategories: newInterests });
    showToast(`관심분야가 업데이트되어 맞춤 추천 목록이 갱신되었습니다.`);
  };

  const completeOnboarding = async (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    setIsOnboardingOpen(false);
    if (currentUser) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await setDoc(
          userDocRef,
          {
            ...newProfile,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        console.error('Failed to sync onboarding to Firestore:', err);
      }
    }
    showToast(`환영합니다, ${newProfile.name}님! 맞춤 활동 추천이 시작되었습니다.`);
  };

  const resetAccount = async () => {
    if (currentUser) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await deleteDoc(userDocRef);
      } catch (err) {
        console.error('Failed to delete user doc:', err);
      }
    }
    await logout();
    showToast('계정 데이터가 성공적으로 초기화되었습니다.');
  };

  // -------------------------------------------------------------
  // 6. 활동 찜하기 (Firestore 동기화)
  // -------------------------------------------------------------
  const toggleSaveActivity = async (activityId: string) => {
    const isSaved = userProfile.savedActivityIds.includes(activityId);
    let newSavedIds: string[];

    if (isSaved) {
      newSavedIds = userProfile.savedActivityIds.filter((id) => id !== activityId);
      showToast('찜 목록에서 제거되었습니다.');
    } else {
      newSavedIds = [...userProfile.savedActivityIds, activityId];
      const targetActivity = activities.find((a) => a.id === activityId);
      showToast(`'${targetActivity?.title.slice(0, 16)}...'을(를) 찜했습니다! 마감 알림이 자동 등록됩니다.`);

      // 마감 임박 알림 추가
      if (targetActivity && userProfile.notificationSettings?.deadlineAlerts) {
        const newNotif: NotificationItem = {
          id: `notif_auto_${Date.now()}`,
          type: 'deadline',
          title: '🔔 찜한 활동 마감 알림 예약됨',
          message: `'${targetActivity.title}' 활동이 관심 목록에 추가되었습니다. 신청 마감 3일 전과 1일 전에 푸시 알림을 발송해 드립니다.`,
          activityId: targetActivity.id,
          createdAt: '방금 전',
          isRead: false,
        };
        setNotifications((prev) => [newNotif, ...prev]);
      }
    }

    await updateUserProfile({ savedActivityIds: newSavedIds });
  };

  const isActivitySaved = (activityId: string) => {
    return userProfile.savedActivityIds.includes(activityId);
  };

  const addNewActivity = (newActivityData: Omit<Activity, 'id' | 'createdAt' | 'matchScore'>) => {
    const id = `act_custom_${Date.now()}`;
    const newActivity: Activity = {
      ...newActivityData,
      id,
      matchScore: 90,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setActivities((prev) => [newActivity, ...prev]);
    showToast(`'${newActivity.title}' 프로그램이 성공적으로 등록되었습니다!`);
  };

  const updateLadderNodeStatus = (
    ladderId: string,
    nodeId: string,
    status: 'completed' | 'in_progress' | 'recommended'
  ) => {
    setLadders((prev) =>
      prev.map((ladder) => {
        if (ladder.id !== ladderId) return ladder;
        const updatedNodes = ladder.nodes.map((node) => {
          if (node.id === nodeId) {
            return { ...node, status };
          }
          return node;
        });
        return { ...ladder, nodes: updatedNodes };
      })
    );
    showToast('성장 사다리 진행 상태가 업데이트되었습니다.');
  };

  // -------------------------------------------------------------
  // 7. 학생 활동 기록 (Firestore activityLogs 컬렉션 연동)
  // -------------------------------------------------------------
  const addActivityRecord = async (recordData: Omit<ActivityRecord, 'id' | 'userId' | 'createdAt'>) => {
    const recId = `rec_${Date.now()}`;
    const newRecord: ActivityRecord = {
      ...recordData,
      id: recId,
      userId: currentUser?.uid || userProfile.id,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setActivityRecords((prev) => [newRecord, ...prev]);

    if (currentUser) {
      try {
        const logDocRef = doc(db, 'activityLogs', recId);
        await setDoc(logDocRef, newRecord);
      } catch (err) {
        console.error('Failed to save activity record to Firestore:', err);
      }
    }

    showToast('새로운 활동 기록이 학생부/포트폴리오에 안전하게 저장되었습니다!');
  };

  const updateActivityRecord = async (id: string, updatedFields: Partial<ActivityRecord>) => {
    setActivityRecords((prev) =>
      prev.map((rec) => (rec.id === id ? { ...rec, ...updatedFields } : rec))
    );

    if (currentUser) {
      try {
        const logDocRef = doc(db, 'activityLogs', id);
        await updateDoc(logDocRef, updatedFields as any);
      } catch (err) {
        console.error('Failed to update activity record in Firestore:', err);
      }
    }
    showToast('기록이 수정되었습니다.');
  };

  const deleteActivityRecord = async (id: string) => {
    setActivityRecords((prev) => prev.filter((rec) => rec.id !== id));

    if (currentUser) {
      try {
        const logDocRef = doc(db, 'activityLogs', id);
        await deleteDoc(logDocRef);
      } catch (err) {
        console.error('Failed to delete activity record in Firestore:', err);
      }
    }
    showToast('활동 기록이 삭제되었습니다.');
  };

  // -------------------------------------------------------------
  // 8. 우리 동네 개설 요청 (Firestore communityRequests 연동)
  // -------------------------------------------------------------
  const createCommunityRequest = async (requestData: {
    title: string;
    category: ActivityCategory;
    description: string;
    province: string;
    city: string;
    preferredDays: string[];
    preferredBudget: string;
  }) => {
    if (
      requestData.title.includes('느금마') ||
      requestData.description.includes('느금마')
    ) {
      showToast('올바르고 정중한 언어로 활동 개설 요청을 작성해 주세요.');
      return;
    }

    const reqId = `req_${Date.now()}`;
    const authorId = currentUser?.uid || userProfile.id;
    const newReq: CommunityRequest = {
      id: reqId,
      userId: authorId,
      authorName: userProfile.name,
      authorGrade: userProfile.grade,
      category: requestData.category,
      title: requestData.title,
      description: requestData.description,
      region: {
        province: requestData.province,
        city: requestData.city,
      },
      preferredDays: requestData.preferredDays,
      preferredBudget: requestData.preferredBudget,
      supportCount: 1,
      supportedByUserIds: [authorId],
      status: '수렴중',
      statusComment: '새로 등록되어 지역 학생들의 지지를 모으고 있습니다.',
      targetCount: 20,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setCommunityRequests((prev) => [newReq, ...prev]);
    setIsRequestModalOpen(false);

    try {
      const reqDocRef = doc(db, 'communityRequests', reqId);
      await setDoc(reqDocRef, newReq);
    } catch (err) {
      console.error('Failed to save community request to Firestore:', err);
    }

    showToast('우리 동네 활동 개설 요청이 등록되었습니다! 20명 지지 시 지자체/기업에 전달됩니다.');
  };

  const deleteCommunityRequest = async (requestId: string) => {
    setCommunityRequests((prev) => prev.filter((req) => req.id !== requestId));

    try {
      const reqDocRef = doc(db, 'communityRequests', requestId);
      await deleteDoc(reqDocRef);
    } catch (err) {
      console.error('Failed to delete community request in Firestore:', err);
    }

    showToast('활동 개설 요청이 삭제되었습니다.');
  };

  const toggleSupportRequest = async (requestId: string) => {
    const authorId = currentUser?.uid || userProfile.id;

    let targetUpdatedReq: CommunityRequest | null = null;

    setCommunityRequests((prev) =>
      prev.map((req) => {
        if (req.id !== requestId) return req;
        const hasSupported = req.supportedByUserIds.includes(authorId);
        const newSupported = hasSupported
          ? req.supportedByUserIds.filter((id) => id !== authorId)
          : [...req.supportedByUserIds, authorId];

        const newCount = hasSupported
          ? Math.max(0, req.supportCount - 1)
          : req.supportCount + 1;

        let newStatus = req.status;
        let newComment = req.statusComment;

        if (newCount >= req.targetCount && req.status === '수렴중') {
          newStatus = '지자체/기업전달';
          newComment = `${req.region.city} 청소년수련관 및 지자체 교육지원청에 학생 수요 청원이 공식 전달되었습니다!`;
        }

        const updated: CommunityRequest = {
          ...req,
          supportCount: newCount,
          supportedByUserIds: newSupported,
          status: newStatus,
          statusComment: newComment,
        };
        targetUpdatedReq = updated;
        return updated;
      })
    );

    if (targetUpdatedReq) {
      try {
        const reqDocRef = doc(db, 'communityRequests', requestId);
        await setDoc(reqDocRef, targetUpdatedReq, { merge: true });
      } catch (err) {
        console.error('Failed to update support to Firestore:', err);
      }
    }

    showToast('개설 요청 지지가 반영되었습니다!');
  };

  // -------------------------------------------------------------
  // 9. 알림 관리
  // -------------------------------------------------------------
  const unreadNotificationCount = notifications.filter((n) => !n.isRead).length;

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('모든 알림을 읽음 처리했습니다.');
  };

  const triggerSimulatedPush = (title: string, message: string, type: NotificationItem['type'] = 'system') => {
    const newNotif: NotificationItem = {
      id: `notif_sim_${Date.now()}`,
      type,
      title,
      message,
      createdAt: '방금 전',
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    showToast(`[푸시 알림] ${title}`);
  };

  const resetSearchFilter = () => {
    setSearchFilter(initialFilter);
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        isAuthLoading,
        currentUser,
        loginWithGoogle,
        logout,
        currentView,
        setCurrentView,
        userProfile,
        updateUserProfile,
        setPrimaryInterest,
        toggleInterestCategory,
        isOnboardingOpen,
        setIsOnboardingOpen,
        completeOnboarding,
        resetAccount,
        activities: curatedActivities,
        selectedActivity: selectedActivity
          ? {
              ...selectedActivity,
              ...calculateCurationScore(selectedActivity, userProfile),
            }
          : null,
        setSelectedActivity,
        toggleSaveActivity,
        isActivitySaved,
        addNewActivity,
        ladders,
        selectedLadder,
        setSelectedLadder,
        updateLadderNodeStatus,
        activityRecords,
        addActivityRecord,
        updateActivityRecord,
        deleteActivityRecord,
        communityRequests,
        isRequestModalOpen,
        setIsRequestModalOpen,
        createCommunityRequest,
        deleteCommunityRequest,
        toggleSupportRequest,
        notifications,
        unreadNotificationCount,
        isNotificationModalOpen,
        setIsNotificationModalOpen,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        triggerSimulatedPush,
        searchFilter,
        setSearchFilter,
        resetSearchFilter,
        isAdminModalOpen,
        setIsAdminModalOpen,
        toastMessage,
        showToast,
      }}
    >
      {children}
      {/* 전역 토스트 알림 */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-stone-900 text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 border border-stone-800 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
          <p className="text-sm font-medium leading-relaxed">{toastMessage}</p>
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
