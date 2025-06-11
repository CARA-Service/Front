import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaHome,
  FaBookOpen,
  FaQuestionCircle,
  FaEnvelope,
  FaChevronDown,
  FaChevronUp,
  FaPlus, // 새 채팅방 버튼 아이콘
} from "react-icons/fa";
import Profile from "../Profile";
import "../Profile.css";
import "../Header.css";
import "./PromptHeader.css";

export default function PromptHeader({
  onSignUpClick,
  chatHistory = [],
  onSelectChat,
  onCreateChat,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileImage, setProfileImage] = useState("/default-profile.png");
  const navigate = useNavigate();

  // 로그인 상태 및 프로필 이미지 관리
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("token");
      const storedProfileImage = localStorage.getItem("profileImage");
      setIsLoggedIn(!!token);
      setProfileImage(storedProfileImage || "/default-profile.png");
    };
    checkLoginStatus();

    const handleStorageChange = () => checkLoginStatus();
    const handleCustomStorageChange = () => checkLoginStatus();

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("storageChange", handleCustomStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("storageChange", handleCustomStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("profileImage");
    setIsLoggedIn(false);
    setProfileImage("/default-profile.png");
  };

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("ph-sidebar-backdrop")) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      <header className="ph-header">
        <div className="ph-header-left">
          <button className="ph-hamburger" onClick={() => setSidebarOpen(true)}>
            <FaBars />
          </button>
          <button
            className="ph-new-chat-btn"
            onClick={() => {
              onCreateChat();
              setSidebarOpen(false);
            }}>
            새 채팅방
          </button>
        </div>
        <div className="auth-section">
          {isLoggedIn ? (
            <Profile onLogout={handleLogout} />
          ) : (
            <button className="signup-button" onClick={onSignUpClick}>
              간편 회원가입
            </button>
          )}
        </div>
      </header>

      {/* 사이드바 및 백드롭 */}
      <div
        className={`ph-sidebar-backdrop${sidebarOpen ? " show" : ""}`}
        onClick={handleBackdropClick}>
        <nav className={`ph-sidebar${sidebarOpen ? " open" : ""}`}>
          <div className="ph-sidebar-header">
            <span className="ph-sidebar-title">perplexity</span>
            <button
              className="ph-sidebar-close"
              onClick={() => setSidebarOpen(false)}>
              ×
            </button>
          </div>
          <ul className="ph-menu">
            <li>
              <Link to="/" onClick={() => setSidebarOpen(false)}>
                <FaHome className="ph-menu-icon" /> 홈
              </Link>
            </li>
            <li>
              <div
                className="ph-menu-toggle"
                onClick={() => setChatOpen((v) => !v)}>
                <FaBookOpen className="ph-menu-icon" /> 채팅내역
                {chatOpen ? (
                  <FaChevronUp className="ph-menu-chevron" />
                ) : (
                  <FaChevronDown className="ph-menu-chevron" />
                )}
              </div>
              {chatOpen && (
                <ul className="ph-submenu">
                  {chatHistory.map((chat) => (
                    <li
                      key={chat.id}
                      onClick={() => {
                        onSelectChat(chat.id);
                        setSidebarOpen(false);
                      }}>
                      Chat {chat.id}
                    </li>
                  ))}
                </ul>
              )}
            </li>
            <li>
              <Link to="/faq" onClick={() => setSidebarOpen(false)}>
                <FaQuestionCircle className="ph-menu-icon" /> FAQ
              </Link>
            </li>
            <li>
              <Link to="/ask" onClick={() => setSidebarOpen(false)}>
                <FaEnvelope className="ph-menu-icon" /> 문의하기
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}
