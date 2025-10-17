import React, { useState, useEffect } from "react";
import "../css/ProgressPage.css";
// import axios from "axios"; // 나중에 서버 연동 시 사용

const ProgressPage = () => {
  // ================================
  // 1️⃣ 예시 데이터 (현재는 이걸로 테스트)
  // ================================
  const [files, setFiles] = useState([
    { id: 1, name: "PDF1.pdf", status: "분류 완료 (회의록)", statusColor: "green" },
    { id: 2, name: "PDF2.pdf", status: "분류 중...", statusColor: "black" },
    { id: 3, name: "한글파일1.hwp", status: "변환 완료", statusColor: "black" },
    { id: 4, name: "starcraft.exe", status: "지원하는 타입이 아닙니다.", statusColor: "red" },
    { id: 5, name: "워드1.docx", status: "대기 중", statusColor: "gray" },
  ]);

  // ================================
  // 2️⃣ 서버에서 데이터 받아오기 (나중에 주석 해제)
  // ================================
  /*
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get("http://localhost:8000/files"); // 백엔드 주소
        setFiles(response.data);
      } catch (error) {
        console.error("파일 가져오기 실패:", error);
      }
    };

    fetchFiles();
  }, []);
  */

  // ================================
  // 파일 제거 함수
  // ================================
  const handleRemove = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);

    // ================================
    // 서버 연동 시 제거 요청 (나중에 주석 해제)
    // ================================
    /*
    const fileId = files[index].id;
    axios.delete(`http://localhost:8000/files/${fileId}`)
      .then(() => console.log("삭제 완료"))
      .catch((err) => console.error("삭제 실패:", err));
    */
  };

  return (
    <div className="progress-container">
      <h2>진행 현황</h2>
      <div className="progress-table">
        {files.map((file, index) => (
          <div className="progress-row" key={file.id}>
            <span className="file-name">{file.name}</span>
            <span className="file-status" style={{ color: file.statusColor }}>
              {file.status}
            </span>
            <button className="remove-btn" onClick={() => handleRemove(index)}>
              제거
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressPage;
