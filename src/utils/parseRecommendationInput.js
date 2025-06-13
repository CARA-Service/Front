export function parseRecommendationInput(input) {
  const rentalKeywords = [
    "렌터카",
    "렌트카",
    "렌트",
    "차량",
    "예약",
    "대여",
    "연비",
    "픽업",
    "반납",
    "여행",
    "운전",
    "승차",
    "수하물",
    "차",
    "갈거야",
    "놀러",
    "가고 싶어",
    "놀러가",
    "이동",
    "드라이브",
  ];

  const isRelevant = rentalKeywords.some((kw) => input.includes(kw));
  if (!isRelevant) return null;

  const today = new Date();
  const rentalDate = today.toISOString().slice(0, 10);
  const returnDate = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  // 사용자 입력에 명확하게 언급된 항목만 추정
  const pickupLocation = /제주/.test(input)
    ? "제주도"
    : /부산/.test(input)
      ? "부산"
      : /강릉/.test(input)
        ? "강릉"
        : null;

  const passengerMatch = input.match(/(\d+)\s*명/);
  const passengerCount = passengerMatch ? parseInt(passengerMatch[1]) : null;

  const fuelEfficiencyPreference = /연비|효율|가성비|경제적/.test(input)
    ? 1
    : null;

  let luggageSize = null;
  if (/많은 짐|대형 캐리어|트렁크 큰/.test(input)) luggageSize = "대형";
  else if (/가방 하나|작은 짐/.test(input)) luggageSize = "소형";

  let purpose = null;
  if (/출장|비즈니스/.test(input)) purpose = "출장";
  else if (/데이트/.test(input)) purpose = "데이트";
  else if (/여행/.test(input)) purpose = "여행";

  const budgetMatch = input.match(/(\d{2,5})\s*(만원|원)/);
  const budget =
    budgetMatch && budgetMatch.length >= 3
      ? parseInt(budgetMatch[1]) * (budgetMatch[2] === "만원" ? 10000 : 1)
      : null;

  return {
    userId: 1,
    pickupLocation,
    rentalDate,
    returnDate,
    passengerCount,
    luggageSize,
    purpose,
    fuelEfficiencyPreference,
    budget,
    additionalOptions: input,
  };
}
