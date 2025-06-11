import React, { useState, useEffect, useRef } from "react";
import PromptHeader from "../../components/PromptHeader/PromptHeader.jsx";
import DatePicker, { registerLocale } from "react-datepicker";
import ko from "date-fns/locale/ko";
import "react-datepicker/dist/react-datepicker.css";
import "./Prompt.css";
import use400px from "../../hooks/use400px";

registerLocale("ko", ko);

const RENTAL_CAR_LOCATIONS = [
  { name: "제주공항 렌트카", address: "제주특별자치도 제주시 공항로 2" },
  { name: "행복 렌트카", address: "제주특별자치도 제주시 연동 303-1" },
  { name: "제주 로얄 렌트카", address: "제주특별자치도 제주시 용문로 11" },
];
const AVAILABLE_CARS = [
  "현대 소나타 (1일 50,000원)",
  "기아 K5 (1일 55,000원)",
  "기아 카니발 (1일 80,000원)",
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
  const mapContainer = useRef(null);
  const is400px = use400px();
  const messagesEndRef = useRef(null);

  const currentMessages =
    chatHistory.find((chat) => chat.id === selectedChat)?.messages || [];

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

  useEffect(() => {
    if (!showMap || !mapContainer.current || !window.kakao?.maps) return;
    const mapOption = {
      center: new window.kakao.maps.LatLng(33.499621, 126.531188),
      level: 8,
    };
    const map = new window.kakao.maps.Map(mapContainer.current, mapOption);
    const geocoder = new window.kakao.maps.services.Geocoder();
    RENTAL_CAR_LOCATIONS.forEach((location) => {
      geocoder.addressSearch(location.address, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
          const marker = new window.kakao.maps.Marker({
            map,
            position: coords,
          });
          const infowindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:5px;font-size:12px;">${location.name}</div>`,
          });
          infowindow.open(map, marker);
        }
      });
    });
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
      const guideMessageText = `제주도 근처 렌트카 예약을 도와드리겠습니다.\n대표 렌트카 지점 위치를 지도에 표시했습니다.\n\n**예약 가능 차량:**\n- ${AVAILABLE_CARS.join(
        "\n- "
      )}\n\n**예약 시 필요 서류:**\n- ${REQUIRED_DOCS.join(
        "\n- "
      )}\n\n예약을 진행하시려면 차량을 선택해주세요.`;
      setTimeout(() => {
        addMessage({ text: guideMessageText, mine: false, showMapAfter: true });
        setShowMap(true);
      }, 0);
    }
  }, [dateRange]);

  const handleSelectChat = (chatId) => setSelectedChat(chatId);
  const handleCreateChat = () => {
    const newId = Date.now();
    setChatHistory((prev) => [...prev, { id: newId, messages: [] }]);
    setSelectedChat(newId);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
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
    } else {
      addMessage({
        text: "죄송합니다. 차량 예약 관련 질문만 도와드릴 수 있어요.",
        mine: false,
      });
    }
    setInput("");
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [chatHistory, showMap, showCalendar]);

  useEffect(() => {
    if (chatHistory.length === 0) handleCreateChat();
  }, []);

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
            <button className="chat-new-btn" onClick={handleCreateChat}>
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
