import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { SiNaver } from 'react-icons/si';
import { FcGoogle } from 'react-icons/fc';
import { RiKakaoTalkFill } from 'react-icons/ri';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import ErrorPopup from '../../components/ErrorPopup/ErrorPopup';

const Login = ({ isOpen, onClose, onSwitchSignUp }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    loginId: '',
    password: '',
    autoLogin: false,
  });
  const [error, setError] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // TODO: 로그인 처리 로직
    setError('로그인 실패!');  // 무조건 오류 발생 차후 수정하셈
  };

  const handleSocialLogin = (provider) => {
    // TODO: 소셜로그인 
    localStorage.setItem('token', 'social-login-token');
    onClose();
  };

  const socialProviders = [
    { key: 'kakao', icon: <RiKakaoTalkFill className="kakao-icon" />, className: 'kakao' },
    { key: 'google', icon: <FcGoogle />, className: 'google' },
    { key: 'naver', icon: <SiNaver />, className: 'naver' },
  ];

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
              name="loginId"
              id="loginId"
              value={form.loginId}
              onChange={handleInputChange}
              placeholder="아이디를 입력하세요"
              required
              className="login-form-underline"
            />
          </div>
          <div className="login-form-group">
            <label htmlFor="login-password">비밀번호</label>
            <div className="password-input-wrapper">
              <input
                type={passwordVisible ? 'text' : 'password'}
                name="password"
                id="login-password"
                value={form.password}
                onChange={handleInputChange}
                placeholder="비밀번호를 입력하세요"
                required
                className="login-form-underline"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setPasswordVisible(v => !v)}
                tabIndex={-1}
                aria-label={passwordVisible ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {passwordVisible ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
          </div>
          <div className="login-options-row">
            <label className="auto-login">
              <input type="checkbox" name="autoLogin" checked={form.autoLogin} onChange={handleInputChange} />
              자동로그인
            </label>
            <button type="button" className="find-password" onClick={() => navigate('/find-password')}>비밀번호를 잊으셨나요?</button>
          </div>
          <button className="login-button" type="submit">로그인하기</button>
        </form>
        <div className="social-login-title">소셜로그인으로 함께하기</div>
        <div className="social-login social-row">
          {socialProviders.map(({ key, icon, className }) => (
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
        <div className="signup-link-row">
          <span>CARA 가 처음이신가요?</span>
          <button className="signup-link" type="button" onClick={onSwitchSignUp}>회원가입 하기</button>
        </div>
        <ErrorPopup error={error} onClose={() => setError(null)} />
      </div>
    </div>
  );
};

export default Login; 