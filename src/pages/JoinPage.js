import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2"; 
import "../css/JoinPage.css";

function JoinPage() {
  const [form, setForm] = useState({
    user_login_id: "",
    password: "",
    password_confirm: "",
    email: "",
  });

  const [validation, setValidation] = useState({
    idValid: false,
    pwValid: false,
    pwMatch: false,
    emailValid: false,
  });

  const [errorMsg, setErrorMsg] = useState(""); // 전체 실패 메시지용

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const regex = {
    id: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/,
    pw: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);
    setErrorMsg(""); // 입력 중엔 오류문구 초기화

    if (name === "user_login_id") {
      setValidation((p) => ({ ...p, idValid: regex.id.test(value) }));
    }
    if (name === "password") {
      setValidation((p) => ({
        ...p,
        pwValid: regex.pw.test(value),
        pwMatch: value === updatedForm.password_confirm,
      }));
    }
    if (name === "password_confirm") {
      setValidation((p) => ({
        ...p,
        pwMatch: updatedForm.password === value,
      }));
    }
    if (name === "email") {
      setValidation((p) => ({
        ...p,
        emailValid: regex.email.test(value),
      }));
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();

    if (
      !validation.idValid ||
      !validation.pwValid ||
      !validation.pwMatch ||
      !validation.emailValid
    ) {
      if (!validation.idValid)
        return setErrorMsg("아이디는 영문+숫자 8~20자로 입력해주세요.");
      if (!validation.pwValid)
        return setErrorMsg("비밀번호는 영문+숫자 8~20자여야 합니다.");
      if (!validation.pwMatch)
        return setErrorMsg("비밀번호가 일치하지 않습니다.");
      if (!validation.emailValid)
        return setErrorMsg("유효한 이메일 형식이 아닙니다.");
    }

    try {
      await axios.post("http://127.0.0.1:8000/auth/register", {
        user_login_id: form.user_login_id,
        email: form.email,
        password: form.password,
      });

      // 회원가입 성공 시 토스트 표시
      const Toast = Swal.mixin({
        toast: true,
        position: "top",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: false,
        customClass: {
          popup: "login-toast-popup",
          title: "login-toast-title",
        },
      });

      Toast.fire({
        icon: "success",
        title: `회원가입 완료! 환영합니다 ${form.user_login_id}님`,
      });

      setTimeout(() => (window.location.href = "/login"), 1500);
    } catch {
      setErrorMsg("이미 존재하는 아이디입니다.");
    }
  };

  return (
    <div className="join-page">
      <div className="join-container">
        <div className="join-box">
          <h2 className="join-title">회원가입</h2>

          <form className="join-form" onSubmit={handleJoin}>
            {/* 아이디 */}
            <div className="input-group">
              <input
                type="text"
                name="user_login_id"
                placeholder="아이디 (영문+숫자 8~20자)"
                className="join-input"
                value={form.user_login_id}
                onChange={handleChange}
                required
              />
              {form.user_login_id && (
                <p
                  className={`validation-text ${
                    validation.idValid ? "valid" : "invalid"
                  }`}
                >
                  {validation.idValid
                    ? "✔ 사용 가능한 아이디입니다."
                    : "✖ 아이디는 영문+숫자 8~20자로 입력해주세요."}
                </p>
              )}
            </div>

            {/* 비밀번호 */}
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="비밀번호 (영문+숫자 8~20자)"
                className="join-input"
                value={form.password}
                onChange={handleChange}
                required
              />
              {form.password && (
                <button
                  type="button"
                  className="toggle-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="비밀번호 보기"
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
              {form.password && (
                <p
                  className={`validation-text ${
                    validation.pwValid ? "valid" : "invalid"
                  }`}
                >
                  {validation.pwValid
                    ? "✔ 올바른 비밀번호 형식입니다."
                    : "✖ 영문+숫자 8~20자로 입력해주세요."}
                </p>
              )}
            </div>

            {/* 비밀번호 확인 */}
            <div className="input-group">
              <input
                type={showConfirm ? "text" : "password"}
                name="password_confirm"
                placeholder="비밀번호 확인"
                className="join-input"
                value={form.password_confirm}
                onChange={handleChange}
                required
              />
              {form.password_confirm && (
                <>
                  <button
                    type="button"
                    className="toggle-visibility"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label="비밀번호 보기"
                  >
                    {showConfirm ? (
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
                  <p
                    className={`validation-text ${
                      validation.pwMatch ? "valid" : "invalid"
                    }`}
                  >
                    {validation.pwMatch
                      ? "✔ 비밀번호가 일치합니다."
                      : "✖ 비밀번호가 일치하지 않습니다."}
                  </p>
                </>
              )}
            </div>

            {/* 이메일 */}
            <div className="input-group">
              <input
                type="email"
                name="email"
                placeholder="이메일"
                className="join-input"
                value={form.email}
                onChange={handleChange}
                required
              />
              {form.email && (
                <p
                  className={`validation-text ${
                    validation.emailValid ? "valid" : "invalid"
                  }`}
                >
                  {validation.emailValid
                    ? "✔ 사용 가능한 이메일입니다."
                    : "✖ 올바른 이메일 형식이 아닙니다."}
                </p>
              )}
            </div>

            {/* 실패 문구 — 버튼 위로 이동 */}
            <p className={`join-error-text ${errorMsg ? "show" : ""}`}>
              {errorMsg}
            </p>

            <button type="submit" className="join-btn">
              회원가입
            </button>
          </form>

          <p className="login-link">
            이미 계정이 있으신가요? <Link to="/login">로그인</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default JoinPage;
