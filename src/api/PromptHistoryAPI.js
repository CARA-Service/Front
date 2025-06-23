import api from "./api";

export const savePromptHistory = async (
  rentalRequestId,
  userInput,
  botResponse
) => {
  try {
    await api.post(`/api/v1/rental-requests/${rentalRequestId}/history`, {
      userInput,
      botResponse,
    });
    console.log("채팅 히스토리 저장 성공");
  } catch (error) {
    console.error("채팅 히스토리 저장 실패:", error);
  }
};

export const fetchChatHistory = async (rentalRequestId) => {
  try {
    const response = await api.get(
      `/api/v1/rental-requests/${rentalRequestId}/history`
    );
    return response.data; // [{ userInput, botResponse, timestamp }, ...]
  } catch (error) {
    console.error("채팅 히스토리 불러오기 실패:", error);
    return [];
  }
};
