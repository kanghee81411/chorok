// [청록] ladderGenerator.ts - 키워드 및 활동 탐색 DB 기반 실시간 기회 사다리(성장 로드맵) 3종 생성 엔진

import { Activity, OpportunityLadder, LadderNode, UserProfile, ActivityCategory } from '../types';

export interface KeywordCategoryPreset {
  domain: ActivityCategory;
  title: string;
  keywords: string[];
}

export const KEYWORD_PRESETS: KeywordCategoryPreset[] = [
  {
    domain: '코딩',
    title: 'SW & AI 기술',
    keywords: ['생성형AI·LLM', '파이썬·알고리즘', '웹·앱개발', '로봇공학·아두이노', '데이터분석', '해커톤'],
  },
  {
    domain: '과학/환경',
    title: '과학·생명·환경',
    keywords: ['생명과학·PCR', '기후변화·탄소중립', '신재생에너지', '생태환경·바이오블리츠', 'R&E소논문', '의약학·바이오'],
  },
  {
    domain: '창업',
    title: '스타트업 & 비즈니스',
    keywords: ['소셜벤처·로컬창업', 'MVP시제품제작', '크라우드펀딩', '비즈니스모델·IR피칭', '디자인씽킹'],
  },
  {
    domain: '봉사',
    title: '봉사 & 지역사회',
    keywords: ['1365디지털튜터', '세대소통·노인복지', '환경정화·플로깅', '디지털격차해소', '청소년멘토링'],
  },
  {
    domain: '진로',
    title: '진로 & 학술 리더십',
    keywords: ['대학학과심층체험', '청소년의회·정책제안', '학생부세특·연구', '국제청소년포상제', '직무멘토링'],
  },
];

/**
 * 키워드 및 활동 탐색 데이터셋을 바탕으로 실시간 3종 기회 사다리(성장 로드맵)를 생성합니다.
 */
export function generateOpportunityLadders(
  selectedKeywords: string[],
  allActivities: Activity[],
  userProfile: UserProfile
): OpportunityLadder[] {
  const activeKeywords = selectedKeywords.length > 0
    ? selectedKeywords
    : (userProfile.interestedCategories.length > 0 ? userProfile.interestedCategories : ['코딩', '과학/환경', '진로']);

  const regionName = `${userProfile.region.province} ${userProfile.region.city}`;
  const cityShort = userProfile.region.city.replace(/시|군|구/g, '');

  // 1. 키워드 매칭 관련 활동 검색 & 가중치 계산
  const scoredActivities = allActivities.map((act) => {
    let matchCount = 0;
    const actText = `${act.title} ${act.summary} ${act.description} ${act.tags.join(' ')} ${act.category} ${act.hostOrg}`.toLowerCase();

    for (const kw of activeKeywords) {
      const cleanKw = kw.replace(/[·/]/g, ' ').toLowerCase();
      const parts = cleanKw.split(' ');
      for (const p of parts) {
        if (p.length > 1 && actText.includes(p)) {
          matchCount += 2;
        }
      }
    }

    // 지역 가산점
    const isSameCity = act.region.city.includes(userProfile.region.city) || userProfile.region.city.includes(act.region.city);
    const isOnline = act.format === '온라인' || act.region.province === '전국';
    const regionBonus = isSameCity ? 3 : (isOnline ? 2 : 0);

    return {
      activity: act,
      score: matchCount + regionBonus,
    };
  });

  // 점수 높은 순 정렬
  scoredActivities.sort((a, b) => b.score - a.score);

  // 카테고리 결정 (선택된 키워드에서 가장 많이 나온 도메인 또는 프로필 도메인)
  const categoryCount: Partial<Record<ActivityCategory, number>> = {
    '과학/환경': 0,
    '코딩': 0,
    '창업': 0,
    '봉사': 0,
    '진로': 0,
    '스포츠': 0,
    '음악': 0,
    '기타': 0,
  };

  activeKeywords.forEach((kw) => {
    KEYWORD_PRESETS.forEach((preset) => {
      if (preset.keywords.some((k) => k.includes(kw) || kw.includes(k))) {
        categoryCount[preset.domain] = (categoryCount[preset.domain] || 0) + 2;
      }
    });
  });

  // 카테고리 우선순위 정렬
  const sortedCategories = (Object.keys(categoryCount) as ActivityCategory[]).sort(
    (a, b) => (categoryCount[b] || 0) - (categoryCount[a] || 0)
  );

  const primaryCat = sortedCategories[0] || userProfile.interestedCategories[0] || '코딩';
  const secondaryCat = sortedCategories[1] || (primaryCat === '코딩' ? '과학/환경' : '진로');
  const tertiaryCat = sortedCategories[2] || '창업';

  // -------------------------------------------------------------
  // [사다리 1] 핵심 전문성 & 로컬 밀착 심화 경로
  // -------------------------------------------------------------
  const ladder1Activities = scoredActivities
    .filter((s) => s.activity.category === primaryCat || s.score > 2)
    .map((s) => s.activity);

  const getLinkedIds = (acts: Activity[], count: number = 2) => {
    return acts.slice(0, count).map((a) => a.id);
  };

  const primaryKwDisplay = activeKeywords.slice(0, 3).join(', ');

  const ladder1: OpportunityLadder = {
    id: `ladder_custom_1_${Date.now()}`,
    trackName: `[전문 심화] ${userProfile.region.city} 맞춤 ${primaryCat} & ${activeKeywords[0] || '전문성'} 마스터 사다리`,
    category: primaryCat,
    description: `${userProfile.name}님이 선택하신 [${primaryKwDisplay}] 키워드를 중심으로, 교내 기초 학습부터 ${userProfile.region.city} 공인 연구실 연계 프로젝트와 전국 대회까지 체계적으로 도약하는 로드맵입니다.`,
    totalStages: 4,
    matchedKeywords: activeKeywords.slice(0, 4),
    targetOutcome: `${primaryCat} 분야 전국 청소년 학술·아이디어 대회 장관상 수상 및 대학 연구실 R&E 소논문 포트폴리오 완성`,
    coreMilestones: [
      '1단: 기초 입문 & 개념 마스터',
      `2단: ${userProfile.region.city} 지역 실전 멘토링/캠프`,
      '3단: 심화 R&E 프로젝트 & 연구보고서',
      '4단: 전국 공모전 출품 & 공인 인증',
    ],
    nodes: [
      {
        id: `node_l1_1_${Date.now()}`,
        stageOrder: 1,
        title: `1단계: ${primaryCat} 기초 탐구 & ${activeKeywords[0] || '기본 역량'} 습득`,
        experienceType: '교내/입문',
        description: `온라인 튜토리얼 및 교내 자율 동아리를 통해 ${primaryCat}의 기본 원리와 기초 실습을 완벽히 마스터합니다.`,
        acquiredSkills: ['기초 개념 정립', '데이터 분석 기초', '자기주도 학습력'],
        linkedActivityIds: getLinkedIds(ladder1Activities.slice(0, 2)),
        prerequisites: ['관련 분야 기본 흥미 및 학습 의지'],
        status: 'completed',
      },
      {
        id: `node_l1_2_${Date.now()}`,
        stageOrder: 2,
        title: `2단계: ${userProfile.region.city}·경기 지역 거점 실전 프로젝트 참여`,
        experienceType: '지역 행사/캠프',
        description: `${userProfile.region.city} 관내 청소년센터 및 거점 대학 멘토링 프로그램에 참여하여 실무 멘토와 실전 과제를 수행합니다.`,
        acquiredSkills: ['팀 프로젝트 협업', '실무 장비/도구 활용', '지역 문제 해결력'],
        linkedActivityIds: getLinkedIds(ladder1Activities.slice(1, 3)),
        prerequisites: ['1단계 기초 탐구 보고서 1건 이상'],
        status: 'recommended',
      },
      {
        id: `node_l1_3_${Date.now()}`,
        stageOrder: 3,
        title: `3단계: 대학·연구소 연계 심화 R&E 연구 & 소논문 작성`,
        experienceType: '실전 프로젝트',
        description: `교수·연구원 지도하에 가설을 검증하고, 실험/개발 데이터를 체계적으로 수집하여 완성도 높은 R&E 연구보고서를 작성합니다.`,
        acquiredSkills: ['소논문 작성', '통계 및 가설 검증', '심층 학술 탐구'],
        linkedActivityIds: getLinkedIds(ladder1Activities.slice(2, 4)),
        prerequisites: ['2단계 지역 프로젝트 수료증'],
        status: 'locked',
      },
      {
        id: `node_l1_4_${Date.now()}`,
        stageOrder: 4,
        title: `4단계: 전국 청소년 경진대회 & 정부부처 공인 포상 도전`,
        experienceType: '대외 공모전/인증',
        description: `완성된 연구 및 결과물을 전국 규모 대회에 출품하여 입상하고, 교육감/장관상 표창 및 학생부 세특의 핵심 실적을 완성합니다.`,
        acquiredSkills: ['전국 단위 수상 실적', '발표 및 디펜스 역량', '학생부 종합전형 경쟁력'],
        linkedActivityIds: getLinkedIds(ladder1Activities.slice(0, 3)),
        prerequisites: ['3단계 심화 연구보고서 완성본'],
        status: 'locked',
      },
    ],
  };

  // -------------------------------------------------------------
  // [사다리 2] 융합 & 실전 문제해결 (소셜/체인지메이커/스타트업)
  // -------------------------------------------------------------
  const ladder2Activities = scoredActivities
    .filter((s) => s.activity.category === secondaryCat || s.activity.category === '창업' || s.activity.category === '봉사')
    .map((s) => s.activity);

  const ladder2: OpportunityLadder = {
    id: `ladder_custom_2_${Date.now()}`,
    trackName: `[실전 융합] ${activeKeywords[1] || secondaryCat} 기반 로컬 체인지메이커 & 실전 프로젝트 사다리`,
    category: secondaryCat,
    description: `기술과 지식을 교과서에 머무르지 않고, ${userProfile.region.city}의 실생활 문제를 해결하는 시제품(MVP) 제작 및 사회적 가치 창출 프로젝트로 확장하는 실천형 경로입니다.`,
    totalStages: 4,
    matchedKeywords: [activeKeywords[1] || secondaryCat, '실전프로젝트', '지역사회문제해결', '협업'],
    targetOutcome: `${userProfile.region.city} 로컬 사회문제 해결 솔루션 런칭, 지자체 정책 제안 및 크라우드펀딩 100% 달성`,
    coreMilestones: [
      '1단: 지역사회 문제 정의 & 팀 빌딩',
      '2단: 솔루션 기획 & 전문가 멘토링',
      '3단: 시제품(MVP) 제작 & 로컬 현장 검증',
      '4단: 청소년 소셜벤처 런칭 & 지자체 전달',
    ],
    nodes: [
      {
        id: `node_l2_1_${Date.now()}`,
        stageOrder: 1,
        title: `1단계: ${userProfile.region.city} 현안 조사 & 아이디어 발굴 워크숍`,
        experienceType: '교내/입문',
        description: `디자인 씽킹 기법을 적용하여 우리 동네의 개선 과제를 발견하고, 뜻이 맞는 팀원들과 팀을 결성합니다.`,
        acquiredSkills: ['디자인 씽킹', '문제 발견력', '팀 빌딩'],
        linkedActivityIds: getLinkedIds(ladder2Activities.slice(0, 2)),
        prerequisites: ['지역 사회에 대한 관심과 개선 의지'],
        status: 'in_progress',
      },
      {
        id: `node_l2_2_${Date.now()}`,
        stageOrder: 2,
        title: `2단계: 비즈니스 모델(BM) 수립 및 스타트업 멘토링`,
        experienceType: '지역 행사/캠프',
        description: `소셜벤처 대표 및 현직자 멘토와 함께 비즈니스 캔버스를 작성하고, 지속 가능한 해결 모델을 구체화합니다.`,
        acquiredSkills: ['비즈니스 캔버스', '비용 및 효익 분석', 'IR 피칭 기초'],
        linkedActivityIds: getLinkedIds(ladder2Activities.slice(1, 3)),
        prerequisites: ['1단계 문제 정의서'],
        status: 'recommended',
      },
      {
        id: `node_l2_3_${Date.now()}`,
        stageOrder: 3,
        title: `3단계: 실물 시제품(MVP) 제작 및 현장 사용자 테스트`,
        experienceType: '실전 프로젝트',
        description: `시제품 제작비 지원을 받아 3D 프린팅 또는 소프트웨어 프로토타입을 완성하고 실제 주민 피드백을 수집합니다.`,
        acquiredSkills: ['MVP 제작', '사용자 피드백 분석', '서비스 개선 사이클'],
        linkedActivityIds: getLinkedIds(ladder2Activities.slice(2, 4)),
        prerequisites: ['2단계 기획안 검토 완료'],
        status: 'locked',
      },
      {
        id: `node_l2_4_${Date.now()}`,
        stageOrder: 4,
        title: `4단계: 크라우드펀딩 런칭 및 지자체 우수 청소년 정책 채택`,
        experienceType: '대외 공모전/인증',
        description: `텀블벅/와디즈 모의 펀딩을 통해 대중의 공감을 얻고, ${userProfile.region.city} 시장/의회에 청소년 정책으로 공식 전달합니다.`,
        acquiredSkills: ['크라우드펀딩 운영', '정책 입법 제안', '소셜 임팩트 리더십'],
        linkedActivityIds: getLinkedIds(ladder2Activities.slice(0, 2)),
        prerequisites: ['3단계 시제품 실물 완성'],
        status: 'locked',
      },
    ],
  };

  // -------------------------------------------------------------
  // [사다리 3] 글로벌 인증 & 리더십 (공인 포상 / 진로 연계)
  // -------------------------------------------------------------
  const ladder3Activities = scoredActivities
    .filter((s) => s.activity.category === tertiaryCat || s.activity.category === '진로' || s.activity.category === '봉사')
    .map((s) => s.activity);

  const ladder3: OpportunityLadder = {
    id: `ladder_custom_3_${Date.now()}`,
    trackName: `[공인 리더십] ${activeKeywords[2] || tertiaryCat} 중심 청소년 리더십 & 글로벌 인증 사다리`,
    category: tertiaryCat,
    description: `개인의 성장을 넘어 학교와 지역사회 청소년 대표로서 기획단·의회 활동을 이끌고, 공인 인증서(국제청소년성취포상제 등)를 획득하는 최고 권위 리더십 경로입니다.`,
    totalStages: 4,
    matchedKeywords: [activeKeywords[2] || tertiaryCat, '청소년의회', '포상제', '리더십', '1365인증'],
    targetOutcome: `국제청소년성취포상제 금장/은장 완주 및 지자체 청소년참여위원회 대표 청소년 조례안 발의`,
    coreMilestones: [
      '1단: 자기개발 4대 영역 목표 수립',
      '2단: 정기 1365 봉사 & 멘토링 활동',
      '3단: 청소년참여위원회 & 정책 제안단',
      '4단: 여성가족부 장관 인증 & 글로벌 포상',
    ],
    nodes: [
      {
        id: `node_l3_1_${Date.now()}`,
        stageOrder: 1,
        title: `1단계: 자기개발·신체단련·봉사 4대 영역 주간 루틴 수립`,
        experienceType: '교내/입문',
        description: `국제청소년성취포상제 기준에 맞추어 매주 꾸준히 실천할 자기관리 목표와 멘토링 계획을 설계합니다.`,
        acquiredSkills: ['자기관리 역량', '목표 설정', '성장 기록 습관'],
        linkedActivityIds: getLinkedIds(ladder3Activities.slice(0, 2)),
        prerequisites: ['꾸준한 실천 다짐'],
        status: 'completed',
      },
      {
        id: `node_l3_2_${Date.now()}`,
        stageOrder: 2,
        title: `2단계: 1365 연계 정기 디지털/학습 멘토링 봉사 30시간 완주`,
        experienceType: '지역 행사/캠프',
        description: `${userProfile.region.city} 복지관 및 지역아동센터에서 소외계층 아동·어르신을 위한 맞춤형 나눔을 실천합니다.`,
        acquiredSkills: ['공감 및 소통', '1365 공인 봉사실적', '사회적 배려심'],
        linkedActivityIds: getLinkedIds(ladder3Activities.slice(1, 3)),
        prerequisites: ['1단계 목표 등록 완료'],
        status: 'recommended',
      },
      {
        id: `node_l3_3_${Date.now()}`,
        stageOrder: 3,
        title: `3단계: ${userProfile.region.city} 청소년참여위원회 대표 및 조례안 발의`,
        experienceType: '기획단/리더',
        description: `지자체 청소년 대표로서 정기 회의에 참석하고, 청소년 권익 및 교육 환경 개선을 위한 조례안을 직접 기안합니다.`,
        acquiredSkills: ['조례안 입법 기획', '공청회 토론', '공공 리더십'],
        linkedActivityIds: getLinkedIds(ladder3Activities.slice(2, 4)),
        prerequisites: ['2단계 봉사 및 멘토링 활동 실적'],
        status: 'locked',
      },
      {
        id: `node_l3_4_${Date.now()}`,
        stageOrder: 4,
        title: `4단계: 여성가족부 장관 인증서 & 글로벌 청소년 성취 포상 수여`,
        experienceType: '대외 공모전/인증',
        description: `모든 영역의 활동 일지와 심사를 통과하여 대한민국 정부 및 국제기구가 공인하는 최고 등급 포상을 획득합니다.`,
        acquiredSkills: ['글로벌 인증 포트폴리오', '최고 권위 장관상', '미래 인재 공인'],
        linkedActivityIds: getLinkedIds(ladder3Activities.slice(0, 2)),
        prerequisites: ['3단계 리더십 활동 완료'],
        status: 'locked',
      },
    ],
  };

  return [ladder1, ladder2, ladder3];
}
