import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/LoginPage.css";

function LoginPage({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // 테스트용: 로그인 성공(true) / 실패(false) 수동 설정
    const TEST_SUCCESS = true; // true로 바꾸면 로그인 성공, false면 실패

    if (TEST_SUCCESS) {
      setIsLoggedIn(true);
      navigate("/upload");
    } else {
      setIsLoggedIn(false);
      setError("없는 아이디 또는 잘못된 비밀번호입니다.");
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">로그인</h2>
      <form className="login-form" onSubmit={handleLogin}>
        <input type="text" placeholder="아이디" className="login-input" required />
        <input type="password" placeholder="비밀번호" className="login-input" required />
        <button type="submit" className="login-btn">로그인</button>
      </form>
      {error && <p className="error-message">{error}</p>} {/* 로그인 실패 시 메시지 */}
      <p className="join-link">
        계정이 없으신가요? <Link to="/join">회원가입</Link>
      </p>
    </div>
  );
}

export default LoginPage;
