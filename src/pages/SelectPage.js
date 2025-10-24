import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/SelectPage.css";

function SelectPage() {
  const navigate = useNavigate();

  return (
    <div className="select-page">
      <h2 className="select-title">원하는 작업을 선택하세요</h2>
      <div className="select-boxes">
        <div className="select-card upload" onClick={() => navigate("/upload")}>
          <h3>📤 문서 업로드</h3>
          <p>문서를 업로드하고 AI로 자동 추출하기</p>
        </div>

        <div className="select-card classify" onClick={() => navigate("/directory")}>
          <h3>🗃️ 문서 분류</h3>
          <p>기존 폴더에서 카테고리를 생성 및 관리하기</p>
        </div>
      </div>
    </div>
  );
}

export default SelectPage;
