import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MainPage from "./pages/MainPage";
import JoinPage from "./pages/JoinPage";
import LoginPage from "./pages/LoginPage";
import UploadPage from "./pages/UploadPage";
import ProgressPage from "./pages/ProgressPage";
import DirectoryPage from "./pages/DirectoryPage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 여부 상태

  return (
    <Router>
      {/* 헤더에 로그인 상태와 상태 변경 함수 전달 */}
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Routes>
        {/* 로그인 상태에 따라 메인 경로 변경 */}
        <Route path="/" element={isLoggedIn ? <UploadPage /> : <MainPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/directory" element={<DirectoryPage />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
