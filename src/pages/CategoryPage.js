import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../css/CategoryPage.css";
import Swal from "sweetalert2";

const CategoryPage = () => {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const folder = location.state?.folder;
  const folderName = folder?.folder_name || "이름 없음";

  const [categories, setCategories] = useState([]);
  const [files, setFiles] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState([]);
  // 분류되지 않은 문서 드롭다운 상태
  const [showUncategorized, setShowUncategorized] = useState(false);


  const [menuOpen, setMenuOpen] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const [modal, setModal] = useState({
    show: false,
    type: "",
    index: null,
    value: "",
  });

  const [directoryPath, setDirectoryPath] = useState("");

  // 백엔드에서 받아올 진행현황
  const [progressStats, setProgressStats] = useState({
    total: 0,
    transform_done: 0,
    classification_done: 0,
    transform_pending: 0,
    classification_pending: 0,
    transform_rate: 0,
    classification_rate: 0,
  });

  // 진행현황 불러오기
  const fetchProgress = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/folders/${folderId}/progress`);
      setProgressStats(res.data);
    } catch (err) {
      console.error("진행현황 불러오기 실패:", err);
    }
  };


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

  // 카테고리 없는 문서 불러오기
  const fetchFilesWithoutCategory = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/files/${folderId}/unclassified`);
      const fetched = res.data.files || [];
      setFiles(fetched);
    } catch (err) {
      console.error("카테고리 없는 파일 불러오기 실패:", err);
    }
  };
  
  useEffect(() => {
    const storedPath = localStorage.getItem(`directoryPath_${folderName}`);
    if (storedPath) setDirectoryPath(storedPath);
    fetchCategories();
    fetchFilesWithoutCategory();
    fetchProgress();
  }, [folderName]);

  // 진행현황 자동 갱신 (3초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchProgress(); // 진행률만 새로 불러오기
    }, 3000); // 3초마다 갱신

    return () => clearInterval(interval); // 페이지 나가면 중단
  }, [folderId]);


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
            <span className="folder-icon2">📁</span>

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

                // 카테고리, 파일 다시 불러오기
                await fetchCategories();
                await fetchFilesWithoutCategory();

                // 진행현황도 같이 새로고침
                await fetchProgress();

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
          
          {/* 분류하기 버튼 */}
          <button
            data-tip="AI로 문서를 자동 분류합니다"
            onClick={async () => {
              try {
                // 백엔드에서 분류 가능한 문서 개수 조회
                const filesRes = await axios.get(`http://localhost:8000/folders/${folderId}/files`);
                const files = filesRes.data.files || [];

                // 분류되지 않은 파일만 계산
                const unclassified = files.filter(
                  (f) => f.is_transform === 2 && f.is_classification === 2 && f.cateory === null
                );

                if (unclassified.length === 0) {
                  Swal.fire({
                    icon: "info",
                    title: "분류할 문서가 없습니다",
                    text: "모든 문서가 이미 분류 완료 상태입니다.",
                    timer: 2000,
                    showConfirmButton: false,
                  });
                  return;
                }

                // 분류 개수 안내창
                const confirm = await Swal.fire({
                  title: "AI 분류 시작",
                  html: `총 <b>${files.length}</b>개 중 <b style="color:#0066ff;">${unclassified.length}</b>개의 문서를 분류합니다.<br>진행하시겠습니까?`,
                  icon: "question",
                  showCancelButton: true,
                  confirmButtonText: "시작하기",
                  cancelButtonText: "취소",
                  reverseButtons: true,
                });

                if (!confirm.isConfirmed) return;

                // 로딩 표시
                Swal.fire({
                  title: "분류 중...",
                  text: "AI가 문서를 분석하고 있어요.",
                  allowOutsideClick: false,
                  didOpen: () => {
                    Swal.showLoading();
                  },
                });

                // 실제 분류 요청
                const res = await axios.post(`http://localhost:8000/folders/${folderId}/classify`);

                Swal.fire({
                  icon: "success",
                  title: "분류 요청 완료",
                  text: `${unclassified.length}개의 파일이 분류 서버로 전달되었습니다.`,
                  timer: 2000,
                  showConfirmButton: false,
                });

                await fetchProgress(); // 진행률 즉시 갱신
                await fetchFilesWithoutCategory();
              } catch (err) {
                console.error("분류 요청 실패:", err);
                Swal.fire({
                  icon: "error",
                  title: "분류 실패",
                  text: "분류 서버와 연결할 수 없습니다.",
                });
              }
            }}
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

      {/* 진행현황 표시줄 */}
        <div className="progress-inline">
          총 {progressStats.total}건 ·
          <span className="waiting"> 추출 대기 {progressStats.transform_waiting}</span> /
          <span className="pending"> 진행 {progressStats.transform_pending}</span> /
          <span className="done"> 완료 {progressStats.transform_done}</span> ·
          <span className="waiting"> 분류 대기 {progressStats.classification_waiting}</span> /
          <span className="pending"> 진행 {progressStats.classification_pending}</span> /
          <span className="done"> 완료 {progressStats.classification_done}</span>
        </div>

      <p className="guide-text2">
        {categories.length === 0
          ? "카테고리를 생성해 문서를 분류할 수 있습니다."
          : "카테고리를 펼쳐 문서를 확인할 수 있습니다."}
      </p>

      {/* content-container */}
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
                      <span className="file-type">
                        {file.file_type?.toUpperCase()}
                      </span>

                      <div className="file-actions">
                        {file.file_type?.toLowerCase() === "zip" && (
                          <button
                            className="unzip-btn"
                            onClick={async () => {
                              try {
                                Swal.fire({
                                  title: "압축 해제 중...",
                                  text: "ZIP 파일의 내용을 추출하고 있어요.",
                                  allowOutsideClick: false,
                                  didOpen: () => Swal.showLoading(),
                                });

                                const res = await axios.post(
                                  `http://localhost:8000/files/unzip/${folderId}/${file.file_id}`
                                );

                                Swal.fire({
                                  icon: "success",
                                  title: "압축 해제 완료!",
                                  text: res.data.message,
                                  timer: 2000,
                                  showConfirmButton: false,
                                });

                                await fetchCategories();
                                await fetchFilesWithoutCategory();
                                await fetchProgress();
                              } catch (err) {
                                Swal.fire({
                                  icon: "error",
                                  title: "압축 해제 실패",
                                  text: "ZIP 파일을 해제하는 중 오류가 발생했습니다.",
                                });
                              }
                            }}
                          >
                            압축해제
                          </button>
                        )}

                        <button className="download-btn">⬇</button>
                        <button
                          className="delete-btn"
                          onClick={async () => {
                            const confirm = await Swal.fire({
                              title: "삭제하시겠어요?",
                              text: `${file.file_name} 파일이 완전히 삭제됩니다.`,
                              icon: "warning",
                              showCancelButton: true,
                              confirmButtonText: "삭제",
                              cancelButtonText: "취소",
                              confirmButtonColor: "#d33",
                              cancelButtonColor: "#aaa",
                            });

                            if (!confirm.isConfirmed) return;

                            try {
                              await axios.delete(
                                `http://localhost:8000/files/${file.file_id}`
                              );
                              Swal.fire({
                                icon: "success",
                                title: "삭제 완료",
                                text: `${file.file_name}이 삭제되었습니다.`,
                                timer: 1500,
                                showConfirmButton: false,
                              });

                              await fetchCategories();
                              await fetchFilesWithoutCategory();
                              await fetchProgress();
                            } catch (err) {
                              console.error("파일 삭제 실패:", err);
                              Swal.fire({
                                icon: "error",
                                title: "삭제 실패",
                                text: "서버에서 파일 삭제 중 오류가 발생했습니다.",
                              });
                            }
                          }}
                        >
                          ✖
                        </button>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="no-data">문서 없음</li>
                )}
              </ul>
            )}
          </div>
        ))}

        {/* 구분선 */}
        {files.length > 0 && <div className="divider-line"></div>}

        {/* 분류되지 않은 문서 */}
        {files.length > 0 && (
          <div className="item-block">
            <div
              className="item-header"
              onClick={() => setShowUncategorized(!showUncategorized)}
            >
              <span className="cat-name">분류되지 않은 문서</span>
              <div className="right-icons">
                <span className="arrow">
                  {showUncategorized ? "▲" : "▼"}
                </span>
              </div>
            </div>

            {showUncategorized && (
              <ul className="drop-files">
                {files.map((file, idx) => (
                  <li key={idx} className="file-item">
                    <span className="file-name">{file.file_name}</span>
                    <span className="file-type">
                      {file.file_type?.toUpperCase()}
                    </span>

                    <div className="file-actions">
                      {file.file_type?.toLowerCase() === "zip" && (
                        <button
                          className="unzip-btn"
                          onClick={async () => {
                            try {
                              Swal.fire({
                                title: "압축 해제 중...",
                                text: "ZIP 파일의 내용을 추출하고 있어요.",
                                allowOutsideClick: false,
                                didOpen: () => Swal.showLoading(),
                              });

                              const res = await axios.post(
                                `http://localhost:8000/files/unzip/${folderId}/${file.file_id}`
                              );

                              Swal.fire({
                                icon: "success",
                                title: "압축 해제 완료!",
                                text: res.data.message,
                                timer: 2000,
                                showConfirmButton: false,
                              });

                              await fetchCategories();
                              await fetchFilesWithoutCategory();
                              await fetchProgress();
                            } catch (err) {
                              Swal.fire({
                                icon: "error",
                                title: "압축 해제 실패",
                                text: "ZIP 파일을 해제하는 중 오류가 발생했습니다.",
                              });
                            }
                          }}
                        >
                          압축해제
                        </button>
                      )}

                      <button className="download-btn">⬇</button>
                      <button
                        className="delete-btn"
                        onClick={async () => {
                          const confirm = await Swal.fire({
                            title: "삭제하시겠어요?",
                            text: `${file.file_name} 파일이 완전히 삭제됩니다.`,
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonText: "삭제",
                            cancelButtonText: "취소",
                            confirmButtonColor: "#d33",
                            cancelButtonColor: "#aaa",
                          });

                          if (!confirm.isConfirmed) return;

                          try {
                            await axios.delete(
                              `http://localhost:8000/files/${file.file_id}`
                            );
                            Swal.fire({
                              icon: "success",
                              title: "삭제 완료",
                              text: `${file.file_name}이 삭제되었습니다.`,
                              timer: 1500,
                              showConfirmButton: false,
                            });

                            await fetchCategories();
                            await fetchFilesWithoutCategory();
                            await fetchProgress();
                          } catch (err) {
                            console.error("파일 삭제 실패:", err);
                            Swal.fire({
                              icon: "error",
                              title: "삭제 실패",
                              text: "서버에서 파일 삭제 중 오류가 발생했습니다.",
                            });
                          }
                        }}
                      >
                        ✖
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
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
