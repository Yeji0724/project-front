import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "../css/JoinPage.css";

function JoinPage() {
  const [form, setForm] = useState({
    user_login_id: "",
    user_password: "",
    password_confirm: "",
    email: "",
    folder_name: "", // 가상 폴더 이름 (선택)
  });

  const [validation, setValidation] = useState({
    idValid: false,
    pwValid: false,
    pwMatch: false,
    emailValid: false,
  });

  const [errorMsg, setErrorMsg] = useState("");
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
    setErrorMsg("");

    if (name === "user_login_id") {
      setValidation((p) => ({ ...p, idValid: regex.id.test(value) }));
    }
    if (name === "user_password") {
      setValidation((p) => ({
        ...p,
        pwValid: regex.pw.test(value),
        pwMatch: value === updatedForm.password_confirm,
      }));
    }
    if (name === "password_confirm") {
      setValidation((p) => ({
        ...p,
        pwMatch: updatedForm.user_password === value,
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

    console.log("handleJoin 실행됨");

    const folderName =
      form.folder_name.trim() === "" ? "unknown" : form.folder_name.trim();

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
      const res = await axios.post("http://127.0.0.1:8000/auth/register", {
        user_login_id: form.user_login_id,
        email: form.email,
        user_password: form.user_password, // ← 서버 스키마와 일치
        folder_name: folderName,
      });

      console.log("서버 응답: ", res.data);

      // 오른쪽 상단 알림
      const Toast = Swal.mixin({
        toast: true,
        position: "top", // 가운데 상단
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: false,
        customClass: {
          popup: "login-toast-popup",
          title: "login-toast-title",
        },
      });

      Toast.fire({
        icon: "success",
        html: `
        <div style="text-align:left; line-height:1.4;">
          <b>회원가입 완료!</b> 환영합니다 <b>${form.user_login_id}</b>님<br/>
          <small style="opacity:0.9;">📁 '${folderName}' 폴더가 생성되었습니다.</small>
        </div>
      `,
      });

      // 로그인 페이지로 이동
      setTimeout(() => (window.location.href = "/login"), 2200);
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
                name="user_password"
                placeholder="비밀번호 (영문+숫자 8~20자)"
                className="join-input"
                value={form.user_password}
                onChange={handleChange}
                required
              />
              {form.user_password && (        
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
              {form.user_password && (              /* ← 조건 필드명 정정 */
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

            {/* 폴더 이름 (선택) */}
            <div className="input-group folder-tooltip-wrapper">
              <input
                type="text"
                name="folder_name"
                placeholder="폴더 이름 (선택, 미입력 시 unknown)"
                className="join-input"
                value={form.folder_name}
                onChange={handleChange}
              />
              <div className="tooltip-icon">❓
                <span className="tooltip-text">
                  이 폴더는 실제 컴퓨터 폴더가 아니라<br />
                  사이트 내에서 문서를 분류하기 위한 <b>가상의 폴더</b>입니다.<br />
                  입력하지 않으면 기본 폴더명은 <b>'unknown'</b>으로 생성됩니다.
                </span>
              </div>
            </div>

            {/* 실패 문구 */}
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
