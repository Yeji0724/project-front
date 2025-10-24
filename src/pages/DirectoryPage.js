import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/DirectoryPage.css";

function DirectoryPage() {
  const [folders, setFolders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const navigate = useNavigate(); // 페이지 이동용

  // localStorage에서 폴더 불러오기
  useEffect(() => {
    const storedFolders = JSON.parse(localStorage.getItem("userFolders") || "[]");
    setFolders(storedFolders);
  }, []);

  // 폴더 생성
  const handleCreateFolder = () => {
    const folderName = newFolderName.trim() === "" ? "unknown" : newFolderName.trim();
    const newFolder = { name: folderName, createdAt: Date.now() };

    const updatedFolders = [newFolder, ...folders];
    setFolders(updatedFolders);
    localStorage.setItem("userFolders", JSON.stringify(updatedFolders));

    setNewFolderName("");
    setShowModal(false);
  };

  // 폴더 클릭 시 카테고리 페이지로 이동
  const handleOpenFolder = (folderName) => {
    navigate(`/directory/${folderName}`);
  };

  return (
    <div className="directory-page">
      <div className="directory-header">
        <h2 className="directory-title">폴더 목록</h2>
        <button className="create-folder-btn" onClick={() => setShowModal(true)}>
          + 폴더 생성
        </button>
      </div>

      <div className="folder-container">
        {folders.length === 0 ? (
          <p className="no-folder-text">생성된 폴더가 없습니다 😢</p>
        ) : (
          folders.map((folder, idx) => (
            <div
              key={idx}
              className="folder-card"
              onClick={() => handleOpenFolder(folder.name)} // 클릭 시 이동
            >
              <span className="folder-icon">📁</span>
              <p className="folder-name">{folder.name}</p>
            </div>
          ))
        )}
      </div>

      {/* 폴더 생성 모달 */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>새 폴더 생성</h3>
            <input
              type="text"
              placeholder="폴더 이름 입력 (미입력 시 unknown)"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="modal-input"
            />
            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>
                취소
              </button>
              <button className="confirm-btn" onClick={handleCreateFolder}>
                생성
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DirectoryPage;
