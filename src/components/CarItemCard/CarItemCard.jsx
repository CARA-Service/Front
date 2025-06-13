import React, { useState, useEffect, useRef } from "react";
import "./CarItemCard.css";

const CarItemCard = ({ car }) => {
  const {
    brand,
    model,
    originalPrice,
    discountRate,
    imageUrl,
    comment,
    features,
  } = car;
  const [isExpanded, setIsExpanded] = useState(false);
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
    const baseCost = price / 1000; // 기본 주행거리 1,000km로 고정
    const minCost = Math.floor(baseCost * 0.85);
    const maxCost = Math.ceil(baseCost * 1.15);
    return `${minCost} ~ ${maxCost}`;
  };

  const calculateDiscountedPrice = (originalPrice, discountRate) => {
    return Math.floor(originalPrice * (1 - discountRate / 100));
  };

  const handleReservation = (e) => {
    e.stopPropagation();
    console.log("예약하기 클릭:", brand, model);
  };

  const handleCardClick = () => {
    setIsExpanded(true);
  };

  const costRange = calculateCostPerKm(originalPrice);

  return (
    <div
      ref={cardRef}
      className={`car-item-card ${isExpanded ? "expanded" : ""}`}
      onClick={handleCardClick}>
      <div className="car-header">
        <h3 className="car-title">
          {brand} {model}
        </h3>
        <span className="cost-per-km">
          <span className="cost-icon">$</span>
          {costRange} 원 / km
        </span>
      </div>
      <div className="car-image">
        <img
          src={imageUrl}
          alt={`${brand} ${model}`}
          onError={(e) => {
            console.error("이미지 로드 실패:", imageUrl);
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
  );
};

export default CarItemCard;
