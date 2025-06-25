// 지점 조회 API 호출 함수
import api from './api.js';

// 모든 지점 조회
export const getAllAgencies = async () => {
  try {
    const response = await api.get('/api/v1/agencies');
    return response.data;
  } catch (error) {
    console.error('지점 조회 API 호출 실패:', error);
    throw error;
  }
};

// 지역별 지점 조회 (폴백 로직 포함)
export const getAgenciesByLocation = async (location) => {
  try {
    console.log(`🔍 지점 조회 시작: ${location}`);

    const response = await api.get(`/api/v1/agencies/by-location?location=${encodeURIComponent(location)}`);
    const data = response.data;

    console.log(`📍 ${location} 지점 조회 결과: ${data.length}개`);

    // 지점이 없으면 폴백 로직 실행
    if (data.length === 0) {
      console.log(`⚠️ ${location} 지점이 없음, 폴백 로직 실행`);
      return await getAgenciesWithFallback(location);
    }

    return data;
  } catch (error) {
    console.error('지역별 지점 조회 API 호출 실패:', error);
    throw error;
  }
};

// 폴백 로직: 지점이 없을 때 대안 지역 조회
const getAgenciesWithFallback = async (originalLocation) => {
  const fallbackMap = {
    // 서울 구 단위 → 서울 전체
    '강남': '서울', '강북': '서울', '강서': '서울', '강동': '서울',
    '관악': '서울', '광진': '서울', '구로': '서울', '금천': '서울',
    '노원': '서울', '도봉': '서울', '동대문': '서울', '동작': '서울',
    '마포': '서울', '서대문': '서울', '서초': '서울', '성동': '서울',
    '성북': '서울', '송파': '서울', '양천': '서울', '영등포': '서울',
    '용산': '서울', '은평': '서울', '종로': '서울', '중구': '서울', '중랑': '서울',

    // 경기도 시 단위 → 경기 전체
    '수원': '경기', '성남': '경기', '고양': '경기', '용인': '경기',
    '부천': '경기', '안산': '경기', '안양': '경기', '남양주': '경기',

    // 기타 지역
    '제주도': '제주'
  };

  const fallbackLocation = fallbackMap[originalLocation] || originalLocation;

  if (fallbackLocation !== originalLocation) {
    console.log(`🔄 폴백: ${originalLocation} → ${fallbackLocation}`);

    try {
      const response = await api.get(`/api/v1/agencies/by-location?location=${encodeURIComponent(fallbackLocation)}`);
      const data = response.data;
      console.log(`✅ 폴백 성공: ${fallbackLocation}에서 ${data.length}개 지점 발견`);
      return data;
    } catch (error) {
      console.error(`폴백 실패: ${fallbackLocation}`, error);
    }
  }

  // 최종 폴백: 서울 지점 조회
  console.log(`🏃 최종 폴백: 서울 지점 조회`);
  try {
    const response = await api.get('/api/v1/agencies/by-location?location=서울');
    const data = response.data;
    console.log(`✅ 최종 폴백 성공: 서울에서 ${data.length}개 지점 발견`);
    return data;
  } catch (error) {
    console.error('최종 폴백 실패:', error);
  }

  return []; // 모든 폴백 실패 시 빈 배열 반환
};

// 지점 데이터를 프론트엔드 형식으로 변환
export const transformAgencyData = (agencies) => {
  return agencies.map(agency => ({
    name: agency.agencyName,
    address: agency.location || agency.agencyName, // location이 null이면 agencyName 사용
    latitude: agency.latitude,
    longitude: agency.longitude,
    operatingHours: agency.operatingHours
  }));
};
