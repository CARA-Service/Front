import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home/Home.jsx";
import PromptPage from "./pages/PromptPage/PromptPage.jsx";
import SignUp from "./pages/SignUp/SignUp.jsx";
import ProfilePage from "./pages/ProfilePage/ProfilePage.jsx";
import ReservationsPage from "./pages/ReservationsPage/ReservationsPage.jsx";
import HistoryPage from "./pages/HistoryPage/HistoryPage.jsx";
import AnalysisPage from "./pages/AnalysisPage/AnalysisPage.jsx";
import KakaoCallback from "./pages/Auth/KakaoCallBack.jsx";
// 차후 삭제 필요
import CarListPage from "./pages/CarListPage/CarListPage";
// 차후 삭제 필요
import "./App.css";
// import use400px from "./hooks/use500px";

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert" className="error-fallback">
      <p>⚠️ 문제가 발생했습니다:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>다시 시도</button>
    </div>
  );
}

function App() {
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  // const is500px = use500px();
  const location = useLocation();

  // const hideHeader = location.pathname === "/prompt" && is500px;

  return (
    <AuthProvider>
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/prompt"
            element={
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <PromptPage />
              </ErrorBoundary>
            }
          />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/reservations" element={<ReservationsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/cars" element={<CarListPage />} />
          <Route path="/auth/kakao/callback" element={<KakaoCallback />} />
        </Routes>
      </div>
      {isSignUpOpen && (
        <SignUp
          isOpen={isSignUpOpen}
          onClose={() => setIsSignUpOpen(false)}
          onSwitchLogin={() => {
            setIsSignUpOpen(false);
            setIsLoginOpen(true);
          }}
        />
      )}
    </AuthProvider>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
