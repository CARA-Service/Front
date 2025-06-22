import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaCalendarAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaCamera,
  FaIdCard
} from 'react-icons/fa';
import './ProfilePage.css';

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState('/default-profile.png');
  const [tempProfileImage, setTempProfileImage] = useState(null);
  const [profileData, setProfileData] = useState({
    name: '홍길동',
    email: 'user@example.com',
    phone: '010-1234-5678',
    address: '서울시 강남구',
    birthDate: '1990-01-01',
    isLicenseVerified: true,
  });

  const [tempData, setTempData] = useState({});

  useEffect(() => {
    // 로컬 스토리지에서 프로필 데이터 로드
    const storedImage = localStorage.getItem('profileImage');
    if (storedImage) {
      setProfileImage(storedImage);
    }
    
    const storedData = localStorage.getItem('profileData');
    if (storedData) {
      setProfileData(JSON.parse(storedData));
    }
  }, []);

  const handleEdit = () => {
    setTempData({ ...profileData });
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfileData(tempData);
    localStorage.setItem('profileData', JSON.stringify(tempData));
    if (tempProfileImage) {
      setProfileImage(tempProfileImage);
      localStorage.setItem('profileImage', tempProfileImage);
      window.dispatchEvent(new Event('storageChange'));
      setTempProfileImage(null);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempData({});
    setIsEditing(false);
    setTempProfileImage(null); // 취소 시 임시 이미지도 초기화
  };

  const handleInputChange = (field, value) => {
    setTempData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        setTempProfileImage(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const currentData = isEditing ? tempData : profileData;

  return (
    <div className="profile-page compact">
      <div className="profile-content profile-horizontal">
        {/* 왼쪽: 프로필 이미지 */}
        <div className="profile-image-section compact profile-image-left">
          <div className="profile-image-container">
            <img 
              src={isEditing && tempProfileImage ? tempProfileImage : profileImage}
              alt="Profile"
              className="profile-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-profile.png';
              }}
            />
            {isEditing && (
              <div className="image-overlay">
                <label htmlFor="image-upload" className="upload-button">
                  <FaCamera />
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>
            )}
          </div>
          <div className="profile-actions">
            {!isEditing ? (
              <button className="edit-button" onClick={handleEdit}>
                <FaEdit />
              </button>
            ) : (
              <div className="edit-actions">
                <button className="save-button" onClick={handleSave}>
                  <FaSave />
                </button>
                <button className="cancel-button" onClick={handleCancel}>
                  <FaTimes />
                </button>
              </div>
            )}
          </div>
        </div>
        {/* 오른쪽: 정보 리스트 */}
        <div className="profile-info compact profile-info-right">
          <div className="info-item">
            <div className="info-icon"><FaUser /></div>
            <div className="info-content">
              <label>이름</label>
              {isEditing ? (
                <input
                  type="text"
                  value={currentData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="edit-input"
                />
              ) : (
                <span>{currentData.name}</span>
              )}
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon"><FaEnvelope /></div>
            <div className="info-content">
              <label>이메일</label>
              {isEditing ? (
                <input
                  type="email"
                  value={currentData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="edit-input"
                />
              ) : (
                <span>{currentData.email}</span>
              )}
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon"><FaPhone /></div>
            <div className="info-content">
              <label>전화번호</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={currentData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="edit-input"
                />
              ) : (
                <span>{currentData.phone}</span>
              )}
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon"><FaCalendarAlt /></div>
            <div className="info-content">
              <label>생년월일</label>
              {isEditing ? (
                <input
                  type="date"
                  value={currentData.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  className="edit-input"
                />
              ) : (
                <span>{currentData.birthDate}</span>
              )}
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon"><FaMapMarkerAlt /></div>
            <div className="info-content">
              <label>주소</label>
              {isEditing ? (
                <input
                  type="text"
                  value={currentData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="edit-input"
                />
              ) : (
                <span>{currentData.address}</span>
              )}
            </div>
          </div>
          {/* 운전면허증 인증 여부는 편집 모드가 아닐 때만 표시 */}
          {(!isEditing) && (
            <div className="info-item">
              <div className="info-icon"><FaIdCard /></div>
              <div className="info-content">
                <label>운전면허증</label>
                <span className={`license-status ${currentData.isLicenseVerified ? 'verified' : ''}`}>
                  {currentData.isLicenseVerified ? '인증 완료' : '미인증'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 