import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ isOpen, onClose, onSwitchSignUp }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: '',
    autoLogin: false,
  });
  const [error, setError] = useState(null);

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
    // setError('로그인 실패!');
  };

  const handleSocialLogin = (provider) => {
    // TODO: 소셜 로그인 처리
  };

  if (!isOpen) return null;

  return (
    <div className="login-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="login-container" onClick={e => e.stopPropagation()}>
        <h1>로그인</h1>
        <form className="login-form" onSubmit={handleLogin} autoComplete="off">
          <div className="form-group">
            <label htmlFor="login-username">아이디</label>
            <input name="username" id="login-username" value={form.username} onChange={handleInputChange} placeholder="아이디를 입력하세요" required />
          </div>
          <div className="form-group">
            <label htmlFor="login-password">비밀번호</label>
            <input type="password" name="password" id="login-password" value={form.password} onChange={handleInputChange} placeholder="비밀번호를 입력하세요" required />
          </div>
          <div className="login-options-row">
            <label className="auto-login">
              <input type="checkbox" name="autoLogin" checked={form.autoLogin} onChange={handleInputChange} />
              자동로그인
            </label>
            <button type="button" className="find-password" onClick={() => navigate('/find-password')}>비밀번호 찾기</button>
          </div>
          <button className="login-button" type="submit">로그인</button>
        </form>
        <div className="social-login social-row">
          <button className="social-button kakao" type="button" onClick={() => handleSocialLogin('kakao')}>카카오로 로그인</button>
          <button className="social-button google" type="button" onClick={() => handleSocialLogin('google')}>구글로 로그인</button>
          <button className="social-button naver" type="button" onClick={() => handleSocialLogin('naver')}>네이버로 로그인</button>
        </div>
        <div className="signup-link-row">
          <span>처음오셨나요?</span>
          <button className="signup-link" type="button" onClick={onSwitchSignUp}>회원가입 하기</button>
        </div>
        {error && (
          <div className="error-popup">
            <div className="error-content">
              <div className="error-icon">!</div>
              <h3>오류 발생</h3>
              <p>{error}</p>
              <button className="error-close-button" onClick={() => setError(null)}>
                확인
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login; 