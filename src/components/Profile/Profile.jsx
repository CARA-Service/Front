import React, { useState, useEffect, useRef } from "react";
import {
  FaUser,
  FaCalendarAlt,
  FaHistory,
  FaChartBar,
  FaSignOutAlt,
  FaTimes,
} from "react-icons/fa";
import ProfilePage from "../../pages/ProfilePage/ProfilePage.jsx";
import ReservationHistoryPage from "../../pages/ReservationHistoryPage/ReservationHistoryPage.jsx";
import HistoryPage from "../../pages/HistoryPage/HistoryPage.jsx";
import AnalysisPage from "../../pages/AnalysisPage/AnalysisPage.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import './Profile.css';

const Profile = ({ onLogout }) => {
  const { smartLogout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [profileImage, setProfileImage] = useState("/default-profile.png");
  const profileRef = useRef(null);

  useEffect(() => {
    // 로컬 스토리지에서 프로필 이미지 가져오기
    const storedImage = localStorage.getItem("profileImage");
    if (storedImage) {
      setProfileImage(storedImage);
    }
    const handleProfileImageChange = () => {
      const updatedImage = localStorage.getItem("profileImage");
      if (updatedImage) setProfileImage(updatedImage);
    };
    window.addEventListener("profileImageChanged", handleProfileImageChange);
    return () => window.removeEventListener("profileImageChanged", handleProfileImageChange);
  }, []);

  useEffect(() => {
    // 메뉴가 열려있을 때만 이벤트 리스너 추가
    if (isMenuOpen) {
      const handleClickOutside = (event) => {
        if (profileRef.current && !profileRef.current.contains(event.target)) {
          setIsMenuOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isMenuOpen]);

  useEffect(() => {
    if (activeModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    // 컴포넌트 언마운트 시 클래스 제거
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [activeModal]);

  const handleLogout = () => {
    // AuthContext의 스마트 로그아웃 사용 (카카오/일반 자동 판별)
    smartLogout();

    // 기존 onLogout 콜백도 호출 (Header 상태 업데이트용)
    if (onLogout) {
      onLogout();
    }

    setIsMenuOpen(false);
    setActiveModal(null);
  };

  const handleMenuClick = (modalType) => {
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
        title: "내 프로필",
        content: <ProfilePage />,
      },
      reservations: {
        title: "예약 내역",
        content: <ReservationHistoryPage />,
      },
      history: {
        title: "이용 기록",
        content: <HistoryPage />,
      },
      analysis: {
        title: "이용 분석",
        content: <AnalysisPage />,
      },
    };

    const modal = modalContents[activeModal];

    return (
      <div className="modal-overlay" onClick={closeModal}>
        <div className={`modal-content modal-${activeModal}`} onClick={(e) => e.stopPropagation()}>
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
    <div className="profile-container" ref={profileRef}>
      <div
        className="profile-image-container"
        onClick={() => setIsMenuOpen(!isMenuOpen)}>
        <img
          src={profileImage}
          alt="Profile"
          className="profile-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/default-profile.png";
          }}
        />
      </div>

      {isMenuOpen && (
        <div className="profile-menu">
          <button
            className="menu-item"
            onClick={() => handleMenuClick("profile")}>
            <FaUser /> 내 프로필
          </button>
          <button
            className="menu-item"
            onClick={() => handleMenuClick("reservations")}>
            <FaCalendarAlt /> 예약 내역
          </button>
          <button
            className="menu-item"
            onClick={() => handleMenuClick("history")}>
            <FaHistory /> 이용 기록
          </button>
          <button
            className="menu-item"
            onClick={() => handleMenuClick("analysis")}>
            <FaChartBar /> 분석
          </button>
          <div className="menu-divider" />
          <button className="logout-button" onClick={handleLogout}>
            <FaSignOutAlt /> 로그아웃
          </button>
        </div>
      )}

      {renderModal()}
    </div>
  );
};

export default Profile;
