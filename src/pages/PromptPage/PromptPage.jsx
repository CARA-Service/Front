import React, { useState, useEffect, useRef } from "react";
import PromptHeader from "../../components/PromptHeader/PromptHeader.jsx";
import DatePicker, { registerLocale } from "react-datepicker";
import ko from "date-fns/locale/ko";
import "react-datepicker/dist/react-datepicker.css";
import CarItemCard from "../../components/CarItemCard/CarItemCard.jsx";
import "../../components/CarItemCard/CarItemCard.css";
import Header from "../../components/Header/Header.jsx";
import "./PromptPage.css";
import use500px from "../../hooks/use500px.jsx";
import SignUp from "../SignUp/SignUp.jsx";
import Login from "../Login/Login.jsx";
import { HiArrowUp } from "react-icons/hi";
import { AiOutlinePlus, AiOutlineDelete } from "react-icons/ai";
import { MdClearAll } from "react-icons/md";
import {
  getRecommendations,
  transformRecommendationData,
} from "../../api/recommendationAPI.js";
import {
  getAgenciesByLocation,
  getAllAgencies,
  transformAgencyData,
} from "../../api/agencyAPI.js";
import { useAuth } from "../../contexts/AuthContext.jsx";

registerLocale("ko", ko);

const RENTAL_CAR_LOCATIONS = [
  { name: "제주공항 렌트카", address: "제주특별자치도 제주시 공항로 2" },
  { name: "행복 렌트카", address: "제주특별자치도 제주시 삼성로9길 27" },
  {
    name: "제주 로얄 렌트카",
    address: "제주특별자치도 제주시 용담일동 2823-7",
  },
];

const REQUIRED_DOCS = [
  "운전면허증 (만 21세 이상, 운전 경력 1년 이상)",
  "본인 명의 신용카드",
  "예약 확인증",
];

const Prompt = () => {
  const { user, loading } = useAuth(); // 인증 상태 가져오기
  const [input, setInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  // 채팅 내역 localStorage에서 불러오기
  useEffect(() => {
    const loadChatHistory = () => {
      try {
        const savedHistory = localStorage.getItem('chatHistory');
        const savedSelectedChat = localStorage.getItem('selectedChat');

        if (savedHistory) {
          const parsedHistory = JSON.parse(savedHistory);
          setChatHistory(parsedHistory);

          // 선택된 채팅이 있고, 해당 채팅이 존재하면 복원
          if (savedSelectedChat && parsedHistory.find(chat => chat.id === parseInt(savedSelectedChat))) {
            setSelectedChat(parseInt(savedSelectedChat));
          } else if (parsedHistory.length > 0) {
            // 저장된 선택 채팅이 없으면 첫 번째 채팅 선택
            setSelectedChat(parsedHistory[0].id);
          }
        }
      } catch (error) {
        console.error('채팅 내역 로드 실패:', error);
      }
    };

    loadChatHistory();
  }, []);

  // 채팅 내역이 변경될 때마다 localStorage에 저장
  useEffect(() => {
    if (chatHistory.length > 0) {
      try {
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
      } catch (error) {
        console.error('채팅 내역 저장 실패:', error);
      }
    }
  }, [chatHistory]);

  // 선택된 채팅이 변경될 때마다 localStorage에 저장
  useEffect(() => {
    if (selectedChat !== null) {
      try {
        localStorage.setItem('selectedChat', selectedChat.toString());
      } catch (error) {
        console.error('선택된 채팅 저장 실패:', error);
      }
    }
  }, [selectedChat]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);
  const [showMap, setShowMap] = useState(false);
  const [showCars, setShowCars] = useState(false);
  const [recommendedCars, setRecommendedCars] = useState([]); // API에서 받은 추천 차량
  const [isLoadingRecommendations, setIsLoadingRecommendations] =
    useState(false); // 로딩 상태
  const [currentAgencies, setCurrentAgencies] = useState([]); // 현재 표시할 지점들
  const [currentLocation, setCurrentLocation] = useState("제주도"); // 현재 지역
  const [gptRecommendationMessage, setGptRecommendationMessage] = useState(""); // GPT 추천 메시지
  const is500px = use500px();
  const messagesEndRef = useRef(null);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false); // 해더 추가용
  const [isLoginOpen, setIsLoginOpen] = useState(false); // 로그인 모달
  const [pendingUserInput, setPendingUserInput] = useState(""); // 로그인 대기 중인 사용자 입력

  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);

  const carItemRefs = useRef([]); // 차량 자세히 보기시 화면 가운데로 이동

  const currentMessages =
    chatHistory.find((chat) => chat.id === selectedChat)?.messages || [];

  // 로그인 성공 후 대기 중인 추천 요청 처리
  useEffect(() => {
    if (user && pendingUserInput && !loading) {
      console.log('✅ 로그인 완료 - 대기 중인 추천 요청 처리:', pendingUserInput);

      addMessage({
        text: "로그인이 완료되었습니다! 차량 추천을 진행하겠습니다.",
        mine: false
      });

      // 차량 관련 질문인지 확인
      const isCarRelated = isCarRentalRelated(pendingUserInput);

      if (isCarRelated) {
        // 캘린더 표시
        addMessage({
          text: "언제부터 언제까지 이용하시겠어요?",
          mine: false,
          showCalendarAfter: true,
        });

        // 캘린더 안내 메시지 추가
        setTimeout(() => {
          addMessage({
            text: "📅 날짜를 선택해주세요",
            mine: false,
          });
        }, 500);

        setShowCalendar(true);
        setShowMap(false);
        setShowCars(false);
      } else {
        // 직접 API 호출
        setTimeout(() => {
          fetchRecommendations(pendingUserInput);
        }, 1000);
      }

      setPendingUserInput(""); // 처리 완료 후 초기화
    }
  }, [user, pendingUserInput, loading]);

  // 사용자 상태 변화 감지 (로그아웃 감지)
  useEffect(() => {
    console.log('👤 사용자 상태 변화 감지:', { user, loading, token: localStorage.getItem('token') });

    // 로그아웃된 경우 (토큰이 없고 로딩이 완료된 상태)
    if (!user && !loading && !localStorage.getItem('token')) {
      console.log('🚪 로그아웃 감지됨 - 모든 UI 상태 초기화');

      // 진행 중인 요청 취소
      setPendingUserInput("");
      setIsLoadingRecommendations(false);

      // UI 상태 완전 초기화
      setShowCalendar(false);
      setShowMap(false);
      setShowCars(false);
      setRecommendedCars([]);
      setCurrentAgencies([]);
      setCurrentLocation("제주도");
      setDateRange([null, null]);
      setGptRecommendationMessage("");

      // 입력창도 초기화
      setInput("");

      // 모든 채팅 메시지의 UI 플래그 제거
      setChatHistory((prev) =>
        prev.map((chat) => ({
          ...chat,
          messages: chat.messages.map((msg) => ({
            ...msg,
            showCalendarAfter: false,
            showMapAfter: false,
            showCarsAfter: false,
          })),
        }))
      );

      console.log('✅ 로그아웃 후 UI 상태 및 메시지 플래그 초기화 완료');
    }
  }, [user, loading]);

  // localStorage 변화 감지 (다른 탭에서 로그아웃 시에도 반응)
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      if (!token && user) {
        console.log('🔄 다른 탭에서 로그아웃 감지됨');
        // AuthContext의 logout이 호출되어 user 상태가 업데이트됨
      }
    };

    window.addEventListener('storageChange', handleStorageChange);
    return () => window.removeEventListener('storageChange', handleStorageChange);
  }, [user]);

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
      center: new window.kakao.maps.LatLng(33.5027469615008, 126.508826280302),
      level: 7,
    };
    map.current = new window.kakao.maps.Map(mapContainer.current, mapOption);
    console.log("지도 새로 생성됨:", map.current);

    // 마커 생성 (동적 지점 사용)
    const geocoder = new window.kakao.maps.services.Geocoder();
    const locationsToUse =
      currentAgencies.length > 0 ? currentAgencies : RENTAL_CAR_LOCATIONS;

    locationsToUse.forEach((location) => {
      // API에서 받은 데이터는 latitude/longitude가 있고, 기본 데이터는 address 검색 필요
      if (location.latitude && location.longitude) {
        // API 데이터: 직접 좌표 사용
        const coords = new window.kakao.maps.LatLng(
          location.latitude,
          location.longitude
        );
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
            const coords = new window.kakao.maps.LatLng(
              result[0].y,
              result[0].x
            );
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
    // 디버깅 로그 추가
    console.log('🔍 fetchRecommendations 호출됨');
    console.log('👤 현재 사용자 상태:', { user, loading });
    console.log('🎫 현재 토큰:', localStorage.getItem("token"));

    // 토큰과 사용자 상태 재검증
    const token = localStorage.getItem("token");
    if (!token || !user) {
      console.log('❌ 토큰 또는 사용자 정보 없음 - API 호출 중단');
      addMessage({
        text: "🔐 인증이 필요합니다. 다시 로그인해주세요.",
        mine: false,
        showLoginButton: true
      });
      return [];
    }

    console.log('✅ 사용자 로그인 확인됨, API 호출 시작');

    setIsLoadingRecommendations(true);
    try {
      const apiResponse = await getRecommendations(userInput);
      const { cars, gptMessage } = transformRecommendationData(apiResponse);
      setRecommendedCars(cars);
      setGptRecommendationMessage(gptMessage);
      return cars;
    } catch (error) {
      console.error("추천 API 호출 실패:", error);

      // 401 에러 (인증 실패) 처리
      if (error.response?.status === 401) {
        console.log('🔐 401 인증 오류 - 로그아웃 처리');
        addMessage({
          text: "🔐 인증이 만료되었습니다. 다시 로그인해주세요.",
          mine: false,
          showLoginButton: true
        });
        // 자동 로그아웃 처리는 AuthContext의 인터셉터에서 처리됨
      } else if (error.response?.status === 400) {
        console.log('❌ 400 Bad Request - 요청 데이터 오류');
        addMessage({
          text: "❌ 요청 처리 중 오류가 발생했습니다. 로그인 상태를 확인해주세요.",
          mine: false,
          showLoginButton: true
        });
      } else {
        console.log('❌ 기타 오류:', error.response?.status);
        addMessage({
          text: "❌ 차량 추천 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
          mine: false
        });
      }

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
      console.log(`📊 ${location} 지역 조회 결과: ${agencies.length}개 지점`);
      const transformedAgencies = transformAgencyData(agencies);

      // 지점이 없는 경우 폴백 로직
      if (agencies.length === 0) {
        console.log(`❌ ${location} 지역에 지점이 없음, 폴백 시도...`);

        // 폴백 매핑 테이블
        const fallbackMap = {
          홍대: "서울",
          강남: "서울",
          마포: "서울",
          수원: "경기",
          인천: "서울",
        };

        const fallbackLocation = fallbackMap[location] || "서울"; // 기본 서울 폴백
        console.log(`🗺️ 폴백 매핑: ${location} → ${fallbackLocation}`);

        if (fallbackLocation !== location) {
          console.log(`🔄 폴백 실행: ${location} → ${fallbackLocation}`);
          try {
            const fallbackAgencies = await getAgenciesByLocation(
              fallbackLocation
            );
            console.log(`📊 폴백 조회 결과: ${fallbackAgencies.length}개 지점`);

            if (fallbackAgencies.length > 0) {
              console.log(
                `✅ 폴백 성공: ${fallbackLocation}에서 ${fallbackAgencies.length}개 지점 발견`
              );
              const transformedFallbackAgencies =
                transformAgencyData(fallbackAgencies);
              setCurrentAgencies(transformedFallbackAgencies);
              setCurrentLocation(fallbackLocation);

              // 폴백 안내 메시지
              setTimeout(() => {
                addMessage({
                  text: `💡 ${location} 지역에는 직접적인 렌터카 지점이 없어서, 인근 ${fallbackLocation} 지역의 지점들을 안내해드립니다.`,
                  mine: false,
                });
              }, 1000);

              return {
                agencies: transformedFallbackAgencies,
                actualLocation: fallbackLocation,
              };
            } else {
              console.log(
                `❌ 폴백도 실패: ${fallbackLocation}에도 지점이 없음`
              );
            }
          } catch (fallbackError) {
            console.error(`❌ 폴백 API 호출 실패:`, fallbackError);
          }
        } else {
          console.log(`⚠️ 폴백 불가: ${location}은 이미 기본 지역`);
        }
      } else {
        console.log(
          `✅ ${location} 지역에서 ${agencies.length}개 지점 발견, 폴백 불필요`
        );
      }

      setCurrentAgencies(transformedAgencies);

      // 실제 조회된 지점들의 지역 확인
      let actualLocation = location;
      if (agencies.length > 0) {
        // 첫 번째 지점의 이름에서 실제 지역 추출
        const firstAgencyName = agencies[0].agencyName;
        if (firstAgencyName.includes("서울")) actualLocation = "서울";
        else if (firstAgencyName.includes("부산")) actualLocation = "부산";
        else if (firstAgencyName.includes("제주")) actualLocation = "제주";
        // 필요시 다른 지역들도 추가
      }

      setCurrentLocation(actualLocation);
      console.log(
        `🏢 ${location} → ${actualLocation} 지점 ${transformedAgencies.length}개 로딩 완료`
      );
      return { agencies: transformedAgencies, actualLocation };
    } catch (error) {
      console.error("지점 조회 실패:", error);
      // 에러 시 기본 제주도 지점 사용
      setCurrentAgencies([
        { name: "제주공항 렌트카", address: "제주특별자치도 제주시 공항로 2" },
        { name: "행복 렌트카", address: "제주특별자치도 제주시 삼성로9길 27" },
        {
          name: "제주 로얄 렌트카",
          address: "제주특별자치도 제주시 용담일동 2823-7",
        },
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
    const seoulDistricts = [
      "강남",
      "강북",
      "강서",
      "강동",
      "관악",
      "광진",
      "구로",
      "금천",
      "노원",
      "도봉",
      "동대문",
      "동작",
      "마포",
      "서대문",
      "서초",
      "성동",
      "성북",
      "송파",
      "양천",
      "영등포",
      "용산",
      "은평",
      "종로",
      "중구",
      "중랑",
      "홍대",
    ];

    // 서울 구 단위 체크
    for (const district of seoulDistricts) {
      if (userInput.includes(district)) {
        console.log(`🗺️ 서울 ${district} 지역 인식 → 서울로 매핑`);
        return "서울";
      }
    }

    // 광역시/도 단위 체크
    const locations = [
      "서울",
      "부산",
      "대구",
      "인천",
      "광주",
      "대전",
      "울산",
      "세종",
      "제주",
      "경기",
      "강원",
      "충북",
      "충남",
      "전북",
      "전남",
      "경북",
      "경남",
      "제주도",
    ];

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
      "여행",
      "렌트카",
      "렌터카",
      "차량",
      "추천",
      "예약",
      "서울",
      "부산",
      "대구",
      "인천",
      "광주",
      "대전",
      "울산",
      "세종",
      "제주",
      "경기",
      "강원",
      "충북",
      "충남",
      "전북",
      "전남",
      "경북",
      "경남",
      "자동차",
      "승용차",
      "SUV",
      "세단",
      "해치백",
    ];

    return keywords.some((keyword) => userInput.includes(keyword));
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
      agencies.forEach((agency) => {
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
      const currentChat = chatHistory.find((chat) => chat.id === selectedChat);
      const userMessages =
        currentChat?.messages.filter((msg) => msg.mine) || [];
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
      fetchAgenciesByLocation(location)
        .then((result) => {
          const actualLocation = result.actualLocation;
          console.log(`🔄 지점 조회 완료: ${location} → ${actualLocation}`);

          // 실제 지역으로 차량 추천 API 호출
          const fullUserInput = `${actualLocation}에서 차량 추천해줘 ${format(
            start
          )}부터 ${format(end)}까지`;
          console.log("🚗 API 호출 입력 (실제 지역):", fullUserInput);

          return fetchRecommendations(fullUserInput);
        })
        .then((cars) => {
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
    setGptRecommendationMessage("");
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
    setGptRecommendationMessage("");
  };

  // 채팅 내역 전체 삭제
  const handleClearAllChats = () => {
    if (window.confirm('모든 채팅 내역을 삭제하시겠습니까?')) {
      setChatHistory([]);
      setSelectedChat(null);
      localStorage.removeItem('chatHistory');
      localStorage.removeItem('selectedChat');

      // 상태 초기화
      setShowCalendar(false);
      setShowMap(false);
      setShowCars(false);
      setRecommendedCars([]);
      setCurrentAgencies([]);
      setCurrentLocation("제주도");
      setDateRange([null, null]);
      setGptRecommendationMessage("");
    }
  };

  // 개별 채팅 삭제
  const handleDeleteChat = (chatId) => {
    if (window.confirm('이 채팅을 삭제하시겠습니까?')) {
      const updatedHistory = chatHistory.filter(chat => chat.id !== chatId);
      setChatHistory(updatedHistory);

      // 삭제된 채팅이 현재 선택된 채팅이면 다른 채팅 선택
      if (selectedChat === chatId) {
        if (updatedHistory.length > 0) {
          setSelectedChat(updatedHistory[0].id);
        } else {
          setSelectedChat(null);
          localStorage.removeItem('selectedChat');
        }
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 맨 먼저 로그인 상태 확인 (다른 로직 실행 전에)
    if (!loading && !user) {
      console.log('❌ 로그인되지 않은 상태에서 입력 시도');

      // 사용자 메시지만 추가 (봇 응답은 추가하지 않음)
      if (chatHistory.length === 0) {
        handleCreateChat({ text: input, mine: true });
      } else {
        addMessage({ text: input, mine: true });
      }

      // 로그인 필요 메시지 및 모달 표시
      addMessage({
        text: "🔐 차량 추천 서비스를 이용하려면 로그인이 필요합니다.",
        mine: false
      });

      setPendingUserInput(input);
      setTimeout(() => {
        setIsLoginOpen(true);
      }, 1000);

      setInput("");
      return; // 여기서 함수 종료 - 아래 로직 실행 안 함
    }

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
        // 캘린더 안내 메시지 추가
        setTimeout(() => {
          addMessage({
            text: "📅 날짜를 선택해주세요",
            mine: false,
          });
        }, 500);

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

        // 캘린더 안내 메시지 추가
        setTimeout(() => {
          addMessage({
            text: "📅 날짜를 선택해주세요",
            mine: false,
          });
        }, 500);

        setShowCalendar(true);
      } else {
        // 렌터카 관련이 아닌 질문이지만 API 호출 시도
        addMessage({
          text: "질문을 확인하고 있습니다...",
          mine: false,
        });

        // API 호출
        fetchRecommendations(input)
          .then((cars) => {
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
                  console.log(
                    `🔄 지역 변경: ${location} → ${actualLocation}, 차량 재추천 필요`
                  );
                  // 실제 지역으로 차량 재추천
                  const newInput = input.replace(location, actualLocation);
                  return fetchRecommendations(newInput);
                }
              });
            }
          })
          .catch((error) => {
            console.error("API 호출 에러:", error);
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
      {is500px && (
        <PromptHeader
          chatHistory={chatHistory}
          onSelectChat={handleSelectChat}
          onCreateChat={handleCreateChat}
        />
      )}
      {!is500px && (
        <aside className="chat-sidebar">
          <Header onSignUpClick={() => setIsSignUpOpen(true)} />
          <div className="chat-sidebar-header">
            <h2>채팅 내역</h2>
            <div className="chat-header-buttons">
              <button
                className="chat-clear-btn"
                onClick={handleClearAllChats}
                title="모든 채팅 삭제"
              >
                <MdClearAll size={18} />
              </button>
              <button className="chat-new-btn" onClick={() => handleCreateChat()}>
                <AiOutlinePlus size={20} />
              </button>
            </div>
          </div>
          <ul>
            {chatHistory.map((chat) => (
              <li
                key={chat.id}
                className={selectedChat === chat.id ? "active" : ""}
              >
                <div
                  className="chat-item-content"
                  onClick={() => setSelectedChat(chat.id)}
                >
                  Chat {chat.id}
                </div>
                <button
                  className="chat-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChat(chat.id);
                  }}
                  title="채팅 삭제"
                >
                  <AiOutlineDelete size={14} />
                </button>
              </li>
            ))}
          </ul>
        </aside>
      )}
      <div className="chat-main">
        {selectedChat === null ? (
          <div className="chat-empty-guide">
            <div className="chat-empty-title">채팅방을 클릭하여 렌트하기</div>
            <div className="chat-empty-desc">
              왼쪽 채팅방 목록에서 채팅을 선택하거나 새 채팅을 시작해보세요.
              <br />
              렌트카 상담이 이곳에 표시됩니다.
            </div>
          </div>
        ) : (
          <>
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
                    {/* 로그인 버튼 표시 */}
                    {msg.showLoginButton && (
                      <button
                        className="login-prompt-button"
                        onClick={() => setIsLoginOpen(true)}
                        style={{
                          marginTop: "10px",
                          padding: "8px 16px",
                          backgroundColor: "#007bff",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}
                      >
                        로그인하기
                      </button>
                    )}
                  </div>
                  {showCalendar && msg.showCalendarAfter && user && localStorage.getItem('token') && (
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
                  {showMap && msg.showMapAfter && user && localStorage.getItem('token') && (
                    <div className="map-container" ref={mapContainer} />
                  )}
                  {showCars && msg.showCarsAfter && user && localStorage.getItem('token') && (
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
                          <p>
                            추천드릴&nbsp;
                            <span style={{ fontSize: "20px" }}> 차량</span> 을
                            찾아왔습니다! &nbsp;🚗
                          </p>
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
                                style={{
                                  display: "inline-block",
                                  cursor: "pointer",
                                }}>
                                <CarItemCard car={car} dateRange={dateRange} />
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p>
                          추천 가능한 차량이 없습니다. 다른 조건으로 다시
                          시도해보세요. 😅
                        </p>
                      )}
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            <form className="chat-input-bar" onSubmit={handleSubmit}>
              <button type="button" className="chat-add-btn">
                <AiOutlinePlus size={20} />
              </button>
              <input
                type="text"
                placeholder={
                  !user
                    ? "로그인이 필요합니다"
                    : isLoadingRecommendations
                    ? "추천 중..."
                    : "채팅을 입력하세요"
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onClick={() => {
                  // 로그인되지 않은 상태에서 입력창 클릭 시 로그인 모달 표시
                  if (!user && !loading) {
                    setIsLoginOpen(true);
                  }
                }}
                disabled={showCalendar || isLoadingRecommendations}
              />
              <button
                type="submit"
                className="chat-send-btn"
                disabled={!user || showCalendar || isLoadingRecommendations}>
                <HiArrowUp className="arrow-up" />
              </button>
            </form>
          </>
        )}
      </div>
      {isSignUpOpen && (
        <SignUp isOpen={isSignUpOpen} onClose={() => setIsSignUpOpen(false)} />
      )}
      {isLoginOpen && (
        <Login
          isOpen={isLoginOpen}
          onClose={() => {
            setIsLoginOpen(false);
            setPendingUserInput(""); // 모달 닫을 때 대기 입력 초기화
          }}
          onSwitchSignUp={() => {
            setIsLoginOpen(false);
            setIsSignUpOpen(true);
          }}
          redirectTo="/prompt" // 로그인 후 현재 페이지 유지
        />
      )}
    </div>
  );
};

export default Prompt;
