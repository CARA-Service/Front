import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Prompt.css";

const chatHistoryDummy = [
  {
    id: 1,
    title: "Chat 1",
    messages: [
      { text: "안녕하세요!", mine: false },
      { text: "제주도 여행은 언제?", mine: true },
      { text: "날짜를 선택해 주세요.", mine: false },
    ],
  },
  {
    id: 2,
    title: "Chat 2",
    messages: [
      { text: "GPT야, 너 뭐 할 수 있어?", mine: false },
      { text: "저는 다양한 질문에 답변할 수 있어요!", mine: true },
    ],
  },
  {
    id: 3,
    title: "Chat 3",
    messages: [
      { text: "오늘 할 일 알려줘.", mine: false },
      { text: "1. 공부하기\n2. 운동하기\n3. 산책하기", mine: true },
    ],
  },
];

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
  const [chatHistory, setChatHistory] = useState(chatHistoryDummy);
  const [selectedChat, setSelectedChat] = useState(chatHistoryDummy[0].id);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setChatHistory((prev) =>
      prev.map((chat) =>
        chat.id === selectedChat
          ? {
              ...chat,
              messages: [...chat.messages, { text: input, mine: true }],
            }
          : chat
      )
    );
    setInput("");
  };

  return (
    <div className="chat-root">
      <aside className="chat-sidebar">
        <h2>채팅 내역</h2>
        <ul>
          {chatHistory.map((chat) => (
            <li
              key={chat.id}
              className={selectedChat === chat.id ? "active" : ""}
              onClick={() => setSelectedChat(chat.id)}>
              {chat.title}
            </li>
          ))}
        </ul>
      </aside>
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
