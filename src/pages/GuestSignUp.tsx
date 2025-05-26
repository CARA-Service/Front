import React, { useState, useEffect } from 'react';
import IdVerificationModal from '../components/IdVerificationModal';
import './GuestSignUp.css';

interface GuestSignUpProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
}

const GuestSignUp: React.FC<GuestSignUpProps> = ({ isOpen, onClose, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    birthDate: '',
    password: '',
    confirmPassword: ''
  });
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  // 모달이 열릴 때 배경 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsVerificationModalOpen(true);
  };

  const handleVerificationComplete = () => {
    // 운전면허 인증 완료 시 프로필로 전환
    localStorage.setItem('token', 'guest-token');
    localStorage.setItem('profileImage', '/default-profile.png');
    window.dispatchEvent(new Event('storage'));
    
    setIsVerificationModalOpen(false);
    onClose();
  };

  const handleVerificationClose = () => {
    setIsVerificationModalOpen(false);
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content guest-signup">
        <div className="signup-header">
          <h2>비회원 회원가입</h2>
          <p className="subtitle">간편하게 시작하세요</p>
        </div>
        <form onSubmit={handleSubmit} className="guest-signup-form">
          <div className="form-group">
            <label htmlFor="name">이름</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="이름을 입력하세요"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">전화번호</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="전화번호를 입력하세요"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="birthDate">생년월일</label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleInputChange}
              placeholder="생년월일을 입력하세요"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              name="password"
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
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="비밀번호를 다시 입력해주세요"
              minLength={8}
              required
            />
          </div>
          <div className="button-group">
            <button type="button" onClick={onBack} className="back-button">이전</button>
            <button type="submit" className="submit-button">가입하기</button>
          </div>
        </form>
      </div>

      <IdVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={handleVerificationClose}
        onVerify={handleVerificationComplete}
      />
    </div>
  );
};

export default GuestSignUp; 