import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/DirectoryPage.css";

function DirectoryPage() {
  const [folders, setFolders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [modalType, setModalType] = useState("");
  const [selectedFolderIndex, setSelectedFolderIndex] = useState(null);

  const [menuOpen, setMenuOpen] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const navigate = useNavigate();
  const userId = 1;

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

  const saveFolders = (updated) => {
    localStorage.setItem("userFolders", JSON.stringify(updated));
    setFolders([...updated]);
  };

  const updateTimestamp = (index) => {
    const updated = [...folders];
    updated[index].updatedAt = Date.now();

    const sorted = updated.sort(
      (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)
    );

    saveFolders(sorted);
  };

  const handleMenuToggle = (e, idx) => {
    e.stopPropagation();
    const rect = e.target.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 6,
      left: rect.left - 100,
    });
    setMenuOpen(menuOpen === idx ? null : idx);
  };

  const handleCreateFolder = () => {
    setModalType("create");
    setNewFolderName("");
    setSelectedFolderIndex(null);
    setShowModal(true);
  };

  const handleRename = (idx) => {
    setModalType("rename");
    setSelectedFolderIndex(idx);
    setNewFolderName(folders[idx].name);
    setShowModal(true);
    setMenuOpen(null);
  };

  const handleDelete = (idx) => {
    setModalType("delete");
    setSelectedFolderIndex(idx);
    setShowModal(true);
    setMenuOpen(null);
  };

  const modalConfirm = () => {
    let updated = [...folders];

    if (modalType === "create") {
      if (!newFolderName.trim()) return;
      updated = [
        { name: newFolderName.trim(), createdAt: Date.now(), updatedAt: Date.now() },
        ...folders,
      ];
    }

    if (modalType === "rename") {
      if (!newFolderName.trim()) return;
      updated[selectedFolderIndex].name = newFolderName.trim();
      updated[selectedFolderIndex].updatedAt = Date.now();
    }

    if (modalType === "delete") {
      const folderName = folders[selectedFolderIndex].name;
      localStorage.removeItem(`categories_${folderName}`);
      localStorage.removeItem(`files_${folderName}`);

      updated = folders.filter((_, i) => i !== selectedFolderIndex);
    }

    const sorted = updated.sort(
      (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)
    );

    saveFolders(sorted);

    setShowModal(false);
    setNewFolderName("");
    setSelectedFolderIndex(null);
  };

  const handleOpenFolder = (folder) => {
    const index = folders.findIndex(f => f.folder_id === folder.folder_id);
    updateTimestamp(index);

    navigate(`/directory/${folder.folder_id}`, { state: { folder: folder } });
  };

  return (
    <div className="directory-page" onClick={() => setMenuOpen(null)}>
      <div className="directory-header">
        <h2 className="directory-title">폴더 목록</h2>
        <button className="create-folder-btn" onClick={handleCreateFolder}>
          + 폴더 생성
        </button>
      </div>

      {/* 추가된 안내 문구 */}
      <p className="guide-text">
        문서를 폴더별로 효율적으로 관리할 수 있습니다.
      </p>

      <div className="folder-container">
        {folders.length === 0 ? (
          <p className="no-folder-text">생성된 폴더가 없습니다.</p>
        ) : (
          folders.map((folder, idx) => (
            <div
              key={idx}
              className="folder-card"
              onClick={() => handleOpenFolder(folder)}
            >
              <span className="folder-icon">📁</span>
              <p className="folder-name">{folder.folder_name}</p>

              <span
                className="folder-menu-btn"
                onClick={(e) => handleMenuToggle(e, idx)}
              >
                ⋮
              </span>
            </div>
          ))
        )}
      </div>

      {menuOpen !== null && (
        <div
          className="menu-box"
          style={{ top: menuPos.top, left: menuPos.left }}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={() => handleRename(menuOpen)}>수정</button>
          <button className="delete" onClick={() => handleDelete(menuOpen)}>
            삭제
          </button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            {modalType === "delete" ? (
              <>
                <h4>폴더를 삭제하시겠습니까?</h4>
                <p className="modal-warning-text">되돌릴 수 없습니다.</p>

                <div className="modal-btn-wrap">
                  <button className="cancel-btn"
                    onClick={() => setShowModal(false)}>
                    취소
                  </button>
                  <button
                    className="confirm-btn delete"
                    onClick={modalConfirm}
                  >
                    삭제
                  </button>
                </div>
              </>
            ) : (
              <>
                <h4>{modalType === "create" ? "새 폴더 생성" : "폴더 이름 수정"}</h4>

                <input
                  type="text"
                  className="modal-input"
                  placeholder="폴더 이름"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                />

                <div className="modal-btn-wrap">
                  <button className="cancel-btn"
                    onClick={() => setShowModal(false)}>
                    취소
                  </button>
                  <button className="confirm-btn"
                    onClick={modalConfirm}>
                    확인
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DirectoryPage;
