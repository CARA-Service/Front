import React, { useState, useRef } from "react";
import "./ReservationModal.css";

const ReservationModal = ({ car, dateRange, onClose, onPayment }) => {
  const [startDate, endDate] = dateRange || [null, null];
  const [showConfirm, setShowConfirm] = useState(false);
  const contentRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onPayment(); // 결제모달로 전환
  };

  // 바깥 클릭 시 안내 모달
  const handleModalMouseDown = (e) => {
    if (contentRef.current && !contentRef.current.contains(e.target)) {
      setShowConfirm(true);
    }
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    onClose();
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <div className="reservation-modal" onMouseDown={handleModalMouseDown}>
      <div className="reservation-modal-content" ref={contentRef} onMouseDown={e => e.stopPropagation()}>
        <div className="reservation-modal-header-row">
          <div className="reservation-modal-car-image">
            <img
              src={car.image_url}
              alt={`${car.manufacturer} ${car.model_name}`}
              onError={(e) => {
                console.error("이미지 로드 실패:", car.image_url);
                e.target.src = "./default-profile.png";
              }}
            />
          </div>
          <div className="reservation-modal-car-header">
            <h3>{car.manufacturer} {car.model_name}</h3>
            <div className="reservation-modal-car-features-row">
              <div className="reservation-info-item">
                <span className="reservation-info-label">연식</span>
                <span className="reservation-info-value">2023년</span>
              </div>
              <div className="reservation-info-item">
                <span className="reservation-info-label">주행거리</span>
                <span className="reservation-info-value">15,000km</span>
              </div>
              <div className="reservation-info-item">
                <span className="reservation-info-label">연료</span>
                <span className="reservation-info-value">가솔린</span>
              </div>
              <div className="reservation-info-item">
                <span className="reservation-info-label">변속기</span>
                <span className="reservation-info-value">자동</span>
              </div>
            </div>
          </div>
        </div>
        <div className="reservation-modal-info-form">
          <form onSubmit={handleSubmit}>
            <label>
              이름
              <input type="text" name="name"  />
            </label>
            <label>
              연락처
              <input type="tel" name="phone"  />
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
            <div className="reservation-modal-actions">
              <button type="button" onClick={() => setShowConfirm(true)}>
                닫기
              </button>
              <button type="submit">예약 하기</button>
            </div>
          </form>
        </div>
      </div>
      {showConfirm && (
        <div className="reservation-confirm-modal-backdrop">
          <div className="reservation-confirm-modal">
            <p className="reservation-confirm-warning">입력하신 정보가 전부 삭제 됩니다</p>
            <p>예약을 취소하시겠습니까?</p>
            <div className="reservation-confirm-actions">
              <button onClick={handleConfirm}>예</button>
              <button onClick={handleCancel}>아니오</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationModal;
