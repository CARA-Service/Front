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
      brand: '현대',
      model: '엘란트라',
      originalPrice: 185000,
      discountRate: 20,
      imageUrl: './현대엘란트라세단(측면).png',
      comment: '1일 이상 운행하면 20% 페이백 !',
      features: ['5인승', '후방센서', '블루투스', '자동주차']
    },
    {
      id: 2,
      brand: '도요타',
      model: '코롤라',
      originalPrice: 222000,
      discountRate: 15,
      imageUrl: './도요타COROLLA(측면).png',
      comment: ' ⚠️ 사고 차량입니다 주의 요망 ',
      features: ['5인승', '후방카메라', '스마트키', '블루투스']
    },
    {
      id: 3,
      brand: '벤츠',
      model: 'C클래스',
      originalPrice: 52800000,
      discountRate: -140,
      imageUrl: './벤츠메르세데스C(측면).png',
      comment: '많은 사용자들이 이용한 차량입니다!',
      features: ['5인승', '파노라마루프', '헤드업디스플레이', '자율주행']
    }
  ];

  return (
    <>
      <Header onSignUpClick={() => setIsSignUpOpen(true)} />
      <div className="car-list-container">
        <div className="car-list">
          {testCars.map(car => (
            <CarItemCard key={car.id} car={car} />
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