import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../css/CategoryPage.css";
import Swal from "sweetalert2";

const Toast = Swal.mixin({
  toast: true,
  position: "top",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: false,
  customClass: {
    popup: "login-toast-popup",
    title: "login-toast-title",
  },
});

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

  // 백엔드에서 받아올 진행현황
  const [progressStats, setProgressStats] = useState({
    total: 0,
    transform_waiting: 0,
    transform_pending: 0,
    transform_done: 0,
    classification_waiting: 0,
    classification_pending: 0,
    classification_done: 0,
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


  // 카테고리 목록 불러오기 (문서 포함 버전)
  const fetchCategories = async () => {
    try {
      // 카테고리 목록 가져오기
      const res = await axios.get(
        `http://localhost:8000/folders/${folderId}/categories`
      );
      const names = res.data.categories || [];

      // 카테고리 기본 구조 세팅
      const categoryData = names.map((name) => ({
        name,
        updatedAt: Date.now(),
        files: [],
      }));

      // 각 카테고리별 문서 목록 불러오기
      await Promise.all(
        categoryData.map(async (cat, idx) => {
          try {
            const filesRes = await axios.get(
              `http://localhost:8000/folders/${folderId}/categories/${encodeURIComponent(cat.name)}/files`
            );
            categoryData[idx].files = filesRes.data.files || [];
          } catch (err) {
            console.warn(`⚠ ${cat.name} 파일 불러오기 실패:`, err);
          }
        })
      );

      //  한 번에 갱신
      setCategories([...categoryData]);
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

  const refreshAll = async (delay = 300) => {
    // DB 커밋 타이밍 맞춰 잠깐 대기
    await new Promise((r) => setTimeout(r, delay));

    // 최신 데이터로 한 번에 갱신
    await fetchCategories();
    await fetchFilesWithoutCategory();
    await fetchProgress();
  };
  
  useEffect(() => {
    fetchCategories();
    fetchFilesWithoutCategory();
    fetchProgress();
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

  // 카테고리 삭제 (파일은 '분류되지 않은 문서'로 이동)
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

        await new Promise((resolve) => setTimeout(resolve, 500));

        // 최신 목록 불러오기
        await refreshAll(200);

      }

      if (modal.type === "rename") {
        if (!modal.value.trim()) return;
        await axios.put(
          `http://localhost:8000/folders/${folderId}/categories/${encodeURIComponent(
            categories[modal.index].name
          )}`,
          { new_name: modal.value.trim() }
        );

        await new Promise((resolve) => setTimeout(resolve, 300));

        // 최신 목록 불러오기
        await refreshAll(200);

      }

        if (modal.type === "delete") {
          try {
            const targetName = categories[modal.index]?.name;

            await axios.delete(
              `http://localhost:8000/folders/${folderId}/categories/${encodeURIComponent(targetName)}`
            );

            // UI 즉시 반영 (해당 카테고리 제거)
            setCategories((prev) => prev.filter((_, i) => i !== modal.index));

            // '분류되지 않은 문서' 갱신 + 자동 펼치기
            await fetchFilesWithoutCategory();
            setShowUncategorized(true);

            // 진행현황 갱신
            await fetchProgress();

            // 알림 (조금 오래)
            Toast.fire({
              icon: "success",
              html: `
                <div style="text-align:left; line-height:1.4;">
                  <b>카테고리 삭제 완료!</b><br/>
                  <small>'${targetName}' 카테고리가 삭제되었으며,<br/>
                  포함된 문서들은 <b>분류되지 않은 문서</b>로 이동했습니다.</small>
                </div>
              `,
              timer: 5000
            });
          } catch (err) {
            console.error("카테고리 삭제 실패:", err);
            Toast.fire({
              icon: "error",
              html: `
                <div style="text-align:left; line-height:1.4;">
                  <b>삭제 실패!</b><br/>
                  <small>서버에서 카테고리 삭제 중 오류가 발생했습니다.</small>
                </div>
              `,
              timer: 5000
            });
          }
        }

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

  // 전체 다운로드 
  const handleDownloadFolder = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/folders/download/${folderId}`,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], { type: "application/zip" });

      const fileHandle = await window.showSaveFilePicker({
        suggestedName: `${folderName}.zip`,
        types: [
          {
            description: "ZIP 파일",
            accept: { "application/zip": [".zip"] },
          },
        ],
      });

      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();

      Toast.fire({
        icon: "success",
        html: `
          <div style="text-align:left; line-height:1.4;">
            <b>다운로드 완료!</b><br/>
            <small>📁 '${folderName}' 파일이 저장되었습니다.</small>
          </div>
        `,
      });
    } catch (err) {
      console.error("폴더 다운로드 실패:", err);
    }
  };

  // 카테고리별 다운로드 
  const handleDownloadCategory = async (categoryName) => {
    try {
      // 현재 카테고리 안에 파일이 존재하는지 확인
      const targetCategory = categories.find((cat) => cat.name === categoryName);

      if (!targetCategory || !targetCategory.files || targetCategory.files.length === 0) {
        Toast.fire({
          icon: "info",
          html: `
            <div style="
              font-size: 15px;
              font-weight: 500;
              text-align: center;
              color: #333;
              line-height: 1.6;
              font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
            ">
              <span style="display:block; font-weight:700; color:#1a264d;">
                '${categoryName}'
              </span>
              카테고리에 포함된 문서가 없습니다.
            </div>
          `,
          background: "#fff",
          showConfirmButton: false,
          timer: 3500,
        });
        return; // 다운로드 중단
      }

      // 파일이 있는 경우만 백엔드 요청
      const response = await axios.get(
        `http://localhost:8000/folders/download/category/${folderId}/${encodeURIComponent(categoryName)}`,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], { type: "application/zip" });

      const fileHandle = await window.showSaveFilePicker({
        suggestedName: `${categoryName}.zip`,
        types: [
          {
            description: "ZIP 파일",
            accept: { "application/zip": [".zip"] },
          },
        ],
      });

      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();

      Toast.fire({
        icon: "success",
        html: `
          <div style="text-align:left; line-height:1.4;">
            <b>다운로드 완료!</b><br/>
            <small>'${categoryName}.zip' 저장 완료!</small>
          </div>
        `,
      });
    } catch (err) {
      console.error("카테고리 다운로드 실패:", err);
      Toast.fire({
        icon: "error",
        html: `
          <div style="text-align:left; line-height:1.4;">
            <b>다운로드 실패!</b><br/>
            <small>서버에서 파일을 가져오는 중 오류가 발생했습니다.</small>
          </div>
        `,
        timer: 4000,
      });
    }
  };

  // 개별 파일 다운로드
  const handleDownloadFile = async (fileId, fileName) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/folders/download/file/${fileId}`,
        {
          responseType: "blob",
          headers: {
            Accept: "application/octet-stream",
          },
        }
      );

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);

      // 최신 브라우저: showSaveFilePicker
      if (window.showSaveFilePicker) {
        try {
          const fileHandle = await window.showSaveFilePicker({
            suggestedName: fileName,
            types: [
              {
                description: "모든 파일",
                accept: { "application/octet-stream": ["*/*"] },
              },
            ],
          });

          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
        } catch (pickerError) {
          console.warn("showSaveFilePicker 사용 불가, fallback 실행:", pickerError);
          // fallback으로 a태그 다운로드 시도
          const a = document.createElement("a");
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          a.remove();
        }
      } else {
        // 구형 브라우저: 자동 다운로드 링크 생성
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }

      // cleanup
      window.URL.revokeObjectURL(url);

      Toast.fire({
        icon: "success",
        html: `
          <div style="text-align:left; line-height:1.4;">
            <b>다운로드 완료!</b><br/>
            <small>'${fileName}' 저장 완료!</small>
          </div>
        `,
      });
    } catch (err) {
      console.error("파일 다운로드 실패:", err);
    }
  };



  return (
    <div className="category-page" onClick={() => setMenuOpen(null)}>

      <div className="top-bar">
        <button className="back-btn" onClick={() => navigate("/directory", { state: {refresh: true} })}>
          ← 돌아가기
        </button>
      </div>

      <div className="folder-top">
        <h2 className="folder-title">
          {folderName}
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
          </h2>
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
                const filesRes = await axios.get(`http://localhost:8000/folders/${folderId}/files`);
                const files = filesRes.data.files || [];

                const unclassified = files.filter(
                  (f) => f.is_transform === 2 && f.is_classification === 2 && f.category == null
                );

                if (unclassified.length === 0) {
                  Toast.fire({
                    icon: "info",
                    html: `
                      <div style="text-align:center; line-height:1.6;">
                        <b>분류할 문서가 없습니다.</b><br/>
                        <small>파일이 존재하지 않습니다.</small>
                      </div>
                    `,
                    background: "#fff",
                    showConfirmButton: false,
                    timer: 3000,
                  });
                  return;
                }

                // 로딩 Toast 표시
                const loadingToast = Swal.mixin({
                  toast: true,
                  position: "top",
                  showConfirmButton: false,
                  timerProgressBar: true,
                  background: "#fff",
                  customClass: {
                    popup: "login-toast-popup",
                    title: "login-toast-title",
                  },
                  didOpen: () => {
                    Swal.showLoading();
                  },
                });

                loadingToast.fire({
                  icon: "info",
                  html: `
                    <div style="text-align:center; line-height:1.6;">
                      <b>AI 분류 중...</b><br/>
                      <small>문서를 분석하고 있습니다.</small>
                    </div>
                  `,
                  timer: 3000,
                });

                // 실제 분류 요청
                const res = await axios.post(`http://localhost:8000/folders/${folderId}/classify`);

                // 성공 Toast
                Toast.fire({
                  icon: "success",
                  html: `
                    <div style="text-align:left; line-height:1.4;">
                      <b>AI 분류 완료!</b><br/>
                      <small>${files.length}개 문서가 처리되었습니다.</small>
                    </div>
                  `,
                  timer: 4000,
                });

                await fetchProgress();
                await fetchFilesWithoutCategory();
              } catch (err) {
                console.error("분류 요청 실패:", err);
                Toast.fire({
                  icon: "error",
                  html: `
                    <div style="text-align:left; line-height:1.4;">
                      <b>분류 실패!</b><br/>
                      <small>분류 서버와 연결할 수 없습니다.</small>
                    </div>
                  `,
                  timer: 4000,
                });
              }
            }}
          >
            분류하기
          </button>

          {/* 전체 다운로드 버튼 */}
          <button
            data-tip="폴더 내 모든 문서를 다운로드합니다"
            onClick={() => handleDownloadFolder()}
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
                    <li key={fIdx} className="cat-file-item">
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
                                // 🔹 로딩 Toast
                                const loadingToast = Swal.mixin({
                                  toast: true,
                                  position: "top",
                                  showConfirmButton: false,
                                  timerProgressBar: true,
                                  background: "#fff",
                                  customClass: {
                                    popup: "login-toast-popup",
                                    title: "login-toast-title",
                                  },
                                  didOpen: () => {
                                    Swal.showLoading();
                                  },
                                });

                                loadingToast.fire({
                                  icon: "info",
                                  html: `
                                    <div style="text-align:center; line-height:1.6;">
                                      <b>압축 해제 중...</b><br/>
                                      <small>ZIP 파일의 내용을 추출하고 있습니다.</small>
                                    </div>
                                  `,
                                  timer: 2000,
                                });

                                // 실제 해제 요청
                                const res = await axios.post(
                                  `http://localhost:8000/files/unzip/${folderId}/${file.file_id}`
                                );

                                // 성공 Toast
                                Toast.fire({
                                  icon: "success",
                                  html: `
                                    <div style="text-align:left; line-height:1.4;">
                                      <b>압축 해제 완료!</b><br/>
                                      <small>${res.data.message}</small>
                                    </div>
                                  `,
                                  timer: 3500,
                                });

                                await fetchCategories();
                                await fetchFilesWithoutCategory();
                                await fetchProgress();
                              } catch (err) {
                                console.error("ZIP 해제 실패:", err);
                                Toast.fire({
                                  icon: "error",
                                  html: `
                                    <div style="text-align:left; line-height:1.4;">
                                      <b>압축 해제 실패!</b><br/>
                                      <small>ZIP 파일 해제 중 오류가 발생했습니다.</small>
                                    </div>
                                  `,
                                  timer: 4000,
                                });
                              }
                            }}
                          >
                            압축해제
                          </button>
                        )}

                        <button 
                          className="download-btn"
                          onClick={() => handleDownloadFile(file.file_id, file.file_name)}
                        >
                          ⬇
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() =>
                            setModal({
                              show: true,
                              type: "deleteFile",
                              value: file.file_name,
                              fileId: file.file_id,
                            })
                          }
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
                {files.some((f) => f.is_classification === 2) && (
                  <button
                    className="retry-btn"
                    title="분류 실패한 문서만 다시 시도"
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        const failedFiles = files.filter((f) => f.is_classification === 2);
                        if (failedFiles.length === 0) return;

                        // 🔹 로딩 Toast
                        const loadingToast = Swal.mixin({
                          toast: true,
                          position: "top",
                          showConfirmButton: false,
                          timerProgressBar: true,
                          background: "#fff",
                          customClass: {
                            popup: "login-toast-popup",
                            title: "login-toast-title",
                          },
                          didOpen: () => Swal.showLoading(),
                        });

                        loadingToast.fire({
                          icon: "info",
                          html: `
                            <div style="text-align:center; line-height:1.6;">
                              <b>재분류 중...</b><br/>
                              <small>분류 실패한 문서 ${failedFiles.length}개를 다시 시도 중입니다.</small>
                            </div>
                          `,
                          timer: 2500,
                        });

                        // 🔹 재분류 요청
                        await axios.post(`http://localhost:8000/folders/${folderId}/classify/failed`, {
                          retry_failed: true, // 서버에서 이 옵션으로 필터 가능하게 설계 권장
                        });

                        Toast.fire({
                          icon: "success",
                          html: `
                            <div style="text-align:left; line-height:1.4;">
                              <b>재분류 요청 완료!</b><br/>
                              <small>${failedFiles.length}개 문서가 다시 분류됩니다.</small>
                            </div>
                          `,
                          timer: 4000,
                        });

                        await fetchFilesWithoutCategory();
                        await fetchProgress();
                      } catch (err) {
                        console.error("재분류 실패:", err);
                        Toast.fire({
                          icon: "error",
                          html: `
                            <div style="text-align:left; line-height:1.4;">
                              <b>재분류 실패!</b><br/>
                              <small>서버에서 재분류 요청 중 오류가 발생했습니다.</small>
                            </div>
                          `,
                          timer: 4000,
                        });
                      }
                    }}
                  >
                    🔁 실패 문서 재분류
                  </button>
                )}
                <span className="arrow">{showUncategorized ? "▲" : "▼"}</span>
              </div>
            </div>

            {showUncategorized && (
              <ul className="drop-files">
                {files.map((file, idx) => (
                  <li key={idx} className="cat-file-item">
                    <span className="file-name">{file.file_name}</span>
                    <span className="file-type">
                      {file.file_type?.toUpperCase()}
                    </span>

                    <div className="file-actions">
                      {file.file_type?.toLowerCase() === "zip" ? (
                        // 🔹 ZIP 파일: 압축 해제 버튼
                        <button
                          className={`unzip-btn ${file.is_classification === 4 ? "disabled" : ""}`}
                          disabled={file.is_classification === 4}
                          onClick={async () => {
                            if (file.is_classification === 4) return;
                            try {
                              const loadingToast = Swal.mixin({
                                toast: true,
                                position: "top",
                                showConfirmButton: false,
                                timerProgressBar: true,
                                background: "#fff",
                                customClass: {
                                  popup: "login-toast-popup",
                                  title: "login-toast-title",
                                },
                                didOpen: () => Swal.showLoading(),
                              });

                              loadingToast.fire({
                                icon: "info",
                                html: `
                                  <div style="text-align:center; line-height:1.6;">
                                    <b>압축 해제 중...</b><br/>
                                    <small>ZIP 파일의 내용을 추출하고 있습니다.</small>
                                  </div>
                                `,
                                timer: 2000,
                              });

                              const res = await axios.post(
                                `http://localhost:8000/files/unzip/${folderId}/${file.file_id}`
                              );

                              Toast.fire({
                                icon: "success",
                                html: `
                                  <div style="text-align:left; line-height:1.4;">
                                    <b>압축 해제 완료!</b><br/>
                                    <small>${res.data.message}</small>
                                  </div>
                                `,
                                timer: 3500,
                              });

                              await fetchCategories();
                              await fetchFilesWithoutCategory();
                              await fetchProgress();
                            } catch (err) {
                              Toast.fire({
                                icon: "error",
                                html: `
                                  <div style="text-align:left; line-height:1.4;">
                                    <b>압축 해제 실패!</b><br/>
                                    <small>ZIP 파일 해제 중 오류가 발생했습니다.</small>
                                  </div>
                                `,
                                timer: 4000,
                              });
                            }
                          }}
                        >
                          {file.is_classification === 4 ? "해제 완료" : "압축해제"}
                        </button>
                      ) : (
                        // 🔹 ZIP이 아닐 경우 상태 표시
                        (() => {
                          const supported = [
                            "pdf", "hwp", "docx", "pptx", "xlsx",
                            "jpg", "jpeg", "png", "txt"
                          ];
                          const ext = file.file_type?.toLowerCase();

                          let label = "";
                          let statusClass = "";

                          if (!supported.includes(ext)) {
                            label = "미지원";
                            statusClass = "unsupported";
                          } else if (file.is_transform === 0) {
                            label = "대기 중";
                            statusClass = "wait";
                          } else if (file.is_transform === 1) {
                            label = "추출 중";
                            statusClass = "extract";
                          } else if (file.is_transform === 2) {
                            if (file.is_classification === 0) {
                              label = "분류 대기 중";
                              statusClass = "ready";
                            } else if (file.is_classification === 1) {
                              label = "분류 중";
                              statusClass = "classifying";
                            } else if (file.is_classification === 2) {
                              label = "분류 실패";
                              statusClass = "fail";
                            }
                          }

                          return (
                            <span className={`status-label status-${statusClass}`}>
                              {label}
                            </span>
                          );
                        })()
                      )}

                      <button 
                        className="download-btn"
                        onClick={() => handleDownloadFile(file.file_id, file.file_name)}
                      >
                        ⬇
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() =>
                          setModal({
                            show: true,
                            type: "deleteFile",
                            value: file.file_name,
                            fileId: file.file_id,
                          })
                        }
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
                  {modal.type === "create" ? "새 카테고리 생성" : "카테고리 이름 수정"}
                </h4>
                <input
                  type="text"
                  className="modal-input"
                  value={modal.value}
                  onChange={(e) => setModal({ ...modal, value: e.target.value })}
                  autoFocus
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
                <h4>카테고리를 삭제하시겠습니까?</h4>
                <p className="modal-warning-text" style={{ textAlign: "center" }}>
                  <b>'{modal.value}'</b> 카테고리를 삭제하면<br/>
                  해당 카테고리 안의 문서들은 <b>분류되지 않은 문서</b>로 이동합니다.<br/><br/>
                  <small>삭제 후 되돌릴 수 없습니다.</small>
                </p>
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

      {modal.show && modal.type === "deleteFile" && (
        <div className="modal-overlay" onClick={() => setModal({ show: false })}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h4>문서를 삭제하시겠습니까?</h4>
            <p className="modal-warning-text">
              <b>'{modal.value}'</b> <br /> 문서가 삭제됩니다.<br />
              삭제 후 되돌릴 수 없습니다.
            </p>
            <div className="modal-btn-wrap">
              <button className="cancel-btn" onClick={() => setModal({ show: false })}>
                취소
              </button>
              <button
                className="confirm-btn delete"
                onClick={async () => {
                  try {
                    await axios.delete(`http://localhost:8000/files/${modal.fileId}`);
                    await fetchCategories();
                    await fetchFilesWithoutCategory();
                    await fetchProgress();
                    setModal({ show: false });

                    Toast.fire({
                      icon: "success",
                      html: `
                        <div style="text-align:left; line-height:1.4;">
                          <b>삭제 완료!</b><br/>
                          <small>'${modal.value}' 문서가 삭제되었습니다.</small>
                        </div>
                      `,
                      timer: 4000,
                    });
                  } catch (err) {
                    console.error("파일 삭제 실패:", err);
                    Toast.fire({
                      icon: "error",
                      html: `
                        <div style="text-align:left; line-height:1.4;">
                          <b>삭제 실패!</b><br/>
                          <small>서버에서 문서 삭제 중 오류가 발생했습니다.</small>
                        </div>
                      `,
                      timer: 5000,
                    });
                  }
                }}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {menuOpen !== null && (() => {
        const cat = categories[menuOpen];
        if (!cat) return null;
        return (
          <div
            className="menu-box"
            style={{ top: menuPos.top, left: menuPos.left }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => handleRename(menuOpen)}>수정</button>
            <button className="delete" onClick={() => handleDelete(menuOpen)}>
              삭제
            </button>
            <button
              className="download"
              onClick={() => handleDownloadCategory(cat.name)}
            >
              카테고리 다운로드
            </button>
          </div>
        );
      })()}
    </div>
  );
};

export default CategoryPage;
