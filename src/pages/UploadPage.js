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

    const handleUpload = async () => {
        if (files.length === 0) {
        alert("파일을 선택해주세요!");
        return;
        }

        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));

        try {
        const userId = 1;
        const response = await fetch(`http://localhost:8000/upload/?user_id=${userId}`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("업로드 실패");
        }

        const data = await response.json();
        console.log("서버 응답:", data);

        // 업로드 성공 시 페이지 이동
        navigate("/progress");
        } catch (error) {
        console.error("업로드 중 오류:", error);
        alert("업로드 중 오류가 발생했습니다.");
        }
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