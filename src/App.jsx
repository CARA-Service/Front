import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home/Home.jsx";
import Prompt from "./pages/Prompt/Prompt.jsx";
import SignUp from "./pages/SignUp/SignUp.jsx";
import ProfilePage from "./pages/ProfilePage/ProfilePage.jsx";
import ReservationsPage from "./pages/ReservationsPage/ReservationsPage.jsx";
import HistoryPage from "./pages/HistoryPage/HistoryPage.jsx";
import AnalysisPage from "./pages/AnalysisPage/AnalysisPage.jsx";
// 차후 삭제 필요
import CarListPage from "./pages/CarListPage/CarListPage";
// 차후 삭제 필요
import "./App.css";
import use400px from "./hooks/use400px";

function App() {
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const is400px = use400px();
  const location = useLocation();

  return (
    <>
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/prompt" element={<Prompt />} />
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
