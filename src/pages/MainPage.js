import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/MainPage.css";

function MainPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const setHeaderVar = () => {
      const header = document.querySelector("header");
      const h = header ? header.getBoundingClientRect().height : 0;
      document.documentElement.style.setProperty("--header-h", `${h}px`);
    };
    setHeaderVar();
    window.addEventListener("resize", setHeaderVar);
    return () => window.removeEventListener("resize", setHeaderVar);
  }, []);

  const scrollToFeatures = () => {
    const section = document.querySelector(".features-section");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="main-wrapper">
      <section className="main-container">
        <div className="main-content">
          <h1 className="project-title">사이트이름</h1>

          <div className="main-box">
            <p className="main-subtext">
              <strong>문서 업로드, 변환 및 관리</strong>까지 한 곳에서
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

        <p className="supported-types">
          한글(.hwp), MS 오피스(.docx, .pptx, .xlsx), 이미지(.jpg, .png), 텍스트(.txt) 파일을 지원합니다.
        </p>

        <div className="scroll-hint" onClick={scrollToFeatures}>
          주요 기능
          <br />
          ▼
        </div>
      </section>

      <section className="features-section">
        <div
          className="scroll-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ▲<br />돌아가기
        </div>

        <h2 className="features-title">주요 기능 소개</h2>

        <div className="features-rows">
          <div className="feature-item">
            <div className="feature-icon">📂</div>
            <h3>문서 업로드 및 변환</h3>
            <p>PDF, 이미지, 오피스 문서를 업로드하고 텍스트로 변환합니다.</p>
          </div>

          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <h3>AI 자동 분류</h3>
            <p>문서 내용을 분석해 <strong>사용자가 만든 카테고리</strong>로 자동 분류합니다.</p>
          </div>

          <div className="feature-item">
            <div className="feature-icon">🗂️</div>
            <h3>폴더 & 카테고리 연동</h3>
            <p>실제 디렉토리처럼 문서를 구조적으로 관리할 수 있습니다.</p>
          </div>

          <div className="feature-item">
            <div className="feature-icon">📦</div>
            <h3>ZIP 다운로드</h3>
            <p>정리된 문서를 ZIP 파일로 묶어 다운로드할 수 있습니다.</p>
          </div>

          <div className="feature-item">
            <div className="feature-icon">📈</div>
            <h3>처리 현황 확인</h3>
            <p>문서 처리 상태를 <strong>직관적으로</strong> 확인할 수 있습니다.</p>
          </div>
        </div>

        <hr className="divider" />

        <h2 className="howto-title-main">이용 방법 안내</h2>

        <div className="howto-split">
          <div className="howto-card">
            <h3 className="howto-title">업로드 먼저</h3>
            <ol>
              <li>문서를 업로드합니다.</li>
              <li>정리할 폴더를 선택합니다.</li>
              <li>업로드 완료 후 <strong>폴더 페이지로 이동</strong>합니다.</li>
              <li>카테고리를 생성하고 분류합니다.</li>
              <li>ZIP으로 내려받아 활용합니다.</li>
            </ol>
          </div>

          <div className="howto-card">
            <h3 className="howto-title">분류 먼저</h3>
            <ol>
              <li>폴더와 카테고리를 먼저 생성합니다.</li>
              <li>문서를 업로드합니다.</li>
              <li>AI가 분석해 자동 분류합니다.</li>
              <li>필요 시 직접 분류를 수정할 수 있습니다.</li>
              <li>ZIP으로 내려받을 수 있습니다.</li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}

export default MainPage;
