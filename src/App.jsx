import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home/Home.jsx";
import Prompt from "./pages/Prompt/Prompt.jsx";
import SignUp from "./pages/SignUp/SignUp.jsx";
import Header from "./components/Header.jsx";
import ProfilePage from "./pages/ProfilePage/ProfilePage.jsx";
import ReservationsPage from "./pages/ReservationsPage/ReservationsPage.jsx";
import HistoryPage from "./pages/HistoryPage/HistoryPage.jsx";
import AnalysisPage from "./pages/AnalysisPage/AnalysisPage.jsx";
import "./App.css";

function App() {
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  return (
    <Router>
      <Header
        onSignUpClick={() => setIsSignUpOpen(true)}
      />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/prompt" element={<Prompt />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/reservations" element={<ReservationsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
        </Routes>
      </div>
      {isSignUpOpen && (
        <SignUp
          isOpen={isSignUpOpen}
          onClose={() => setIsSignUpOpen(false)}
        />
      )}
    </Router>
  );
}

export default App; 