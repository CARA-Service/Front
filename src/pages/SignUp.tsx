import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import IdVerificationModal from '../components/IdVerificationModal';
import './SignUp.css';

interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone: string;
}

interface SignUpProps {
  isOpen: boolean;
  onClose: () => void;
  onGuestSignUp: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ isOpen, onClose, onGuestSignUp }) => {
  const navigate = useNavigate();
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [isGuestSignUpModalOpen, setIsGuestSignUpModalOpen] = useState(false);
  const [formData, setFormData] = useState<SignUpFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
  });

  useEffect(() => {
    if (isOpen || isGuestModalOpen || isGuestSignUpModalOpen || isVerificationModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen, isGuestModalOpen, isGuestSignUpModalOpen, isVerificationModalOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      // TODO: 실제 회원가입 API 연동
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsVerificationModalOpen(true);
    } catch (error) {
      console.error('회원가입 중 오류가 발생했습니다:', error);
      alert('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleSocialLogin = async (provider: string) => {
    try {
      // TODO: 실제 소셜 로그인 API 연동
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsVerificationModalOpen(true);
    } catch (error) {
      console.error('소셜 로그인 중 오류가 발생했습니다:', error);
      alert('소셜 로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleGuestStart = () => {
    setIsGuestModalOpen(true);
  };

  const handleGuestConfirm = () => {
    setIsGuestModalOpen(false);
    onGuestSignUp();
  };

  const handleGuestSignUpComplete = () => {
    setIsGuestSignUpModalOpen(false);
    onClose();
    navigate('/');
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

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleGuestModalOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsGuestModalOpen(false);
    }
  };

  const handleGuestSignUpModalOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsGuestSignUpModalOpen(false);
    }
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

        <div className="divider">
          <span>또는</span>
        </div>

        <div className="guest-signup">
          <span onClick={handleGuestStart}>비회원으로 시작하기</span>
        </div>
      </div>

      {isGuestModalOpen && (
        <div className="modal-overlay" onClick={handleGuestModalOverlayClick}>
          <div className="modal-content">
            <h2>비회원으로 시작하기</h2>
            <p>비회원으로 시작하시면 일부 기능이 제한될 수 있습니다.</p>
            <p>계속하시겠습니까?</p>
            <div className="modal-buttons">
              <button
                type="button"
                className="cancel-button"
                onClick={() => setIsGuestModalOpen(false)}
              >
                취소
              </button>
              <button
                type="button"
                className="signup-button"
                onClick={handleGuestConfirm}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {isGuestSignUpModalOpen && (
        <div className="modal-overlay" onClick={handleGuestSignUpModalOverlayClick}>
          <div className="modal-content">
            <h2>회원가입</h2>
            <form onSubmit={handleSubmit} className="signup-form">
              <div className="form-group">
                <label htmlFor="email">이메일</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">비밀번호</label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="8자 이상 입력해주세요"
                  minLength={8}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">비밀번호 확인</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="비밀번호를 다시 입력해주세요"
                  minLength={8}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="name">이름</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="홍길동"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">전화번호</label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="010 - 0000 - 0000"
                  required
                />
              </div>

              <div className="modal-buttons">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setIsGuestSignUpModalOpen(false)}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="signup-button"
                >
                  가입하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <IdVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={handleVerificationClose}
        onVerify={handleVerificationComplete}
      />
    </div>
  );
};

export default SignUp; 