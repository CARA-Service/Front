import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import { getUserProfile } from "../../api/Reservations&PaymentAPI.js";
import "./ProfilePage.css";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      const data = await getUserProfile();
      if (data) {
        setProfile(data);
      } else {
        setError("프로필 정보를 불러오지 못했습니다. 로그인이 필요합니다.");
        // 로그인 페이지로 이동하거나, 에러 메시지를 보여줄 수 있습니다.
        // navigate('/login');
      }
    }
    fetchProfile();
  }, [navigate]);

  if (!profile) {
    return (
      <div className="profile-page">
        {error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div>로딩 중...</div>
        )}
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="profile-page">
        <div className="profile-content">
          <div className="profile-section">
            <h2>기본 정보</h2>
            <div className="profile-info">
              <div className="info-item">
                <label>이름</label>
                <span>{profile.fullName}</span>
              </div>
              <div className="info-item">
                <label>이메일</label>
                <span>{profile.email}</span>
              </div>
              <div className="info-item">
                <label>전화번호</label>
                <span>{profile.phoneNumber}</span>
              </div>
              {/* 필요하다면 추가 정보도 출력 가능 */}
              <div className="info-item">
                <label>주소</label>
                <span>{profile.address}</span>
              </div>
              <div className="info-item">
                <label>운전면허번호</label>
                <span>{profile.driverLicense}</span>
              </div>
              {/* profileImageUrl 등도 필요하다면 추가 */}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProfilePage;
