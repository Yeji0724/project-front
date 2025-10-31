import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const userId = localStorage.getItem("user_id");
  const token = localStorage.getItem("token");
  const location = useLocation();

  useEffect(() => {
    const verify = async () => {
      if (isAuthorized === false) {
        return;
      }
      if (isAuthorized === null && (!userId || !token)) {
        alert("로그인 후 이용해주세요.");
        setIsAuthorized(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:8000/auth/verify", {
          headers: { Authorization: `Bearer ${token}`,
                    user_id: userId
                  },
        });

        let data;
        try {
          data = await res.json();
        } catch {
          data = { detail: { error: "verify_failed" } };
        }

        if (!res.ok) {
          throw { error: data.detail?.error || "verify_failed" };
        }

        if (!data.valid || data.user_id !== Number(userId)) {
          throw { error: "invalid_key" };
        }

        setIsAuthorized(true);
      } catch (err) {
        console.error("ProtectedRoute 인증 실패:", err);

        const errorType = err.error || "verify_failed";

        if (errorType === "invalid_key") {
          alert("인증이 유효하지 않습니다. 다시 로그인해주세요.");
        } else if (errorType === "timeout") {
          alert("마지막 활동으로부터 30분이 지났습니다. 다시 로그인해주세요.");
        } else if (errorType === "jwt_error") {
          alert("토큰에 이상이 발생했습니다. 다시 로그인해주세요.");
        } else {
          alert("인증이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.");
        }

        // 로그아웃 처리
        localStorage.clear();
        setIsAuthorized(false);
      }
    };

    verify();
  }, [userId, token, location.pathname]);

  if (isAuthorized === null) return <div>Loading...</div>;

  if (!isAuthorized) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
