import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FaUser, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import Profile from "../Profile/Profile";
import Login from '../../pages/Login/Login';
import SignUp from '../../pages/SignUp/SignUp';
import "./Header.css";

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileImage, setProfileImage] = useState("/default-profile.png");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null); // 'login' | 'signup'
  const [dragging, setDragging] = useState(false);
  const [dragX, setDragX] = useState(0); // px 단위, 0이 중앙
  const [dragMode, setDragMode] = useState(null); // 'login' | 'signup' | null
  const holderRef = useRef();
  const btnRef = useRef();
  const [isBtnHovered, setIsBtnHovered] = useState(false);

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

  useEffect(() => {
    if (showModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showModal]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("profileImage");
    setIsLoggedIn(false);
    setProfileImage("/default-profile.png");
  };

  // 드래그 이벤트 핸들러
  const handleHolderMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
    setDragX(0);
    setDragMode(null);
    document.body.style.userSelect = 'none';
  };
  useEffect(() => {
    if (!dragging) return;
    const handleMouseMove = (e) => {
      if (!btnRef.current) return;
      const rect = btnRef.current.getBoundingClientRect();
      let x = e.clientX - rect.left - rect.width / 2;
      // 최대 이동 제한 (버튼의 1/3만큼)
      const max = rect.width / 2 - 32;
      if (x < -max) x = -max;
      if (x > max) x = max;
      setDragX(x);
      if (x < -max / 2) setDragMode('login');
      else if (x > max / 2) setDragMode('signup');
      else setDragMode(null);
    };
    const handleMouseUp = () => {
      setDragging(false);
      setDragX(0);
      document.body.style.userSelect = '';
      // 드래그가 끝난 위치에 따라 모달 오픈
      if (dragMode === 'login') {
        setShowModal(true);
        setModalType('login');
      } else if (dragMode === 'signup') {
        setShowModal(true);
        setModalType('signup');
      }
      setDragMode(null);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, dragMode]);

  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
  };
  const switchToLogin = () => setModalType('login');
  const switchToSignUp = () => setModalType('signup');

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
            <div className="cara-join-btn-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
              <button
                className={`cara-join-btn drag${dragMode === 'login' ? ' login-active' : ''}${dragMode === 'signup' ? ' signup-active' : ''}`}
                ref={btnRef}
                type="button"
                tabIndex={0}
                onMouseEnter={() => setIsBtnHovered(true)}
                onMouseLeave={() => setIsBtnHovered(false)}
              >
                {!isBtnHovered && (
                  <div className="cara-join-title-bg">
                    <div className="cara-join-title">CARA 와 함께하기</div>
                  </div>
                )}
                <span className={`btn-side login${dragMode === 'login' ? ' visible' : ''}`}>{dragMode === 'login' && '로그인'}</span>
                <span
                  className={`circle-holder${dragging ? ' dragging' : ''}${dragMode ? ' moved-' + dragMode : ''}${isBtnHovered ? ' hovered' : ''}`}
                  ref={holderRef}
                  style={{
                    transform: `translate(-50%, -50%) translateX(${dragX}px) scale(${dragging ? 1.08 : 1})`
                  }}
                  onMouseDown={handleHolderMouseDown}
                  tabIndex={0}
                  role="slider"
                  aria-valuenow={dragX}
                  aria-valuemin={-btnRef.current?.offsetWidth/2||-110}
                  aria-valuemax={btnRef.current?.offsetWidth/2||110}
                  aria-label="CARA와 함께하기 드래그"
                >
                  {dragMode === 'login' ? <FaArrowLeft /> : dragMode === 'signup' ? <FaArrowRight /> : <FaUser />}
                </span>
                <span className={`btn-side signup${dragMode === 'signup' ? ' visible' : ''}`}>{dragMode === 'signup' && '회원가입'}</span>
              </button>
              {isBtnHovered && (
                <div className="cara-join-tooltip">
                  <span className="left">왼쪽으로 밀어서 <b>로그인하기</b></span>
                  <span className="right">오른쪽으로 밀어서 <b>회원가입하기</b></span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            {modalType === 'login' ? (
              <Login isOpen={true} onClose={closeModal} onSwitchSignUp={switchToSignUp} />
            ) : (
              <SignUp isOpen={true} onClose={closeModal} onSwitchLogin={switchToLogin} />
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
