import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import Profile from "../Profile/Profile";
import Login from '../../pages/Login/Login';
import SignUp from '../../pages/SignUp/SignUp';
import "./Header.css";

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileImage, setProfileImage] = useState("/default-profile.png");
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [hoverSide, setHoverSide] = useState(null); // null | 'login' | 'signup'

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("token");
      const storedProfileImage = localStorage.getItem("profileImage");
      setIsLoggedIn(!!token);
      setProfileImage(storedProfileImage || "/default-profile.png");
    };

    // 초기 로그인 상태 확인
    checkLoginStatus();

    // storage 이벤트 리스너
    const handleStorageChange = () => {
      checkLoginStatus();
    };

    // 커스텀 storageChange 이벤트 리스너
    const handleCustomStorageChange = () => {
      checkLoginStatus();
    };

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

  // 버튼 마우스 무브 핸들러
  const handleJoinBtnMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) {
      setHoverSide('login');
    } else {
      setHoverSide('signup');
    }
  };
  const handleJoinBtnMouseLeave = () => {
    setHoverSide(null);
  };
  const handleJoinBtnClick = () => {
    if (hoverSide === 'login') {
      setShowLogin(true);
    } else if (hoverSide === 'signup') {
      setShowSignUp(true);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          CARA
        </Link>
        <nav className="nav-links">
          <Link to="/reservations">예약하기</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/contact">문의하기</Link>
        </nav>
        <div className="auth-section">
          {isLoggedIn ? (
            <Profile onLogout={handleLogout} />
          ) : (
            <button
              className={`cara-join-btn${hoverSide ? ' ' + hoverSide : ''}`}
              onMouseMove={handleJoinBtnMouseMove}
              onMouseLeave={handleJoinBtnMouseLeave}
              onClick={handleJoinBtnClick}
            >
              {hoverSide === 'login' && '로그인'}
              {hoverSide === 'signup' && '회원가입'}
              {hoverSide === null && 'CARA와 함께하기'}
            </button>
          )}
        </div>
      </div>
      <Login
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSwitchSignUp={() => {
          setShowLogin(false);
          setTimeout(() => setShowSignUp(true), 350);
        }}
      />
      <SignUp
        isOpen={showSignUp}
        onClose={() => setShowSignUp(false)}
        onSwitchLogin={() => {
          setShowSignUp(false);
          setTimeout(() => setShowLogin(true), 350);
        }}
      />
    </header>
  );
}

export default Header;
