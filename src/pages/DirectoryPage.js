import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../css/DirectoryPage.css";

function DirectoryPage() {
  const [folders, setFolders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [warningText, setWarningText] = useState("");
  const [modalType, setModalType] = useState("");
  const [selectedFolderIndex, setSelectedFolderIndex] = useState(null);

  const [menuOpen, setMenuOpen] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const navigate = useNavigate();
  const location = useLocation();
  const userId = Number(localStorage.getItem("user_id"));


  const fetchFolders = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/folders/${userId}`);
      const sorted = response.data.folders.sort(
        (a, b) => new Date(b.last_work) - new Date(a.last_work)
      );
      setFolders(sorted);
    } catch (error) {
      console.error("폴더 목록 불러오기 실패:", error);
    }
  };

  useEffect(() => {
    if(userId) fetchFolders();
  }, [userId]);

  // CategoryPage에서 돌아올 때 강제 새로고침
  useEffect(() => {
    if (location.state?.refresh) {
      fetchFolders();
      // history 정리 (뒤로가기 누를 때 무한 새로고침 방지)
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // 카테고리 변경 감지
  useEffect(() => {
    const checkUpdate = () => {
      const updated = localStorage.getItem("folder_updated");
      if (updated) {
        fetchFolders();
        localStorage.removeItem("folder_updated");
      }
    };

    window.addEventListener("focus", checkUpdate);
    return () => window.removeEventListener("focus", checkUpdate);
  }, []);

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
      const res = await axios.post("http://localhost:8000/folders/create", {
        user_id: userId,
        folder_name: newFolderName.trim(),
      });

      const newFolder = {
        folder_id: res.data.folder_id,
        user_id: userId,
        folder_name: newFolderName.trim(),
        file_cnt: 0,
      };

      setFolders([newFolder, ...folders]);
      setWarningText(""); // 기존 경고문 초기화
      return true;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setWarningText(error.response.data.detail); // “이미 존재하는 폴더 이름입니다.”
      } else {
        console.error("폴더 생성 실패:", error);
        setWarningText("서버 오류가 발생했습니다.")
      }
      return false;
    }
  };

  // DB - 폴더 이름 수정
  const handleRename = async (idx) => {
    if (!newFolderName.trim()) return false;
    const folder = folders[idx];

    try {
      await axios.patch(
        `http://localhost:8000/folders/${folder.folder_id}/rename`,
        { new_name: newFolderName.trim() }
      );

      const res = await axios.get(`http://localhost:8000/folders/${userId}`);
      const sorted = res.data.folders.sort(
        (a, b) => new Date(b.last_work) - new Date(a.last_work)
      );

      setFolders(sorted);
      setWarningText("");
      setShowModal(false);
      setMenuOpen(null);
      return true; // 성공
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setWarningText(error.response.data.detail);
      } else {
        console.error("폴더 이름 수정 실패:", error);
        setWarningText("서버 오류가 발생했습니다.");
      }
      return false; // 실패
    }
  };

  // DB - 폴더 삭제
  const handleDelete = async (idx) => {
  const folder = folders[idx];

  try {
    await axios.delete(`http://localhost:8000/folders/${folder.folder_id}`);

    setFolders(folders.filter((_, i) => i !== idx));
    setShowModal(false);
    setMenuOpen(null);

  } catch (error) {
    console.error("폴더 삭제 실패:", error);
  }
};

  // 모달 확인 동작
  const modalConfirm = async () => {
    let success = false;

    if (modalType === "create") {
      success = await handleCreateFolder();
    } else if (modalType === "rename") {
      success = await handleRename(selectedFolderIndex);
    } else if (modalType === "delete") {
      await handleDelete(selectedFolderIndex);
      success = true;
    }

    // 성공한 경우에만 닫기
    if (success) {
      setShowModal(false);
      setNewFolderName("");
      setSelectedFolderIndex(null);
    }
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
          setWarningText("");
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

              {/* 폴더 이름 */}
              <p className="folder-name">{folder.folder_name}</p>

              {/* 파일 개수 표시 */}
               <div className="folder-footer">
                <span className="file-count-small">
                  {folder.file_cnt ? `파일 ${folder.file_cnt}개` : "파일 0개"}
                </span>

                <div
                  className="menu-dots"
                  onClick={(e) => handleMenuToggle(e, idx)}
                >
                  <span></span><span></span><span></span>
                </div>
              </div>
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
            setWarningText("");
            setShowModal(true);
          }}>
            수정
          </button>
          <button className="delete" onClick={() => {
            setModalType("delete");
            setSelectedFolderIndex(menuOpen);
            setShowModal(true);
          }}>
            삭제
          </button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box1" onClick={(e) => e.stopPropagation()}>
            {modalType === "delete" ? (
              <>
                <h4>폴더를 삭제하시겠습니까?</h4>
                <p className="modal-warning-text">되돌릴 수 없습니다.</p>
              </>
            ) : (
              <>
                <h4>{modalType === "create" ? "새 폴더 생성" : "폴더 이름 수정"}</h4>

                {/* 입력창 */}
                <div className="input-wrap">
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="폴더 이름 (최대 20자)"
                    maxLength={20}
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    autoFocus
                  />

                  {/* 글자수 + 경고문 */}
                  <div className="char-count">
                    {newFolderName.length}/20
                  </div>
                </div>

                {warningText && (
                  <p className="modal-warning-text" style={{ color: "red", marginTop: "6px" }}>
                    {warningText}
                  </p>
                )}
              </>
            )}

            {/* 모달 공통 버튼 */}
            <div className="modal-btn-wrap">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>
                취소
              </button>
              <button
                className="confirm-btn"
                onClick={modalConfirm}
                disabled={modalType !== "delete" && (!newFolderName.trim() || newFolderName.length > 20)}
              >
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
