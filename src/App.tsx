import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import Prompt from "./pages/Prompt";
import SignUp from "./pages/SignUp";
import GuestSignUp from "./pages/GuestSignUp";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./App.css";

function App() {
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isGuestSignUpOpen, setIsGuestSignUpOpen] = useState(false);

  const handleGuestSignUp = () => {
    setIsSignUpOpen(false);
    setIsGuestSignUpOpen(true);
  };

  return (
    <Router>
      <Header
        onSignUpClick={() => setIsSignUpOpen(true)}
        onGuestSignUpClick={() => setIsGuestSignUpOpen(true)}
      />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/prompt" element={<Prompt />} />
        </Routes>
      </div>
      {/* <Footer /> */}
      {isSignUpOpen && (
        <SignUp
          isOpen={isSignUpOpen}
          onClose={() => setIsSignUpOpen(false)}
          onGuestSignUp={handleGuestSignUp}
        />
      )}
      {isGuestSignUpOpen && (
        <GuestSignUp
          isOpen={isGuestSignUpOpen}
          onClose={() => setIsGuestSignUpOpen(false)}
          onBack={() => {
            setIsGuestSignUpOpen(false);
            setIsSignUpOpen(true);
          }}
        />
      )}
    </Router>
  );
}

export default App;
