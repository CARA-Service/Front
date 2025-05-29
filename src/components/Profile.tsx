import React, { useState } from 'react';
import { FaUser, FaCalendarAlt, FaHistory, FaChartBar, FaSignOutAlt, FaTimes } from 'react-icons/fa';
import ProfilePage from '../pages/ProfilePage';
import ReservationsPage from '../pages/ReservationsPage';
import HistoryPage from '../pages/HistoryPage';
import AnalysisPage from '../pages/AnalysisPage';
import './Profile.css';

interface ProfileProps {
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleLogout = () => {
    onLogout();
    setIsMenuOpen(false);
  };

  const handleMenuClick = (modalType: string) => {
    setActiveModal(modalType);
    setIsMenuOpen(false);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const renderModal = () => {
    if (!activeModal) return null;

    const modalContents = {
      profile: {
        title: '내 프로필',
        content: <ProfilePage />
      },
      reservations: {
        title: '예약 내역',
        content: <ReservationsPage />
      },
      history: {
        title: '이용 기록',
        content: <HistoryPage />
      },
      analysis: {
        title: '이용 분석',
        content: <AnalysisPage />
      }
    };

    const modal = modalContents[activeModal as keyof typeof modalContents];

    return (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <button className="modal-close" onClick={closeModal}>
            <FaTimes />
          </button>
          <h2>{modal.title}</h2>
          {modal.content}
        </div>
      </div>
    );
  };

  return (
    <div className="profile-container">
      <div 
        className="profile-image-container"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <img 
          src="/default-profile.png" 
          alt="Profile" 
          className="profile-image"
        />
      </div>

      {isMenuOpen && (
        <div className="profile-menu">
          <button 
            className="menu-item"
            onClick={() => handleMenuClick('profile')}
          >
            <FaUser /> 내 프로필
          </button>
          <button 
            className="menu-item"
            onClick={() => handleMenuClick('reservations')}
          >
            <FaCalendarAlt /> 예약 내역
          </button>
          <button 
            className="menu-item"
            onClick={() => handleMenuClick('history')}
          >
            <FaHistory /> 이용 기록
          </button>
          <button 
            className="menu-item"
            onClick={() => handleMenuClick('analysis')}
          >
            <FaChartBar /> 분석
          </button>
          <div className="menu-divider" />
          <button 
            className="logout-button"
            onClick={handleLogout}
          >
            <FaSignOutAlt /> 로그아웃
          </button>
        </div>
      )}

      {renderModal()}
    </div>
  );
};

export default Profile; 