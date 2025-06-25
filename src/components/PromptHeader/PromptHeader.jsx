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
import Profile from "../Profile/Profile";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { getChatTitle } from "../../utils/chatTitleUtils.js";
import "../Profile/Profile.css";
import "../Header/Header.css";
import "./PromptHeader.css";

export default function PromptHeader({
  onSignUpClick,
  chatHistory = [],
  onSelectChat,
  onCreateChat,
}) {
  const { smartLogout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileImage, setProfileImage] = useState("/default-profile.png");
  const [dotAnim, setDotAnim] = useState(0);
  const navigate = useNavigate();

  // 로딩 애니메이션을 위한 useEffect
  useEffect(() => {
    const interval = setInterval(() => setDotAnim((d) => (d + 1) % 4), 500);
    return () => clearInterval(interval);
  }, []);

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
    // AuthContext의 스마트 로그아웃 사용 (카카오/일반 자동 판별)
    smartLogout();

    // 로컬 상태 업데이트
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
                  {chatHistory.map((chat) => {
                    const title = getChatTitle(chat);
                    return (
                      <li
                        key={chat.id}
                        onClick={() => {
                          onSelectChat(chat.id);
                          setSidebarOpen(false);
                        }}>
                        {title || (
                          <span className="chat-dots">
                            {".".repeat(dotAnim)}
                          </span>
                        )}
                      </li>
                    );
                  })}
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
