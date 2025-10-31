import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import MainPage from "./pages/MainPage";
import JoinPage from "./pages/JoinPage";
import LoginPage from "./pages/LoginPage";
import UploadPage from "./pages/UploadPage";
import DirectoryPage from "./pages/DirectoryPage";
import SelectPage from "./pages/SelectPage"; 
import CategoryPage from "./pages/CategoryPage";


function App() {
  const userId = localStorage.getItem("user_id");
  const token = localStorage.getItem("token");
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  const location = useLocation();

  useEffect(() => {
    // join이나 login 페이지일 때는 검증 안 함
    if (location.pathname === "/join" || location.pathname === "/login") return;

    if (!token || !userId) {
      setIsLoggedIn(false);
    }

  }, [location.pathname, token, userId]);

  return (
    <>
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Routes>
        {/* 로그인 시 선택 페이지로 이동 */}
        <Route path="/" element={<PublicRoute> <MainPage /> </PublicRoute>} />
        <Route path="/join" element={<PublicRoute> <JoinPage /> </PublicRoute>} />
        <Route path="/login" element={<PublicRoute> <LoginPage setIsLoggedIn={setIsLoggedIn} /> </PublicRoute>} />
        <Route path="/upload" element={<ProtectedRoute> <UploadPage /> </ProtectedRoute>} />
        <Route path="/directory" element={<ProtectedRoute> <DirectoryPage /> </ProtectedRoute>} />
        <Route path="/select" element={<ProtectedRoute> <SelectPage /> </ProtectedRoute>} />
        <Route path="/directory/:folderId" element={<ProtectedRoute> <CategoryPage /> </ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
