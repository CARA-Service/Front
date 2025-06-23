import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import './Login.css';
import { SiNaver } from 'react-icons/si';
import { FcGoogle } from 'react-icons/fc';
import { RiKakaoTalkFill } from 'react-icons/ri';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import ErrorPopup from '../../components/ErrorPopup/ErrorPopup';

const Login = ({ isOpen, onClose, onSwitchSignUp }) => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [form, setForm] = useState({
    loginId: '',
    password: '',
    autoLogin: false,
  });
  const [error, setError] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!form.loginId || !form.password) {
      setError('아이디와 비밀번호를 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // 백엔드 로그인 API 호출
      const response = await api.post('/api/v1/auth/login', {
        loginId: form.loginId,
        password: form.password
      });
      
      // 로그인 성공 시 JWT 토큰 저장
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      
      // 사용자 정보 설정
      setUser(user);
      
      // 자동 로그인 설정 저장
      if (form.autoLogin) {
        localStorage.setItem('autoLogin', 'true');
      } else {
        localStorage.removeItem('autoLogin');
      }
      
      // 로그인 성공 후 모달 닫기 및 페이지 이동
      onClose();
      navigate('/');
      
    } catch (err) {
      console.error('로그인 오류:', err);
      
      // 오류 메시지 설정
      if (err.response) {
        // 서버에서 응답이 왔지만 오류 상태 코드인 경우
        if (err.response.status === 401) {
          setError('아이디 또는 비밀번호가 일치하지 않습니다.');
        } else {
          setError(err.response.data?.message || '로그인 처리 중 오류가 발생했습니다.');
        }
      } else if (err.request) {
        // 요청이 전송되었지만 응답이 없는 경우
        setError('서버와 통신할 수 없습니다. 네트워크 연결을 확인해주세요.');
      } else {
        // 요청 설정 중 오류가 발생한 경우
        setError('로그인 요청 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    if (provider === 'kakao') {
      // 카카오 로그인 URL로 리다이렉트
      const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID || '7c13edee67bab4b026ddc1256ec88eeb';
      const REDIRECT_URI = encodeURIComponent('http://localhost:8080/api/v1/auth/kakao/callback');
      window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  if (!isOpen) return null;

  return (
    <div className="login-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="login-container" onClick={e => e.stopPropagation()}>
        <h1 className="login-title">로그인</h1>
        <div className="login-divider" />
        <form className="login-form" onSubmit={handleLogin} autoComplete="off">
          <div className="login-form-group">
            <label htmlFor="loginId">아이디</label>
            <input 
              type="text" 
              id="loginId" 
              name="loginId" 
              value={form.loginId} 
              onChange={handleInputChange} 
              placeholder="아이디를 입력하세요" 
              required 
            />
          </div>
          <div className="login-form-group">
            <label htmlFor="password">비밀번호</label>
            <div className="password-input-container">
              <input 
                type={passwordVisible ? "text" : "password"} 
                id="password" 
                name="password" 
                value={form.password} 
                onChange={handleInputChange} 
                placeholder="비밀번호를 입력하세요" 
                required 
              />
              <button 
                type="button" 
                className="password-toggle-button" 
                onClick={togglePasswordVisibility}
              >
                {passwordVisible ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
          </div>
          <div className="login-options">
            <div className="auto-login">
              <input 
                type="checkbox" 
                id="autoLogin" 
                name="autoLogin" 
                checked={form.autoLogin} 
                onChange={handleInputChange} 
              />
              <label htmlFor="autoLogin">자동 로그인</label>
            </div>
            <button type="button" className="forgot-password">비밀번호 찾기</button>
          </div>
          <button 
            className="login-button" 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인하기'}
          </button>
          <div className="social-login-title">소셜로그인으로 함께하기</div>
          <div className="social-login social-row">
            {[
              { key: 'kakao', icon: <RiKakaoTalkFill className="kakao-icon" />, className: 'kakao' },
              { key: 'google', icon: <FcGoogle />, className: 'google' },
              { key: 'naver', icon: <SiNaver />, className: 'naver' },
            ].map(({ key, icon, className }) => (
              <button
                key={key}
                className={`social-button ${className}`}
                type="button"
                onClick={() => handleSocialLogin(key)}
              >
                {icon}
              </button>
            ))}
          </div>
          <div className="login-divider" />
        </form>
        <div className="signup-link-row">
          <span>아직 회원이 아니신가요?</span>
          <button className="signup-link" type="button" onClick={onSwitchSignUp}>회원가입하러가기</button>
        </div>
        <ErrorPopup error={error} onClose={() => setError(null)} />
      </div>
    </div>
  );
};

export default Login; 