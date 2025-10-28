import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/UploadPage.css";

const UploadPage = () => {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "" });

  const navigate = useNavigate();

  useEffect(() => {
    const savedFolders = JSON.parse(localStorage.getItem("userFolders") || "[]");
    setFolders(savedFolders);
  }, []);

  const showToast = (message, callback) => {
    setToast({ show: true, message });

    setTimeout(() => {
      setToast({ show: false, message: "" });
      if (callback) callback();
    }, 2100);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
  };

  const handleFileSelect = (e) => {
    setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  const handleDelete = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (files.length === 0) {
      showToast("업로드할 파일을 선택해주세요.");
      return;
    }
    setShowFolderModal(true);
  };

  const confirmFolderSelection = () => {
    if (!selectedFolder) {
      showToast("업로드할 폴더를 선택해주세요.");
      return;
    }

    const categories = JSON.parse(
      localStorage.getItem(`categories_${selectedFolder.name}`) || "[]"
    );

    const hasCategory = categories.length > 0;

    if (!hasCategory) {
      showToast(
        [
          "카테고리가 없어 문서만 업로드됩니다.",
          <br key="br1" />,
          "카테고리를 생성한 후 분류하기를 눌러주세요."
        ],
        () => navigate(`/directory/${selectedFolder.name}`)
      );
    } else {
      showToast(
        "자동 분류가 적용됩니다!",
        () => navigate(`/directory/${selectedFolder.name}`)
      );
    }

    setShowFolderModal(false);
  };

  return (
    <div className="upload-container">
      <h2 className="upload-title">파일 업로드</h2>

      <div
        className="upload-box"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <p>drag & drop<br/> 또는 클릭하여 파일 선택</p>
        <input type="file" multiple className="file-input" onChange={handleFileSelect} />
      </div>

      {files.length > 0 && (
        <div className="file-list">
          {files.map((file, index) => (
            <div key={index} className="file-item">
              <span className="file-name">{file.name}</span>
              <button className="delete-btn" onClick={() => handleDelete(index)}>✖</button>
            </div>
          ))}
        </div>
      )}

      <button className="upload-btn" onClick={handleUpload}>
        업로드
      </button>

      {showFolderModal && (
        <div className="select-modal-overlay">
          <div className="select-modal">
            <h3 className="modal-title">업로드할 폴더 선택</h3>

            <div className="modal-folder-area">
              {folders.length === 0 ? (
                <p className="modal-empty-text">폴더가 없습니다.</p>
              ) : (
                folders.map((folder, idx) => (
                  <div
                    key={idx}
                    className={`modal-folder-card ${
                      selectedFolder?.name === folder.name ? "active" : ""
                    }`}
                    onClick={() => setSelectedFolder(folder)}
                  >
                    📁 {folder.name}
                  </div>
                ))
              )}
            </div>

            <div className="modal-btn-wrap">
              <button className="modal-btn cancel" onClick={() => setShowFolderModal(false)}>
                취소
              </button>
              <button className="modal-btn ok" onClick={confirmFolderSelection}>
                업로드
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 토스트 */}
      {toast.show && (
        <div className="toast-message">{toast.message}</div>
      )}
    </div>
  );
};

export default UploadPage;
