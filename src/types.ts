// [청록] types.ts - 청소년 활동, 사용자 프로필, 성장 기회 사다리, 데이터 수집 전략 및 활동 기록 관련 전체 타입 정의

/** 활동 카테고리 (5대 핵심 추천 분야: 코딩, 창업, 봉사, 과학/환경, 진로) */
export type ActivityCategory =
  | '코딩'
  | '창업'
  | '봉사'
  | '과학/환경'
  | '진로'
  | '스포츠'
  | '음악'
  | '기타';

/** 데이터 수집 전략 분류 (PRD 명시) */
export type DataCollectionStrategy =
  | '경쟁형' // 공모전·대회·연구 -> 공식 채널(공문, 공공데이터포털, 대회 홈페이지) 수집
  | '비경쟁형' // 동아리·캠프·특강 -> 사용자 제보 및 운영자 자율 등록
  | '참여형'; // 청소년의회·멘토링 -> 지자체·기관 직접 제휴

/** 온/오프라인 형태 */
export type ActivityFormat = '오프라인' | '온라인' | '온/오프라인 혼합';

/** 학년 범위 */
export type TargetGrade = '중1' | '중2' | '중3' | '고1' | '고2' | '고3' | '전체 청소년' | '중학생 전체' | '고등학생 전체';

/** 활동 데이터 모델 */
export interface Activity {
  id: string;
  title: string;
  category: ActivityCategory;
  collectionStrategy: DataCollectionStrategy;
  sourceChannel: string; // 예: '행정안전부 공공데이터포털', '논산시 청소년수련관 제휴', '학생 제보 검증 완료'
  hostOrg: string; // 주최/주관 기관
  hostOrgType: '공공기관/지자체' | '비영리단체' | '대학/연구소' | '기업/사회공헌';
  imageUrl: string;
  summary: string;
  description: string;
  targetGrades: TargetGrade[];
  region: {
    province: string; // 시/도 (예: 충청남도, 전라북도, 경상북도, 강원특별자치도 등)
    city: string; // 시/군/구 (예: 논산시, 공주시, 전주시, 안동시, 춘천시 등)
    detailAddress: string;
    latitude?: number;
    longitude?: number;
  };
  distanceKm: number; // 사용자 기준 예상 거리 (km)
  commuteTimeMinutes: number; // 예상 이동 시간(분)
  format: ActivityFormat;
  fee: number; // 0이면 무료
  feeDescription: string;
  applicationPeriod: {
    start: string; // YYYY-MM-DD
    end: string; // YYYY-MM-DD
  };
  activityPeriod: {
    start: string; // YYYY-MM-DD
    end: string; // YYYY-MM-DD
    daysOfWeek: string[]; // ['토', '일'] 등
  };
  recommendReason?: string; // 학생 맞춤 추천 이유
  matchScore: number; // 적합도 점수 (0~100%)
  ladderNodeId?: string; // 연결된 기회 사다리 노드 ID
  ladderStageName?: string; // 기회 사다리 단계명 (예: '2단계: 지역 청소년 영상제')
  tags: string[];
  capacity: number; // 정원
  currentApplicants: number; // 현재 신청 인원
  isUrgent?: boolean; // 마감 임박 여부
  officialUrl?: string; // 신청 공식 링크
  createdAt: string;
}

/** 기회 사다리 노드 (성장 경로의 각 단계) */
export interface LadderNode {
  id: string;
  stageOrder: number; // 1, 2, 3, 4, 5...
  title: string;
  experienceType: '교내/입문' | '지역 행사/캠프' | '실전 프로젝트' | '기획단/리더' | '대외 공모전/인증';
  description: string;
  acquiredSkills: string[];
  linkedActivityIds: string[];
  prerequisites?: string[]; // 선수 경험 요건
  status: 'completed' | 'in_progress' | 'recommended' | 'locked';
}

/** 기회 사다리 (성장 로드맵) */
export interface OpportunityLadder {
  id: string;
  trackName: string; // 예: '청소년 미디어 크리에이터 & 방송 전문가 경로'
  category: ActivityCategory;
  description: string;
  totalStages: number;
  nodes: LadderNode[];
  targetOutcome: string; // 예: '지역 미디어 공모전 대상 및 방송사 청소년 기자단 활동'
  matchedKeywords?: string[]; // 매칭된 키워드 태그
  coreMilestones?: string[]; // 핵심 마일스톤 요약
}

/** 사용자 온보딩 & 프로필 데이터 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  grade: '중1' | '중2' | '중3' | '고1' | '고2' | '고3' | '학교 밖 청소년';
  region: {
    province: string;
    city: string;
  };
  interestedCategories: ActivityCategory[];
  availableDays: string[]; // ['월', '수', '토', '일'] 등
  maxCommuteTimeMinutes: number; // 예: 30분, 60분, 90분, 120분 (2시간 이상)
  preferOnline?: boolean; // 온라인 위주 활동 선호 여부 분리
  maxFeeBudget: number; // 예: 0(무료만), 30000(3만원 이하), 100000(무관)
  completedActivityIds: string[]; // 진행 완료한 활동 ID 목록
  savedActivityIds: string[]; // 찜한 활동 ID 목록
  notificationSettings: {
    deadlineAlerts: boolean; // 마감 3일전/1일전 알림
    similarProgramAlerts: boolean; // 찜한 활동과 유사한 지역 프로그램 등록 알림
    ladderNextStepAlerts: boolean; // 사다리 다음 성장 단계 알림
    pushEnabled: boolean;
  };
  isAdmin?: boolean; // 기관/관리자 모드 여부
}

/** 학생 활동 기록 (학생부·포트폴리오·성장기록) */
export interface ActivityRecord {
  id: string;
  userId: string;
  activityId?: string;
  activityTitle: string;
  category: ActivityCategory;
  recordType: '진로' | '봉사' | '교육' | '자율';
  date: string; // YYYY-MM-DD
  role: string; // 예: '기획 및 영상 촬영 담당', '팀장'
  content: string; // 진행한 활동 내용 요약
  reflection: string; // 느낀 점 및 성장한 점 (학생부 기재용 문장 형태)
  hoursSpent?: number; // 활동 시간 (봉사 인정 시간 등)
  ladderTrackName?: string; // 연계된 기회 사다리
  isVerified?: boolean; // 기관 확인/실적 인증 여부
  createdAt: string;
}

/** 우리 동네에도 만들어주세요 (청소년 수요 요청) */
export interface CommunityRequest {
  id: string;
  userId: string;
  authorName: string;
  authorGrade: string;
  category: ActivityCategory;
  title: string;
  description: string;
  region: {
    province: string;
    city: string;
  };
  preferredDays: string[];
  preferredBudget: string; // '무료 희망', '3만원 이하', '상관없음'
  supportCount: number; // 지지/동의한 학생 수
  supportedByUserIds: string[];
  status: '수렴중' | '검토중' | '지자체/기업전달' | '개설완료';
  statusComment?: string;
  targetCount: number; // 목표 지지자 수 (예: 20명, 50명)
  createdAt: string;
}

/** 알림 항목 */
export interface NotificationItem {
  id: string;
  type: 'deadline' | 'similar_program' | 'ladder_step' | 'request_update' | 'system';
  title: string;
  message: string;
  activityId?: string;
  ladderId?: string;
  requestId?: string;
  createdAt: string;
  isRead: boolean;
}

/** 탐색 필터 옵션 */
export interface SearchFilterState {
  keyword: string;
  province: string;
  city: string;
  maxDistanceKm: number;
  grades: string[];
  maxFee: number;
  categories: ActivityCategory[];
  format: string; // '전체' | '오프라인' | '온라인'
  strategy: string; // '전체' | '경쟁형' | '비경쟁형' | '참여형'
  sortBy: 'recommend' | 'deadline' | 'distance' | 'latest';
}
