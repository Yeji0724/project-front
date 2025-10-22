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
  });

  const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/;

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);

    if (name === "user_login_id") {
      setValidation((prev) => ({ ...prev, idValid: regex.test(value) }));
    }
    if (name === "password") {
      setValidation((prev) => ({
        ...prev,
        pwValid: regex.test(value),
        pwMatch: value === updatedForm.password_confirm,
      }));
    }
    if (name === "password_confirm") {
      setValidation((prev) => ({
        ...prev,
        pwMatch: updatedForm.password === value,
      }));
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();

    // --- 프론트 유효성 검사 ---
    if (!validation.idValid || !validation.pwValid || !validation.pwMatch) {
      let msg = "";
      if (!validation.idValid)
        msg = "아이디는 영문과 숫자를 포함한 8~20자여야 합니다.";
      else if (!validation.pwValid)
        msg = "비밀번호는 영문과 숫자를 포함한 8~20자여야 합니다.";
      else if (!validation.pwMatch)
        msg = "비밀번호가 일치하지 않습니다.";

      Swal.fire({
        toast: true,
        position: "top",
        icon: "error",
        title: `회원가입 실패: ${msg}`,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: false,
        customClass: {
          popup: "join-fail-toast",
          title: "join-fail-toast-title",
        },
      });
      return;
    }

    // --- 서버 전송 ---
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/auth/register",
        {
          user_login_id: form.user_login_id,
          email: form.email,
          password: form.password,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("회원가입 성공:", res.data);

      Swal.fire({
        toast: true,
        position: "top",
        icon: "success",
        title: `회원가입 완료! 환영합니다, ${form.user_login_id}님 💙`,
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: false,
        customClass: {
          popup: "join-success-toast",
          title: "join-success-toast-title",
        },
      });

      setTimeout(() => (window.location.href = "/login"), 1500);
    } catch (err) {
      console.error("회원가입 실패:", err.response?.data || err.message);
      const status = err.response?.status;
      const detail = err.response?.data?.detail;
      let errorMessage = "회원가입 중 오류가 발생했습니다.";

      if (status === 409) {
        errorMessage = "이미 존재하는 아이디입니다.";
      } else if (status === 422) {
        if (Array.isArray(detail) && detail[0]?.msg?.includes("valid email")) {
          errorMessage = "올바른 이메일 주소를 입력해주세요. (예: example@gmail.com)";
        } else if (Array.isArray(detail) && detail[0]?.msg) {
          errorMessage = detail[0].msg;
        } else if (typeof detail === "string") {
          errorMessage = detail;
        } else {
          errorMessage = "입력값을 다시 확인해주세요.";
        }
      }

      Swal.fire({
        toast: true,
        position: "top",
        icon: "error",
        title: `회원가입 실패: ${errorMessage}`,
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: false,
        customClass: {
          popup: "join-fail-toast",
          title: "join-fail-toast-title",
        },
      });
    }
  };

  return (
    <div className="join-container">
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
            <span
              className={`checkmark ${validation.idValid ? "valid" : "invalid"}`}
            >
              {validation.idValid ? "✅" : "❌"}
            </span>
          )}
        </div>

        {/* 비밀번호 */}
        <div className="input-group">
          <input
            type="password"
            name="password"
            placeholder="비밀번호 (영문+숫자 8~20자)"
            className="join-input"
            value={form.password}
            onChange={handleChange}
            required
          />
          {form.password && (
            <span
              className={`checkmark ${validation.pwValid ? "valid" : "invalid"}`}
            >
              {validation.pwValid ? "✅" : "❌"}
            </span>
          )}
        </div>

        {/* 비밀번호 확인 */}
        <div className="input-group">
          <input
            type="password"
            name="password_confirm"
            placeholder="비밀번호 확인"
            className="join-input"
            value={form.password_confirm}
            onChange={handleChange}
            required
          />
          {form.password_confirm && (
            <span
              className={`checkmark ${validation.pwMatch ? "valid" : "invalid"}`}
            >
              {validation.pwMatch ? "✅" : "❌"}
            </span>
          )}
        </div>

        {/* 이메일 */}
        <input
          type="email"
          name="email"
          placeholder="이메일"
          className="join-input"
          value={form.email}
          onChange={handleChange}
          required
        />

        <button type="submit" className="join-btn">
          회원가입
        </button>
      </form>

      <p className="login-link">
        이미 계정이 있으신가요? <Link to="/login">로그인</Link>
      </p>
    </div>
  );
}

export default JoinPage;
