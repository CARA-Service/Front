import api from "./api.js";

// 보험 옵션 조회 API
export const getInsuranceOptions = async () => {
  try {
    const response = await api.get('/api/v1/insurance-options');
    return response.data.map(option => ({
      id: option.insuranceOptionId,
      label: option.insuranceType,
      price: Number(option.insuranceFee)
    }));
  } catch (error) {
    console.error('보험 옵션 조회 실패:', error);
    throw error;
  }
};
