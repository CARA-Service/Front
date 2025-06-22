// 차량 추천 API 호출 함수
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const getRecommendations = async (userInput) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/llm/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userInput: userInput
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('추천 API 호출 실패:', error);
    throw error;
  }
};

// 응답 데이터를 프론트엔드 형식으로 변환하는 함수
export const transformRecommendationData = (apiResponse) => {
  // GPT 메시지 추출 (첫 번째 아이템에서)
  const gptMessage = apiResponse.length > 0 ? apiResponse[0].gptMessage || '' : '';

  // 차량 데이터만 필터링하고 변환
  const cars = apiResponse
    .filter(item => item.car) // car 객체가 있는 항목만
    .map(item => ({
      car_id: item.car.carId,
      manufacturer: item.car.manufacturer,
      model_name: item.car.modelName,
      daily_price: item.car.dailyPrice,
      discountRate: 0, // API에서 할인율 정보가 없으면 기본값
      image_url: '', // 이미지 없이 처리
      comment: `${item.car.manufacturer} ${item.car.modelName}`, // 간단한 차량 설명
      additional_options: item.car.additionalOptions ? item.car.additionalOptions.split(',') : [],
      category: item.car.category,
      capacity: item.car.capacity,
      luggage_size: item.car.luggageSize,
      fuel_type: item.car.fuelType,
      fuel_efficiency: item.car.fuelEfficiency,
      agency_name: item.agencyName
    }));

  return {
    cars,
    gptMessage
  };
};
