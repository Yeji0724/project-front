import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/LoginPage.css";

function LoginPage({ setIsLoggedIn }) { // App에서 전달받은 setIsLoggedIn
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // TODO: 실제 백엔드 로그인 API 호출 후 성공 시
    setIsLoggedIn(true);  // 로그인 상태 true로 변경
    navigate("/upload");  // 로그인 후 업로드 페이지로 이동
  };

  return (
    <div className="login-container">
      <h2 className="login-title">로그인</h2>
      <form className="login-form" onSubmit={handleLogin}>
        <input type="text" placeholder="아이디" className="login-input" required />
        <input type="password" placeholder="비밀번호" className="login-input" required />
        <button type="submit" className="login-btn">로그인</button>
      </form>
      <p className="join-link">
        계정이 없으신가요? <Link to="/join">회원가입</Link>
      </p>
    </div>
  );
}

export default LoginPage;
