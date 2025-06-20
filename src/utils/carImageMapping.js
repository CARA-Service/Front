/**
 * 차량 이미지 매핑 유틸리티
 * public/cars 폴더의 이미지 파일명과 차량 모델을 매핑합니다.
 */

// 차량 이미지 파일명 매핑 테이블
const CAR_IMAGE_MAP = {
  // 현대 차량
  'Avante': 'Avante_Hyundai.png',
  'Sonata': 'Sonata_Hyundai.png',
  'Tucson': 'Tucson_Hyundai.png',
  'Grandeur' : 'Grandeur_Hyundai.png',
  
  // 기아 차량
  'Carnival': 'Carnival_Kia.png',
  'G70': 'G70_Kia.png',
  'K3': 'K3_Kia.png',
  'K5': 'K5_Kia.png',
  'Sportage': 'Sportage_Kia.png',
  
  // 제네시스 차량
  'G80': 'G80_Genesis.png',
  
  // 르노 차량
  'QM6': 'QM6_Renault.png',
  'SM6': 'SM6_Renault.png',
  
  // 쉐보레 차량
  'Spark': 'Spark_Chevrolet.png',
  'Trax': 'Trax_Chevrolet.png'
};

/**
 * 차량 모델명과 제조사를 기반으로 이미지 경로를 생성합니다.
 * @param {string} modelName - 차량 모델명 (예: 'Avante', 'K5')
 * @param {string} manufacturer - 제조사명 (예: 'Hyundai', 'Kia')
 * @returns {string} 이미지 경로 (예: '/cars/Avante_Hyundai.png')
 */
export const getCarImagePath = (modelName, manufacturer) => {
  // 매핑 테이블에서 이미지 파일명 찾기
  const imageName = CAR_IMAGE_MAP[modelName] || `${modelName} ${manufacturer}.png`;
  return `/cars/${imageName}`;
};

/**
 * 차량 이미지가 존재하는지 확인합니다.
 * @param {string} modelName - 차량 모델명
 * @returns {boolean} 이미지 존재 여부
 */
export const hasCarImage = (modelName) => {
  return CAR_IMAGE_MAP.hasOwnProperty(modelName);
};

/**
 * 지원되는 모든 차량 모델 목록을 반환합니다.
 * @returns {string[]} 차량 모델명 배열
 */
export const getSupportedCarModels = () => {
  return Object.keys(CAR_IMAGE_MAP);
};

/**
 * 새로운 차량 이미지 매핑을 추가합니다.
 * @param {string} modelName - 차량 모델명
 * @param {string} imageName - 이미지 파일명
 */
export const addCarImageMapping = (modelName, imageName) => {
  CAR_IMAGE_MAP[modelName] = imageName;
};

/**
 * 제조사별 차량 목록을 반환합니다.
 * @returns {Object} 제조사별 차량 모델 그룹
 */
export const getCarsByManufacturer = () => {
  const result = {};
  
  Object.entries(CAR_IMAGE_MAP).forEach(([model, fileName]) => {
    // 파일명에서 제조사 추출 (예: 'Avante_Hyundai.png' → 'Hyundai')
    const manufacturer = fileName.split(' ')[1]?.replace('.png', '') || 'Unknown';
    
    if (!result[manufacturer]) {
      result[manufacturer] = [];
    }
    result[manufacturer].push(model);
  });
  
  return result;
};

export default {
  getCarImagePath,
  hasCarImage,
  getSupportedCarModels,
  addCarImageMapping,
  getCarsByManufacturer
};
