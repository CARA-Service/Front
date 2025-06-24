import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import "./ReservationHistoryPage.css";

const ReservationHistoryPage = () => {
  const { user } = useAuth(); // 현재 로그인된 사용자 정보
  const [reservations, setReservations] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelInput, setCancelInput] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [agreePenalty, setAgreePenalty] = useState(false);

  useEffect(() => {
    const load = () => {
      const data = JSON.parse(localStorage.getItem('reservations') || '[]');

      // 사용자 정보가 없는 예약에 현재 로그인된 사용자 정보 또는 기본값 설정
      const updatedData = data.map(reservation => ({
        ...reservation,
        userName: reservation.userName || user?.fullName || "사용자",
        userPhone: reservation.userPhone || user?.phoneNumber || "연락처 없음"
      }));

      setReservations(updatedData);
    };
    load();
    window.addEventListener('storageChange', load);
    return () => window.removeEventListener('storageChange', load);
  }, []);

  const selected = reservations[selectedIdx] || null;

  // 전환 효과 트리거
  const handleSelect = (idx) => {
    if (selectedIdx !== idx) {
      setAnimating(true);
      setTimeout(() => {
        setSelectedIdx(idx);
        setAnimating(false);
      }, 220); // CSS duration과 맞춤
    }
  };

  const handleCancelReservation = () => {
    if (cancelInput !== "예약 취소 동의하기") {
      setCancelError("정확히 '예약 취소 동의하기'를 입력해야 합니다.");
      return;
    }
    if (!agreePenalty) {
      setCancelError("위약금 발생에 동의해야 취소가 가능합니다.");
      return;
    }
    const updated = reservations.filter((r, idx) => idx !== selectedIdx);
    localStorage.setItem('reservations', JSON.stringify(updated));
    window.dispatchEvent(new Event('storageChange'));
    setSelectedIdx(0);
    setShowCancelModal(false);
    setCancelInput("");
    setCancelError("");
    setAgreePenalty(false);
  };

  return (
    <div className="ReservationHistory-CardList">
      {reservations.length === 0 ? (
        <div className="no-history">예약 내역이 없습니다.</div>
      ) : (
        <div className="reservation-cards-container">
          {reservations.map((reservation, idx) => (
            <div
              key={reservation.id}
              className="reservation-detail-card fade-in"
              style={{ animationDelay: `${idx * 0.1}s` }} // 순차적 애니메이션
            >
              <div className="reservation-header-row">
                <img src={reservation.carImage} alt={reservation.carName} className="reservation-car-image" />
                <div className="reservation-header-info">
                  <div className="reservation-car-name">{reservation.carName}</div>
                  <div className="reservation-date-status">
                    <span>{reservation.date} {reservation.time}</span>
                    <span className="reservation-status">{reservation.status}</span>
                  </div>
                </div>
              </div>
              <div className="reservation-section">
                <div className="reservation-section-title">결제 정보</div>
                <div className="reservation-info-row">
                  <span className="reservation-info-label">결제금액</span>
                  <span className="reservation-info-value">{reservation.price?.toLocaleString()}원</span>
                </div>
                <div className="reservation-info-row">
                  <span className="reservation-info-label">결제수단</span>
                  <span className="reservation-info-value">{reservation.paymentMethod}</span>
                </div>
                <div className="reservation-info-row">
                  <span className="reservation-info-label">보험</span>
                  <span className="reservation-info-value">{reservation.insurances && reservation.insurances.length > 0 ? reservation.insurances.join(', ') : '-'}</span>
                </div>
              </div>
              <div className="reservation-section">
                <div className="reservation-section-title">예약자 정보</div>
                <div className="reservation-info-row">
                  <span className="reservation-info-label">이름</span>
                  <span className="reservation-info-value">{reservation.userName || '-'}</span>
                </div>
                <div className="reservation-info-row">
                  <span className="reservation-info-label">연락처</span>
                  <span className="reservation-info-value">{reservation.userPhone || '-'}</span>
                </div>
              </div>
              <div className="reservation-action-row">
                <button
                  className="reservation-cancel-btn"
                  onClick={() => {
                    setSelectedIdx(idx);
                    setShowCancelModal(true);
                  }}
                >
                  예약 취소하기
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 취소 모달 */}
      {showCancelModal && (
        <div className="cancel-modal-backdrop">
          <div className="cancel-modal">
            <div className="cancel-modal-title">예약 취소 확인</div>
            <div className="cancel-modal-warning">※ 예약 취소 시 위약금이 발생할 수 있습니다. 자세한 내용은 약관을 확인하세요.</div>
            <div className="cancel-modal-desc">예약을 정말로 취소하시려면 아래에 <b>예약 취소 동의하기</b>를 정확히 입력하세요.</div>
            <input
              className="cancel-modal-input"
              type="text"
              value={cancelInput}
              onChange={e => { setCancelInput(e.target.value); setCancelError(""); }}
              placeholder="예약 취소 동의하기"
            />
            <div className="cancel-modal-checkbox-row">
              <input
                type="checkbox"
                id="agreePenalty"
                checked={agreePenalty}
                onChange={e => setAgreePenalty(e.target.checked)}
              />
              <label htmlFor="agreePenalty" className="cancel-modal-checkbox-label">
                위약금 발생에 동의합니다
              </label>
            </div>
            {cancelError && <div className="cancel-modal-error">{cancelError}</div>}
            <div className="cancel-modal-actions">
              <button className="cancel-modal-btn" onClick={handleCancelReservation}>확인</button>
              <button className="cancel-modal-btn cancel" onClick={() => { setShowCancelModal(false); setCancelInput(""); setCancelError(""); setAgreePenalty(false); }}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationHistoryPage; 