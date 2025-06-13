import React from "react";
import "./ReservationsPage.css";

const ReservationsPage = () => {
  return (
    <div className="reservations-page">
      <div className="reservations-content">
        <div className="reservations-section">
          <h2>예약 내역</h2>
          <div className="reservations-list">
            <div className="reservation-card">
              <div className="reservation-date">
                <span className="date">2024-03-20</span>
                <span className="time">14:00</span>
              </div>
              <div className="reservation-details">
                <h3>기본 서비스</h3>
                <span className="status confirmed">예약완료</span>
              </div>
            </div>
            <div className="reservation-card">
              <div className="reservation-date">
                <span className="date">2024-03-25</span>
                <span className="time">16:00</span>
              </div>
              <div className="reservation-details">
                <h3>프리미엄 서비스</h3>
                <span className="status confirmed">예약완료</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationsPage;
