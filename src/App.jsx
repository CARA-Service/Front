import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import Home from "./pages/Home/Home.jsx";
import PromptPage from "./pages/PromptPage/PromptPage.jsx";
import SignUp from "./pages/SignUp/SignUp.jsx";
import Header from "./components/Header/Header.jsx";
import ProfilePage from "./pages/ProfilePage/ProfilePage.jsx";
import ReservationsPage from "./pages/ReservationsPage/ReservationsPage.jsx";
import HistoryPage from "./pages/HistoryPage/HistoryPage.jsx";
import AnalysisPage from "./pages/AnalysisPage/AnalysisPage.jsx";
// 차후 삭제 필요
import CarListPage from "./pages/CarListPage/CarListPage";
// 차후 삭제 필요
import "./App.css";
import use400px from "./hooks/use400px";

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
  const is400px = use400px();
  const location = useLocation();


  const hideHeader = location.pathname === "/prompt" && is400px;


  return (
    <>
     {!hideHeader && <Header onSignUpClick={() => setIsSignUpOpen(true)} />}
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
        </Routes>
      </div>
      {isSignUpOpen && (
        <SignUp isOpen={isSignUpOpen} onClose={() => setIsSignUpOpen(false)} />
      )}
    </>
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
