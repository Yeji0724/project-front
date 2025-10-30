import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MainPage from "./pages/MainPage";
import JoinPage from "./pages/JoinPage";
import LoginPage from "./pages/LoginPage";
import UploadPage from "./pages/UploadPage";
import DirectoryPage from "./pages/DirectoryPage";
import SelectPage from "./pages/SelectPage"; 
import CategoryPage from "./pages/CategoryPage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // 새로고침해도 localStorage에 token이 있으면 로그인 유지
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);


  return (
    <Router>
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Routes>
        {/* 로그인 시 선택 페이지로 이동 */}
        <Route path="/" element={isLoggedIn ? <SelectPage /> : <MainPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/directory" element={<DirectoryPage />} />
        <Route path="/select" element={<SelectPage />} />
        <Route path="/directory/:folderId" element={<CategoryPage />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
