import React, { useState } from "react";
import "./PayMentModal.css";

const paymentMethods = [
  { id: "visa", label: "Visa", icon: "/visa.png" },
  { id: "jcb", label: "JCB", icon: "/jcb.png" },
  { id: "mastercard", label: "MasterCard", icon: "/mastercard.png" },
  { id: "paypal", label: "PayPal", icon: "/paypal.png" },
];

const insuranceOptions = [
  { id: "basic", label: "기본 보험", price: 3000 },
  { id: "standard", label: "표준 보험", price: 6000 },
  { id: "premium", label: "프리미엄 보험", price: 12000 },
  { id: "super", label: "슈퍼 보험", price: 20000 },
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
  const [selectedInsurances, setSelectedInsurances] = useState([]);
  const [hide, setHide] = useState(false);

  // 보험 총액 계산
  const insuranceTotal = selectedInsurances.reduce(
    (sum, id) => sum + (insuranceOptions.find((opt) => opt.id === id)?.price || 0),
    0
  );
  const totalPrice = price + insuranceTotal;

  const handleInsuranceChange = (id) => {
    setSelectedInsurances((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 결제(예약) 로직 추가 가능
    // 예: onPayment(), onReserve() 등
  };

  const handleBack = () => {
    setHide(true);
    setTimeout(() => {
      onBack();
    }, 350); // css 트랜지션 시간과 맞춤
  };

  return (
    <div className={`payment-modal${hide ? " hide" : ""}`}>
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
        {/* 보험 선택지 */}
        <div className="insurance-options">
          <div className="insurance-title">보험 선택</div>
          {insuranceOptions.map((opt) => (
            <label key={opt.id} className="insurance-row">
              <input
                type="checkbox"
                checked={selectedInsurances.includes(opt.id)}
                onChange={() => handleInsuranceChange(opt.id)}
              />
              <span className="insurance-label">{opt.label}</span>
              <span className="insurance-price">+{opt.price.toLocaleString()}원</span>
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
            {totalPrice.toLocaleString()} {currency}
          </div>
        </div>
        <div className="payment-bottom">
          <span className="discount">{Math.round(discount * 100)}%</span>
          <span className="origin-price">
            {originPrice.toLocaleString()}
            {currency}
          </span>
          <span className="final-price">
            {totalPrice.toLocaleString()} {currency}
          </span>
        </div>
        {/* 버튼 */}
        <div className="modal-actions">
          <button type="button" className="back-btn" onClick={handleBack}>
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
