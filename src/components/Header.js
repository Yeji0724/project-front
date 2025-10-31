import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../css/Header.css";

const Header = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();

  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user_login_id");

    // 작게, 위쪽에 자동으로 사라지는 로그아웃 알림
    const Toast = Swal.mixin({
      toast: true,
      position: "top",
      icon: "info",
      title: "로그아웃 되었습니다.",
      showConfirmButton: false,
      timer: 1000,
      timerProgressBar: false,
      customClass: {
        popup: "logout-toast-popup",
        title: "logout-toast-title",
      },
    });
    Toast.fire();

    navigate("/"); // 로그아웃 시 메인화면으로 이동
  };

  return (
    <header className="navbar">
      <h1 className="site-title">
        <Link to="/" className="site-link">
          사이트이름 도대체 뭘로
        </Link>
      </h1>

      {isLoggedIn ? (
        <nav className="nav-buttons">
          <Link to="/upload" className="nav-btn">문서 업로드</Link>
          <Link to="/directory" className="nav-btn">문서 분류</Link>
          <button className="logout-btn" onClick={handleLogout}>
            로그아웃
          </button>
        </nav>
      ) : null}
    </header>
  );
};

export default Header;
