import React, { useState, useEffect, useRef } from 'react';
import './CarItemCard.css';

const CarItemCard = ({ car }) => {
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
  const cardRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const calculateDiscountedPrice = (price, discountRate) => {
    return Math.floor(price * (1 - discountRate / 100));
  };

  const handleReservation = (e) => {
    e.stopPropagation();
    // 예약 처리 로직
    console.log('예약하기 클릭:', manufacturer, model_name);
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

  return (
    <div 
      ref={cardRef}
      className={`car-item-card ${isExpanded ? 'expanded' : ''}`}
      onClick={handleCardClick}
    >
      <div className="car-header">
        <h3 className="car-title">{manufacturer} {model_name}</h3>
        <span 
          className={`fuel-efficiency ${getFuelEfficiencyClass(fuel_efficiency)}`}
          data-tooltip={`연비 ${fuel_efficiency} km/L\n\n연비 등급:\n${getEfficiencyDescription(fuel_efficiency)}`}
        >
          {fuel_efficiency} km/L
        </span>
      </div>
      <div className="car-image">
        <img 
          src={image_url} 
          alt={`${manufacturer} ${model_name}`} 
          onError={(e) => {
            console.error('이미지 로드 실패:', image_url);
            e.target.src = './default-profile.png';
          }}
        />
        <div className="zoom-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="currentColor"/>
          </svg>
        </div>
      </div>
      <div className="car-info">
        <p className="car-comment">{comment}</p>
        <div className="car-features">
          {additional_options.map((option, index) => (
            <span key={index} className="feature-tag">{option}</span>
          ))}
        </div>
        <div className={`additional-info ${isExpanded ? 'show' : ''}`}>
          <div className="car-info-item">
            <span className="info-label">차종</span>
            <span className="info-value">{category}</span>
          </div>
          <div className="car-info-item">
            <span className="info-label">탑승인원</span>
            <span className="info-value">{capacity}인승</span>
          </div>
          <div className="car-info-item">
            <span className="info-label">수하물</span>
            <span className="info-value">{luggage_size}</span>
          </div>
          <div className="car-info-item">
            <span className="info-label">연료</span>
            <span className="info-value">{fuel_type}</span>
          </div>
        </div>
        <div className="price-section">
          <div className="price-container">
            <div className="price-header">
              <span className="discount-rate">{discountRate}% 할인</span>
              <span className="original-price">{daily_price.toLocaleString()} 원</span>
            </div>
            <div className="discounted-price">
              {calculateDiscountedPrice(daily_price, discountRate).toLocaleString()} 원
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