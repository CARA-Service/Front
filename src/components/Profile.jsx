import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaCalendarAlt,
  FaHistory,
  FaChartBar,
  FaSignOutAlt,
  FaTimes,
} from "react-icons/fa";
import ProfilePage from "../pages/ProfilePage/ProfilePage.jsx";
import ReservationsPage from "../pages/ReservationsPage/ReservationsPage.jsx";
import HistoryPage from "../pages/HistoryPage/HistoryPage.jsx";
import AnalysisPage from "../pages/AnalysisPage/AnalysisPage.jsx";
import "./Profile.css";

const Profile = ({ onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [profileImage, setProfileImage] = useState("/default-profile.png");

  useEffect(() => {
    // 로컬 스토리지에서 프로필 이미지 가져오기
    const storedImage = localStorage.getItem("profileImage");
    if (storedImage) {
      setProfileImage(storedImage);
    }
  }, []);

  const handleLogout = () => {
    onLogout();
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
        content: <ReservationsPage />,
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
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
