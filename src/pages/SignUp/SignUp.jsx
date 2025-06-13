import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import IdVerificationModal from '../../components/IdVerificationModal/IdVerificationModal.jsx';
import './SignUp.css';

const SignUp = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen || isVerificationModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen, isVerificationModalOpen]);

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

  if (!isOpen) return null;

  return (
    <div className="signup-overlay" onClick={handleOverlayClick}>
      <div className="signup-container">
        <h1>회원가입</h1>
        
        <div className="social-login">
          <button 
            className="social-button kakao"
            onClick={() => handleSocialLogin('kakao')}
          >
            카카오로 시작하기
          </button>
          <button 
            className="social-button google"
            onClick={() => handleSocialLogin('google')}
          >
            구글로 시작하기
          </button>
          <button 
            className="social-button naver"
            onClick={() => handleSocialLogin('naver')}
          >
            네이버로 시작하기
          </button>
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