import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/MainPage.css";

function MainPage() {
  const navigate = useNavigate();

  // 헤더 높이 반영
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

  // 화살표 클릭 시 아래 섹션으로 스크롤
  const scrollToFeatures = () => {
    const section = document.querySelector(".features-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
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

        {/* 클릭 이벤트 */}
        <div className="scroll-hint" onClick={scrollToFeatures}>
          ▼
        </div>
      </section>

      {/* ===== 아래 기능 소개 섹션 ===== */}
      <section className="features-section">
        {/* 위로가기 화살표 추가 */}
        <div className="scroll-top" onClick={() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}>
          ▲
        </div>
        <h2 className="features-title">주요 기능 소개</h2>
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">📁</div>
            <h3>문서 업로드 및 변환</h3>
            <p>한글(HWP), 오피스, 이미지, 텍스트 등 다양한 파일을 한 번에 업로드하고 변환할 수 있습니다.</p>
          </div>

          <div className="feature-item">
            <div className="feature-icon">🔍</div>
            <h3>AI 자동분류</h3>
            <p>업로드된 문서의 내용을 분석해 자동으로 카테고리를 지정하고 폴더별로 정리합니다.</p>
          </div>

          <div className="feature-item">
            <div className="feature-icon">⚙️</div>
            <h3>일괄 처리 및 다운로드</h3>
            <p>여러 개의 문서를 동시에 처리하고, 변환된 결과를 ZIP 형태로 한 번에 내려받을 수 있습니다.</p>
          </div>

          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <h3>실시간 처리 현황 확인</h3>
            <p>업로드 후 변환 진행률과 처리 상태를 실시간으로 확인할 수 있습니다</p>
          </div>
        </div>
        
        {/* 구분선 + 이용 방법 안내 */}
        <hr className="divider" />
        <div className="howto-inline">
          <h3 className="howto-inline-title">이용 방법 안내</h3>
          <ol className="howto-inline-list">
            <li>
              <strong>파일 업로드:</strong> 한글, 오피스, 이미지, TXT, ZIP 파일을 업로드할 수 있습니다.
            </li>
            <li>
              <strong>AI 자동 처리:</strong> 업로드된 문서를 AI가 분석하여 자동으로 변환하고 분류합니다.
            </li>
            <li>
              <strong>진행 현황 확인:</strong> 업로드 후 자동으로 ‘진행 현황’ 페이지로 이동합니다.
            </li>
            <li>
              <strong>결과 다운로드:</strong> 변환이 완료되면 ZIP 파일로 한 번에 다운로드할 수 있습니다.
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
}

export default MainPage;
