import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PayMentModal.css";
import { FaCreditCard, FaRegMoneyBillAlt, FaCheckCircle } from "react-icons/fa";
import { MdClose, MdArrowBack, MdInfoOutline } from "react-icons/md";
import { getCarImagePath } from "../../utils/carImageMapping.js";
import { getInsuranceOptions } from "../../api/insuranceAPI.js";
import { useAuth } from "../../contexts/AuthContext.jsx";
import api from "../../api/api.js";

const paymentMethods = [
  { id: "visa", label: "Visa", icon: "/visa.png" },
  { id: "jcb", label: "JCB", icon: "/jcb.png" },
  { id: "mastercard", label: "MasterCard", icon: "/mastercard.png" },
  { id: "paypal", label: "PayPal", icon: "/paypal.png" },
];

// 보험 옵션은 API에서 가져옴

const PaymentModal = ({
  car,
  dateRange,
  userInfo = {},
  onBack,
  onClose,
  price = 0,
  discount = -1.4,
  originPrice = 1000000,
  currency = "원",
}) => {
  const { user } = useAuth(); // 현재 로그인된 사용자 정보 가져오기
  const [selected, setSelected] = useState("visa");
  const [selectedInsurance, setSelectedInsurance] = useState(null);
  const [hide, setHide] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [insuranceOptions, setInsuranceOptions] = useState([]);
  const [insuranceLoading, setInsuranceLoading] = useState(true);
  const navigate = useNavigate();

  // 실제 차량 데이터만 사용, 기본값 제거
  const brand = car?.manufacturer || car?.brand || "차량정보없음";
  const model = car?.model_name || car?.model || "모델정보없음";

  // 차량 일일 가격 가져오기 (dailyPrice 또는 daily_price)
  const carDailyPrice = Number(car?.dailyPrice || car?.daily_price || price || 0);

  // 디버깅용 로그
  console.log('💰 PaymentModal - 차량 가격 정보:', {
    car: car,
    dailyPrice: car?.dailyPrice,
    daily_price: car?.daily_price,
    price: price,
    carDailyPrice: carDailyPrice
  });

  console.log('👤 PaymentModal - 사용자 정보:', {
    user: user,
    fullName: user?.fullName,
    phoneNumber: user?.phoneNumber,
    userInfo: userInfo
  });

  // 이미지 경로 생성
  let imageUrl;
  if (imageError) {
    imageUrl = "/default-profile.png";
  } else if (car?.model_name && car?.manufacturer) {
    imageUrl = getCarImagePath(car.model_name, car.manufacturer);
  } else if (car?.model && car?.brand) {
    imageUrl = getCarImagePath(car.model, car.brand);
  } else {
    imageUrl = "/default-profile.png";
  }

  useEffect(() => {
    document.body.classList.add("modal-open");

    // 보험 옵션 가져오기
    const fetchInsuranceOptions = async () => {
      try {
        setInsuranceLoading(true);
        const options = await getInsuranceOptions();
        setInsuranceOptions(options);
      } catch (error) {
        console.error('보험 옵션 로딩 실패:', error);
        // 에러 시 기본 옵션 사용
        setInsuranceOptions([
          { id: 1, label: "기본 보험", price: 3000 },
          { id: 2, label: "표준 보험", price: 6000 },
          { id: 3, label: "프리미엄 보험", price: 12000 },
          { id: 4, label: "슈퍼 보험", price: 20000 },
        ]);
      } finally {
        setInsuranceLoading(false);
      }
    };

    fetchInsuranceOptions();

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, []);

  // 보험 총액 계산
  const insuranceTotal = selectedInsurance
    ? insuranceOptions.find((opt) => opt.id === selectedInsurance)?.price || 0
    : 0;
  const totalPrice = carDailyPrice + insuranceTotal;

  const handleInsuranceChange = (id) => {
    setSelectedInsurance(id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 예약 API 호출
      const reservationData = {
        recommendation_id: car?.recommendation_id,
        insurance_option_id: selectedInsurance,
        rental_date: dateRange && dateRange[0] ? dateRange[0].toISOString().split('T')[0] : null,
        return_date: dateRange && dateRange[1] ? dateRange[1].toISOString().split('T')[0] : null,
        total_price: totalPrice,
        payment: paymentMethods.find((m) => m.id === selected)?.label
      };

      console.log('📝 예약 요청 데이터:', reservationData);

      const response = await api.post('/api/v1/reservations', reservationData);

      console.log('✅ 예약 성공:', response.data);

      // 성공 시 localStorage에도 저장 (기존 기능 유지)
      const reservation = {
        id: response.data.reservationId || Date.now(),
        carName: brand + " " + model,
        carImage: imageUrl,
        date: dateRange && dateRange[0] ? dateRange[0].toLocaleDateString() : "",
        time: dateRange && dateRange[0] ? dateRange[0].toLocaleTimeString() : "",
        price: totalPrice,
        paymentMethod: paymentMethods.find((m) => m.id === selected)?.label,
        insurances: selectedInsurance
          ? [insuranceOptions.find((opt) => opt.id === selectedInsurance)?.label].filter(Boolean)
          : [],
        userName: user?.fullName || "사용자",
        userPhone: user?.phoneNumber || "연락처 없음",
        status: "결제완료",
      };

      const prev = JSON.parse(localStorage.getItem("reservations") || "[]");
      localStorage.setItem("reservations", JSON.stringify([...prev, reservation]));
      window.dispatchEvent(new Event("storageChange"));

      setShowSuccess(true);
    } catch (error) {
      console.error('❌ 예약 실패:', error);
      alert('예약 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setHide(true);
    setTimeout(() => {
      onBack();
    }, 350);
  };

  const handleClose = () => setShowConfirm(true);
  const handleConfirm = () => {
    setShowConfirm(false);
    onClose();
  };
  const handleCancel = () => setShowConfirm(false);

  return (
    <div className={`pay-modal${hide ? " hide" : ""}`}>
      <div className="pay-modal-content">
        {/* 상단 타이틀/닫기 */}
        <div className="pay-modal-header-row">
          <div className="pay-modal-title-row">
            <FaCreditCard className="pay-modal-main-icon" />
            <h2 className="pay-modal-main-title">결제하기</h2>
          </div>
          <button className="pay-modal-close-btn" onClick={handleClose}>
            <MdClose size={24} />
          </button>
        </div>
        {/* 차량 정보 */}
        <div className="pay-modal-car-info">
          <div className="pay-modal-car-image">
            <img
              src={imageUrl}
              alt={`${brand} ${model}`}
              onError={() => setImageError(true)}
            />
          </div>
          <div className="pay-modal-car-details">
            <div className="pay-modal-car-model">
              {brand} {model}
            </div>
            <div className="pay-modal-car-meta">
              <span>연식: 2023년</span>
              <span>연료: {car?.fuelType || car?.fuel_type || "가솔린"}</span>
              <span>변속기: 자동</span>
              <span>일일 요금: {carDailyPrice.toLocaleString()}원</span>
            </div>
          </div>
        </div>
        {/* 결제수단 */}
        <div className="pay-modal-section">
          <div className="pay-modal-section-title">
            <FaCreditCard /> 결제 수단
          </div>
          <div className="pay-modal-methods">
            {paymentMethods.map((m) => (
              <label
                key={m.id}
                className={`pay-method-row ${
                  selected === m.id ? "selected" : ""
                }`}>
                <input
                  type="radio"
                  name="payment"
                  value={m.id}
                  checked={selected === m.id}
                  onChange={() => setSelected(m.id)}
                />
                <span className="pay-method-icon">
                  <img src={m.icon} alt={m.label} />
                </span>
                <span className="pay-method-label">{m.label}</span>
              </label>
            ))}
          </div>
        </div>
        {/* 보험 */}
        <div className="pay-modal-section">
          <div className="pay-modal-section-title">
            <FaRegMoneyBillAlt /> 보험 선택
          </div>
          <div className="pay-insurance-options">
            {insuranceLoading ? (
              <div className="pay-insurance-loading">보험 옵션 로딩 중...</div>
            ) : (
              insuranceOptions.map((opt) => (
                <label key={opt.id} className="pay-insurance-row">
                  <input
                    type="radio"
                    name="insurance" // 같은 name을 지정해야 그룹으로 동작[2][4][5]
                    checked={selectedInsurance === opt.id}
                    onChange={() => handleInsuranceChange(opt.id)}
                  />
                  <span className="pay-insurance-label">{opt.label}</span>
                  <span className="pay-insurance-price">
                    +{opt.price.toLocaleString()}원
                  </span>
                </label>
              ))
            )}
          </div>
        </div>
        {/* 안내문구 */}
        <div className="pay-modal-help">
          <MdInfoOutline style={{ marginRight: 4, verticalAlign: "middle" }} />
          결제가 어렵습니까 휴먼? 돈이 없는게 아니라? <a href="#">도움말.</a>
        </div>
        {/* 결제 요약 */}
        <div className="pay-modal-summary">
          <div className="pay-summary-left">
            <FaCheckCircle style={{ color: "#1e8fff", marginRight: 4 }} />
            <span className={`pay-method-icon small`}>
              <img
                src={paymentMethods.find((m) => m.id === selected).icon}
                alt={selected}
              />
            </span>
            <span className="pay-summary-method">
              {paymentMethods.find((m) => m.id === selected).label}
            </span>
          </div>
          <div className="pay-summary-right">
            {totalPrice.toLocaleString()} {currency}
          </div>
        </div>
        {/* 할인/원가/최종가 */}
        <div className="pay-modal-bottom">
          <span className="pay-discount">{Math.round(discount * 100)}%</span>
          <span className="pay-origin-price">
            {originPrice.toLocaleString()}
            {currency}
          </span>
          <span className="pay-final-price">
            {totalPrice.toLocaleString()} {currency}
          </span>
        </div>
        {/* 버튼 */}
        <div className="pay-modal-actions">
          <button type="button" className="pay-back-btn" onClick={handleBack}>
            <MdArrowBack style={{ marginRight: 4 }} /> 뒤로가기
          </button>
          <button
            type="submit"
            className="pay-submit-btn"
            onClick={handleSubmit}>
            <FaCreditCard style={{ marginRight: 4 }} /> 결제하기
          </button>
        </div>
      </div>
      {showConfirm && (
        <div className="pay-confirm-modal-backdrop">
          <div className="pay-confirm-modal">
            <p className="pay-confirm-warning">결제를 취소하시겠습니까?</p>
            <div className="pay-confirm-actions">
              <button onClick={handleConfirm}>예</button>
              <button onClick={handleCancel}>아니오</button>
            </div>
          </div>
        </div>
      )}
      {showSuccess && (
        <div className="pay-success-modal-backdrop">
          <div className="pay-success-modal">
            <div className="pay-success-title">
              예약이 성공적으로 완료되었습니다!
            </div>
            <div className="pay-success-message">
              차량 예약이 정상적으로 처리되었습니다.
              <br />
              차량 인수 및 이용 전, 예약 내역과 주의사항을 꼭 확인해 주세요.
            </div>
            <div className="pay-success-warning">
              ※ 예약 취소 시 위약금이 발생할 수 있습니다. 자세한 내용은 약관을
              확인하세요.
            </div>
            <div className="pay-success-actions">
              <button
                className="pay-success-btn"
                onClick={() => navigate("/reservation-history")}>
                예약기록으로 이동
              </button>
              <button
                className="pay-success-btn close"
                onClick={() => {
                  setShowSuccess(false);
                  if (onClose) onClose();
                }}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
      {loading && (
        <div className="pay-loading-backdrop">
          <div className="pay-loading-modal">
            <div className="pay-loading-spinner"></div>
            <div className="pay-loading-text">결제중..</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentModal;
