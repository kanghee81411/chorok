// [청록] volunteerApi.ts - 행정안전부 봉사참여정보서비스 API 클라이언트 (getVltrSearchWordList, getVltrPartcptnItem)

import { Activity } from '../types';

export interface VltrSearchParams {
  keyword?: string;
  schSido?: string;
  schSigngu?: string;
  upperClCode?: string;
  clCode?: string;
  progrmBgnde?: string;
  progrmEndde?: string;
  adultPosblAt?: string;
  yngbgsPosblAt?: string;
  pageNo?: number;
  numOfRows?: number;
}

export interface VltrRawItem {
  progrmRegistNo: string | number;
  progrmSj: string;
  progrmBgnde?: string | number;
  progrmEndde?: string | number;
  actBeginTm?: string | number;
  actEndTm?: string | number;
  actPlace?: string;
  nanmmbyNm?: string;
  srvcClCode?: string;
  adultPosblAt?: string;
  yngbgsPosblAt?: string;
  url?: string;
  sidoCd?: string | number;
  gugunCd?: string | number;
  [key: string]: any;
}

export interface VltrDetailRawItem extends VltrRawItem {
  progrmCn?: string;
  nanmmbyNmAdmn?: string;
  telno?: string;
  fxnum?: string;
  postngBgnde?: string | number;
  postngEndde?: string | number;
  rcritNmpr?: string | number;
  apptotal?: string | number;
  notice?: string;
}

export interface VltrListResponse {
  success: boolean;
  configured?: boolean;
  message?: string;
  data: {
    items: VltrRawItem[];
    totalCount: number;
    pageNo: number;
    numOfRows: number;
  };
}

export interface VltrDetailResponse {
  success: boolean;
  configured?: boolean;
  message?: string;
  data: VltrDetailRawItem | null;
}

/** 날짜 포맷 변환 (20260901 -> 2026-09-01) */
function formatDate(dateStr?: string | number): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  const s = String(dateStr).replace(/[^0-9]/g, '');
  if (s.length === 8) {
    return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
  }
  return String(dateStr);
}

/**
 * 행안부 공공데이터 아이템 -> 청록 Activity 모델 변환 헬퍼
 */
export function mapVltrItemToActivity(item: VltrRawItem): Activity {
  const regNo = String(item.progrmRegistNo || Date.now());
  const startDate = formatDate(item.progrmBgnde);
  const endDate = formatDate(item.progrmEndde);

  return {
    id: `gov_${regNo}`,
    title: item.progrmSj || '청소년 봉사 참여 활동',
    category: '봉사',
    collectionStrategy: '참여형',
    sourceChannel: '행정안전부 1365 자원봉사포털 (공공데이터 API 실시간 연동)',
    hostOrg: item.nanmmbyNm || '1365 자원봉사센터',
    hostOrgType: '공공기관/지자체',
    imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&auto=format&fit=crop&q=80',
    summary: `${item.actPlace ? `[${item.actPlace}] ` : ''}${item.progrmSj || '지역 사회 봉사활동'}`,
    description: `행정안전부 1365 자원봉사포털에 등록된 실시간 공인 봉사활동입니다.\n\n- 활동장소: ${item.actPlace || '상세 장소 안내 참조'}\n- 활동기간: ${startDate} ~ ${endDate}\n- 주최기관: ${item.nanmmbyNm || '지역 자원봉사센터'}\n- 청소년 참여가능 여부: ${item.yngbgsPosblAt === 'Y' ? '청소년 참여 가능 (V)' : '전체 대상'}\n- 프로그램 등록번호: ${regNo}`,
    targetGrades: ['중학생 전체', '고등학생 전체'],
    region: {
      province: '전국',
      city: item.actPlace ? item.actPlace.split(' ')[0] : '지역',
      detailAddress: item.actPlace || '1365 자원봉사센터 지정 장소',
    },
    distanceKm: 4.5,
    commuteTimeMinutes: 25,
    format: '오프라인',
    fee: 0,
    feeDescription: '무료 (1365 자원봉사 시간 공식 인증)',
    applicationPeriod: {
      start: startDate,
      end: endDate,
    },
    activityPeriod: {
      start: startDate,
      end: endDate,
      daysOfWeek: ['토', '일'],
    },
    recommendReason: '행정안전부 1365 자원봉사포털 실시간 연계 활동으로, 청소년 참여 가능 및 학교생활기록부 공인 봉사시간 인정 프로그램입니다.',
    matchScore: 95,
    ladderNodeId: 'node_env_1',
    ladderStageName: '1단계: 지역 봉사 & 사회참여 활동',
    tags: ['1365봉사', '행정안전부', '공인봉사시간', '청소년가능', '사회참여'],
    capacity: 30,
    currentApplicants: 12,
    isUrgent: false,
    officialUrl: `https://www.1365.go.kr/vols/P9210/partcptn/timeVntr.do?type=show&progrmRegistNo=${regNo}`,
    createdAt: startDate,
  };
}

/**
 * ① 봉사/참여활동 검색 및 목록 조회 (getVltrSearchWordList)
 */
export async function fetchVltrSearchWordList(params: VltrSearchParams = {}): Promise<VltrListResponse> {
  const query = new URLSearchParams();
  if (params.keyword) query.set('keyword', params.keyword);
  if (params.schSido) query.set('schSido', params.schSido);
  if (params.schSigngu) query.set('schSigngu', params.schSigngu);
  if (params.upperClCode) query.set('upperClCode', params.upperClCode);
  if (params.clCode) query.set('clCode', params.clCode);
  if (params.progrmBgnde) query.set('progrmBgnde', params.progrmBgnde);
  if (params.progrmEndde) query.set('progrmEndde', params.progrmEndde);
  if (params.adultPosblAt) query.set('adultPosblAt', params.adultPosblAt);
  if (params.yngbgsPosblAt) query.set('yngbgsPosblAt', params.yngbgsPosblAt);
  query.set('pageNo', String(params.pageNo || 1));
  query.set('numOfRows', String(params.numOfRows || 20));

  const response = await fetch(`/api/getVltrSearchWordList?${query.toString()}`);
  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

/**
 * ② 활동 상세 조회 (getVltrPartcptnItem)
 */
export async function fetchVltrPartcptnItem(progrmRegistNo: string | number): Promise<VltrDetailResponse> {
  const response = await fetch(`/api/getVltrPartcptnItem?progrmRegistNo=${encodeURIComponent(String(progrmRegistNo))}`);
  if (!response.ok) {
    throw new Error(`상세 API 요청 실패: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export interface GoogleSmartSearchParams {
  keyword?: string;
  category?: string;
  province?: string;
  city?: string;
  maxFee?: number;
}

export interface GoogleSmartSearchResponse {
  success: boolean;
  source?: string;
  message?: string;
  data: {
    items: Activity[];
    totalCount: number;
  };
}

/**
 * ③ 구글 & 청소년 대외활동 종합 스마트 검색 (구글 검색 연동 & 카테고리 전체 탐색)
 */
export async function fetchGoogleSmartActivities(params: GoogleSmartSearchParams = {}): Promise<GoogleSmartSearchResponse> {
  const response = await fetch('/api/activities/google-search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`구글 스마트 검색 요청 실패: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

