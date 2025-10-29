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
  const userId = Number(localStorage.getItem("userId"));

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await fetch(`http://localhost:8000/folders/${userId}`);
        if (!response.ok) throw new Error("서버 응답 오류");
        const data = await response.json();

        // data가 { folders: [...] } 형태라면 아래처럼 처리
        const folderList = data.folders || data; 
        setFolders(folderList);
        console.log(folderList)
      } catch (error) {
        console.error("폴더 목록 불러오기 실패:", error);
      }
    };

    fetchFolders();
  }, [userId]);

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

  const confirmFolderSelection = async () => {
    if (!selectedFolder) {
      showToast("업로드할 폴더를 선택해주세요.");
      return;
    }

    try {
      // ✅ 1️⃣ 파일 업로드 (FormData 생성)
      const formData = new FormData();
      formData.append("user_id", userId);
      formData.append('folder_id', selectedFolder.folder_id);
      files.forEach((file) => {
        formData.append("files", file);
      });

      // ✅ 2️⃣ 업로드 요청 보내기
      const uploadRes = await fetch(`http://localhost:8000/upload/`, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("파일 업로드 실패");

      console.log("✅ 파일 업로드 성공");

      // ✅ 백엔드에서 카테고리 목록 가져오기
      const res = await fetch(`http://localhost:8000/folders/${selectedFolder.folder_id}/category`);
      if (!res.ok) throw new Error("카테고리 불러오기 실패");
      const data = await res.json();
      const categories = data.categories || [];

      const hasCategory = categories.length > 0;

      if (!hasCategory) {
        showToast(
          [
            "카테고리가 없어 문서만 업로드됩니다.",
            <br key="br1" />,
            "카테고리를 생성한 후 분류하기를 눌러주세요.",
          ],
          () => navigate(`/directory/${selectedFolder.folder_id}`, { state: { folder: selectedFolder } })
        );
      } else {
        showToast(
          "자동 분류가 적용됩니다!",
          () => navigate(`/directory/${selectedFolder.folder_id}`, { state: { folder: selectedFolder } })
        );
      }
    } catch (err) {
      console.error("카테고리 불러오기 오류:", err);
      showToast("카테고리 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setShowFolderModal(false);
    }
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
                      selectedFolder?.folder_name === folder.folder_name ? "active" : ""
                    }`}
                    onClick={() => setSelectedFolder(folder)}
                  >
                    📁 {folder.folder_name}
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
