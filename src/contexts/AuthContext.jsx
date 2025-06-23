import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 토큰이 있으면 사용자 정보 가져오기
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // 사용자 정보 가져오기
          const response = await api.get('/api/v1/users/me');
          setUser(response.data);
        } catch (error) {
          console.error('인증 확인 오류:', error);
          // 토큰이 유효하지 않으면 로그아웃
          logout();
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);
  
  // 로그아웃 함수
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('autoLogin');
    setUser(null);
  };
  
  // API 요청 인터셉터 설정
  useEffect(() => {
    // 응답 인터셉터
    const interceptor = api.interceptors.response.use(
      response => response,
      error => {
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
    <AuthContext.Provider value={{ user, loading, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// 커스텀 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};