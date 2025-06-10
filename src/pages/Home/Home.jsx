import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer.jsx";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState("");
  const [currentReviewIndex, setCurrentReviewIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/prompt");
  };

  const reviews = [
    {
      id: 1,
      name: "박지민",
      rating: 4,
      content: "답변이 정확하고 빠르네요. 다음에도 꼭 이용할 것 같습니다.",
      date: "2024.03.13",
    },
    {
      id: 2,
      name: "김서연",
      rating: 5,
      content:
        "AI 챗봇과의 대화가 정말 자연스러워요. 궁금한 점을 바로바로 해결해주니 편리합니다.",
      date: "2024.03.15",
    },
    {
      id: 3,
      name: "이준호",
      rating: 5,
      content:
        "24시간 언제든지 상담이 가능해서 좋아요. 특히 비회원으로도 이용할 수 있어서 편리합니다.",
      date: "2024.03.14",
    },
    {
      id: 4,
      name: "최유진",
      rating: 5,
      content:
        "처음에는 반신반의했는데, 실제로 사용해보니 정말 유용하네요. 특히 건강 관련 상담이 도움이 많이 됐어요.",
      date: "2024.03.12",
    },
    {
      id: 5,
      name: "정민수",
      rating: 4,
      content:
        "응답 속도가 빠르고 정확해요. 다만 가끔 복잡한 질문에 대해서는 답변이 조금 늦어질 때가 있네요.",
      date: "2024.03.11",
    },
    {
      id: 6,
      name: "한소희",
      rating: 5,
      content:
        "친절하고 상세한 답변에 감동했어요. 특히 24시간 이용 가능하다는 점이 정말 좋습니다.",
      date: "2024.03.10",
    },
    {
      id: 7,
      name: "김태현",
      rating: 5,
      content:
        "비회원으로도 이용할 수 있어서 편리해요. 나중에 회원가입도 할 예정입니다.",
      date: "2024.03.09",
    },
  ];

  const getVisibleReviews = () => {
    const totalReviews = reviews.length;
    const prevIndex = (currentReviewIndex - 1 + totalReviews) % totalReviews;
    const nextIndex = (currentReviewIndex + 1) % totalReviews;

    return [
      { ...reviews[prevIndex], className: "prev" },
      { ...reviews[currentReviewIndex], className: "active" },
      { ...reviews[nextIndex], className: "next" },
    ];
  };

  // 자동 슬라이드
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning) {
        setCurrentReviewIndex((prev) =>
          prev < reviews.length - 1 ? prev + 1 : 0
        );
        setIsTransitioning(true);
        setTimeout(() => setIsTransitioning(false), 800);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isTransitioning]);

  return (
    <div className="home-container">
      <h1>
        <span className="highlight">'카라'</span> 로 한번에{" "}
        <span className="highlight-rent"> 랜트 </span>해보세요!
      </h1>
      <div className="content">
        <p>편리하게 상담하며 궁금한 모든 것을 해결하세요.</p>
        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="궁금한 내용을 입력하세요"
            className="text-input"
          />
          <div className="button-container">
            <button className="faq-button">자주 묻는 질문</button>
            <button type="submit" className="start-button">
              시작하기
            </button>
          </div>
        </form>
        <div className="features">
          <div className="feature-card">
            <div className="feature-icon">1</div>
            <h3>회원가입</h3>
            <p>
              소셜 로그인 또는 비회원으로
              <br />
              간편하게 시작하세요
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">2</div>
            <h3>대화 시작</h3>
            <p>
              AI 챗봇과 자유롭게
              <br />
              대화를 나눠보세요
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">3</div>
            <h3>맞춤형 응답</h3>
            <p>
              상황에 맞는 최적의 답변을
              <br />
              받아보세요
            </p>
          </div>
        </div>

        <div className="reviews-section">
          <h2>사용자 후기</h2>
          <div className="reviews-container">
            <div className="review-slider">
              {getVisibleReviews().map((review) => (
                <div
                  key={review.id}
                  className={`review-card ${review.className}`}>
                  <div className="review-header">
                    <div className="reviewer-info">
                      <span className="reviewer-name">{review.name}</span>
                      <div className="rating">
                        {[...Array(review.rating)].map((_, i) => (
                          <span key={i} className="star">
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="review-date">{review.date}</span>
                  </div>
                  <p className="review-content">{review.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Home;
