import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "../css/LoginPage.css";

function LoginPage({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ user_login_id: "", user_password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState({
    user_login_id: "",
    user_password: "",
    common: "",
  });

  useEffect(() => {
    const setLayoutVars = () => {
      const header = document.querySelector("header");
      const footer = document.querySelector("footer");
      const hh = header ? header.getBoundingClientRect().height : 0;
      const fh = footer ? footer.getBoundingClientRect().height : 0;
      document.documentElement.style.setProperty("--header-h", `${hh}px`);
      document.documentElement.style.setProperty("--footer-h", `${fh}px`);
    };
    setLayoutVars();
    window.addEventListener("resize", setLayoutVars);
    return () => window.removeEventListener("resize", setLayoutVars);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrorMsg({ user_login_id: "", user_password: "", common: "" });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.user_login_id.trim()) {
      setErrorMsg({ user_login_id: "아이디를 입력해주세요.", user_password: "", common: "" });
      return;
    }
    if (!form.user_password.trim()) {
      setErrorMsg({ user_login_id: "", user_password: "비밀번호를 입력해주세요.", common: "" });
      return;
    }

    try {
      const res = await axios.post("http://localhost:8000/auth/login", {
        user_login_id: form.user_login_id,
        user_password: form.user_password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user_login_id", res.data.user_login_id);
      localStorage.setItem("user_id", res.data.user_id);
      setIsLoggedIn(true);

      Swal.fire({
        toast: true,
        position: "top",
        icon: "success",
        showConfirmButton: false,
        timer: 1800,
        title: `${form.user_login_id}님 환영합니다!`,
      });

    } catch (err) {
      console.error("로그인 실패:", err.response?.data || err.message);
      setIsLoggedIn(false);

      setErrorMsg({
        user_login_id: "",
        user_password: "",
        common: "아이디 또는 비밀번호가 올바르지 않습니다.",
      });
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-box">
          <h2 className="login-title">로그인</h2>

          <form className="login-form" onSubmit={handleLogin}>
            
            {/* 아이디 */}
            <div className="input-group">
              <input
                type="text"
                name="user_login_id"
                placeholder="아이디"
                className={`login-input ${
                  errorMsg.common || errorMsg.id ? "input-error" : ""
                }`}
                value={form.user_login_id}
                onChange={handleChange}
                required
              />
              {(errorMsg.id || errorMsg.common) && (
                <p className="error-text">{errorMsg.id || errorMsg.common}</p>
              )}
            </div>

            {/* 비밀번호 */}
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                name="user_password"
                placeholder="비밀번호"
                className="login-input"
                value={form.user_password}
                onChange={handleChange}
                required
              />
              {form.user_password && (
                <button
                  type="button"
                  className="toggle-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.94 17.94A10.44 10.44 0 0 1 12 20c-7.5 0-10-8-10-8a17.1 17.1 0 0 1 5.06-6.44" />
                      <path d="M1 1l22 22" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              )}
            </div>

            <button type="submit" className="login-btn">
              로그인
            </button>
          </form>

          <p className="join-link">
            계정이 없으신가요? <Link to="/join">회원가입</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
