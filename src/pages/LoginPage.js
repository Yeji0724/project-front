import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "../css/LoginPage.css";

function LoginPage({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ id: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:8000/auth/login", {
        user_login_id: form.id,
        password: form.password,
      });

      // 로그인 성공 — 위에 작게 파란 토스트
      localStorage.setItem("token", res.data.token);
      setIsLoggedIn(true);

      const Toast = Swal.mixin({
        toast: true,
        position: "top",
        showConfirmButton: false,
        timer: 1000,
        timerProgressBar: false,
        customClass: {
          popup: "login-toast-popup",
          title: "login-toast-title",
        },
      });

      Toast.fire({ title: "로그인 성공!" });

      setTimeout(() => navigate("/upload"), 800);
    } catch (err) {
      console.error("로그인 실패:", err.response?.data || err.message);
      setIsLoggedIn(false);

      // 로그인 실패 — 위에 작게 파란색 토스트 (성공과 같은 스타일)
      const FailToast = Swal.mixin({
        toast: true,
        position: "top",
        showConfirmButton: false,
        timer: 1200,
        timerProgressBar: false,
        customClass: {
          popup: "login-fail-toast",
          title: "login-fail-toast-title",
        },
      });

      FailToast.fire({
        icon: "error",
        title: "로그인 실패! 아이디 또는 비밀번호를 확인해주세요.",
      });
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">로그인</h2>
      <form className="login-form" onSubmit={handleLogin}>
        <input
          type="text"
          name="id"
          placeholder="아이디"
          className="login-input"
          value={form.id}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="비밀번호"
          className="login-input"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit" className="login-btn">
          로그인
        </button>
      </form>

      <p className="join-link">
        계정이 없으신가요? <Link to="/join">회원가입</Link>
      </p>
    </div>
  );
}

export default LoginPage;
