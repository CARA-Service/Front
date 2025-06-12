import React from 'react';
import CarItemCard from '../../components/CarItemCard/CarItemCard';
import './CarListPage.css';

const CarListPage = () => {
  // 테스트용 데이터
  const testCars = [
    {
      id: 1,
      brand: '현대',
      model: '엘란트라',
      year: 2023,
      price: 23500000,
      imageUrl: './현대엘란트라세단(측면).png',
      mileage: 12000,
      fuelType: '가솔린',
      transmission: '자동',
      location: '서울시 강남구'
    },
    {
      id: 2,
      brand: '도요타',
      model: '코롤라',
      year: 2022,
      price: 22800000,
      imageUrl: './도요타COROLLA(측면).png',
      mileage: 18000,
      fuelType: '가솔린',
      transmission: '자동',
      location: '서울시 서초구'
    },
    {
      id: 3,
      brand: '벤츠',
      model: 'C클래스',
      year: 2023,
      price: 52800000,
      imageUrl: './벤츠메르세데스C(측면).png',
      mileage: 8000,
      fuelType: '가솔린',
      transmission: '자동',
      location: '서울시 송파구'
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