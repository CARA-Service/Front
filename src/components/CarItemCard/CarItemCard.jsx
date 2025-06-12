import React from 'react';
import './CarItemCard.css';

const CarItemCard = ({ car }) => {
  const {
    brand,
    model,
    price,
    imageUrl,
    mileage,
    fuelType,
    transmission,
    location
  } = car;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatMileage = (mileage) => {
    return new Intl.NumberFormat('ko-KR').format(mileage);
  };

  // 주행거리별 비용 계산 (예시: 1km당 100원)
  const calculateCostPerKm = (price, mileage) => {
    const costPerKm = Math.round(price / mileage);
    const minCost = Math.round(costPerKm * 0.85); // 최소 비용 (85%)
    const maxCost = Math.round(costPerKm * 1.15); // 최대 비용 (115%)
    return {
      min: minCost.toLocaleString(),
      max: maxCost.toLocaleString()
    };
  };

  const costRange = calculateCostPerKm(price, mileage);

  return (
    <div className="car-item-card">
      <div className="car-header">
        <h3 className="car-title">{brand} {model}</h3>
        <span className="cost-per-km">
          <span className="cost-icon">💲</span>
          {costRange.min} ~ {costRange.max} 원 / km
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
        <div className="car-details">
          <span>주행거리: {formatMileage(mileage)}km</span>
          <span>연료: {fuelType}</span>
          <span>변속기: {transmission}</span>
        </div>
        <p className="car-location">{location}</p>
        <p className="car-price">{formatPrice(price)}</p>
      </div>
    </div>
  );
};

export default CarItemCard; 