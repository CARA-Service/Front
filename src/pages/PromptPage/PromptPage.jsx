import React, { useState, useEffect, useRef } from "react";
import PromptHeader from "../../components/PromptHeader/PromptHeader.jsx";
import DatePicker, { registerLocale } from "react-datepicker";
import ko from "date-fns/locale/ko";
import "react-datepicker/dist/react-datepicker.css";
import CarItemCard from "../../components/CarItemCard/CarItemCard.jsx";
import "../../components/CarItemCard/CarItemCard.css";
import "./PromptPage.css";
import use400px from "../../hooks/use400px.jsx";

registerLocale("ko", ko);

const RENTAL_CAR_LOCATIONS = [
  { name: "제주공항 렌트카", address: "제주특별자치도 제주시 공항로 2" },
  { name: "행복 렌트카", address: "제주특별자치도 제주시 연313-1" },
  { name: "제주 로얄 렌트카", address: "제주특별자치도 제주시 용문로 11" },
];
const AVAILABLE_CARS = [
  {
    brand: "현대",
    model: "엘란트라세단",
    originalPrice: 50000,
    discountRate: 10,
    imageUrl: "/현대엘란트라세단(측면).png",
    comment: "편안한 승차감과 넓은 실내 공간",
    features: ["스마트키", "후방카메라", "블루투스"],
  },
  {
    brand: "도요타",
    model: "COROLLA",
    originalPrice: 55000,
    discountRate: 5,
    imageUrl: "/도요타COROLLA(측면).png",
    comment: "세련된 디자인과 강력한 성능",
    features: ["에어백", "내비게이션", "오디오"],
  },
  {
    brand: "벤츠",
    model: "메르세데스C",
    originalPrice: 80000,
    discountRate: 8,
    imageUrl: "/벤츠메르세데스C(측면).png",
    comment: "넉넉한 7인승, 가족 여행에 적합",
    features: ["파워슬라이드", "듀얼 선루프", "스마트크루즈"],
  },
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
  const is400px = use400px();
  const messagesEndRef = useRef(null);

  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);

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
      center: new window.kakao.maps.LatLng(33.499621, 126.531188),
      level: 8,
    };
    map.current = new window.kakao.maps.Map(mapContainer.current, mapOption);
    console.log("지도 새로 생성됨:", map.current);

    // 마커 생성
    const geocoder = new window.kakao.maps.services.Geocoder();
    RENTAL_CAR_LOCATIONS.forEach((location) => {
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
          console.log("마커 생성됨:", location.name);
        } else {
          console.log("마커 생성 실패:", location.name, status);
        }
      });
    });

    return () => {
      markers.current.forEach((marker) => marker.setMap(null));
      markers.current = [];
    };
  }, [showMap]);

  const addMessage = (messageObject) => {
    setChatHistory((prev) =>
      prev.map((chat) =>
        chat.id === selectedChat
          ? { ...chat, messages: [...chat.messages, messageObject] }
          : chat
      )
    );
  };

  // 날짜 선택 후 처리
  useEffect(() => {
    const [start, end] = dateRange;
    if (start && end) {
      const format = (date) =>
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(date.getDate()).padStart(2, "0")}`;
      const responseText = `선택하신 기간: ${format(start)} ~ ${format(end)}`;
      addMessage({ text: responseText, mine: true });
      setShowCalendar(false);
      const guideMessageText = `제주도 근처 렌트카 예약을 도와드리겠습니다.\n대표 렌트카 지점 위치를 지도에 표시했습니다.\n\n**추천차량:**\n\n**예약 시 필요 서류:**\n- ${REQUIRED_DOCS.join(
        "\n- "
      )}\n\n추천차량을 확인해보세요.`;
      addMessage({
        text: guideMessageText,
        mine: false,
        showMapAfter: true,
        showCarsAfter: true,
      });
      setShowMap(true);
      setShowCars(true);
    }
  }, [dateRange]);

  const handleSelectChat = (chatId) => setSelectedChat(chatId);

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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (chatHistory.length === 0) {
      const botResponse =
        input.includes("여행") ||
        input.includes("렌트카") ||
        input.includes("제주도")
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
      if (
        input.includes("여행") ||
        input.includes("렌트카") ||
        input.includes("제주도")
      ) {
        setShowCalendar(true);
        setShowMap(false);
        setShowCars(false);
      }
    } else {
      addMessage({ text: input, mine: true });
      if (
        input.includes("여행") ||
        input.includes("렌트카") ||
        input.includes("제주도")
      ) {
        addMessage({
          text: "언제부터 언제까지 이용하시겠어요?",
          mine: false,
          showCalendarAfter: true,
        });
        setShowCalendar(true);
        setShowMap(false);
        setShowCars(false);

        setDateRange([null, null]);
      } else {
        addMessage({
          text: "죄송합니다. 차량 예약 관련 질문만 도와드릴 수 있어요.",
          mine: false,
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
              +
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
                    onChange={(update) => setDateRange(update)}
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
                  <h3>추천차량</h3>
                  <div className="car-cards">
                    {AVAILABLE_CARS.map((car, idx) => (
                      <CarItemCard key={idx} car={car} dateRange={dateRange} />
                    ))}
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        <form className="chat-input-bar" onSubmit={handleSubmit}>
          <button type="button" className="chat-add-btn">
            +
          </button>
          <input
            type="text"
            placeholder="채팅을 입력하세요"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={showCalendar}
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={showCalendar}>
            <span className="arrow-up">&#8593;</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Prompt;
