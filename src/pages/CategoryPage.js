import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../css/CategoryPage.css";

const CategoryPage = () => {
  const { folderName } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [files, setFiles] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);

  const [menuOpen, setMenuOpen] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const [modal, setModal] = useState({
    show: false,
    type: "",
    index: null,
    value: "",
  });

  const [directoryPath, setDirectoryPath] = useState("");

  useEffect(() => {
    const storedPath = localStorage.getItem(`directoryPath_${folderName}`);
    if (storedPath) setDirectoryPath(storedPath);

    const stored = JSON.parse(localStorage.getItem(`categories_${folderName}`) || "[]");
    const sorted = stored.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    setCategories(sorted);

    const storedFiles = JSON.parse(localStorage.getItem(`files_${folderName}`) || "[]");
    setFiles(storedFiles);
  }, [folderName]);

  const saveCategories = (updated) => {
    const sorted = updated.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    setCategories([...sorted]);
    localStorage.setItem(`categories_${folderName}`, JSON.stringify(sorted));
  };

  const toggleCategory = (index) => {
    if (menuOpen !== null) return;
    setExpandedCategory(expandedCategory === index ? null : index);
  };

  const toggleMenu = (e, index) => {
    e.stopPropagation();
    const rect = e.target.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 6, left: rect.left - 100 });
    setMenuOpen(menuOpen === index ? null : index);
  };

  const handleCreateCategory = () => {
    setModal({ show: true, type: "create", index: null, value: "" });
  };

  const handleRename = (index) => {
    setModal({ show: true, type: "rename", index, value: categories[index].name });
    setMenuOpen(null);
  };

  const handleDelete = (index) => {
    setModal({ show: true, type: "delete", index, value: categories[index].name });
    setMenuOpen(null);
  };

  const modalConfirm = () => {
    let updated = [...categories];

    if (modal.type === "create") {
      if (!modal.value.trim()) return;
      updated = [
        { name: modal.value.trim(), createdAt: Date.now(), updatedAt: Date.now(), files: [] },
        ...categories,
      ];
    }

    if (modal.type === "rename") {
      if (!modal.value.trim()) return;
      updated[modal.index].name = modal.value.trim();
      updated[modal.index].updatedAt = Date.now();
    }

    if (modal.type === "delete") {
      updated = categories.filter((_, i) => i !== modal.index);
    }

    saveCategories(updated);
    setModal({ show: false, type: "", index: null, value: "" });
  };

  const handleFolderSelect = (e) => {
    const fileList = e.target.files;
    if (!fileList.length) return;

    const fullPath = fileList[0].webkitRelativePath;
    const rootFolder = fullPath.split("/")[0];

    setDirectoryPath(rootFolder);
    localStorage.setItem(`directoryPath_${folderName}`, rootFolder);
  };

  const pathSegments = directoryPath ? directoryPath.split("/").filter(Boolean) : [];

  return (
    <div className="category-page" onClick={() => setMenuOpen(null)}>
      
      <input
        type="file"
        id="folderInput"
        webkitdirectory="true"
        directory=""
        multiple
        style={{ display: "none" }}
        onChange={handleFolderSelect}
      />

      <div className="top-bar">
        <button className="back-btn" onClick={() => navigate("/directory")}>
          ← 돌아가기
        </button>

        <div className="sync-path-box">
          <span className="folder-icon">📁</span>

          {pathSegments.length > 0 ? (
            pathSegments.map((seg, idx) => (
              <span key={idx} className="path-seg">
                {seg}
                {idx < pathSegments.length - 1 && (
                  <span className="arrow">›</span>
                )}
              </span>
            ))
          ) : (
            <span className="path-placeholder">연결된 디렉토리 없음</span>
          )}

          <button
            className="edit-btn"
            onClick={(e) => {
              e.stopPropagation();
              document.getElementById("folderInput").click();
            }}
          >
            변경
          </button>
        </div>
      </div>

      <div className="folder-top">
        <h2 className="folder-title">{folderName}</h2>
        <div className="folder-actions">
          <button onClick={handleCreateCategory}>카테고리 생성</button>
          <button>분류하기</button>
        </div>
      </div>

      {categories.length === 0 ? (
        <p className="guide-text">카테고리를 생성해 문서를 분류할 수 있습니다.</p>
      ) : files.length === 0 ? (
        <p className="guide-text">문서를 카테고리에 추가해 분류할 수 있습니다.</p>
      ) : (
        <p className="guide-text">카테고리를 펼쳐 문서를 확인할 수 있습니다.</p>
      )}

      <div className="content-container">
        {categories.map((cat, idx) => (
          <div key={idx} className="item-block">
            <div className="item-header" onClick={() => toggleCategory(idx)}>
              <span className="cat-name">{cat.name}</span>

              <div className="right-icons">
                <span
                  className="arrow"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCategory(idx);
                  }}
                >
                  {expandedCategory === idx ? "▲" : "▼"}
                </span>

                <span className="menu-btn" onClick={(e) => toggleMenu(e, idx)}>⋮</span>
              </div>
            </div>

            {expandedCategory === idx && (
              <ul className="drop-files">
                {cat.files?.length ? (
                  cat.files.map((file, i) => <li key={i}>{file.name}</li>)
                ) : (
                  <li className="no-data">문서 없음</li>
                )}
              </ul>
            )}
          </div>
        ))}

        {files.map((file, i) => (
          <div key={i} className="file-card">{file.name}</div>
        ))}
      </div>

      {modal.show && (
        <div className="modal-overlay" onClick={() => setModal({ show: false })}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            {modal.type !== "delete" ? (
              <>
                <h4>
                  {modal.type === "create"
                    ? "새 카테고리 생성"
                    : "카테고리 이름 수정"}
                </h4>

                <input
                  type="text"
                  className="modal-input"
                  value={modal.value}
                  onChange={(e) =>
                    setModal({ ...modal, value: e.target.value })
                  }
                />

                <div className="modal-btn-wrap">
                  <button
                    className="cancel-btn"
                    onClick={() => setModal({ show: false })}
                  >
                    취소
                  </button>
                  <button className="confirm-btn" onClick={modalConfirm}>
                    확인
                  </button>
                </div>
              </>
            ) : (
              <>
                <h4>삭제하시겠어요?</h4>
                <p className="modal-warning-text">되돌릴 수 없습니다.</p>

                <div className="modal-btn-wrap">
                  <button className="cancel-btn"
                    onClick={() => setModal({ show: false })}
                  >
                    취소
                  </button>
                  <button className="confirm-btn delete" onClick={modalConfirm}>
                    삭제
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

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

    </div>
  );
};

export default CategoryPage;
