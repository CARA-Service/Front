import React from 'react';
import CarItemCard from '../../components/CarItemCard/CarItemCard';
import './CarListPage.css';

const CarListPage = () => {
  // 테스트용 데이터
  const testCars = [
  {
    id: 1,
    manufacturer: '현대',
    model_name: '엘란트라',
    daily_price: 185000,
    discountRate: 20,
    image_url: './현대엘란트라세단(측면).png',
    comment: '1일 이상 운행하면 20% 페이백 !',
    additional_options: ['5인승', '후방센서', '블루투스', '자동주차'],
    category: '준중형',
    capacity: 5,
    luggage_size: '중형',
    fuel_type: '가솔린',
    fuel_efficiency: 13.5
  },
  {
    id: 2,
    manufacturer: '도요타',
    model_name: '코롤라',
    daily_price: 222000,
    discountRate: 15,
    image_url: './도요타COROLLA(측면).png',
    comment: ' ⚠️ 사고 차량입니다 주의 요망 ',
    additional_options: ['5인승', '후방카메라', '스마트키', '블루투스'],
    category: '중형',
    capacity: 5,
    luggage_size: '중형',
    fuel_type: '하이브리드',
    fuel_efficiency: 17.2
  },
  {
    id: 3,
    manufacturer: '벤츠',
    model_name: 'C클래스',
    daily_price: 52800000,
    discountRate: -140,
    image_url: './벤츠메르세데스C(측면).png',
    comment: '많은 사용자들이 이용한 차량입니다!',
    additional_options: ['5인승', '파노라마루프', '헤드업디스플레이', '자율주행'],
    category: '대형',
    capacity: 5,
    luggage_size: '대형',
    fuel_type: '디젤',
    fuel_efficiency: 10.1
  }
];


  return (
    <div className="car-list-page">
      <div className="car-list">
        {testCars.map(car => (
          <CarItemCard key={car.id} car={car} />
        ))}
      </div>
    </div>
  );
};

export default CarListPage; 