import React, { useState, useEffect } from "react";
import "./PayMentModal.css";
import { FaCreditCard, FaRegMoneyBillAlt, FaCheckCircle } from "react-icons/fa";
import { MdClose, MdArrowBack, MdInfoOutline } from "react-icons/md";

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
  price = 14000000,
  discount = -1.4,
  originPrice = 1000000,
  currency = "원",
}) => {
  const [selected, setSelected] = useState("visa");
  const [selectedInsurances, setSelectedInsurances] = useState([]);
  const [hide, setHide] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [imageError, setImageError] = useState(false);

  const defaultImage = '/G70_Kia.png';
  const defaultBrand = '기아';
  const defaultModel = 'G70';
  const imageUrl = imageError ? defaultImage : (car.imageUrl || defaultImage);
  const brand = car.brand || defaultBrand;
  const model = car.model || defaultModel;

  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

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
  };

  const handleBack = () => {
    setHide(true);
    setTimeout(() => {
      onBack();
    }, 350);
  };

  const handleClose = () => setShowConfirm(true);
  const handleConfirm = () => { setShowConfirm(false); onClose(); };
  const handleCancel = () => setShowConfirm(false);

  return (
    <div className={`payment-modal${hide ? " hide" : ""}`}>
      <div className="modal-content">
        {/* 상단 타이틀/닫기 */}
        <div className="payment-modal-header-row">
          <div className="payment-modal-title-row">
            <FaCreditCard className="payment-modal-main-icon" />
            <h2 className="payment-modal-main-title">결제하기</h2>
          </div>
          <button className="payment-modal-close-btn" onClick={handleClose}>
            <MdClose size={24} />
          </button>
        </div>
        {/* 차량 정보 */}
        <div className="payment-modal-car-info">
          <div className="payment-modal-car-header">
            <h3>{brand} {model}</h3>
          </div>
          <div className="payment-modal-car-image">
            <img
              src={imageUrl}
              alt={`${brand} ${model}`}
              onError={() => setImageError(true)}
            />
          </div>
        </div>
        {/* 결제수단 */}
        <div className="payment-modal-section">
          <div className="payment-modal-section-title">
            <FaCreditCard /> 결제 수단
          </div>
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
        </div>
        {/* 보험 */}
        <div className="payment-modal-section">
          <div className="payment-modal-section-title">
            <FaRegMoneyBillAlt /> 보험 선택
          </div>
          <div className="insurance-options">
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
        </div>
        {/* 안내문구 */}
        <div className="payment-help">
          <MdInfoOutline style={{marginRight:4,verticalAlign:'middle'}} />
          결제가 어렵습니까 휴먼? 돈이 없는게 아니라? <a href="#">도움말.</a>
        </div>
        {/* 결제 요약 */}
        <div className="payment-summary">
          <div className="summary-left">
            <FaCheckCircle style={{color:'#1e8fff',marginRight:4}} />
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
        {/* 할인/원가/최종가 */}
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
            <MdArrowBack style={{marginRight:4}} /> 뒤로가기
          </button>
          <button type="submit" className="submit-btn" onClick={handleSubmit}>
            <FaCreditCard style={{marginRight:4}} /> 결제하기
          </button>
        </div>
      </div>
      {showConfirm && (
        <div className="payment-confirm-modal-backdrop">
          <div className="payment-confirm-modal">
            <p className="payment-confirm-warning">결제를 취소하시겠습니까?</p>
            <div className="payment-confirm-actions">
              <button onClick={handleConfirm}>예</button>
              <button onClick={handleCancel}>아니오</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentModal;
