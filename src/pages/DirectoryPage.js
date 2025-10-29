import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
  const userId = Number(localStorage.getItem("userId"));

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/folders/${userId}`);
        setFolders(response.data.folders || []);
      } catch (error) {
        console.error("폴더 목록 불러오기 실패:", error);
      }
    };

    if(userId) fetchFolders();
  }, [userId]);

  const handleMenuToggle = (e, idx) => {
    e.stopPropagation();
    const rect = e.target.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 6,
      left: rect.left - 100,
    });
    setMenuOpen(menuOpen === idx ? null : idx);
    setSelectedFolderIndex(idx);
  };

  // DB - 폴더 생성
  const handleCreateFolder = async () => {
  if (!newFolderName.trim()) return;

  try {
    const res = await axios.post("http://localhost:8000/folders/", {
      user_id: userId,
      folder_name: newFolderName.trim()
    });

    const newFolder = {
      folder_id: res.data.folder_id,
      user_id: userId,
      folder_name: newFolderName.trim(),
      file_cnt: 0
    };

    setFolders([newFolder, ...folders]);
    setShowModal(false);

  } catch (error) {
    console.error("폴더 생성 실패:", error);
  }
};


  // DB - 폴더 이름 수정
  const handleRename = async (idx) => {
  if (!newFolderName.trim()) return;
  const folder = folders[idx];

  try {
    await axios.patch(
      `http://localhost:8000/folders/${folder.folder_id}`,
      { new_name: newFolderName.trim() }
    );

    // DB에서 최신 목록 다시 조회 & 정렬 반영
    const res = await axios.get(`http://localhost:8000/folders/${userId}`);
    const sorted = res.data.folders.sort(
      (a, b) => new Date(b.last_work) - new Date(a.last_work)
    );

    setFolders(sorted);
    setShowModal(false);
    setMenuOpen(null);

  } catch (error) {
    console.error("폴더 이름 수정 실패:", error);
  }
};



  // DB - 폴더 삭제
  const handleDelete = async (idx) => {
  const folder = folders[idx];

  try {
    await axios.delete(`http://localhost:8000/folders/${folder.folder_id}`);

    setFolders(folders.filter((_, i) => i !== idx));
    setShowModal(false);

  } catch (error) {
    console.error("폴더 삭제 실패:", error);
  }
};

  // 모달 확인 동작
  const modalConfirm = () => {
    if (modalType === "create") {
      handleCreateFolder();
    } 
    else if (modalType === "rename") {
      handleRename(selectedFolderIndex);
    } 
    else if (modalType === "delete") {
      handleDelete(selectedFolderIndex);
    }

    setShowModal(false);
    setNewFolderName("");
    setSelectedFolderIndex(null);
  };

  const handleOpenFolder = (folder) => {
    navigate(`/directory/${folder.folder_id}`, { state: { folder: folder } });
  };

  return (
    <div className="directory-page" onClick={() => setMenuOpen(null)}>
      <div className="directory-header">
        <h2 className="directory-title">폴더 목록</h2>
        <button className="create-folder-btn" onClick={() => {
          setModalType("create");
          setNewFolderName("");
          setShowModal(true);
        }}>
          + 폴더 생성
        </button>
      </div>

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
          <button onClick={() => {
            setModalType("rename");
            setNewFolderName(folders[menuOpen]?.folder_name || "");
            setShowModal(true);
          }}>
            수정
          </button>
          <button className="delete" onClick={() => {
            setModalType("delete");
            setShowModal(true);
          }}>
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
              </>
            )}

            <div className="modal-btn-wrap">
              <button className="cancel-btn"
                onClick={() => setShowModal(false)}>
                취소
              </button>
              <button className="confirm-btn"
                onClick={modalConfirm}>
                {modalType === "delete" ? "삭제" : "확인"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DirectoryPage;
