import React, { useState, useEffect, useRef } from "react";
import PromptHeader from "../../components/PromptHeader/PromptHeader.jsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Prompt.css";
import use400px from "../../hooks/use400px";
import { postRecommendation } from "../../api/llmAPI.js";
import { parseRecommendationInput } from "../../utils/parseRecommendationInput.js";

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
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);
  const [calendarMsgIdx, setCalendarMsgIdx] = useState(null);
  const is400px = use400px();
  const messagesEndRef = useRef(null);

  const handleSelectChat = (chatId) => {
    setSelectedChat(chatId);
  };

  const currentMessages =
    chatHistory.find((chat) => chat.id === selectedChat)?.messages || [];

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

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [currentMessages.length, showCalendar]);

  useEffect(() => {
    if (chatHistory.length > 0 && selectedChat === null) {
      setSelectedChat(chatHistory[0].id);
    }
  }, [chatHistory, selectedChat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, mine: true };
    let activeChatId = selectedChat;

    if (selectedChat !== null) {
      setChatHistory((prev) =>
        prev.map((chat) =>
          chat.id === selectedChat
            ? { ...chat, messages: [...chat.messages, userMessage] }
            : chat
        )
      );
    } else {
      const newId = Date.now();
      activeChatId = newId;
      setChatHistory((prev) => [
        ...prev,
        { id: newId, messages: [userMessage] },
      ]);
      setSelectedChat(newId);
    }

    const payload = parseRecommendationInput(input);
    if (!payload) {
      setChatHistory((prev) =>
        prev.map((chat) =>
          chat.id === activeChatId
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  {
                    text: "죄송합니다. 차량 관련 질문만 도와드릴 수 있어요.",
                    mine: false,
                  },
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
          data[0]?.modelName ===
          "죄송합니다. 현재는 렌터카 관련 질문만 도와드릴 수 있습니다."
            ? data[0].modelName
            : data
                .map(
                  (item) =>
                    `모델: ${item.modelName}, 연료: ${item.fuelType}, 연비: ${item.fuelEfficiency}, 가격: ${item.totalPrice}`
                )
                .join("\n");
      } else {
        replyMessage =
          data.message || "죄송합니다. 알 수 없는 오류가 발생했습니다.";
      }

      setChatHistory((prev) =>
        prev.map((chat) =>
          chat.id === activeChatId
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  { text: replyMessage, mine: false },
                ],
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
      {is400px && (
        <PromptHeader
          // onSignUpClick={/* 회원가입 핸들러 */}
          chatHistory={chatHistory}
          onSelectChat={handleSelectChat}
        />
      )}
      {!is400px && (
        <aside className="chat-sidebar">
          <h2>채팅 내역</h2>
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
          {selectedChat &&
            chatHistory.length > 0 &&
            chatHistory
              .find((chat) => chat.id === selectedChat)
              ?.messages.map((msg, idx) => (
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
