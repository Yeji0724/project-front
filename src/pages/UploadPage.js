import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/UploadPage.css";

const UploadPage = () => {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // localStorage에서 가상 폴더 불러오기
    const savedFolders = JSON.parse(localStorage.getItem("userFolders") || "[]");
    setFolders(savedFolders);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    const newFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileSelect = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDelete = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (files.length === 0) {
      alert("파일을 선택해주세요!");
      return;
    }

    // 가상 폴더 선택창 열기
    setShowFolderModal(true);
  };

  const confirmFolderSelection = () => {
    if (!selectedFolder) {
      alert("폴더를 선택해주세요!");
      return;
    }
    console.log("선택된 폴더:", selectedFolder.name);

    // 추후 백엔드 연동 시 여기에 업로드 로직 추가
    setShowFolderModal(false);
    navigate("/progress");
  };

  return (
    <div className="upload-container">
      <h2 className="upload-title">파일 업로드</h2>

      <div
        className="upload-box"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <p>
          drag and drop<br />
          또는 클릭하여 파일 선택
        </p>
        <input type="file" multiple onChange={handleFileSelect} className="file-input" />
      </div>

      <div className="file-list">
        {files.map((file, index) => (
          <div key={index} className="file-item">
            <span>{file.name}</span>
            <button className="delete-btn" onClick={() => handleDelete(index)}>
              ✖
            </button>
          </div>
        ))}
      </div>

      <button className="upload-btn" onClick={handleUpload}>
        업로드
      </button>

      {/* 폴더 선택 모달 */}
      {showFolderModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>📂 업로드할 폴더 선택</h3>
            {folders.length === 0 ? (
              <p className="no-folder-text">생성된 폴더가 없습니다 😢</p>
            ) : (
              <div className="folder-list">
                {folders.map((folder, idx) => (
                  <div
                    key={idx}
                    className={`folder-item ${
                      selectedFolder?.name === folder.name ? "selected" : ""
                    }`}
                    onClick={() => setSelectedFolder(folder)}
                  >
                    <span>📁 {folder.name}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setShowFolderModal(false)}>
                취소
              </button>
              <button className="confirm-btn" onClick={confirmFolderSelection}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
