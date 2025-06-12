import React from 'react';
import './CarItemCard.css';

const CarItemCard = ({ car }) => {
  const {
    brand,
    model,
    originalPrice,
    discountRate,
    imageUrl,
    comment,
    features
  } = car;

  const calculateCostPerKm = (price) => {
    const baseCost = price / 10000; // 기본 주행거리 10,000km로 고정
    const minCost = Math.floor(baseCost * 0.85);
    const maxCost = Math.ceil(baseCost * 1.15);
    return `${minCost} ~ ${maxCost}`;
  };

  const calculateDiscountedPrice = (originalPrice, discountRate) => {
    return Math.floor(originalPrice * (1 - discountRate / 100));
  };

  const handleReservation = () => {
    // 예약 처리 로직
    console.log('예약하기 클릭:', brand, model);
  };

  const costRange = calculateCostPerKm(originalPrice);

  return (
    <div className="car-item-card">
      <div className="car-header">
        <h3 className="car-title">{brand} {model}</h3>
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
            console.error('이미지 로드 실패:', imageUrl);
            e.target.src = './default-profile.png';
          }}
        />
      </div>
      <div className="car-info">
        <p className="car-comment">{comment}</p>
        <div className="car-features">
          {features.map((feature, index) => (
            <span key={index} className="feature-tag">{feature}</span>
          ))}
        </div>
        <div className="price-section">
          <div className="price-container">
            <div className="price-header">
              <span className="discount-rate">{discountRate}% 할인</span>
              <span className="original-price">{originalPrice.toLocaleString()} 원</span>
            </div>
            <div className="discounted-price">
              {calculateDiscountedPrice(originalPrice, discountRate).toLocaleString()} 원
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