import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import IdVerificationModal from "../../components/IdVerificationModal/IdVerificationModal.jsx";
import ErrorPopup from "../../components/ErrorPopup/ErrorPopup";
import { SiNaver } from "react-icons/si";
import { FcGoogle } from "react-icons/fc";
import { RiKakaoTalkFill } from "react-icons/ri";
import api from "../../api/api.js";
import "./SignUp.css";

const SignUp = ({ isOpen, onClose, onSwitchLogin }) => {
  const navigate = useNavigate();
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [stepDirection, setStepDirection] = useState("right");
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    loginId: "",
    password: "",
    passwordConfirm: "",
    fullName: "", // 백엔드 DTO와 맞추기 위해 name → fullName으로 변경
    email: "",
    phoneNumber: "",
    birthDate: "", // 문자열로 관리. 백엔드에 보낼 때 ISO 형식(예: "1999-01-01")으로 변환
    address: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [stepError, setStepError] = useState("");

  const socialProviders = [
    {
      key: "kakao",
      icon: <RiKakaoTalkFill className="kakao-icon" />,
      className: "kakao",
    },
    { key: "google", icon: <FcGoogle />, className: "google" },
    { key: "naver", icon: <SiNaver />, className: "naver" },
  ];

  const handleSocialLogin = (provider) => {
    if (provider === "kakao") {
      const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
      if (!KAKAO_CLIENT_ID) {
        console.error("카카오 클라이언트 ID가 설정되지 않았습니다.");
        return;
      }
      const REDIRECT_URI = encodeURIComponent(
        "http://localhost:8080/api/v1/auth/kakao/callback"
      );
      console.log("카카오 로그인 요청:", { KAKAO_CLIENT_ID, REDIRECT_URI });
      window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    }
  };

  const handleVerificationComplete = () => {
    setIsVerificationModalOpen(false);
    onClose();
    navigate("/");
  };

  const handleVerificationClose = () => {
    setIsVerificationModalOpen(false);
    onClose();
    navigate("/");
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleErrorClose = () => {
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 생년월일 입력값을 ISO 형식(예: "1999-01-01")으로 변환하는 함수
  const formatBirthDate = (rawValue) => {
    // 예: "19990101" → "1999-01-01"
    if (rawValue.length === 8 && !isNaN(rawValue)) {
      return `${rawValue.substring(0, 4)}-${rawValue.substring(
        4,
        6
      )}-${rawValue.substring(6, 8)}`;
    }
    // 이미 ISO 형식이면 그대로 반환
    if (/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) {
      return rawValue;
    }
    // 그 외는 빈 문자열 또는 에러 처리
    return "";
  };

  const handleEnterNext = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (step === 1) {
        if (!form.loginId || !form.password || !form.passwordConfirm) {
          setStepError("모든 항목을 입력해 주세요.");
          return;
        }
        if (form.password !== form.passwordConfirm) {
          setPasswordError("비밀번호가 일치하지 않습니다.");
          setStepError("");
          return;
        } else {
          setPasswordError("");
          setStepError("");
        }
      }
      if (step === 2) {
        if (!form.fullName || !form.email) {
          setStepError("모든 항목을 입력해 주세요.");
          return;
        } else {
          setStepError("");
        }
      }
      if (step === 3) {
        if (!form.phoneNumber || !form.birthDate || !form.address) {
          setStepError("모든 항목을 입력해 주세요.");
          return;
        } else {
          setStepError("");
        }
      }
      if (step < 3) setStep(step + 1);
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!form.loginId || !form.password || !form.passwordConfirm) {
        setStepError("모든 항목을 입력해 주세요.");
        return;
      }
      if (form.password !== form.passwordConfirm) {
        setPasswordError("비밀번호가 일치하지 않습니다.");
        setStepError("");
        return;
      } else {
        setPasswordError("");
        setStepError("");
      }
    }
    if (step === 2) {
      if (!form.fullName || !form.email) {
        setStepError("모든 항목을 입력해 주세요.");
        return;
      } else {
        setStepError("");
      }
    }
    if (step === 3) {
      if (!form.phoneNumber || !form.birthDate || !form.address) {
        setStepError("모든 항목을 입력해 주세요.");
        return;
      } else {
        setStepError("");
      }
    }
    if (step < 3) {
      setStepDirection("right");
      setStep(step + 1);
    }
  };

  const handlePrev = (e) => {
    e.preventDefault();
    if (step > 1) {
      setStepDirection("left");
      setStep(step - 1);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    // 폼 유효성 검사
    if (
      !form.loginId ||
      !form.password ||
      !form.fullName ||
      !form.email ||
      !form.phoneNumber ||
      !form.birthDate ||
      !form.address
    ) {
      setError("모든 필드를 입력해주세요.");
      return;
    }

    if (form.password !== form.passwordConfirm) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
      return;
    }

    // 생년월일 유효성 검사 및 ISO 형식 변환
    const formattedBirthDate = formatBirthDate(form.birthDate);
    if (!formattedBirthDate) {
      setError(
        "생년월일 형식이 올바르지 않습니다. (예: 19990101 또는 1999-01-01)"
      );
      return;
    }

    setIsLoading(true);

    try {
      // 백엔드 회원가입 API 호출
      // 백엔드 DTO와 완전히 일치하는 필드명으로 보내야 함!
      await api.post("/api/v1/auth/signup", {
        loginId: form.loginId,
        password: form.password,
        name: form.fullName, // 백엔드 컨트롤러에서 req.getName()으로 받으므로, name으로 보내야 함
        email: form.email,
        phoneNumber: form.phoneNumber,
        birthDate: formattedBirthDate, // ISO 형식으로 변환된 값 사용
        address: form.address,
      });

      // 회원가입 성공 시 본인인증 모달 표시
      setIsVerificationModalOpen(true);
    } catch (err) {
      console.error("회원가입 오류:", err);

      if (err.response) {
        // 서버에서 응답이 왔지만 오류 상태 코드인 경우
        if (err.response.status === 409) {
          setError("이미 사용 중인 아이디입니다.");
        } else {
          setError(
            err.response.data?.message ||
              "회원가입 처리 중 오류가 발생했습니다."
          );
        }
      } else if (err.request) {
        // 요청이 전송되었지만 응답이 없는 경우
        setError("서버와 통신할 수 없습니다. 네트워크 연결을 확인해주세요.");
      } else {
        // 요청 설정 중 오류가 발생한 경우
        setError("회원가입 요청 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  function renderStepFields() {
    let slideClass = "signup-step-fields";
    if (stepDirection === "right") slideClass += " slide-in-right";
    if (stepDirection === "left") slideClass += " slide-in-left";
    switch (step) {
      case 1:
        return (
          <div className={slideClass} key={step}>
            <div className="signup-form-group">
              <label htmlFor="loginId">로그인ID</label>
              <input
                type="text"
                name="loginId"
                id="loginId"
                value={form.loginId}
                onChange={handleInputChange}
                placeholder="아이디를 입력하세요"
                required
                onKeyDown={handleEnterNext}
              />
            </div>
            <div className="signup-form-group">
              <label htmlFor="password">비밀번호</label>
              <input
                type="password"
                name="password"
                id="password"
                value={form.password}
                onChange={handleInputChange}
                placeholder="비밀번호를 입력하세요"
                required
                onKeyDown={handleEnterNext}
              />
            </div>
            <div className="signup-form-group">
              <label htmlFor="passwordConfirm">비밀번호 확인</label>
              <input
                type="password"
                name="passwordConfirm"
                id="passwordConfirm"
                value={form.passwordConfirm}
                onChange={handleInputChange}
                placeholder="비밀번호를 다시 입력하세요"
                required
                onKeyDown={handleEnterNext}
              />
              {passwordError && (
                <div
                  style={{
                    color: "#ff4d4f",
                    fontSize: "0.88rem",
                    marginTop: "0.2rem",
                  }}>
                  {passwordError}
                </div>
              )}
            </div>
            {stepError && (
              <div
                style={{
                  color: "#ff4d4f",
                  fontSize: "0.88rem",
                  marginTop: "0.2rem",
                }}>
                {stepError}
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className={slideClass} key={step}>
            <div className="signup-form-group">
              <label htmlFor="fullName">이름</label>
              <input
                type="text"
                name="fullName"
                id="fullName"
                value={form.fullName}
                onChange={handleInputChange}
                placeholder="이름을 입력하세요"
                required
                onKeyDown={handleEnterNext}
              />
            </div>
            <div className="signup-form-group">
              <label htmlFor="email">이메일</label>
              <input
                type="email"
                name="email"
                id="email"
                value={form.email}
                onChange={handleInputChange}
                placeholder="이메일을 입력하세요"
                required
                onKeyDown={handleEnterNext}
              />
            </div>
            {stepError && (
              <div
                style={{
                  color: "#ff4d4f",
                  fontSize: "0.88rem",
                  marginTop: "0.2rem",
                }}>
                {stepError}
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className={slideClass} key={step}>
            <div className="signup-form-group">
              <label htmlFor="phoneNumber">핸드폰번호</label>
              <input
                type="tel"
                name="phoneNumber"
                id="phoneNumber"
                value={form.phoneNumber}
                onChange={handleInputChange}
                placeholder="휴대폰 번호를 입력하세요"
                required
              />
            </div>
            <div className="signup-form-group">
              <label htmlFor="birthDate">생년월일</label>
              <input
                type="text"
                name="birthDate"
                id="birthDate"
                value={form.birthDate}
                onChange={handleInputChange}
                placeholder="예: 19990101 또는 1999-01-01"
                required
              />
            </div>
            <div className="signup-form-group">
              <label htmlFor="address">주소</label>
              <input
                type="text"
                name="address"
                id="address"
                value={form.address}
                onChange={handleInputChange}
                placeholder="주소를 입력하세요"
                required
              />
            </div>
            {stepError && (
              <div
                style={{
                  color: "#ff4d4f",
                  fontSize: "0.88rem",
                  marginTop: "0.2rem",
                }}>
                {stepError}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  }

  if (!isOpen) return null;

  return (
    <div className="signup-overlay" onClick={handleOverlayClick}>
      <div className="signup-container" onClick={(e) => e.stopPropagation()}>
        <h1 className="signup-title">회원가입</h1>
        <div className="signup-divider" />
        <form
          className="signup-form"
          onSubmit={handleSignUp}
          autoComplete="off">
          {renderStepFields()}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              marginTop: "0.5rem",
            }}>
            {step > 1 ? (
              <button
                type="button"
                className="signup-button"
                style={{ width: "48%" }}
                onClick={handlePrev}>
                이전
              </button>
            ) : (
              <div />
            )}
            {step < 3 ? (
              <button
                type="button"
                className="signup-button"
                style={{ width: step > 1 ? "48%" : "100%" }}
                onClick={handleNext}>
                다음
              </button>
            ) : (
              <button
                className="signup-button"
                type="submit"
                style={{ width: step > 1 ? "48%" : "100%" }}
                disabled={isLoading}>
                {isLoading ? "처리 중..." : "회원가입"}
              </button>
            )}
          </div>
          <div className="social-login-title">소셜로그인으로 함께하기</div>
          <div className="social-login social-row">
            {socialProviders.map(({ key, icon, className }) => (
              <button
                key={key}
                className={`social-button ${className}`}
                type="button"
                onClick={() => handleSocialLogin(key)}>
                {icon}
              </button>
            ))}
          </div>
          <div className="signup-divider" />
        </form>
        <div className="login-link-row">
          <span>기존 회원이신가요?</span>
          <button className="login-link" type="button" onClick={onSwitchLogin}>
            로그인하러가기
          </button>
        </div>
        <ErrorPopup error={error} onClose={handleErrorClose} />
      </div>
      {isVerificationModalOpen && (
        <IdVerificationModal
          isOpen={isVerificationModalOpen}
          onClose={handleVerificationClose}
          onVerify={handleVerificationComplete}
        />
      )}
    </div>
  );
};

export default SignUp;
