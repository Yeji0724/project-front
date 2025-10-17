import React, { useState } from "react";
import "../css/DirectoryPage.css";

const dummyData = {
  "카테고리1": ["파일1", "파일2"],
  "카테고리2": ["파일3", "파일4"],
  "카테고리3": ["파일5"]
};

function DirectoryPage() {
  const [filesByCategory, setFilesByCategory] = useState(dummyData);

  // 전체 다운로드
  const handleDownloadAll = async () => {
    try {
      const response = await fetch("http://백엔드주소/download/all"); // 백엔드 전체 다운로드 엔드포인트
      if (!response.ok) throw new Error("다운로드 실패");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "all_files.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert(err.message);
    }
  };

  // 카테고리별 다운로드
  const handleDownloadCategory = async (category) => {
    try {
      const response = await fetch(`http://백엔드주소/download/category?name=${encodeURIComponent(category)}`);
      if (!response.ok) throw new Error("다운로드 실패");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${category}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="directory-page">
      <h2>분류파일 관리</h2>

      <div className="buttons">
        <button onClick={handleDownloadAll}>전체 문서 다운로드</button>
      </div>

      <div className="categories">
        {Object.entries(filesByCategory).map(([category, files]) => (
          <div key={category} className="category">
            <h3>{category} ({files.length}개)</h3>
            <button onClick={() => handleDownloadCategory(category)}>카테고리 다운로드</button>
            <ul>
              {files.map((file, idx) => (
                <li key={idx}>{file}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DirectoryPage;
