import React from 'react';
import './AnalysisPage.css';

const AnalysisPage = () => {
  return (
    <div className="analysis-page">
      <div className="analysis-content">
        <div className="analysis-section">
          <h2>이용 분석</h2>
          <div className="analysis-cards">
            <div className="analysis-card">
              <h3>총 이용 횟수</h3>
              <p className="number">15회</p>
            </div>
            <div className="analysis-card">
              <h3>평균 평점</h3>
              <p className="number">4.5</p>
            </div>
            <div className="analysis-card">
              <h3>선호 서비스</h3>
              <p className="text">프리미엄 서비스</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage; 