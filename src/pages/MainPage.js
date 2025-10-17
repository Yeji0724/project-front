import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/MainPage.css"; 

function MainPage() {
  const navigate = useNavigate();

  return (
    <div className="main-container">
      <div className="main-box">
        <p className="main-subtext">
          문서 업로드, 변환 및 관리까지 한 곳에서
          <br />
          지금 로그인하거나 회원가입하세요.
        </p>
        <div className="button-group">
          <button className="btn-login" onClick={() => navigate("/login")}>
            로그인
          </button>
          <button className="btn-join" onClick={() => navigate("/join")}>
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}

export default MainPage;
