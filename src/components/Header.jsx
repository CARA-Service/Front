import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import Profile from './Profile';
import './Header.css';

function Header({ onSignUpClick }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileImage, setProfileImage] = useState('/default-profile.png');

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      const storedProfileImage = localStorage.getItem('profileImage');
      setIsLoggedIn(!!token);
      setProfileImage(storedProfileImage || '/default-profile.png');
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

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storageChange', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storageChange', handleCustomStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('profileImage');
    setIsLoggedIn(false);
    setProfileImage('/default-profile.png');
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          CARA
        </Link>
        <nav className="nav-links">
          <Link to="/faq">FAQ</Link>
          <Link to="/contact">문의하기</Link>
        </nav>
        <div className="auth-section">
          {isLoggedIn ? (
            <Profile onLogout={handleLogout} />
          ) : (
            <button className="signup-button" onClick={onSignUpClick}>
              간편 회원가입
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header; 