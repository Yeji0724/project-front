import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(null); // null: 로딩, false: 접근불가
  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const verify = async () => {
      if (!userId || !token) {
        setIsAuthorized(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:8000/auth/verify", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log(res)
        if (!res.ok) {
          throw new Error("유효하지 않은 토큰입니다.");
        }

        const data = await res.json();
        if (!data.valid || data.user_id !== Number(userId)) {
          throw new Error("토큰 불일치");
        }

        setIsAuthorized(true);
      } catch (err) {
        console.error("ProtectedRoute 인증 실패:", err);

        // 로그아웃 처리
        localStorage.removeItem("token");
        localStorage.removeItem("user_id");
        localStorage.removeItem("user_login_id");

        // 폴더 관련 캐시 삭제
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith("directoryPath_") || key.includes("folder_updated"))) {
            localStorage.removeItem(key);
            i--;
          }
        }

        if (localStorage.getItem("folder_updated")) {
          localStorage.removeItem("folder_updated");
        }

        alert("인증이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.");
        setIsAuthorized(false);
      }
    };

    verify();
  }, [userId, token]);

  if (isAuthorized === null) {
    // 검증 중 로딩 표시
    return
  }

  if (!isAuthorized) {
    // 접근 불가 시 메인페이지로 이동
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
