import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile } from "../../api/Reservations&PaymentAPI.js";
import "./ProfilePage.css";
import { FaEdit, FaSave, FaTimes, FaUser, FaEnvelope, FaPhone, FaHome, FaIdCard, FaCamera } from "react-icons/fa";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editProfile, setEditProfile] = useState(null);
  const fileInputRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      const data = await getUserProfile();
      if (data) {
        setProfile(data);
        setEditProfile(data);
        setImageUrl(data.profileImageUrl || "/default-profile.png");
      } else {
        setError("프로필 정보를 불러오지 못했습니다. 로그인이 필요합니다.");
        // 로그인 페이지로 이동하거나, 에러 메시지를 보여줄 수 있습니다.
        // navigate('/login');
      }
    }
    fetchProfile();
  }, [navigate]);

  // 프로필 이미지 변경 핸들러
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImageUrl(ev.target.result);
        setEditProfile((prev) => ({ ...prev, profileImageUrl: ev.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditProfile((prev) => ({ ...prev, [name]: value }));
  };

  // 저장 핸들러 (임시 상태에만 반영)
  const handleSave = () => {
    setProfile(editProfile);
    setEditMode(false);
  };

  // 취소 핸들러
  const handleCancel = () => {
    setEditProfile(profile);
    setImageUrl(profile.profileImageUrl || "/default-profile.png");
    setEditMode(false);
  };

  if (!profile || !editProfile) {
    return (
      <div className="profile-card-centered">
        {error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div>로딩 중...</div>
        )}
      </div>
    );
  }

  return (
    <div className="profile-card-centered">
      <div className="profile-card">
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar" onClick={() => editMode && fileInputRef.current.click()} style={{cursor: editMode ? 'pointer' : 'default'}}>
            <img
              src={imageUrl}
              alt="프로필 이미지"
              onError={e => { e.target.onerror = null; e.target.src = "/default-profile.png"; }}
            />
            {editMode && (
              <div className="profile-avatar-overlay">
                <FaCamera />
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleImageChange}
          />
        </div>
        <div className="profile-main-info">
          <div className="profile-main-name">{editMode ? (
            <input className="edit-input" name="fullName" value={editProfile.fullName} onChange={handleChange} />
          ) : profile.fullName}</div>
          <div className="profile-main-email">{editMode ? (
            <input className="edit-input" name="email" value={editProfile.email} onChange={handleChange} />
          ) : profile.email}</div>
        </div>
        <div className="profile-info-list">
          <div className="profile-info-row">
            <FaPhone className="profile-info-icon" />
            {editMode ? (
              <input className="edit-input" name="phoneNumber" value={editProfile.phoneNumber} onChange={handleChange} />
            ) : profile.phoneNumber}
          </div>
          <div className="profile-info-row">
            <FaHome className="profile-info-icon" />
            {editMode ? (
              <input className="edit-input" name="address" value={editProfile.address} onChange={handleChange} />
            ) : profile.address}
          </div>
          <div className="profile-info-row">
            <FaIdCard className="profile-info-icon" />
            {editMode ? (
              <input className="edit-input" name="driverLicense" value={editProfile.driverLicense} onChange={handleChange} />
            ) : profile.driverLicense}
          </div>
        </div>
        <div className="profile-action-bar">
          {editMode ? (
            <>
              <button className="save-button" onClick={handleSave} title="저장"><FaSave /></button>
              <button className="cancel-button" onClick={handleCancel} title="취소"><FaTimes /></button>
            </>
          ) : (
            <button className="edit-button" onClick={() => setEditMode(true)} title="편집"><FaEdit /></button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
