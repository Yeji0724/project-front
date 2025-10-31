import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
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
  const location = useLocation();

  useEffect(() => {
    // join이나 login 페이지일 때는 검증 안 함
    if (location.pathname === "/join" || location.pathname === "/login") return;

    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:8000/auth/verify", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          // 로그인 관련
          localStorage.removeItem("token");
          localStorage.removeItem("user_login_id");
          localStorage.removeItem("user_id");

          // 폴더 관련 - 강제 삭제 (확실하게)
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith("directoryPath_") || key.includes("folder_updated"))) {
              localStorage.removeItem(key);
              i--; // 삭제 후 인덱스 당겨지므로 조정
            }
          }

          // 혹시 남은 폴더 캐시 있으면 추가로 클리어
          if (localStorage.getItem("folder_updated")) {
            localStorage.removeItem("folder_updated");
          }

          setIsLoggedIn(false);
        }

      } catch (err) {
        console.error("토큰 검증 실패:", err);
        localStorage.clear();
        setIsLoggedIn(false);
      }
    };

    verifyToken();
  }, [location.pathname]);


  return (
    <>
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
    </>
  );
}

export default App;
