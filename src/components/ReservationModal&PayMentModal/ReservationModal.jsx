import React from "react";
import "./ReservationModal.css";

const ReservationModal = ({ car, dateRange, onClose, onPayment }) => {
  const [startDate, endDate] = dateRange || [null, null];

  const handleSubmit = (e) => {
    e.preventDefault();
    onPayment(); // 결제모달로 전환
  };

  return (
    <div className="reservation-modal">
      <div className="modal-content">
        <div className="modal-car-info">
          <div className="modal-car-header">
            <h3>
              {car.manufacturer} {car.model_name}
            </h3>
          </div>
          <div className="modal-car-image">
            <img
              src={car.image_url}
              alt={`${car.manufacturer} ${car.model_name}`}
              onError={(e) => {
                console.error("이미지 로드 실패:", car.image_url);
                e.target.src = "./default-profile.png";
              }}
            />
          </div>
          <div className="modal-car-features">
            <div className="info-item">
              <span className="info-label">연식</span>
              <span className="info-value">2023년</span>
            </div>
            <div className="info-item">
              <span className="info-label">주행거리</span>
              <span className="info-value">15,000km</span>
            </div>
            <div className="info-item">
              <span className="info-label">연료</span>
              <span className="info-value">가솔린</span>
            </div>
            <div className="info-item">
              <span className="info-label">변속기</span>
              <span className="info-value">자동</span>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <label>
            이름
            <input type="text" name="name" required />
          </label>
          <label>
            연락처
            <input type="tel" name="phone" required />
          </label>
          <label>
            대여기간
            <input
              type="text"
              name="period"
              value={
                startDate && endDate
                  ? `${startDate.toLocaleDateString()} ~ ${endDate.toLocaleDateString()}`
                  : "날짜를 선택해주세요"
              }
              readOnly
            />
          </label>
          <label>
            총 금액
            <input type="text" name="totalPrice" value="계산중" readOnly />
          </label>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              닫기
            </button>
            <button type="submit">예약 하기</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationModal;
