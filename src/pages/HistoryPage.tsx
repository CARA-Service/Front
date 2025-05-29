import React from 'react';
import './HistoryPage.css';

const HistoryPage: React.FC = () => {
  return (
    <div className="history-page">
      <div className="history-content">
        <div className="history-section">
          <h2>이용 기록</h2>
          <div className="history-list">
            <div className="history-card">
              <div className="history-date">
                <span>2024-03-15</span>
              </div>
              <div className="history-details">
                <h3>기본 서비스</h3>
                <div className="history-info">
                  <span className="duration">이용시간: 1시간</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage; 