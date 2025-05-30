import React from 'react';
import './ProfilePage.css';

const ProfilePage = () => {
  return (
    <div className="profile-page">
      <div className="profile-content">
        <div className="profile-section">
          <h2>기본 정보</h2>
          <div className="profile-info">
            <div className="info-item">
              <label>이름</label>
              <span>홍길동</span>
            </div>
            <div className="info-item">
              <label>이메일</label>
              <span>user@example.com</span>
            </div>
            <div className="info-item">
              <label>전화번호</label>
              <span>010-1234-5678</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 