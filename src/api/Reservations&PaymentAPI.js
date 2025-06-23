import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080", // 백엔드 주소로 변경
});

// JWT 토큰을 헤더에 담는 인터셉터
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getUserProfile = async () => {
  try {
    const response = await API.get("/api/v1/users/me");
    console.log("프로필 조회 성공:", response.data); // 성공 콘솔
    return response.data;
  } catch (error) {
    console.error("프로필 조회 실패:", error); // 실패 콘솔
    return null;
  }
};
