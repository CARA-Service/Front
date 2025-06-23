import React, { useState, useRef, useEffect } from "react";
// api/Reservations&PaymentAPI에서 getUserProfile을 가져오고 있으므로
// 별도의 axios import나 함수 중복 정의 없이 사용해야 합니다.
// axios를 직접 사용할 필요가 없다면 import하지 않아도 됩니다.
import { getUserProfile } from "../../api/Reservations&PaymentAPI";
import "./ReservationModal.css"; // CSS 파일 경로 확인 필요

const ReservationModal = ({
  car,
  dateRange,
  onClose,
  onPayment,
  appearDelay = 0,
}) => {
  const [startDate, endDate] = dateRange || [null, null];
  const [showConfirm, setShowConfirm] = useState(false);
  const contentRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // userProfile 상태가 바뀔 때마다 콘솔로 확인
  useEffect(() => {
    console.log("userProfile 상태:", userProfile);
  }, [userProfile]);

  // 모달 등장 및 데이터 호출
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), appearDelay);
    document.body.classList.add("modal-open");

    // api/Reservations&PaymentAPI의 getUserProfile 사용
    getUserProfile()
      .then((profile) => {
        setUserProfile(profile);
        console.log("프로필 데이터:", profile);
      })
      .catch((error) => {
        console.error("프로필 조회 실패:", error);
      });

    return () => {
      clearTimeout(timer);
      document.body.classList.remove("modal-open");
    };
  }, [appearDelay]);

  // onSubmit 핸들러
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

  // 예약 취소 확인 모달 핸들러
  const handleConfirm = () => {
    setShowConfirm(false);
    onClose();
  };

  // 예약 취소 모달에서 '아니오' 클릭
  const handleCancel = () => {
    setShowConfirm(false);
  };

  // 모달 닫기
  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 280);
  };

  return (
    <div className="reservation-modal" onMouseDown={handleModalMouseDown}>
      <div
        className={`reservation-modal-content${visible ? " show" : " hide"}`}
        ref={contentRef}
        onMouseDown={(e) => e.stopPropagation()}>
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
            <h3>
              {car.manufacturer} {car.model_name}
            </h3>
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
              <span>이름</span>
              <input
                type="text"
                name="name"
                value={userProfile?.fullName || ""}
                readOnly
              />
            </label>
            <label>
              <span>연락처</span>
              <input
                type="tel"
                name="phone"
                value={userProfile?.phoneNumber || ""}
                readOnly
              />
            </label>
            <label>
              <span>대여기간</span>
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
            <div className="reservation-modal-actions">
              <button type="button" onClick={handleClose}>
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
            <p className="reservation-confirm-warning">
              입력하신 정보가 전부 삭제 됩니다
            </p>
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
