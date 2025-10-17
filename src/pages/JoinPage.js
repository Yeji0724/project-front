import React from "react";
import { Link, useNavigate } from "react-router-dom"; 
import "../css/JoinPage.css";

function JoinPage() {
  const navigate = useNavigate(); // 페이지 이동용 훅

  const handleJoin = (e) => {
    e.preventDefault(); // 폼 제출 시 페이지 리로드 방지

    // TODO: 여기서 백엔드 회원가입 API 호출 가능
    // 예: fetch("/api/join", {method: "POST", body: ...})

    // 회원가입 후 로그인 페이지로 이동
    navigate("/login");
  };

  return (
    <div className="join-container">
      <h2 className="join-title">회원가입</h2>
      <form className="join-form" onSubmit={handleJoin}>
        <input type="text" placeholder="아이디" className="join-input" required />
        <input type="password" placeholder="비밀번호" className="join-input" required />
        <input type="password" placeholder="비밀번호 확인" className="join-input" required />
        <input type="email" placeholder="이메일" className="join-input" required />
        <button type="submit" className="join-btn">회원가입</button>
      </form>
      <p className="login-link">
        이미 계정이 있으신가요? <Link to="/login">로그인</Link>
      </p>
    </div>
  );
}

export default JoinPage;
