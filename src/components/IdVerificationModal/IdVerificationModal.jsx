import React, { useState } from 'react';
import './IdVerificationModal.css';

const IdVerificationModal = ({
  isOpen,
  onClose,
  onVerify,
}) => {
  const [licenseNumber, setLicenseNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErrorMessage('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLicenseNumberChange = (e) => {
    setLicenseNumber(e.target.value);
    setErrorMessage('');
  };

  const verifyLicenseNumber = (number) => {
    // 운전면허증 번호 형식 검증 (예: 12자리)
    return /^\d{12}$/.test(number);
  };

  const validateForm = () => {
    if (!licenseNumber && !selectedFile) {
      setErrorMessage('운전면허증 번호와 사진을 모두 입력해주세요.');
      return false;
    }

    if (!licenseNumber) {
      setErrorMessage('운전면허증 번호를 입력해주세요.');
      return false;
    }

    if (!verifyLicenseNumber(licenseNumber)) {
      setErrorMessage('올바른 운전면허증 번호를 입력해주세요.');
      return false;
    }

    if (!selectedFile) {
      setErrorMessage('운전면허증 사진을 업로드해주세요.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');

    try {
      // TODO: 실제 운전면허증 인증 API 연동
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 인증 완료 후 로컬 스토리지에 상태 저장
      localStorage.setItem('token', 'verified');
      localStorage.setItem('profileImage', '/프로필.jpg');
      localStorage.setItem('licenseVerified', 'true');
      
      // storageChange 이벤트 발생
      window.dispatchEvent(new Event('storageChange'));
      
      onVerify();
    } catch (error) {
      console.error('인증 중 오류 발생:', error);
      setErrorMessage('인증 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="idv-modal-overlay" onClick={onClose}>
        <div className="idv-modal-content" onClick={e => e.stopPropagation()}>
          <h2>운전면허증 인증</h2>
          <p>운전면허증 번호와 사진을 모두 입력해주세요.</p>
          <form onSubmit={handleSubmit} className="idv-verification-form">
            <div className="idv-form-group">
              <label htmlFor="licenseNumber">운전면허증 번호 <span className="idv-required">*</span></label>
              <input
                type="text"
                id="licenseNumber"
                value={licenseNumber}
                onChange={handleLicenseNumberChange}
                placeholder="운전면허증 번호 12자리"
                maxLength={12}
              />
            </div>

            <div className="idv-form-group">
              <label htmlFor="licenseImage">운전면허증 사진 <span className="idv-required">*</span></label>
              <div className="idv-image-upload-container">
                <input
                  type="file"
                  id="licenseImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="idv-image-upload-input"
                />
                <label 
                  htmlFor="licenseImage" 
                  className={`idv-image-upload-label${previewUrl ? ' has-image' : ''}`}
                  style={previewUrl ? { backgroundImage: `url(${previewUrl})` } : undefined}
                >
                  {!previewUrl && '사진 업로드하기'}
                </label>
              </div>
            </div>

            {errorMessage && (
              <div className="idv-error-message">
                {errorMessage}
              </div>
            )}

            <div className="idv-modal-buttons">
              <button
                type="button"
                className="idv-cancel-button"
                onClick={onClose}
                disabled={isVerifying}
              >
                취소
              </button>
              <button
                type="submit"
                className="idv-verify-button"
                disabled={isVerifying}
              >
                인증하기
              </button>
            </div>
          </form>
        </div>
      </div>
      {isVerifying && (
        <div className="idv-loading-overlay">
          <div className="idv-loading-spinner"></div>
          <div className="idv-loading-text">운전면허 인증 중...</div>
        </div>
      )}
    </>
  );
};

export default IdVerificationModal; 