import React, { useState, useEffect } from "react";
import "./ReservationHistoryPage.css";

const ReservationHistoryPage = () => {
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
      setReservations(data);
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
    <div className="ReservationHistory-MasterDetail">
      <div className="ReservationHistory-Master">
        {reservations.length === 0 && <div className="no-history">예약 내역이 없습니다.</div>}
        {reservations.map((r, idx) => (
          <div
            key={r.id}
            className={`reservation-summary-card${selectedIdx === idx ? ' selected' : ''}`}
            onClick={() => handleSelect(idx)}
          >
            <img src={r.carImage} alt={r.carName} className="reservation-summary-image" />
            <div className="reservation-summary-info">
              <div className="reservation-summary-name">{r.carName}</div>
              <div className="reservation-summary-date">{r.date}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="ReservationHistory-Detail">
        {selected ? (
          <div
            key={selected.id}
            className={`reservation-detail-card${animating ? ' fade-out' : ' fade-in'}`}
          >
            <div className="reservation-header-row">
              <img src={selected.carImage} alt={selected.carName} className="reservation-car-image" />
              <div className="reservation-header-info">
                <div className="reservation-car-name">{selected.carName}</div>
                <div className="reservation-date-status">
                  <span>{selected.date} {selected.time}</span>
                  <span className="reservation-status">{selected.status}</span>
                </div>
              </div>
            </div>
            <div className="reservation-section">
              <div className="reservation-section-title">결제 정보</div>
              <div className="reservation-info-row">
                <span className="reservation-info-label">결제금액</span>
                <span className="reservation-info-value">{selected.price?.toLocaleString()}원</span>
              </div>
              <div className="reservation-info-row">
                <span className="reservation-info-label">결제수단</span>
                <span className="reservation-info-value">{selected.paymentMethod}</span>
              </div>
              <div className="reservation-info-row">
                <span className="reservation-info-label">보험</span>
                <span className="reservation-info-value">{selected.insurances && selected.insurances.length > 0 ? selected.insurances.join(', ') : '-'}</span>
              </div>
            </div>
            <div className="reservation-section">
              <div className="reservation-section-title">예약자 정보</div>
              <div className="reservation-info-row">
                <span className="reservation-info-label">이름</span>
                <span className="reservation-info-value">{selected.userName || '-'}</span>
              </div>
              <div className="reservation-info-row">
                <span className="reservation-info-label">연락처</span>
                <span className="reservation-info-value">{selected.userPhone || '-'}</span>
              </div>
            </div>
            <div className="reservation-action-row">
              <button
                className="reservation-cancel-btn"
                onClick={() => setShowCancelModal(true)}
              >
                예약 취소하기
              </button>
            </div>
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
        ) : (
          <div className="no-detail">예약을 선택하세요.</div>
        )}
      </div>
    </div>
  );
};

export default ReservationHistoryPage; 