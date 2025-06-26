import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./ReservationListPage.css";

const STATUS_LABELS = {
  "결제완료": { label: "결제완료", color: "#1e8fff" },
  "취소": { label: "취소", color: "#ff6b6b" },
  "진행중": { label: "진행중", color: "#f7b731" },
  "완료": { label: "완료", color: "#38a169" },
};

const ReservationListPage = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [filter, setFilter] = useState("전체");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelInput, setCancelInput] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [agreePenalty, setAgreePenalty] = useState(false);
  const [cancelIdx, setCancelIdx] = useState(null);

  useEffect(() => {
    const load = () => {
      const data = JSON.parse(localStorage.getItem('reservations') || '[]');
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

  const filtered = filter === "전체" ? reservations : reservations.filter(r => r.status === filter);

  const statusCounts = reservations.reduce((acc, cur) => {
    acc[cur.status] = (acc[cur.status] || 0) + 1;
    return acc;
  }, {});

  const handleCancelReservation = () => {
    if (cancelInput !== "예약 취소 동의하기") {
      setCancelError("정확히 '예약 취소 동의하기'를 입력해야 합니다.");
      return;
    }
    if (!agreePenalty) {
      setCancelError("위약금 발생에 동의해야 취소가 가능합니다.");
      return;
    }
    const idx = cancelIdx;
    if (idx === null || idx < 0 || idx >= reservations.length) return;
    const updated = reservations.filter((_, i) => i !== idx);
    localStorage.setItem('reservations', JSON.stringify(updated));
    window.dispatchEvent(new Event('storageChange'));
    setReservations(updated);
    setShowCancelModal(false);
    setCancelInput("");
    setCancelError("");
    setAgreePenalty(false);
    setCancelIdx(null);
    setExpandedIdx(null);
  };

  return (
    <>
      <Header />
      <main>
        <div className="reservation-list-topbar">
          <h1 className="reservation-list-title">나의 예약내역</h1>
          <div className="reservation-list-status-summary">
            <span
              className={`reservation-list-status-badge${filter === '전체' ? ' selected' : ''}`}
              onClick={() => setFilter('전체')}
            >
              전체 <b>{reservations.length}</b>
            </span>
            {Object.keys(STATUS_LABELS).map((status) => (
              <span
                key={status}
                className={`reservation-list-status-badge${filter === status ? ' selected' : ''}`}
                style={{ color: STATUS_LABELS[status].color }}
                onClick={() => setFilter(status)}
              >
                {STATUS_LABELS[status].label} {statusCounts[status] ? `(${statusCounts[status]})` : ''}
              </span>
            ))}
          </div>
        </div>
        <div className="ReservationListPage-CardList">
          {filtered.length === 0 ? (
            <div className="reservation-list-no-history">예약 내역이 없습니다.</div>
          ) : (
            <div className="reservation-list-cards-container">
              {filtered.map((reservation, idx) => (
                <div
                  key={reservation.id}
                  className={`reservation-list-card fade-in`}
                >
                  <div className="reservation-list-main-row">
                    <img src={reservation.carImage} alt={reservation.carName} className="reservation-list-car-image" />
                    <div className="reservation-list-main-info">
                      <div className="reservation-list-car-name">{reservation.carName}</div>
                      <div className="reservation-list-period">{reservation.date} {reservation.time}</div>
                      <div className="reservation-list-status-badge"
                        style={{ color: STATUS_LABELS[reservation.status]?.color || '#222' }}>
                        {reservation.status}
                      </div>
                    </div>
                    <div className="reservation-list-main-actions">
                      <button className="reservation-list-detail-btn" onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}>
                        {expandedIdx === idx ? '접기' : '상세'}
                      </button>
                      <button className="reservation-list-cancel-btn" onClick={() => { setShowCancelModal(true); setCancelIdx(idx); }}>예약 취소하기</button>
                    </div>
                  </div>
                  {expandedIdx === idx && (
                    <div className="reservation-list-detail-section">
                      <div className="reservation-list-section">
                        <div className="reservation-list-section-title">결제 정보</div>
                        <div className="reservation-list-info-row">
                          <span className="reservation-list-info-label">결제금액</span>
                          <span className="reservation-list-info-value">{reservation.price?.toLocaleString()}원</span>
                        </div>
                        <div className="reservation-list-info-row">
                          <span className="reservation-list-info-label">결제수단</span>
                          <span className="reservation-list-info-value">{reservation.paymentMethod}</span>
                        </div>
                        <div className="reservation-list-info-row">
                          <span className="reservation-list-info-label">보험</span>
                          <span className="reservation-list-info-value">{reservation.insurances && reservation.insurances.length > 0 ? reservation.insurances.join(', ') : '-'}</span>
                        </div>
                      </div>
                      <div className="reservation-list-section">
                        <div className="reservation-list-section-title">예약 정보</div>
                        <div className="reservation-list-info-row">
                          <span className="reservation-list-info-label">대여일</span>
                          <span className="reservation-list-info-value">{reservation.rental_date || '-'}</span>
                        </div>
                        <div className="reservation-list-info-row">
                          <span className="reservation-list-info-label">반납일</span>
                          <span className="reservation-list-info-value">{reservation.return_date || '-'}</span>
                        </div>
                        <div className="reservation-list-info-row">
                          <span className="reservation-list-info-label">렌트장소</span>
                          <span className="reservation-list-info-value">{reservation.rental_location || '-'}</span>
                        </div>
                        <div className="reservation-list-info-row">
                          <span className="reservation-list-info-label">반납장소</span>
                          <span className="reservation-list-info-value">{reservation.return_location || '-'}</span>
                        </div>
                      </div>
                      <div className="reservation-list-section">
                        <div className="reservation-list-section-title">예약자 정보</div>
                        <div className="reservation-list-info-row">
                          <span className="reservation-list-info-label">이름</span>
                          <span className="reservation-list-info-value">{reservation.userName || '-'}</span>
                        </div>
                        <div className="reservation-list-info-row">
                          <span className="reservation-list-info-label">연락처</span>
                          <span className="reservation-list-info-value">{reservation.userPhone || '-'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="reservation-list-bottom-info">
          <div className="reservation-list-guide">
            예약 관련 문의는 <a href="/support">고객센터 </a>로 연락해 주세요.<br />
            예약 취소 시 위약금이 발생할 수 있습니다.
          </div>
        </div>
      </main>
      {showCancelModal && (
        <div className="reservation-list-cancel-modal-backdrop">
          <div className="reservation-list-cancel-modal">
            <div className="reservation-list-cancel-modal-title">예약 취소 확인</div>
            <div className="reservation-list-cancel-modal-warning">※ 예약 취소 시 위약금이 발생할 수 있습니다. 자세한 내용은 약관을 확인하세요.</div>
            <div className="reservation-list-cancel-modal-desc">예약을 정말로 취소하시려면 아래에 <b>예약 취소 동의하기</b>를 정확히 입력하세요.</div>
            <input
              className="reservation-list-cancel-modal-input"
              type="text"
              value={cancelInput}
              onChange={e => { setCancelInput(e.target.value); setCancelError(""); }}
              placeholder="예약 취소 동의하기"
            />
            <div className="reservation-list-cancel-modal-checkbox-row">
              <input
                type="checkbox"
                id="agreePenalty"
                checked={agreePenalty}
                onChange={e => setAgreePenalty(e.target.checked)}
              />
              <label htmlFor="agreePenalty" className="reservation-list-cancel-modal-checkbox-label">
                위약금 발생에 동의합니다
              </label>
            </div>
            {cancelError && <div className="reservation-list-cancel-modal-error">{cancelError}</div>}
            <div className="reservation-list-cancel-modal-actions">
              <button className="reservation-list-cancel-modal-btn" onClick={handleCancelReservation}>확인</button>
              <button className="reservation-list-cancel-modal-btn cancel" onClick={() => {
                setShowCancelModal(false);
                setCancelInput("");
                setCancelError("");
                setAgreePenalty(false);
                setCancelIdx(null);
              }}>취소</button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default ReservationListPage; 