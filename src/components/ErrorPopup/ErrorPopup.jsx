import React from 'react';
import './ErrorPopup.css';

const ErrorPopup = ({ error, onClose }) => {
  if (!error) return null;
  return (
    <div className="error-popup">
      <div className="error-content">
        <div className="error-icon">!</div>
        <h3>오류 발생</h3>
        <p>{error}</p>
        <button className="error-close-button" onClick={onClose}>
          확인
        </button>
      </div>
    </div>
  );
};

export default ErrorPopup; 