import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/UploadPage.css";

const UploadPage = () => {
    const [files, setFiles] = useState([]);
    const navigate = useNavigate();

    const handleDrop = (e) => {
        e.preventDefault();
        const newFiles = Array.from(e.dataTransfer.files);
        setFiles((prev) => [...prev, ...newFiles]);
    };

    const handleFileSelect = (e) => {
        const newFiles = Array.from(e.target.files);
        setFiles((prev) => [...prev, ...newFiles]);
    };

    const handleDelete = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleUpload = () => {
        if (files.length ===0) {
            alert("선택한 파일이 없습니다.");
            return;
        }
        // 업로드 로직 추가
        navigate("/progress");      // 업로드 후 진행현황 페이지로 이동
    };

    return (
        <div className="upload-container">
            <h2 className="upload-title">파일 업로드</h2>
            <div className="upload-box" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
                <p>drag and drop<br />클릭하면 클릭 탐색기</p>
                <input type="file" multiple onChange={handleFileSelect} className="file-input" />
            </div>

            <div className="file-list">
                {files.map((file, index) => (
                    <div key={index} className="file-item">
                        <sapn>{file.name}</sapn>
                        <button className="delete-btn" onClick={() => handleDelete(index)}>
                            X
                        </button>
                    </div>
                ))}
            </div>

            <button className="upload-btn" onClick={handleUpload}>
                업로드
            </button>
        </div>
    );
};

export default UploadPage;