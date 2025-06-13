import React, { useState } from "react";
import CarItemCard from '../../components/CarItemCard/CarItemCard';
import Header from '../../components/Header/Header.jsx';
import SignUp from '../../pages/SignUp/SignUp.jsx';
import './CarListPage.css';

const CarListPage = () => {
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  // 테스트용 데이터
  const testCars = [
  {
    id: 1,
    manufacturer: '현대', // 제조사
    model_name: '엘란트라',  // 모델명
    daily_price: 185000,  // 일일 대여료
    discountRate: 20,  // 할인율
    image_url: './현대엘란트라세단(측면).png',  // 이미지 주소
    comment: '1일 이상 운행하면 20% 페이백 !',  // 특이 사항
    additional_options: ['5인승', '후방센서', '블루투스', '자동주차'],  // 추가 옵션
    category: '준중형',  // 차량 분류
    capacity: 5,  // 탑승 가능 인원 수
    luggage_size: '중형',  // 적재 공간 크기
    fuel_type: '가솔린',  // 연료 종류
    fuel_efficiency: 23.5  // 연비
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
    capacity: '4 ~ 5',
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
    capacity: 1,
    luggage_size: '대형',
    fuel_type: '디젤',
    fuel_efficiency: 1.1
  }
];


  return (
    <>
      <Header onSignUpClick={() => setIsSignUpOpen(true)} />
      <div className="car-list-container">
        <div className="car-list">
          {testCars.map(car => (
            <CarItemCard key={car.car_id} car={car} />
          ))}
        </div>
      </div>
      {isSignUpOpen && (
        <SignUp isOpen={isSignUpOpen} onClose={() => setIsSignUpOpen(false)} />
      )}
    </>
  );
};

export default CarListPage; 