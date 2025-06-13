import React, { useState } from "react";
import "./PayMentModal.css";

const paymentMethods = [
  { id: "visa", label: "Visa", icon: "/visa.png" },
  { id: "jcb", label: "JCB", icon: "/jcb.png" },
  { id: "mastercard", label: "MasterCard", icon: "/mastercard.png" },
  { id: "paypal", label: "PayPal", icon: "/paypal.png" },
];

const PaymentModal = ({
  car,
  dateRange,
  onBack,
  onClose,
  price = 45000,
  discount = 0.4, // 40% 할인
  originPrice = 28000,
  currency = "원",
  paymentCurrency = "Rp",
  paymentAmount = "1.604.200",
}) => {
  const [selected, setSelected] = useState("visa");
  const [startDate, endDate] = dateRange || [null, null];

  const handleSubmit = (e) => {
    e.preventDefault();
    // 결제(예약) 로직 추가 가능
    // 예: onPayment(), onReserve() 등
  };

  return (
    <div className="payment-modal">
      <div className="modal-content">
        {/* 차량 정보 */}
        <div className="modal-car-info">
          <div className="modal-car-header">
            <h3>
              {car.brand} {car.model}
            </h3>
          </div>
          <div className="modal-car-image">
            <img
              src={car.imageUrl}
              alt={`${car.brand} ${car.model}`}
              onError={(e) => {
                console.error("이미지 로드 실패:", car.imageUrl);
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
        {/* 결제수단 선택 */}
        <div className="payment-methods">
          {paymentMethods.map((m) => (
            <label
              key={m.id}
              className={`method-row ${selected === m.id ? "selected" : ""}`}>
              <input
                type="radio"
                name="payment"
                value={m.id}
                checked={selected === m.id}
                onChange={() => setSelected(m.id)}
              />
              <span className="method-icon">
                <img src={m.icon} alt={m.label} />
              </span>
              <span className="method-label">{m.label}</span>
            </label>
          ))}
        </div>
        <div className="payment-help">
          결제가 어렵습니까 휴먼? 돈이 없는게 아니라? <a href="#">도움말.</a>
        </div>
        <div className="payment-summary">
          <div className="summary-left">
            <span className={`method-icon small`}>
              <img
                src={paymentMethods.find((m) => m.id === selected).icon}
                alt={selected}
              />
            </span>
            <span className="summary-method">
              {paymentMethods.find((m) => m.id === selected).label}
            </span>
          </div>
          <div className="summary-right">
            {paymentCurrency} {paymentAmount}
          </div>
        </div>
        <div className="payment-bottom">
          <span className="discount">{Math.round(discount * 100)}%</span>
          <span className="origin-price">
            {originPrice.toLocaleString()}
            {currency}
          </span>
          <span className="final-price">
            {price.toLocaleString()} {currency}
          </span>
        </div>
        {/* 버튼 */}
        <div className="modal-actions">
          <button type="button" className="back-btn" onClick={onBack}>
            뒤로가기
          </button>
          <button type="button" className="close-btn" onClick={onClose}>
            닫기
          </button>
          <button type="submit" className="submit-btn" onClick={handleSubmit}>
            결제 하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
