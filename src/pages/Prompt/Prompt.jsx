import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import {parseRecommendationInput } from "../../utils/parseRecommendationInput.js"
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Prompt.css";

import { postRecommendation } from '../../api/llmAPI.js';


// const chatHistoryDummy = [
//   {
//     id: 1,
//     title: "Chat 1",
//     messages: [
//       { text: "안녕하세요!", mine: false },
//       { text: "제주도 여행은 언제?", mine: true },
//       { text: "날짜를 선택해 주세요.", mine: false },
//     ],
//   },
//   {
//     id: 2,
//     title: "Chat 2",
//     messages: [
//       { text: "GPT야, 너 뭐 할 수 있어?", mine: false },
//       { text: "저는 다양한 질문에 답변할 수 있어요!", mine: true },
//     ],
//   },
//   {
//     id: 3,
//     title: "Chat 3",
//     messages: [
//       { text: "오늘 할 일 알려줘.", mine: false },
//       { text: "1. 공부하기\n2. 운동하기\n3. 산책하기", mine: true },
//     ],
//   },
// ];

function formatRange(start, end) {
  const format = (date) =>
    `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}.${String(date.getDate()).padStart(2, "0")}`;
  return start && end ? `${format(start)}~${format(end)}` : format(start);
}

const Prompt = () => {
  const [input, setInput] = useState("");
  // const [chatHistory, setChatHistory] = useState(chatHistoryDummy);
  // const [selectedChat, setSelectedChat] = useState(chatHistoryDummy[0].id);
  const [chatHistory, setChatHistory] = useState([]); // 더미 데이터 제거
  const [selectedChat, setSelectedChat] = useState(null); // 초기값을 null로 설정
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);
  const [calendarMsgIdx, setCalendarMsgIdx] = useState(null);

  // 스크롤을 위한 ref
  const messagesEndRef = useRef(null);

  // 현재 채팅방의 메시지
  const currentMessages =
    chatHistory.find((chat) => chat.id === selectedChat)?.messages || [];

  // 날짜 질문 메시지 위치 찾기
  useEffect(() => {
    const idx = currentMessages.findIndex(
      (msg) => !msg.mine && /언제|날짜|date|when/i.test(msg.text)
    );
    if (idx !== -1) {
      setShowCalendar(true);
      setCalendarMsgIdx(idx);
    } else {
      setShowCalendar(false);
      setCalendarMsgIdx(null);
    }
    setDateRange([null, null]);
  }, [selectedChat, currentMessages.length]);

  // 날짜 범위가 모두 선택되면 자동 전송
  useEffect(() => {
    if (dateRange[0] && dateRange[1]) {
      const rangeText = formatRange(dateRange[0], dateRange[1]);
      setChatHistory((prev) =>
        prev.map((chat) =>
          chat.id === selectedChat
            ? {
                ...chat,
                messages: [...chat.messages, { text: rangeText, mine: true }],
              }
            : chat
        )
      );
      setInput("");
      setShowCalendar(false);
      setDateRange([null, null]);
    }
  }, [dateRange, selectedChat]);

  // 채팅 입력/변경 시 스크롤 맨 아래로 이동
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [currentMessages.length, showCalendar]);

  // 채팅방 선택
  useEffect(() => {
    if (chatHistory.length > 0 && selectedChat === null) {
      setSelectedChat(chatHistory[0].id); // 첫 번째 채팅방을 기본값으로 선택
    }
  }, [chatHistory, selectedChat]);

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!input.trim()) return;

  const userMessage = { text: input, mine: true };

  // 🔑 실제로 메시지를 넣을 채팅방 ID를 기억
  let activeChatId = selectedChat;

  // case 1: 기존 채팅방이 선택된 상태
  if (selectedChat !== null) {
    setChatHistory((prev) =>
      prev.map((chat) =>
        chat.id === selectedChat
          ? {
              ...chat,
              messages: [...chat.messages, userMessage],
            }
          : chat
      )
    );
  } else {
    // case 2: 채팅방이 없으면 새로 만들고, 그 ID를 기억
    const newId = Date.now();
    activeChatId = newId;
    setChatHistory((prev) => [
      ...prev,
      { id: newId, messages: [userMessage] },
    ]);
    setSelectedChat(newId); // selectedChat도 업데이트
  }
  const payload = parseRecommendationInput(input);
  console.log(input)
  console.log(payload)
  if (!payload) {
    setChatHistory((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                { text: "죄송합니다. 차량 관련 질문만 도와드릴 수 있어요.", mine: false }
              ],
            }
          : chat
      )
    );
    setInput("");
    return;
  }


  try {
    const data = await postRecommendation(payload);
    let replyMessage = "";
    if (Array.isArray(data)) {
      replyMessage =
        data[0]?.modelName === "죄송합니다. 현재는 렌터카 관련 질문만 도와드릴 수 있습니다."
          ? data[0].modelName
          : data
              .map((item) =>
                `모델: ${item.modelName}, 연료: ${item.fuelType}, 연비: ${item.fuelEfficiency}, 가격: ${item.totalPrice}`
              )
              .join("\n");
    } else {
      replyMessage = data.message || "죄송합니다. 알 수 없는 오류가 발생했습니다.";
    }
  
      setChatHistory((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId
          ? {
              ...chat,
              messages: [...chat.messages, { text: replyMessage, mine: false }],
            }
          : chat
      )
    );

  } catch (err) {
    console.error(err);
  }

  setInput("");
};


  return (
    <div className="chat-root">
      <aside className="chat-sidebar">
        <h2>채팅 내역</h2>
        <ul>
          {/* 채팅방 목록 렌더링 */}
          {chatHistory.map((chat) => (
            <li
              key={chat.id}
              className={selectedChat === chat.id ? "active" : ""}
              onClick={() => setSelectedChat(chat.id)}
            >
              Chat {chat.id}
            </li>
          ))}
        </ul>
      </aside>
      <div className="chat-main">
        <div className="chat-messages" ref={messagesEndRef}>
          {/* {currentMessages.map((msg, idx) => ( */}
           {/* 채팅방 메시지 렌더링 */}
           {selectedChat && chatHistory.length > 0 &&
            chatHistory.find((chat) => chat.id === selectedChat)?.messages.map((msg, idx) => (
            <React.Fragment key={idx}>
              <div className={`chat-message${msg.mine ? " mine" : ""}`}>
                {msg.text.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
              </div>
              {showCalendar && calendarMsgIdx === idx && (
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
                  <div className="calendar-tip">
                    날짜를 두 번 클릭해 기간을 선택하세요
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
