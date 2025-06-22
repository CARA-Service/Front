import React, { useState, useEffect, useRef } from "react";
import PromptHeader from "../../components/PromptHeader/PromptHeader.jsx";
import DatePicker, { registerLocale } from "react-datepicker";
import ko from "date-fns/locale/ko";
import "react-datepicker/dist/react-datepicker.css";
import CarItemCard from "../../components/CarItemCard/CarItemCard.jsx";
import "../../components/CarItemCard/CarItemCard.css";
import Header from "../../components/Header/Header.jsx";
import "./PromptPage.css";
import use400px from "../../hooks/use400px.jsx";
import SignUp from "../SignUp/SignUp.jsx";
import { HiArrowUp } from "react-icons/hi";
import { AiOutlinePlus } from "react-icons/ai";
import { getRecommendations, transformRecommendationData } from "../../api/recommendationAPI.js";
import { getAgenciesByLocation, getAllAgencies, transformAgencyData } from "../../api/agencyAPI.js";


registerLocale("ko", ko);

const RENTAL_CAR_LOCATIONS = [
  { name: "제주공항 렌트카", address: "제주특별자치도 제주시 공항로 2" },
  { name: "행복 렌트카", address: "제주특별자치도 제주시 삼성로9길 27" },
  { name: "제주 로얄 렌트카", address: "제주특별자치도 제주시 용담일동 2823-7" },
];

const REQUIRED_DOCS = [
  "운전면허증 (만 21세 이상, 운전 경력 1년 이상)",
  "본인 명의 신용카드",
  "예약 확인증",
];

const Prompt = () => {
  const [input, setInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);
  const [showMap, setShowMap] = useState(false);
  const [showCars, setShowCars] = useState(false);
  const [recommendedCars, setRecommendedCars] = useState([]); // API에서 받은 추천 차량
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false); // 로딩 상태
  const [currentAgencies, setCurrentAgencies] = useState([]); // 현재 표시할 지점들
  const [currentLocation, setCurrentLocation] = useState("제주도"); // 현재 지역
  const [gptRecommendationMessage, setGptRecommendationMessage] = useState(""); // GPT 추천 메시지
  const is400px = use400px();
  const messagesEndRef = useRef(null);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false); // 해더 추가용

  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);

  const carItemRefs = useRef([]);  // 차량 자세히 보기시 화면 가운데로 이동


    const currentMessages =
    chatHistory.find((chat) => chat.id === selectedChat)?.messages || [];

  // 카카오맵 SDK 로드
  useEffect(() => {
    if (window.kakao?.maps) return;
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${
      import.meta.env.VITE_KAKAO_MAP_KEY
    }&libraries=services&autoload=false`;
    script.async = true;
    document.head.appendChild(script);
    script.onload = () => {
      window.kakao.maps.load(() => {});
    };
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // 지도 생성 및 마커 관리 (매번 새로 생성)
  useEffect(() => {
    if (!showMap || !mapContainer.current || !window.kakao?.maps) {
      console.log(
        "카카오맵 조건 불충족:",
        showMap,
        mapContainer.current,
        window.kakao?.maps
      );
      return;
    }
    // 기존 마커 제거
    markers.current.forEach((marker) => marker.setMap(null));
    markers.current = [];
    // 기존 지도 객체 제거 (필요시)
    if (map.current) {
      map.current = null;
    }
    // 지도 새로 생성
    const mapOption = {
      center: new window.kakao.maps.LatLng(33.5027469615008,126.508826280302),
      level: 7,
    };
    map.current = new window.kakao.maps.Map(mapContainer.current, mapOption);
    console.log("지도 새로 생성됨:", map.current);

    // 마커 생성 (동적 지점 사용)
    const geocoder = new window.kakao.maps.services.Geocoder();
    const locationsToUse = currentAgencies.length > 0 ? currentAgencies : RENTAL_CAR_LOCATIONS;

    locationsToUse.forEach((location) => {
      // API에서 받은 데이터는 latitude/longitude가 있고, 기본 데이터는 address 검색 필요
      if (location.latitude && location.longitude) {
        // API 데이터: 직접 좌표 사용
        const coords = new window.kakao.maps.LatLng(location.latitude, location.longitude);
        const marker = new window.kakao.maps.Marker({
          map: map.current,
          position: coords,
        });
        markers.current.push(marker);
        const infowindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:5px;font-size:12px;">${location.name}</div>`,
        });
        infowindow.open(map.current, marker);
        console.log("마커 생성됨 (좌표):", location.name);
      } else {
        // 기본 데이터: 주소 검색
        geocoder.addressSearch(location.address, (result, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
            const marker = new window.kakao.maps.Marker({
              map: map.current,
              position: coords,
            });
            markers.current.push(marker);
            const infowindow = new window.kakao.maps.InfoWindow({
              content: `<div style="padding:5px;font-size:12px;">${location.name}</div>`,
            });
            infowindow.open(map.current, marker);
            console.log("마커 생성됨 (주소):", location.name);
          } else {
            console.log("마커 생성 실패:", location.name, status);
          }
        });
      }
    });

    return () => {
      markers.current.forEach((marker) => marker.setMap(null));
      markers.current = [];
    };
  }, [showMap, currentAgencies]); // currentAgencies 추가

  const addMessage = (messageObject) => {
    setChatHistory((prev) =>
      prev.map((chat) =>
        chat.id === selectedChat
          ? { ...chat, messages: [...chat.messages, messageObject] }
          : chat
      )
    );
  };

  // API에서 차량 추천 받기
  const fetchRecommendations = async (userInput) => {
    setIsLoadingRecommendations(true);
    try {
      const apiResponse = await getRecommendations(userInput);
      const { cars, gptMessage } = transformRecommendationData(apiResponse);
      setRecommendedCars(cars);
      setGptRecommendationMessage(gptMessage);
      return cars;
    } catch (error) {
      console.error('추천 API 호출 실패:', error);
      // 에러 시 빈 배열 반환
      setRecommendedCars([]);
      setGptRecommendationMessage("");
      return [];
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  // 지역별 지점 로딩
  const fetchAgenciesByLocation = async (location) => {
    try {
      console.log(`🏢 ${location} 지역 지점 조회 중...`);
      const agencies = await getAgenciesByLocation(location);
      const transformedAgencies = transformAgencyData(agencies);
      setCurrentAgencies(transformedAgencies);

      // 실제 조회된 지점들의 지역 확인
      let actualLocation = location;
      if (agencies.length > 0) {
        // 첫 번째 지점의 이름에서 실제 지역 추출
        const firstAgencyName = agencies[0].agencyName;
        if (firstAgencyName.includes('서울')) actualLocation = '서울';
        else if (firstAgencyName.includes('부산')) actualLocation = '부산';
        else if (firstAgencyName.includes('제주')) actualLocation = '제주';
        // 필요시 다른 지역들도 추가
      }

      setCurrentLocation(actualLocation);
      console.log(`🏢 ${location} → ${actualLocation} 지점 ${transformedAgencies.length}개 로딩 완료`);
      return { agencies: transformedAgencies, actualLocation };
    } catch (error) {
      console.error('지점 조회 실패:', error);
      // 에러 시 기본 제주도 지점 사용
      setCurrentAgencies([
        { name: "제주공항 렌트카", address: "제주특별자치도 제주시 공항로 2" },
        { name: "행복 렌트카", address: "제주특별자치도 제주시 삼성로9길 27" },
        { name: "제주 로얄 렌트카", address: "제주특별자치도 제주시 용담일동 2823-7" },
      ]);
      setCurrentLocation("제주도");

      // 폴백 상황 안내 메시지
      if (location !== "제주") {
        setTimeout(() => {
          addMessage({
            text: `💡 ${location} 지역에는 직접적인 렌터카 지점이 없어서, 기본 제주도 지점을 안내해드립니다. 다른 지역을 시도해보시거나 문의해주세요!`,
            mine: false,
          });
        }, 1000);
      }

      return { agencies: [], actualLocation: "제주" };
    }
  };

  // 사용자 입력에서 지역 추출
  const extractLocationFromInput = (userInput) => {
    // 서울 구 단위 지역들 (서울로 매핑)
    const seoulDistricts = ["강남", "강북", "강서", "강동", "관악", "광진", "구로", "금천", "노원",
                           "도봉", "동대문", "동작", "마포", "서대문", "서초", "성동", "성북",
                           "송파", "양천", "영등포", "용산", "은평", "종로", "중구", "중랑"];

    // 서울 구 단위 체크
    for (const district of seoulDistricts) {
      if (userInput.includes(district)) {
        console.log(`🗺️ 서울 ${district} 지역 인식 → 서울로 매핑`);
        return "서울";
      }
    }

    // 광역시/도 단위 체크
    const locations = ["서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종", "제주",
                      "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주도"];

    for (const location of locations) {
      if (userInput.includes(location)) {
        return location.replace("도", ""); // "제주도" -> "제주"
      }
    }

    return "제주"; // 기본값
  };

  // 렌터카 관련 키워드 체크
  const isCarRentalRelated = (userInput) => {
    const keywords = [
      "여행", "렌트카", "렌터카", "차량", "추천", "예약",
      "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종", "제주",
      "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남",
      "자동차", "승용차", "SUV", "세단", "해치백"
    ];

    return keywords.some(keyword => userInput.includes(keyword));
  };

  // 🧪 API 테스트 함수들
  const testAllAgencies = async () => {
    try {
      console.log("🧪 모든 지점 조회 테스트 시작...");
      const agencies = await getAllAgencies();
      console.log("✅ 모든 지점 조회 성공:", agencies);
      console.log(`📊 총 ${agencies.length}개 지점 발견`);

      // 지역별 분류
      const locationGroups = {};
      agencies.forEach(agency => {
        const location = agency.location || "기타";
        if (!locationGroups[location]) locationGroups[location] = [];
        locationGroups[location].push(agency.agencyName);
      });
      console.log("🗺️ 지역별 지점 분류:", locationGroups);
    } catch (error) {
      console.error("❌ 모든 지점 조회 실패:", error);
    }
  };

  const testLocationAgencies = async (location) => {
    try {
      console.log(`🧪 ${location} 지점 조회 테스트 시작...`);
      const agencies = await getAgenciesByLocation(location);
      console.log(`✅ ${location} 지점 조회 성공:`, agencies);
      console.log(`📊 ${location}에서 ${agencies.length}개 지점 발견`);
    } catch (error) {
      console.error(`❌ ${location} 지점 조회 실패:`, error);
    }
  };

  // 날짜 선택 후 처리
  useEffect(() => {
    const [start, end] = dateRange;
    if (start && end && selectedChat) {
      const format = (date) =>
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(date.getDate()).padStart(2, "0")}`;
      const responseText = `선택하신 기간: ${format(start)} ~ ${format(end)}`;
      addMessage({ text: responseText, mine: false });

      // 현재 채팅의 가장 최근 사용자 메시지를 가져와서 API 호출
      const currentChat = chatHistory.find(chat => chat.id === selectedChat);
      const userMessages = currentChat?.messages.filter(msg => msg.mine) || [];
      const latestUserInput = userMessages[userMessages.length - 1]?.text || "";

      console.log("🔍 최신 사용자 입력:", latestUserInput);

      // 사용자 입력에서 지역 추출
      const location = extractLocationFromInput(latestUserInput);
      console.log("🗺️ 추출된 지역:", location);

      const guideMessageText = `${location} 근처 렌트카 예약을 도와드리겠습니다.\n대표 렌트카 지점 위치를 지도에 표시했습니다.\n\n**예약 시 필요 서류:**\n- ${REQUIRED_DOCS.join(
        "\n- "
      )}\n\n추천차량을 불러오는 중...`;

      addMessage({
        text: guideMessageText,
        mine: false,
        showMapAfter: true,
        showCarsAfter: true,
      });

      setShowMap(true);
      setShowCars(true);

      // 지역별 지점 로딩 후 실제 지역으로 차량 추천
      fetchAgenciesByLocation(location).then((result) => {
        const actualLocation = result.actualLocation;
        console.log(`🔄 지점 조회 완료: ${location} → ${actualLocation}`);

        // 실제 지역으로 차량 추천 API 호출
        const fullUserInput = `${actualLocation}에서 차량 추천해줘 ${format(start)}부터 ${format(end)}까지`;
        console.log("🚗 API 호출 입력 (실제 지역):", fullUserInput);

        return fetchRecommendations(fullUserInput);
      }).then((cars) => {
        // 차량 추천 완료 후 달력 숨기고 입력창 활성화
        setTimeout(() => {
          setShowCalendar(false);
          // 추가 질문 유도 메시지
          if (cars.length > 0) {
            addMessage({
              text: "다른 지역의 차량도 궁금하시거나, 추가 질문이 있으시면 언제든 말씀해주세요! 😊",
              mine: false,
            });
          }
        }, 2000); // 2초 후 달력 숨김 및 안내 메시지
      });
    }
  }, [dateRange, selectedChat]); // chatHistory 제거

  const handleSelectChat = (chatId) => {
    setSelectedChat(chatId);
    // 채팅 전환 시 상태 초기화
    setShowCalendar(false);
    setShowMap(false);
    setShowCars(false);
    setRecommendedCars([]);
    setCurrentAgencies([]);
    setCurrentLocation("제주도");
    setDateRange([null, null]);
  };

  const handleCreateChat = (initialMessage, botResponse) => {
    const newId = Date.now();
    const newChat = { id: newId, messages: [] };
    if (initialMessage) {
      newChat.messages.push(initialMessage);
    }
    if (botResponse) {
      newChat.messages.push(botResponse);
    }
    setChatHistory((prev) => [...prev, newChat]);
    setSelectedChat(newId);

    // 새 채팅 생성 시 상태 초기화
    setShowCalendar(false);
    setShowMap(false);
    setShowCars(false);
    setRecommendedCars([]);
    setCurrentAgencies([]);
    setCurrentLocation("제주도");
    setDateRange([null, null]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (chatHistory.length === 0) {
      const isCarRelated = isCarRentalRelated(input);
      const botResponse = isCarRelated
          ? {
              text: "언제부터 언제까지 이용하시겠어요?",
              mine: false,
              showCalendarAfter: true,
            }
          : {
              text: "죄송합니다. 차량 예약 관련 질문만 도와드릴 수 있어요.",
              mine: false,
            };
      handleCreateChat({ text: input, mine: true }, botResponse);
      if (isCarRelated) {
        setShowCalendar(true);
        setShowMap(false);
        setShowCars(false);
      }
    } else {
      addMessage({ text: input, mine: true });
      const isCarRelated = isCarRentalRelated(input);

      if (isCarRelated) {
        // 새로운 추천 시작 시 모든 이전 상태 초기화
        setShowMap(false);
        setShowCars(false);
        setRecommendedCars([]);
        setCurrentAgencies([]);
        setDateRange([null, null]);
        setGptRecommendationMessage("");

        // 이전 메시지들의 지도/차량 플래그 제거
        setChatHistory((prev) =>
          prev.map((chat) =>
            chat.id === selectedChat
              ? {
                  ...chat,
                  messages: chat.messages.map((msg) => ({
                    ...msg,
                    showMapAfter: false,
                    showCarsAfter: false,
                  }))
                }
              : chat
          )
        );

        addMessage({
          text: "언제부터 언제까지 이용하시겠어요?",
          mine: false,
          showCalendarAfter: true,
        });
        setShowCalendar(true);
      } else {
        // 렌터카 관련이 아닌 질문이지만 API 호출 시도
        addMessage({
          text: "질문을 확인하고 있습니다...",
          mine: false,
        });

        // API 호출
        fetchRecommendations(input).then((cars) => {
          if (cars.length === 0) {
            // 시스템 메시지가 있는 경우 해당 메시지 표시
            addMessage({
              text: "죄송합니다. 해당 조건에 맞는 차량을 찾을 수 없습니다. 다른 조건으로 다시 시도해보세요.",
              mine: false,
            });
          } else {
            // 차량이 있으면 지도와 차량 목록 표시
            const location = extractLocationFromInput(input);
            addMessage({
              text: `${location} 지역 차량 추천 결과입니다.`,
              mine: false,
              showMapAfter: true,
              showCarsAfter: true,
            });
            setShowMap(true);
            setShowCars(true);

            // 지점 조회 후 실제 지역으로 차량 재추천
            fetchAgenciesByLocation(location).then((result) => {
              const actualLocation = result.actualLocation;
              if (actualLocation !== location) {
                console.log(`🔄 지역 변경: ${location} → ${actualLocation}, 차량 재추천 필요`);
                // 실제 지역으로 차량 재추천
                const newInput = input.replace(location, actualLocation);
                return fetchRecommendations(newInput);
              }
            });
          }
        }).catch((error) => {
          console.error('API 호출 에러:', error);
          addMessage({
            text: "죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.",
            mine: false,
          });
        });
      }
    }
    setInput("");
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [chatHistory, showMap, showCalendar, showCars]);

  return (
    <div className="chat-root">
      <Header onSignUpClick={() => setIsSignUpOpen(true)} />
      {is400px && (
        <PromptHeader
          chatHistory={chatHistory}
          onSelectChat={handleSelectChat}
          onCreateChat={handleCreateChat}
        />
      )}
      {!is400px && (
        <aside className="chat-sidebar">
          <div className="chat-sidebar-header">
            <h2>채팅 내역</h2>
            <button className="chat-new-btn" onClick={() => handleCreateChat()}>
              <AiOutlinePlus size={20} />
            </button>
          </div>
          <ul>
            {chatHistory.map((chat) => (
              <li
                key={chat.id}
                className={selectedChat === chat.id ? "active" : ""}
                onClick={() => setSelectedChat(chat.id)}>
                Chat {chat.id}
              </li>
            ))}
          </ul>
        </aside>
      )}
      <div className="chat-main">
        <div className="chat-messages" ref={messagesEndRef}>
          {currentMessages.map((msg, idx) => (
            <React.Fragment key={idx}>
              <div className={`chat-message${msg.mine ? " mine" : ""}`}>
                {msg.text.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
              </div>
              {showCalendar && msg.showCalendarAfter && (
                <div className="calendar-popup">
                  <DatePicker
                      selectsRange
                      startDate={dateRange[0]}
                      endDate={dateRange[1]}
                      onChange={(update) => {
                        // 날짜가 이미 선택 완료되었으면 무시
                        if (dateRange[0] && dateRange[1]) return;
                        setDateRange(update);
                      }}
                      inline
                      minDate={new Date()}
                      locale="ko"
                  />
                </div>
              )}
              {showMap && msg.showMapAfter && (
                <div className="map-container" ref={mapContainer} />
              )}
              {showCars && msg.showCarsAfter && (
                <div className="cars-list">
                    {isLoadingRecommendations ? (
                        <p>추천 차량을 불러오는 중... ⏳</p>
                    ) : recommendedCars.length > 0 ? (
                        <>
                            {/* GPT 추천 메시지 표시 */}
                            {gptRecommendationMessage && (
                                <div className="gpt-recommendation-message">
                                    <p>{gptRecommendationMessage}</p>
                                </div>
                            )}
                            <p>추천드릴&nbsp;<span style={{ fontSize: '20px'}}> 차량</span> 을 찾아왔습니다! &nbsp;🚗</p>
                            <div className="car-cards">
                                {recommendedCars.map((car, idx) => (
                                    <div
                                        key={car.car_id || idx}
                                        ref={(el) => (carItemRefs.current[idx] = el)}
                                        onClick={() => {
                                            carItemRefs.current[idx]?.scrollIntoView({
                                                behavior: "smooth",
                                                inline: "center", // 가로 중앙 정렬
                                                block: "nearest", // 세로는 그대로
                                            });
                                        }}
                                        style={{ display: "inline-block", cursor: "pointer" }}
                                    >
                                        <CarItemCard car={car} dateRange={dateRange} />
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p>추천 가능한 차량이 없습니다. 다른 조건으로 다시 시도해보세요. 😅</p>
                    )}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        {/*/!* 🧪 API 테스트 버튼들 (개발용) *!/*/}
        {/*<div style={{ padding: '10px', backgroundColor: '#f8f9fa', borderTop: '1px solid #dee2e6' }}>*/}
        {/*  <div style={{ fontSize: '12px', marginBottom: '8px', color: '#6c757d' }}>🧪 데이터 확인 (개발용)</div>*/}
        {/*  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>*/}
        {/*    <button*/}
        {/*      type="button"*/}
        {/*      onClick={async () => {*/}
        {/*        try {*/}
        {/*          const response = await fetch('http://localhost:8080/api/debug/data-summary');*/}
        {/*          const data = await response.json();*/}
        {/*          console.log('📊 데이터 요약:', data);*/}
        {/*          alert(`데이터 요약:\n전체 차량: ${data.totalCars}개\n전체 지점: ${data.totalAgencies}개\n\n지역별 차량 수:\n${Object.entries(data.carsByLocation).map(([location, count]) => `${location}: ${count}개`).join('\n')}`);*/}
        {/*        } catch (error) {*/}
        {/*          console.error('데이터 확인 실패:', error);*/}
        {/*        }*/}
        {/*      }}*/}
        {/*      style={{ padding: '4px 8px', fontSize: '11px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}*/}
        {/*    >*/}
        {/*      📊 데이터 요약*/}
        {/*    </button>*/}
        {/*    <button*/}
        {/*      type="button"*/}
        {/*      onClick={() => testLocationAgencies('서울')}*/}
        {/*      style={{ padding: '4px 8px', fontSize: '11px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}*/}
        {/*    >*/}
        {/*      서울 지점*/}
        {/*    </button>*/}
        {/*    <button*/}
        {/*      type="button"*/}
        {/*      onClick={() => testLocationAgencies('부산')}*/}
        {/*      style={{ padding: '4px 8px', fontSize: '11px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px' }}*/}
        {/*    >*/}
        {/*      부산 지점*/}
        {/*    </button>*/}
        {/*    <button*/}
        {/*      type="button"*/}
        {/*      onClick={() => testLocationAgencies('제주')}*/}
        {/*      style={{ padding: '4px 8px', fontSize: '11px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '4px' }}*/}
        {/*    >*/}
        {/*      제주 지점*/}
        {/*    </button>*/}
        {/*  </div>*/}
        {/*</div>*/}

        <form className="chat-input-bar" onSubmit={handleSubmit}>
          <button type="button" className="chat-add-btn">
            <AiOutlinePlus size={20} />
          </button>
          <input
            type="text"
            placeholder={showCalendar ? "날짜를 선택해주세요" : isLoadingRecommendations ? "추천 중..." : "채팅을 입력하세요"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={showCalendar || isLoadingRecommendations}
          />
          <button
              type="submit"
              className="chat-send-btn"
              disabled={showCalendar || isLoadingRecommendations}>
            <HiArrowUp className="arrow-up" />
          </button>
        </form>
      </div>
      {isSignUpOpen && (
          <SignUp isOpen={isSignUpOpen} onClose={() => setIsSignUpOpen(false)} />
      )}
    </div>
  );
};

export default Prompt;
