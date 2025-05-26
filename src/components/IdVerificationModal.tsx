import React, { useState } from 'react';
import './IdVerificationModal.css';

interface IdVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: () => void;
}

const IdVerificationModal: React.FC<IdVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerify,
}) => {
  const [licenseNumber, setLicenseNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 실제 운전면허증 인증 API 연동
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 인증 완료 후 로컬 스토리지에 상태 저장
    localStorage.setItem('token', 'verified');
    localStorage.setItem('profileImage', '/default-profile.png');
    
    onVerify();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>운전면허증 인증</h2>
        <p>운전면허증 번호를 입력하거나 사진을 업로드해주세요.</p>
        
        <form onSubmit={handleSubmit} className="verification-form">
          <div className="form-group">
            <label htmlFor="licenseNumber">운전면허증 번호</label>
            <input
              type="text"
              id="licenseNumber"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              placeholder="운전면허증 번호 12자리"
              maxLength={12}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="licenseImage">운전면허증 사진</label>
            <div className="image-upload-container">
              <input
                type="file"
                id="licenseImage"
                accept="image/*"
                onChange={handleFileChange}
                className="image-upload-input"
              />
              <label htmlFor="licenseImage" className="image-upload-label">
                {previewUrl ? '사진 변경하기' : '사진 업로드하기'}
              </label>
            </div>
            {previewUrl && (
              <div className="image-preview">
                <img src={previewUrl} alt="운전면허증 미리보기" />
              </div>
            )}
          </div>

          <div className="modal-buttons">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
            >
              취소
            </button>
            <button
              type="submit"
              className="verify-button"
            >
              인증하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IdVerificationModal; 