import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Profile from './Profile';
import './Header.css';

interface HeaderProps {
  onSignUpClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSignUpClick }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    // 로컬 스토리지에서 로그인 상태와 프로필 이미지 확인
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      const storedProfileImage = localStorage.getItem('profileImage');
      
      if (token) {
        setIsLoggedIn(true);
        if (storedProfileImage) {
          setProfileImage(storedProfileImage);
        }
      } else {
        setIsLoggedIn(false);
        setProfileImage(null);
      }
    };

    // 초기 상태 확인
    checkLoginStatus();

    // 커스텀 이벤트 리스너 추가
    const handleStorageChange = () => {
      checkLoginStatus();
    };

    window.addEventListener('storageChange', handleStorageChange);

    return () => {
      window.removeEventListener('storageChange', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('profileImage');
    setIsLoggedIn(false);
    window.dispatchEvent(new Event('storageChange'));
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          CARA
        </Link>
        <nav className="nav-links">
          <Link to="/faq" className="nav-link">FAQ</Link>
          <Link to="/contact" className="nav-link">문의하기</Link>
          {isLoggedIn ? (
            <Profile onLogout={handleLogout} />
          ) : (
            <button onClick={onSignUpClick} className="nav-link signup-link">
              간편 회원가입
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header; 