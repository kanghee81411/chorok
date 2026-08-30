// [청록] curationEngine.ts - 학생 관심분야 및 지역·학년·비용·성장사다리 다면적 맞춤 큐레이션 알고리즘 엔진

import { Activity, UserProfile, ActivityCategory } from '../types';

export interface CurationBreakdown {
  interestScore: number; // 최대 40점 (관심 분야 및 키워드 일치도)
  regionScore: number; // 최대 25점 (거주지 및 대중교통 이동시간 적합성)
  feeScore: number; // 최대 15점 (0원 무료 또는 학생 예산 내)
  gradeAndScheduleScore: number; // 최대 10점 (대상 학년 및 참여 가능 요일)
  ladderSynergyScore: number; // 최대 10점 (기회 사다리 및 이전 활동 연계)
  urgencyBonus: number; // 최대 5점 (마감 임박 신선도)
  totalScore: number; // 0 ~ 100점
  isTopInterest: boolean;
  isLocalOrOnline: boolean;
  isFree: boolean;
}

/**
 * 특정 활동에 대해 사용자의 프로필(특히 관심 분야 및 거주 지역)을 바탕으로 정밀 적합도 점수와 분석 내역을 계산합니다.
 */
export function calculateCurationScore(
  activity: Activity,
  userProfile: UserProfile
): {
  score: number;
  breakdown: CurationBreakdown;
  recommendReason: string;
} {
  const userInterests = userProfile.interestedCategories || [];
  const primaryInterest = userInterests[0]; // 1순위 관심분야
  const isTargetCategory = userInterests.includes(activity.category);
  const isPrimary = activity.category === primaryInterest;

  // 1. 관심 분야 일치도 (최대 40점)
  let interestScore = 0;
  if (isPrimary) {
    interestScore = 40; // 1순위 관심분야 완벽 일치
  } else if (isTargetCategory) {
    interestScore = 34; // 2순위 이하 관심분야 일치
  } else {
    // 관심분야 목록에 없더라도 태그 또는 제목에 학생의 관심분야 단어가 포함되었는지 탐색
    const hasRelatedTag = activity.tags.some((t) =>
      userInterests.some((cat) => t.includes(cat) || cat.includes(t))
    );
    if (hasRelatedTag) {
      interestScore = 20;
    } else {
      // 새로운 영역 탐색을 위한 기본 점수
      interestScore = 6;
    }
  }

  // 2. 지역 및 이동 편의성 (최대 25점, 타 지역 오프라인은 대폭 감점)
  let regionScore = 0;
  const isSameCity =
    activity.region.city === userProfile.region.city ||
    activity.region.city.includes(userProfile.region.city) ||
    userProfile.region.city.includes(activity.region.city);

  const isSameProvince =
    activity.region.province === userProfile.region.province ||
    activity.region.province === '전국';

  const isOnline = activity.format === '온라인';
  const isHybrid = activity.format === '온/오프라인 혼합';

  if (isOnline && userProfile.preferOnline) {
    regionScore = 25; // 온라인 선호 설정 시 온라인 활동 만점
  } else if (isSameCity) {
    regionScore = 25; // 내 거주 시/군 완벽 일치 최고 점수
  } else if (isOnline) {
    regionScore = 24; // 공간 제약 없는 온라인 활동
  } else if (isSameProvince) {
    if (activity.commuteTimeMinutes <= userProfile.maxCommuteTimeMinutes) {
      regionScore = 20;
    } else {
      regionScore = 10;
    }
  } else if (isHybrid) {
    regionScore = 15; // 원격 참여 가능한 온/오프 혼합
  } else {
    // 타 지역 오프라인 활동 (타 시도 이동 불가 - 홈 추천 점수 대폭 감점)
    regionScore = -40;
  }

  // 3. 비용 및 예산 적합도 (최대 15점)
  let feeScore = 0;
  if (activity.fee === 0) {
    feeScore = 15; // 경제적 부담 없는 0원 전액 무료
  } else if (activity.fee <= userProfile.maxFeeBudget) {
    feeScore = 12;
  } else {
    feeScore = 4;
  }

  // 4. 대상 학년 및 참여 가능 요일 (최대 10점)
  let gradeAndScheduleScore = 0;
  const gradeMatches =
    activity.targetGrades.includes('전체 청소년') ||
    activity.targetGrades.includes(userProfile.grade as any) ||
    (userProfile.grade.startsWith('고') && activity.targetGrades.includes('고등학생 전체')) ||
    (userProfile.grade.startsWith('중') && activity.targetGrades.includes('중학생 전체'));

  if (gradeMatches) gradeAndScheduleScore += 5;

  // 요일 매칭
  const hasMatchingDay = activity.activityPeriod.daysOfWeek.some((d) =>
    userProfile.availableDays.includes(d)
  );
  if (hasMatchingDay || activity.activityPeriod.daysOfWeek.length === 0) {
    gradeAndScheduleScore += 5;
  } else {
    gradeAndScheduleScore += 2;
  }

  // 5. 기회 사다리 및 활동 이력 연속성 (최대 10점)
  let ladderSynergyScore = 4;
  if (activity.ladderStageName) {
    ladderSynergyScore = 8;
  }
  if (
    userProfile.completedActivityIds &&
    userProfile.completedActivityIds.length > 0 &&
    activity.ladderNodeId
  ) {
    ladderSynergyScore = 10;
  }

  // 6. 마감 임박 신선도 보너스 (최대 5점)
  let urgencyBonus = 0;
  if (activity.isUrgent) {
    urgencyBonus = 4;
  }

  const rawTotal =
    interestScore +
    regionScore +
    feeScore +
    gradeAndScheduleScore +
    ladderSynergyScore +
    urgencyBonus;

  // 타지역 오프라인 활동은 최대 35점으로 상한 제한 (홈 추천 상단 노출 원천 방지)
  const isDistantOffline =
    activity.format === '오프라인' &&
    activity.region.province !== '전국' &&
    activity.region.province !== userProfile.region.province &&
    !isSameCity;

  let finalScore = Math.min(100, Math.max(10, Math.round(rawTotal)));
  if (isDistantOffline) {
    finalScore = Math.min(30, finalScore);
  }

  const breakdown: CurationBreakdown = {
    interestScore,
    regionScore,
    feeScore,
    gradeAndScheduleScore,
    ladderSynergyScore,
    urgencyBonus,
    totalScore: finalScore,
    isTopInterest: isPrimary,
    isLocalOrOnline: isSameCity || isOnline || (isSameProvince && activity.commuteTimeMinutes <= userProfile.maxCommuteTimeMinutes),
    isFree: activity.fee === 0,
  };

  // 개인화된 추천 사유 문장 생성
  const recommendReason = generateCurationReason(activity, userProfile, breakdown);

  return {
    score: finalScore,
    breakdown,
    recommendReason,
  };
}

/**
 * 큐레이션 알고리즘 결과를 바탕으로 자연스러운 한국어 맞춤 추천 사유를 생성합니다.
 */
function generateCurationReason(
  activity: Activity,
  userProfile: UserProfile,
  breakdown: CurationBreakdown
): string {
  const userInterests = userProfile.interestedCategories || [];
  const isInterestMatched = userInterests.includes(activity.category);

  if (isInterestMatched) {
    if (activity.ladderStageName) {
      return `${userProfile.name}님의 관심 분야인 [${activity.category}]의 ${activity.ladderStageName} 과정입니다. ${
        breakdown.isFree ? '비용 부담 0원' : '예산 맞춤형'
      }으로 실무 포트폴리오를 완성할 수 있습니다.`;
    }

    if (breakdown.isLocalOrOnline) {
      const locText =
        activity.format === '온라인'
          ? '이동 부담 없는 온라인'
          : `${activity.region.city} 시내(약 ${activity.commuteTimeMinutes}분 거리)`;
      return `관심 분야 [${activity.category}]에 완벽히 일치하며, ${locText}에서 열리는 ${
        breakdown.isFree ? '전액 무료' : '실속형'
      } 프로그램입니다.`;
    }

    return `희망 관심 분야 [${activity.category}] 프로그램으로, 학교생활기록부 및 대외활동 실적 연계에 효과적인 추천 활동입니다.`;
  }

  // 관심분야 외 탐색형 활동인 경우
  if (breakdown.isLocalOrOnline && breakdown.isFree) {
    return `${userProfile.region.city} 인근에서 누구나 무료로 참가할 수 있는 [${activity.category}] 입문 프로그램으로, 새로운 진로 탐색 기회를 제공합니다.`;
  }

  return `[${activity.category}] 분야 청소년 공인 프로그램으로, 기초 역량 강화와 실적 인증이 지원됩니다.`;
}

/**
 * 사용자의 현재 거주지(시/도, 시/군)를 기준으로 활동과의 예상 거리와 이동시간을 동적으로 계산합니다.
 */
export function estimateDistanceAndCommute(
  activity: Activity,
  userProfile: UserProfile
): { distanceKm: number; commuteTimeMinutes: number } {
  if (activity.format === '온라인' || activity.region.city === '온라인' || activity.region.city === '전국') {
    return { distanceKm: 0, commuteTimeMinutes: 0 };
  }

  const isSameCity =
    activity.region.city === userProfile.region.city ||
    activity.region.city.includes(userProfile.region.city) ||
    userProfile.region.city.includes(activity.region.city);

  if (isSameCity) {
    return { distanceKm: 3.5, commuteTimeMinutes: 15 };
  }

  const isSameProvince =
    activity.region.province === userProfile.region.province ||
    activity.region.province === '전국';

  if (isSameProvince) {
    return { distanceKm: 28.0, commuteTimeMinutes: 40 };
  }

  // 온/오프라인 혼합의 경우 온라인 참여 가능
  if (activity.format === '온/오프라인 혼합') {
    return { distanceKm: 35.0, commuteTimeMinutes: 45 };
  }

  // 타 시도 오프라인 활동 (지리적으로 먼 거리)
  return { distanceKm: 145.0, commuteTimeMinutes: 160 };
}

/**
 * 전체 활동 목록에 대해 사용자의 최신 프로필 관심분야와 조건을 실시간 반영하여 큐레이션 점수와 사유를 갱신합니다.
 */
export function curateActivitiesForUser(
  activities: Activity[],
  userProfile: UserProfile
): Activity[] {
  return activities.map((activity) => {
    const { distanceKm, commuteTimeMinutes } = estimateDistanceAndCommute(activity, userProfile);
    const dynamicActivity: Activity = {
      ...activity,
      distanceKm: activity.format === '온라인' ? 0 : distanceKm,
      commuteTimeMinutes: activity.format === '온라인' ? 0 : commuteTimeMinutes,
    };
    const { score, recommendReason } = calculateCurationScore(dynamicActivity, userProfile);
    return {
      ...dynamicActivity,
      matchScore: score,
      recommendReason,
    };
  });
}
