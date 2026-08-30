// [청록] LoginView.tsx - Google 로그인 전용 간편 인증 화면

import React, { useState } from 'react';
import {
  Sparkles,
  MapPin,
  GraduationCap,
  Heart,
  ShieldCheck,
  Compass,
  GitFork,
  BookOpenCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoginView: React.FC = () => {
  const { loginWithGoogle, isAuthLoading } = useApp();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleGoogleLoginClick = async () => {
    try {
      setIsLoggingIn(true);
      setLoginError(null);
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Google login error:', err);
      // 팝업 차단 또는 닫힘 처리
      if (err?.code === 'auth/popup-closed-by-user') {
        setLoginError('로그인 창이 닫혔습니다. 다시 시도해 주세요.');
      } else if (err?.code === 'auth/popup-blocked') {
        setLoginError('브라우저에서 팝업이 차단되었습니다. 팝업을 허용해 주세요.');
      } else {
        setLoginError(err?.message || 'Google 로그인 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100/80 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-emerald-200 selection:text-emerald-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* 청록 심볼 & 브랜드 타이틀 */}
        <div className="flex flex-col items-center text-center">
          <div className="w-18 h-18 rounded-3xl bg-white p-1.5 shadow-lg border border-emerald-100 flex items-center justify-center overflow-hidden mb-4">
            <img
              src="/cheongnok-logo.png"
              alt="청록 로고"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain rounded-2xl"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <span>청록</span>
            <span className="text-emerald-700 font-extrabold text-lg sm:text-xl">
              (청소년들의 기록)
            </span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-stone-600 font-medium max-w-xs leading-relaxed">
            비수도권 및 지역 청소년을 위한 1:1 맞춤 비교과 활동 큐레이션 & 기회 사다리
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-stone-200/60 rounded-3xl border border-stone-200/90 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-base font-black text-stone-900">
              구글 계정으로 3초 만에 시작하기
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              별도의 복잡한 가입 절차 없이 안전한 Google 인증으로 모든 데이터를 동기화합니다.
            </p>
          </div>

          {/* 에러 발생 시 알림 */}
          {loginError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Google 단독 로그인 버튼 */}
          <button
            id="btn-google-login-main"
            type="button"
            onClick={handleGoogleLoginClick}
            disabled={isLoggingIn || isAuthLoading}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl border-2 border-stone-300 hover:border-emerald-600 bg-white hover:bg-emerald-50/40 text-stone-800 text-xs sm:text-sm font-black transition-all shadow-xs hover:shadow-md active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            {isLoggingIn || isAuthLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                <span>Google 계정 연동 중...</span>
              </>
            ) : (
              <>
                {/* Google 공식 'G' 아이콘 */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google 계정으로 로그인</span>
              </>
            )}
          </button>

          {/* 청록 제공 주요 가치 하이라이트 */}
          <div className="pt-4 border-t border-stone-100 space-y-2.5">
            <span className="text-[11px] font-extrabold text-stone-500 block text-center">
              Google 로그인 시 즉시 제공되는 혜택:
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                <Compass className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>내 지역(시·군·구) & 학년 맞춤 실시간 활동 큐레이션</span>
              </div>
              <div className="flex items-center gap-2 text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                <GitFork className="w-4 h-4 text-teal-600 shrink-0" />
                <span>키워드 기반 4단계 성장 로드맵 (기회 사다리) 실시간 생성</span>
              </div>
              <div className="flex items-center gap-2 text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                <BookOpenCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Firebase 클라우드 연동 학생부 세특 기록 영구 보관 & 실시간 동기화</span>
              </div>
            </div>
          </div>

          {/* 청소년 개인정보 보호 배지 */}
          <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-stone-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Firebase Authentication 안전 보안 규격 준수</span>
          </div>
        </div>
      </div>
    </div>
  );
};
