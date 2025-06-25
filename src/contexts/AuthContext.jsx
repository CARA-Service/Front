import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../api/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 카카오 SDK 초기화
  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      const kakaoClientId = import.meta.env.VITE_KAKAO_CLIENT_ID;
      if (kakaoClientId) {
        window.Kakao.init(kakaoClientId);
        console.log('✅ 카카오 SDK 초기화 완료');
      } else {
        console.warn('⚠️ 카카오 클라이언트 ID가 설정되지 않았습니다.');
      }
    }
  }, []);

  // 토큰이 있으면 사용자 정보 가져오기
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      console.log('🔍 AuthContext - 인증 체크 시작');
      console.log('🎫 저장된 토큰:', token ? '있음' : '없음');

      if (token) {
        try {
          console.log('📡 사용자 정보 API 호출 중...');
          // 사용자 정보 가져오기
          const response = await api.get("/api/v1/users/me");
          console.log('✅ 사용자 정보 조회 성공:', response.data);
          setUser(response.data);
        } catch (error) {
          console.error("❌ 인증 확인 오류:", error);
          console.log('🔄 토큰 무효화 및 로그아웃 처리');
          // 토큰이 유효하지 않으면 로그아웃
          logout();
        }
      } else {
        console.log('⚠️ 토큰이 없음 - 비로그인 상태');
      }

      console.log('🏁 AuthContext 로딩 완료');
      setLoading(false);
    };

    checkAuth();
  }, []);

  // 카카오 로그인 토큰 처리 함수
  const handleKakaoLogin = async (token) => {
    console.log('🔑 카카오 로그인 토큰 처리 시작');

    try {
      // 토큰을 localStorage에 저장
      localStorage.setItem("token", token);

      // 사용자 정보 가져오기
      const response = await api.get("/api/v1/users/me");
      console.log('✅ 카카오 로그인 성공:', response.data);
      setUser(response.data);

      return true;
    } catch (error) {
      console.error("❌ 카카오 로그인 처리 오류:", error);
      localStorage.removeItem("token");
      return false;
    }
  };

  // 카카오 로그아웃 함수
  const kakaoLogout = () => {
    console.log('🚪 카카오 로그아웃 처리 시작');

    // 카카오 SDK 로그아웃 시도 (에러 무시)
    try {
      if (window.Kakao && window.Kakao.Auth && window.Kakao.Auth.getAccessToken()) {
        window.Kakao.Auth.logout();
        console.log('✅ 카카오 SDK 로그아웃 시도 완료');
      }
    } catch (error) {
      console.log('ℹ️ 카카오 SDK 로그아웃 오류 (무시됨):', error.message);
    }

    // 우리 앱 로그아웃 처리 (항상 실행)
    logout();
  };

  // 스마트 로그아웃 함수 (카카오 로그인 여부에 따라 자동 선택)
  const smartLogout = () => {
    if (user && user.loginId && user.loginId.startsWith('kakao_')) {
      console.log('🔍 카카오 로그인 사용자 감지 - 카카오 로그아웃 실행');
      kakaoLogout();
    } else {
      console.log('🔍 일반 로그인 사용자 - 일반 로그아웃 실행');
      logout();
    }
  };

  // 일반 로그아웃 함수
  const logout = () => {
    console.log('🚪 로그아웃 처리 시작');
    localStorage.removeItem("token");
    localStorage.removeItem("autoLogin");
    setUser(null);
    setLoading(false);
    window.dispatchEvent(new Event("storageChange"));
    console.log('✅ 로그아웃 완료 - 사용자 상태 초기화');
  };

  // API 요청 인터셉터 설정
  useEffect(() => {
    // 응답 인터셉터
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        // 401 Unauthorized 오류 시 로그아웃
        if (error.response && error.response.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      // 컴포넌트 언마운트 시 인터셉터 제거
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout, kakaoLogout, smartLogout, setUser, handleKakaoLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

// 커스텀 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
