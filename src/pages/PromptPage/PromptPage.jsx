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
  const is400px = use400px();
  const messagesEndRef = useRef(null);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false); // 해더 추가용
  const [dotAnim, setDotAnim] = useState(0);

  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);

  const carItemRefs = useRef([]);  // 차량 자세히 보기시 화면 가운데로 이동

  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [deletingChatId, setDeletingChatId] = useState(null);

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
      const transformedCars = transformRecommendationData(apiResponse);
      setRecommendedCars(transformedCars);
      return transformedCars;
    } catch (error) {
      console.error('추천 API 호출 실패:', error);
      // 에러 시 빈 배열 반환
      setRecommendedCars([]);
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
    const now = new Date().toISOString();
    setChatHistory((prev) => prev.map(chat =>
      chat.id === selectedChat
        ? {
            ...chat,
            messages: [...chat.messages, { text: input, mine: true }],
            lastMessageAt: now
          }
        : chat
    ));
    const isCarRelated = isCarRentalRelated(input);

    if (isCarRelated) {
      // 새로운 추천 시작 시 모든 이전 상태 초기화
      setShowMap(false);
      setShowCars(false);
      setRecommendedCars([]);
      setCurrentAgencies([]);
      setDateRange([null, null]);

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
    setInput("");
    setTimeout(() => { messagesEndRef.current?.focus(); }, 0);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [chatHistory, showMap, showCalendar, showCars]);

  useEffect(() => {
    const interval = setInterval(() => setDotAnim((d) => (d + 1) % 4), 500);
    return () => clearInterval(interval);
  }, []);

  const handleCreateChatDraft = () => {
    const newId = Date.now();
    const now = new Date();
    const newChat = {
      id: newId,
      messages: [],
      title: `Chat ${String(newId).slice(-6)}`,
      createdAt: now.toISOString(),
      isDraft: true,
    };
    setChatHistory((prev) => [...prev, newChat]);
    setSelectedChat(newId);
    setShowCalendar(false);
    setShowMap(false);
    setShowCars(false);
    setRecommendedCars([]);
    setCurrentAgencies([]);
    setCurrentLocation("제주도");
    setDateRange([null, null]);
  };

  const handleFirstMessage = (text) => {
    const now = new Date().toISOString();
    setChatHistory((prev) => prev.map(chat =>
      chat.id === selectedChat
        ? { ...chat, title: text, isDraft: false, lastMessageAt: now }
        : chat
    ));
    processPrompt(text);
    setTimeout(() => { messagesEndRef.current?.focus(); }, 0);
  };

  // 프롬프트 처리 로직을 함수로 분리
  const processPrompt = (promptText) => {
    if (!promptText.trim()) return;
    const isCarRelated = isCarRentalRelated(promptText);
    if (chatHistory.length === 0) {
      // 첫 채팅방 생성 시 (이 케이스는 거의 없음)
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
      handleCreateChat({ text: promptText, mine: true }, botResponse);
      if (isCarRelated) {
        setShowCalendar(true);
        setShowMap(false);
        setShowCars(false);
      }
    } else {
      // 메시지로는 추가하지 않음
      // addMessage({ text: promptText, mine: true });
      if (isCarRelated) {
        setShowMap(false);
        setShowCars(false);
        setRecommendedCars([]);
        setCurrentAgencies([]);
        setDateRange([null, null]);
        setChatHistory((prev) =>
          prev.map((chat) =>
            chat.id === selectedChat
              ? {
                  ...chat,
                  messages: chat.messages.map((msg) => ({
                    ...msg,
                    showMapAfter: false,
                    showCarsAfter: false,
                  })),
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
        addMessage({
          text: "질문을 확인하고 있습니다...",
          mine: false,
        });
        fetchRecommendations(promptText).then((cars) => {
          if (cars.length === 0) {
            addMessage({
              text: "죄송합니다. 해당 조건에 맞는 차량을 찾을 수 없습니다. 다른 조건으로 다시 시도해보세요.",
              mine: false,
            });
          } else {
            const location = extractLocationFromInput(promptText);
            addMessage({
              text: `${location} 지역 차량 추천 결과입니다.`,
              mine: false,
              showMapAfter: true,
              showCarsAfter: true,
            });
            setShowMap(true);
            setShowCars(true);
            fetchAgenciesByLocation(location).then((result) => {
              const actualLocation = result.actualLocation;
              if (actualLocation !== location) {
                const newInput = promptText.replace(location, actualLocation);
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
  };

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
            <button className="chat-new-btn" onClick={handleCreateChatDraft}>
              <AiOutlinePlus size={20} />
            </button>
          </div>
          <ul>
            {chatHistory.map((chat) => (
              <li
                key={chat.id}
                className={
                  (selectedChat === chat.id ? "active " : "") +
                  (editingChatId === chat.id ? "editing" : "")
                }
                onClick={() => setSelectedChat(chat.id)}
              >
                {chat.isDraft ? (
                  <span className="chat-dots">{'.'.repeat(dotAnim + 1)}</span>
                ) : (
                  <div>
                    {editingChatId === chat.id ? (
                      <input
                        className="chat-title-edit-input"
                        value={editingTitle}
                        autoFocus
                        onChange={e => setEditingTitle(e.target.value)}
                        onBlur={() => {
                          if (editingTitle.trim() === "") {
                            setEditingChatId(null);
                          } else {
                            setChatHistory(prev => prev.map(c => c.id === chat.id ? { ...c, title: editingTitle } : c));
                            setEditingChatId(null);
                          }
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            if (editingTitle.trim() === "") {
                              setEditingChatId(null);
                            } else {
                              setChatHistory(prev => prev.map(c => c.id === chat.id ? { ...c, title: editingTitle } : c));
                              setEditingChatId(null);
                            }
                          } else if (e.key === 'Escape') {
                            setEditingChatId(null);
                          }
                        }}
                        style={{ fontSize: '1em', width: '90px', padding: '2px 6px', borderRadius: '4px', border: '1px solid #ddd' }}
                      />
                    ) : (
                      <>
                        <span className="chat-title-text-sidebar">{chat.title || `Chat ${chat.id}`}</span>
                        <div className="chat-actions">
                          <button
                            className="chat-edit-btn"
                            onClick={e => {
                              e.stopPropagation();
                              setEditingChatId(chat.id);
                              setEditingTitle(chat.title || "");
                            }}
                            tabIndex={-1}
                            title="제목 수정"
                          >
                            <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M14.7 2.29a1 1 0 0 1 1.42 1.42l-1.09 1.09-1.42-1.42 1.09-1.09zm-2.12 2.12l1.42 1.42-8.3 8.3a1 1 0 0 0-.26.45l-1 3a1 1 0 0 0 1.26 1.26l3-1a1 1 0 0 0 .45-.26l8.3-8.3-1.42-1.42-8.3 8.3-1.09-1.09 8.3-8.3z" fill="#888"/></svg>
                          </button>
                          <button
                            className="chat-delete-btn"
                            onClick={e => {
                              e.stopPropagation();
                              setDeletingChatId(chat.id);
                            }}
                            tabIndex={-1}
                            title="채팅 삭제"
                          >
                            <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M7 8v6m3-6v6m3-10V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2M4 6h12m-1 0v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h10z" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </aside>
      )}
      {deletingChatId && (
        <div className={"chat-delete-modal-overlay show"}>
          <div className="chat-delete-modal">
            <div className="chat-delete-modal-title">채팅을 삭제하시겠습니까?</div>
            <div className="chat-delete-modal-desc">이 작업은 되돌릴 수 없습니다.</div>
            <div className="chat-delete-modal-actions">
              <button className="chat-delete-modal-cancel" onClick={() => setDeletingChatId(null)}>취소</button>
              <button className="chat-delete-modal-confirm" onClick={() => {
                setChatHistory(prev => prev.filter(c => c.id !== deletingChatId));
                if (selectedChat === deletingChatId) setSelectedChat(null);
                setDeletingChatId(null);
              }}>삭제</button>
            </div>
          </div>
        </div>
      )}
      <div className="chat-main">
        {selectedChat === null ? (
          <div className="chat-empty-guide">
            <div className="chat-empty-title">채팅방을 클릭하여 렌트하기</div>
            <div className="chat-empty-desc">왼쪽 채팅방 목록에서 채팅을 선택하거나 새 채팅을 시작해보세요.<br/>렌트카 상담이 이곳에 표시됩니다.</div>
          </div>
        ) : (
          <>
            <div className="chat-messages" ref={messagesEndRef} onClick={() => inputRef.current?.focus()}>
            {selectedChat !== null && !chatHistory.find(c => c.id === selectedChat)?.isDraft && (
          <div className="chat-title-bar">
            <div className="chat-title-text">{chatHistory.find(c => c.id === selectedChat)?.title || ''}</div>
            <div className="chat-title-date">
              {(() => {
                const chat = chatHistory.find(c => c.id === selectedChat);
                if (!chat) return null;
                const format = (dateStr) => {
                  if (!dateStr) return '';
                  const d = new Date(dateStr);
                  return d.toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                  }).replace(/\. /g, '.').replace(/\.$/, '');
                };
                return (
                  <>
                    <span className="chat-date-created">{format(chat.createdAt)} 생성됨</span><br />
                    <span className="chat-date-updated">{format(chat.lastMessageAt)} 업데이트</span>
                  </>
                );
              })()}
            </div>
          </div>
        )}    
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
            {selectedChat !== null && chatHistory.find(c => c.id === selectedChat)?.isDraft ? (
              <form className="chat-input-bar" onSubmit={e => {
                e.preventDefault();
                if (!input.trim()) return;
                handleFirstMessage(input.trim());
                setInput("");
              }}>
                <input
                  type="text"
                  placeholder="무엇을 물어보고 싶으신가요?"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="chat-send-btn" disabled={!input.trim()}>
                  <HiArrowUp className="arrow-up" />
                </button>
              </form>
            ) : (
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
            )}
          </>
        )}
      </div>
      {isSignUpOpen && (
          <SignUp isOpen={isSignUpOpen} onClose={() => setIsSignUpOpen(false)} />
      )}
    </div>
  );
};

export default Prompt;
