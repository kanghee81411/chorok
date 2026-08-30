// [청록] OpportunityLadderView.tsx - PRD ② 기회 사다리 (Bento Grid 스타일: 현재 경험 → 다음 활동 → 새로운 기회를 하나의 성장 경로 로드맵으로 연결 시각화)

import React from 'react';
import {
  GitFork,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Award,
  BookOpen,
  Layers,
  MapPin,
} from 'lucide-react';
import { OpportunityLadder, LadderNode } from '../types';
import { useApp } from '../context/AppContext';

interface OpportunityLadderViewProps {
  ladder: OpportunityLadder;
  compact?: boolean;
}

export const OpportunityLadderView: React.FC<OpportunityLadderViewProps> = ({
  ladder,
  compact = false,
}) => {
  const {
    activities,
    setSelectedActivity,
    updateLadderNodeStatus,
    setCurrentView,
    userProfile,
  } = useApp();

  const getNodeStatusBadge = (status: LadderNode['status']) => {
    switch (status) {
      case 'completed':
        return {
          label: '완료됨',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
          bg: 'bg-emerald-50/70 border-emerald-300 text-emerald-900',
          dot: 'bg-emerald-600 ring-4 ring-emerald-100',
        };
      case 'in_progress':
        return {
          label: '도전 중',
          icon: <Clock className="w-4 h-4 text-amber-600 animate-spin" />,
          bg: 'bg-amber-50/70 border-amber-300 text-amber-900',
          dot: 'bg-amber-500 ring-4 ring-amber-100',
        };
      case 'recommended':
        return {
          label: '다음 추천',
          icon: <Sparkles className="w-4 h-4 text-emerald-600" />,
          bg: 'bg-emerald-50/90 border-emerald-400 text-emerald-950 font-extrabold shadow-xs',
          dot: 'bg-emerald-600 ring-4 ring-emerald-200 animate-pulse',
        };
      case 'locked':
        return {
          label: '잠김 (선수 경험 필요)',
          icon: <Lock className="w-4 h-4 text-stone-400" />,
          bg: 'bg-stone-50 border-stone-200 text-stone-500',
          dot: 'bg-stone-300 ring-4 ring-stone-100',
        };
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden p-6 sm:p-8">
      {/* 사다리 상단 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-teal-100 text-teal-800 flex items-center gap-1.5 border border-teal-200">
              <GitFork className="w-3.5 h-3.5" />
              성장 기회 사다리 #{ladder.category}
            </span>
            <span className="text-xs text-stone-500 font-semibold">총 {ladder.totalStages}단계 로드맵</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            {ladder.trackName}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
            {ladder.description}
          </p>
        </div>

        {/* 최종 도달 목표 배지 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 shrink-0 max-w-sm">
          <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900 mb-1">
            <Award className="w-4 h-4 text-amber-600" />
            <span>최종 도달 목표</span>
          </div>
          <p className="text-xs text-stone-700 font-medium leading-snug">
            {ladder.targetOutcome}
          </p>
        </div>
      </div>

      {/* 사다리 경로 노드 타임라인 */}
      <div className="mt-8 relative">
        {/* 세로 연결 라인 */}
        <div className="hidden sm:block absolute left-6 top-8 bottom-8 w-0.5 bg-stone-200 -translate-x-1/2" />

        <div className="space-y-6 sm:space-y-8">
          {ladder.nodes.map((node) => {
            const badge = getNodeStatusBadge(node.status);
            const linkedActivities = activities.filter((a) =>
              node.linkedActivityIds.includes(a.id)
            );

            return (
              <div
                key={node.id}
                id={`ladder-node-${node.id}`}
                className="relative flex flex-col sm:flex-row items-start gap-4 sm:gap-6 group"
              >
                {/* 좌측 단계 번호 & 상태 인디케이터 도트 */}
                <div className="relative z-10 shrink-0 flex items-center sm:block">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-sm border shadow-xs transition-all ${
                      node.status === 'completed'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-700/20'
                        : node.status === 'in_progress'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                        : node.status === 'recommended'
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-500 ring-2 ring-emerald-300 ring-offset-2 font-black'
                        : 'bg-stone-100 text-stone-400 border-stone-200'
                    }`}
                  >
                    {node.stageOrder}단
                  </div>
                </div>

                {/* 우측 단계 카드 (Bento Node Box) */}
                <div
                  className={`flex-1 w-full rounded-3xl p-5 sm:p-6 border transition-all ${badge.bg}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-white/90 text-stone-800 border border-stone-200/90 shadow-2xs">
                        {node.experienceType}
                      </span>
                      <h3 className="text-base sm:text-lg font-extrabold text-stone-900">
                        {node.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-extrabold shrink-0 bg-white/80 px-2.5 py-1 rounded-full border border-stone-200/80">
                      {badge.icon}
                      <span>{badge.label}</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                    {node.description}
                  </p>

                  {/* 선수 요건 안내 */}
                  {node.prerequisites && node.prerequisites.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-stone-500 bg-white/60 px-3 py-1.5 rounded-xl border border-stone-200/50">
                      <span className="font-bold text-stone-700">선수 요건:</span>
                      <span>{node.prerequisites.join(', ')}</span>
                    </div>
                  )}

                  {/* 습득 가능한 역량/스킬 태그 */}
                  <div className="mt-3.5 pt-3 border-t border-stone-200/70 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-extrabold text-stone-600 mr-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      성장 역량:
                    </span>
                    {node.acquiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-white text-stone-800 border border-stone-200/90 shadow-2xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* 연결된 실제 활동 카드 (매핑된 활동이 있을 때) */}
                  {linkedActivities.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-stone-200/70 space-y-2">
                      <p className="text-[11px] font-extrabold text-stone-700 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        이 단계에 추천하는 우리 지역 실전 활동:
                      </p>
                      {linkedActivities.map((act) => (
                        <div
                          key={act.id}
                          onClick={() => setSelectedActivity(act)}
                          className="flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-emerald-50/50 border border-stone-200/90 hover:border-emerald-500 shadow-2xs transition-all cursor-pointer group/link"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={act.imageUrl}
                              alt={act.title}
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 rounded-xl object-cover"
                            />
                            <div>
                              <p className="text-xs sm:text-sm font-bold text-stone-900 group-hover/link:text-emerald-700 transition-colors line-clamp-1">
                                {act.title}
                              </p>
                              <p className="text-[11px] text-stone-500 mt-0.5">
                                {act.region.city} · {act.distanceKm}km · {act.fee === 0 ? '무료' : `${act.fee.toLocaleString()}원`}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 shrink-0 bg-emerald-50 px-2.5 py-1 rounded-xl">
                            상세보기
                            <ChevronRight className="w-4 h-4" />
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 단계 상태 토글러 (학생이 직접 내 경험 완료 표시) */}
                  <div className="mt-4 pt-3 border-t border-stone-200/70 flex items-center justify-between text-xs text-stone-600">
                    <span className="text-[11px] font-medium">
                      {node.status === 'completed' ? '✅ 경험 완료되어 포트폴리오에 반영됨' : '활동 참여 후 완료 처리하세요'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {node.status !== 'completed' && (
                        <button
                          id={`node-complete-btn-${node.id}`}
                          onClick={() => updateLadderNodeStatus(ladder.id, node.id, 'completed')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-[11px] font-extrabold hover:bg-emerald-700 transition-colors shadow-2xs active:scale-95"
                        >
                          이 단계 완료하기
                        </button>
                      )}
                      {node.status === 'completed' && (
                        <button
                          id={`node-reset-btn-${node.id}`}
                          onClick={() => updateLadderNodeStatus(ladder.id, node.id, 'in_progress')}
                          className="px-3 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-[11px] font-bold transition-colors"
                        >
                          진행 중으로 변경
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

