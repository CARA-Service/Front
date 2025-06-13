import React, { useState, useRef, useEffect } from "react";
import ReservationModal from "../ReservationModal&PayMentModal/ReservationModal.jsx";
import PaymentModal from "../ReservationModal&PayMentModal/PayMentModal.jsx";
import "./CarItemCard.css";

const CarItemCard = ({ car, dateRange }) => {
  const {
    manufacturer,
    model_name,
    daily_price,
    discountRate,
    image_url,
    comment,
    additional_options,
    category,
    capacity,
    luggage_size,
    fuel_type,
    fuel_efficiency
  } = car;

  const [isExpanded, setIsExpanded] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [transition, setTransition] = useState("reservation");

  const cardRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const calculateCostPerKm = (price) => {
    const baseCost = price / 1000;
    const minCost = Math.floor(baseCost * 0.85);
    const maxCost = Math.ceil(baseCost * 1.15);
    return `${minCost} ~ ${maxCost}`;
  };

  const calculateDiscountedPrice = (originalPrice, discountRate) => {
    return Math.floor(originalPrice * (1 - discountRate / 100));
  };

  const handleReservation = (e) => {
    e.stopPropagation();
    setShowReservationModal(true);
  };

  const handleCloseReservation = () => {
    setShowReservationModal(false);
  };

  const handlePayment = () => {
    setShowReservationModal(false);
    setShowPaymentModal(true);
    setTransition("payment");
  };

  const handleBackToReservation = () => {
    setShowPaymentModal(false);
    setShowReservationModal(true);
    setTransition("reservation");
  };

  const handleClosePayment = () => {
    setShowPaymentModal(false);
  };

  const handleCardClick = () => {
    setIsExpanded(true);
  };

  // 연비에 따른 클래스 반환 함수
  const getFuelEfficiencyClass = (efficiency) => {
    if (efficiency >= 20) return 'excellent';
    if (efficiency >= 5) return 'normal';
    return 'poor';
  };

  // 연비 등급 설명 반환 함수
  const getEfficiencyDescription = (efficiency) => {
    if (efficiency >= 20) return '최고 등급 (20 km/L 이상)\n\n• 매우 경제적인 연비\n• 장거리 주행에 적합\n• 연료비 절감 효과 최대';
    if (efficiency >= 5) return '보통 등급 (5-19.9 km/L)\n\n• 평균적인 연비\n• 일반적인 주행에 적합\n• 일반적인 연료비';
    return '낮은 등급 (5 km/L 미만)\n\n• 높은 연료 소비\n• 단거리 주행 권장\n• 연료비 고려 필요';
  };

  
  const costRange = calculateCostPerKm(daily_price); // ✅ JSX보다 위에서 미리 선언
  // const features = typeof additional_options === 'string'
  // ? additional_options.split(',').map(opt => opt.trim())
  // : [];
  //   const originalPrice = daily_price;



  return (
    <div>
      <div
        ref={cardRef}
        className={`car-item-card ${isExpanded ? "expanded" : ""}`}
        onClick={handleCardClick}>
        <div className="car-header">
          <h3 className="car-title">
            {manufacturer} {model_name}
          </h3>
          <span className="cost-per-km">
            <span className="cost-icon">$</span>
            {costRange} 원 / km
          </span>
        </div>
        <div className="car-image">
          <img
            src={image_url}
            alt={`${manufacturer} ${model_name}`}
            onError={(e) => {
              console.error("이미지 로드 실패:", image_url);
              e.target.src = "./default-profile.png";
            }}
          />
          <div className="zoom-icon">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
        <div className="car-info">
          <p className="car-comment">{comment}</p>
          <div className="car-features">
            {features.map((feature, index) => (
              <span key={index} className="feature-tag">
                {feature}
              </span>
            ))}
          </div>
          <div className={`additional-info ${isExpanded ? "show" : ""}`}>
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
          <div className="price-section">
            <div className="price-container">
              <div className="price-header">
                <span className="discount-rate">{discountRate}% 할인</span>
                <span className="original-price">
                  {originalPrice.toLocaleString()} 원
                </span>
              </div>
              <div className="discounted-price">
                {calculateDiscountedPrice(
                  originalPrice,
                  discountRate
                ).toLocaleString()}{" "}
                원
              </div>
            </div>
            <button className="reservation-button" onClick={handleReservation}>
              예약하기
            </button>
          </div>
        </div>
      </div>
      {showReservationModal && (
        <ReservationModal
          car={car}
          dateRange={dateRange}
          onClose={handleCloseReservation}
          onPayment={handlePayment}
        />
      )}
      {showPaymentModal && (
        <PaymentModal
          car={car}
          dateRange={dateRange}
          onBack={handleBackToReservation}
          onClose={handleClosePayment}
        />
      )}
    </div>
  );
};

export default CarItemCard;
