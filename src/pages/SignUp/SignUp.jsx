import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import IdVerificationModal from '../../components/IdVerificationModal/IdVerificationModal.jsx';
import './SignUp.css';

const SignUp = ({ isOpen, onClose, onSwitchLogin }) => {
  const navigate = useNavigate();
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    loginId: '',
    password: '',
    name: '',
    email: '',
    phoneNumber: '',
    birthDate: '',
    address: '',
  });

  const handleSocialLogin = async (provider) => {
    try {
      setError(null);
      // TODO: 실제 소셜 로그인 API 연동
      const response = await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (false) {
            reject(new Error('로그인에 실패했습니다. 다시 시도해주세요.'));
          } else {
            resolve({ success: true });
          }
        }, 1000);
      });

      if (response.success) {
        setIsVerificationModalOpen(true);
      }
    } catch (error) {
      console.error('소셜 로그인 중 오류가 발생했습니다:', error);
      setError(error.message);
    }
  };

  const handleVerificationComplete = () => {
    setIsVerificationModalOpen(false);
    onClose();
    navigate('/');
  };

  const handleVerificationClose = () => {
    setIsVerificationModalOpen(false);
    onClose();
    navigate('/');
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleErrorClose = () => {
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    // TODO: 회원가입 처리 로직
    setIsVerificationModalOpen(true);
  };

  if (!isOpen) return null;

  return (
    <div className="signup-overlay" onClick={handleOverlayClick}>
      <div className="signup-container" onClick={e => e.stopPropagation()}>
        <h1>회원가입</h1>
        <form className="signup-form" onSubmit={handleSignUp} autoComplete="off">
          <div className="form-group">
            <label htmlFor="loginId">로그인ID</label>
            <input name="loginId" id="loginId" value={form.loginId} onChange={handleInputChange} placeholder="아이디를 입력하세요" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input type="password" name="password" id="password" value={form.password} onChange={handleInputChange} placeholder="비밀번호를 입력하세요" required />
          </div>
          <div className="form-group">
            <label htmlFor="name">이름</label>
            <input name="name" id="name" value={form.name} onChange={handleInputChange} placeholder="이름을 입력하세요" required />
          </div>
          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input type="email" name="email" id="email" value={form.email} onChange={handleInputChange} placeholder="이메일을 입력하세요" required />
          </div>
          <div className="form-group">
            <label htmlFor="phoneNumber">핸드폰번호</label>
            <input name="phoneNumber" id="phoneNumber" value={form.phoneNumber} onChange={handleInputChange} placeholder="휴대폰 번호를 입력하세요" required />
          </div>
          <div className="form-group">
            <label htmlFor="birthDate">생년월일</label>
            <input name="birthDate" id="birthDate" value={form.birthDate} onChange={handleInputChange} placeholder="예: 19990101" required />
          </div>
          <div className="form-group">
            <label htmlFor="address">주소</label>
            <input name="address" id="address" value={form.address} onChange={handleInputChange} placeholder="주소를 입력하세요" required />
          </div>
          <button className="signup-button" type="submit">회원가입</button>
        </form>
        <div className="social-login social-row">
          <button 
            className="social-button kakao"
            onClick={() => handleSocialLogin('kakao')}
            type="button"
          >
            카카오로 시작하기
          </button>
          <button 
            className="social-button google"
            onClick={() => handleSocialLogin('google')}
            type="button"
          >
            구글로 시작하기
          </button>
          <button 
            className="social-button naver"
            onClick={() => handleSocialLogin('naver')}
            type="button"
          >
            네이버로 시작하기
          </button>
        </div>
        <div className="login-link-row">
          <button className="login-link" type="button" onClick={onSwitchLogin}>회원이라면 로그인하기</button>
        </div>
        {error && (
          <div className="error-popup">
            <div className="error-content">
              <div className="error-icon">!</div>
              <h3>오류 발생</h3>
              <p>{error}</p>
              <button className="error-close-button" onClick={handleErrorClose}>
                확인
              </button>
            </div>
          </div>
        )}
      </div>
      {isVerificationModalOpen && (
        <IdVerificationModal
          isOpen={isVerificationModalOpen}
          onClose={handleVerificationClose}
          onVerify={handleVerificationComplete}
        />
      )}
    </div>
  );
};

export default SignUp; 