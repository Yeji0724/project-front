import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../css/CategoryPage.css";

const CategoryPage = () => {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const folder = location.state?.folder;
  const folderName = folder?.folder_name || "이름 없음";

  const [categories, setCategories] = useState([]);
  const [files, setFiles] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState([]);

  const [menuOpen, setMenuOpen] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const [modal, setModal] = useState({
    show: false,
    type: "",
    index: null,
    value: "",
  });

  const [directoryPath, setDirectoryPath] = useState("");

  // 카테고리 목록 불러오기
  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/folders/${folderId}/categories`
      );
      const data = res.data.categories.map((name) => ({
        name,
        updatedAt: Date.now(),
        files: [],
      }));
      setCategories(data);
    } catch (err) {
      console.error("카테고리 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    const storedPath = localStorage.getItem(`directoryPath_${folderName}`);
    if (storedPath) setDirectoryPath(storedPath);
    fetchCategories();
  }, [folderName]);

  // 카테고리 생성
  const handleCreateCategory = () => {
    setModal({ show: true, type: "create", index: null, value: "" });
  };

  // 카테고리 이름 수정
  const handleRename = (index) => {
    setModal({
      show: true,
      type: "rename",
      index,
      value: categories[index].name,
    });
    setMenuOpen(null);
  };

  // 카테고리 삭제
  const handleDelete = (index) => {
    setModal({
      show: true,
      type: "delete",
      index,
      value: categories[index].name,
    });
    setMenuOpen(null);
  };

  // 모달 확인 (CRUD 실행)
  const modalConfirm = async () => {
    try {
      if (modal.type === "create") {
        if (!modal.value.trim()) return;
        await axios.post(
          `http://localhost:8000/folders/${folderId}/categories`,
          { category_name: modal.value.trim() }
        );
      }

      if (modal.type === "rename") {
        if (!modal.value.trim()) return;
        await axios.put(
          `http://localhost:8000/folders/${folderId}/categories/${encodeURIComponent(
            categories[modal.index].name
          )}`,
          { new_name: modal.value.trim() }
        );
      }

      if (modal.type === "delete") {
        await axios.delete(
          `http://localhost:8000/folders/${folderId}/categories/${encodeURIComponent(
            categories[modal.index].name
          )}`
        );
      }

      await fetchCategories();
      localStorage.setItem("folder_updated", Date.now());     // 디렉토리 갱신
      window.dispatchEvent(new Event("focus"));
      setModal({ show: false, type: "", index: null, value: "" });
    } catch (err) {
      console.error("카테고리 작업 실패:", err);
    }
  };

  const toggleCategory = async (index) => {
    if (menuOpen !== null) return;

    const categoryName = categories[index].name;
    const isExpanded = expandedCategories.includes(index);

    if (isExpanded) {
      // 이미 열려 있으면 닫기
      setExpandedCategories(expandedCategories.filter((i) => i !== index));
    } else {
      // 새로 열기
      setExpandedCategories([...expandedCategories, index]);
      await fetchFilesByCategory(categoryName, index);
    }
  };

  const toggleMenu = (e, index) => {
    e.stopPropagation();
    const rect = e.target.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 6, left: rect.left - 100 });
    setMenuOpen(menuOpen === index ? null : index);
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

  // 카테고리별 문서
  const fetchFilesByCategory = async (categoryName, index) => {
  try {
    const res = await axios.get(
      `http://localhost:8000/folders/${folderId}/categories/${encodeURIComponent(categoryName)}/files`
    );

    const updated = [...categories];
    updated[index].files = res.data.files;
    setCategories(updated);
  } catch (err) {
    console.error("문서 목록 불러오기 실패:", err);
  }
};


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
        <button className="back-btn" onClick={() => navigate("/directory", { state: {refresh: true} })}>
          ← 돌아가기
        </button>

        <div className="right-top">
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

          <button
            className="refresh-btn"
            onClick={async (e) => {
              e.stopPropagation();

              try {
                // 폴더 활동 시간 갱신 API 호출
                await axios.patch(`http://localhost:8000/folders/${folderId}/refresh`);

                // DirectoryPage 새로고침 트리거
                localStorage.setItem("folder_updated", Date.now());
                window.dispatchEvent(new Event("focus"));

                // 카테고리 다시 불러오기
                await fetchCategories();

                // 열려 있던 카테고리의 파일 다시 불러오기
                if (expandedCategories.length > 0) {
                  for (const idx of expandedCategories) {
                    const currentCat = categories[idx]?.name;
                    if (currentCat) {
                      await fetchFilesByCategory(currentCat, idx);
                    }
                  }
                }
              } catch (err) {
                console.error("새로고침 중 오류 발생:", err);
              }
            }}
          >
            <span className="refresh-icon">🔄</span>
          </button>
        </div>
      </div>

      <div className="folder-top">
        <h2 className="folder-title">{folderName}</h2>
        <div className="folder-actions">
          <button 
            data-tip="새 카테고리를 추가합니다"
            onClick={handleCreateCategory}
          >
            카테고리 생성
          </button>

          <button
            data-tip="AI로 문서를 자동 분류합니다"
          >
            분류하기
          </button>

          {/* 전체 다운로드 버튼 */}
          <button
            data-tip="폴더 내 모든 문서를 다운로드합니다"
          >
            전체 다운로드
          </button>
        </div>
      </div>

      <p className="guide-text">
        {categories.length === 0
          ? "카테고리를 생성해 문서를 분류할 수 있습니다."
          : "카테고리를 펼쳐 문서를 확인할 수 있습니다."}
      </p>

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
                  {expandedCategories.includes(idx) ? "▲" : "▼"}
                </span>
                <span className="menu-btn" onClick={(e) => toggleMenu(e, idx)}>
                  ⋮
                </span>
              </div>
            </div>
            
            {/* 카테고리 안 문서 */}
            {expandedCategories.includes(idx) && (
              <ul className="drop-files">
                {cat.files && cat.files.length > 0 ? (
                  cat.files.map((file, fIdx) => (
                    <li key={fIdx} className="file-item">
                      <span className="file-name">{file.file_name}</span>
                      <span className="file-type">{file.file_type?.toUpperCase()}</span>
                      <button
                        className="download-btn"
                      >
                        ⬇
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="no-data">문서 없음</li>
                )}
              </ul>
            )}
          </div>
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
                  onChange={(e) => setModal({ ...modal, value: e.target.value })}
                />
                <div className="modal-btn-wrap">
                  <button className="cancel-btn" onClick={() => setModal({ show: false })}>
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
                  <button className="cancel-btn" onClick={() => setModal({ show: false })}>
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
          <button className="download">
            카테고리 다운로드
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
