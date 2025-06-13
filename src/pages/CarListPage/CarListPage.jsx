import React, { useState } from "react";
import CarItemCard from "../../components/CarItemCard/CarItemCard";
import Header from "../../components/Header/Header.jsx";
import SignUp from "../../pages/SignUp/SignUp.jsx";
import "./CarListPage.css";

const CarListPage = () => {
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  // 테스트용 데이터
  const testCars = [
    {
      car_id: 1,
      agency_id: 101,
      model_name: "엘란트라",
      manufacturer: "현대",
      category: "세단",
      capacity: 8,
      luggage_size: "470L",
      fuel_type: "가솔린",
      fuel_efficiency: "40.2",
      daily_price: 185000,
      image_url: "./현대엘란트라세단(측면).png",
      additional_options: ["후방센서", "블루투스", "자동주차"],
      discountRate: 20,
      comment: "1일 이상 운행하면 20% 페이백 !",
    },
    {
      car_id: 2,
      agency_id: 102,
      model_name: "코롤라",
      manufacturer: "도요타",
      category: "세단",
      capacity: 2,
      luggage_size: "430L",
      fuel_type: "하이브리드",
      fuel_efficiency: "9.3",
      daily_price: 222000,
      image_url: "./도요타COROLLA(측면).png",
      additional_options: ["후방카메라", "스마트키", "블루투스"],
      discountRate: 15,
      comment: " ⚠️ 사고 차량입니다 주의 요망 ",
    },
    {
      car_id: 3,
      agency_id: 103,
      model_name: "C클래스",
      manufacturer: "벤츠",
      category: "세단",
      capacity: 5,
      luggage_size: "455L",
      fuel_type: "디젤",
      fuel_efficiency: "1.2",
      daily_price: 528000,
      image_url: "./벤츠메르세데스C(측면).png",
      additional_options: ["파노라마루프", "헤드업디스플레이", "자율주행"],
      discountRate: -140,
      comment: "많은 사용자들이 이용한 차량입니다!",
    },
  ];

  return (
    <>
      <Header onSignUpClick={() => setIsSignUpOpen(true)} />
      <div className="car-list-container">
        <div className="car-list">
          {testCars.map((car) => (
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
