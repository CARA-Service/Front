import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import './Header.css';

interface HeaderProps {
  onSignUpClick: () => void;
  onGuestSignUpClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSignUpClick, onGuestSignUpClick }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

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

    // 클릭 이벤트 리스너 추가
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('storageChange', handleStorageChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('profileImage');
    setIsLoggedIn(false);
    setIsProfileMenuOpen(false);
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
            <div className="profile-container" ref={profileMenuRef}>
              <div className="profile-image-container" onClick={handleProfileClick}>
                <img 
                  src={profileImage || '/default-profile.png'} 
                  alt="프로필" 
                  className="profile-image"
                />
              </div>
              {isProfileMenuOpen && (
                <div className="profile-menu">
                  <button onClick={handleLogout} className="logout-button">
                    로그아웃
                  </button>
                </div>
              )}
            </div>
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