/**
 * 채팅 제목 생성 유틸리티 함수들
 */

/**
 * 사용자 입력을 기반으로 채팅 제목을 생성합니다.
 * @param {string} userInput - 사용자 입력 텍스트
 * @param {number} maxLength - 최대 길이 (기본값: 25)
 * @returns {string} 생성된 채팅 제목
 */
export const generateChatTitle = (userInput, maxLength = 25) => {
  if (!userInput || typeof userInput !== 'string') {
    return '새 채팅';
  }

  // 텍스트 정리 (불필요한 공백 제거)
  const cleanText = userInput.trim().replace(/\s+/g, ' ');
  
  // 키워드 기반 요약
  const summary = summarizeByKeywords(cleanText);
  
  // 길이 제한
  if (summary.length <= maxLength) {
    return summary;
  }
  
  return summary.substring(0, maxLength - 3) + '...';
};

/**
 * 키워드를 기반으로 텍스트를 요약합니다.
 * @param {string} text - 요약할 텍스트
 * @returns {string} 요약된 텍스트
 */
const summarizeByKeywords = (text) => {
  const lowerText = text.toLowerCase();
  
  // 렌터카 관련 키워드 패턴
  const patterns = [
    // 지역 + 렌터카
    { regex: /(제주|서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주도|서울시|부산시).*?(렌터카|렌트카|차량|대여)/i, 
      format: (match) => `${match[1]} 렌터카` },
    
    // 날짜 + 렌터카
    { regex: /(\d+월|\d+일|내일|모레|다음주|이번주|주말).*?(렌터카|렌트카|차량|대여)/i,
      format: (match) => `${match[1]} 렌터카` },
    
    // 차종 + 관련
    { regex: /(소형차|중형차|대형차|suv|세단|승합차|경차|컨버터블).*?(추천|대여|렌트)/i,
      format: (match) => `${match[1]} 추천` },
    
    // 여행 + 지역
    { regex: /(여행|관광|휴가).*?(제주|서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남)/i,
      format: (match) => `${match[2]} ${match[1]}` },
    
    // 일반 렌터카 문의
    { regex: /(렌터카|렌트카|차량|대여).*?(추천|문의|예약|필요)/i,
      format: () => '렌터카 문의' },
  ];
  
  // 패턴 매칭 시도
  for (const pattern of patterns) {
    const match = text.match(pattern.regex);
    if (match) {
      return pattern.format(match);
    }
  }
  
  // 패턴이 매칭되지 않으면 첫 번째 문장 또는 주요 단어 추출
  return extractMainContent(text);
};

/**
 * 텍스트에서 주요 내용을 추출합니다.
 * @param {string} text - 원본 텍스트
 * @returns {string} 추출된 주요 내용
 */
const extractMainContent = (text) => {
  // 첫 번째 문장 추출 (마침표, 물음표, 느낌표로 끝나는)
  const firstSentence = text.match(/^[^.!?]*[.!?]/);
  if (firstSentence) {
    return firstSentence[0].trim();
  }
  
  // 문장이 없으면 첫 15자 정도 반환
  return text.length > 15 ? text.substring(0, 15) : text;
};

/**
 * 채팅 객체에서 제목을 생성합니다.
 * @param {Object} chat - 채팅 객체 (id, messages 포함)
 * @returns {string|null} 생성된 채팅 제목 또는 null (로딩 상태)
 */
export const getChatTitle = (chat) => {
  if (!chat || !chat.messages || chat.messages.length === 0) {
    return null; // 로딩 상태를 나타내기 위해 null 반환
  }

  // 첫 번째 사용자 메시지 찾기
  const firstUserMessage = chat.messages.find(msg => msg.mine);

  if (!firstUserMessage || !firstUserMessage.text) {
    return null; // 로딩 상태를 나타내기 위해 null 반환
  }

  return generateChatTitle(firstUserMessage.text);
};
