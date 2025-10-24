import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../css/CategoryPage.css";

const CategoryPage = () => {
  const { folderName } = useParams();
  const [categories, setCategories] = useState([]);

  // localStorage에서 카테고리 불러오기
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(`categories_${folderName}`) || "[]");
    setCategories(saved);
  }, [folderName]);

  // 카테고리 생성
  const handleCreateCategory = () => {
    const name = prompt("새 카테고리 이름을 입력하세요:");
    if (!name || name.trim() === "") return;

    const newCat = { name: name.trim(), createdAt: Date.now() };
    const updated = [newCat, ...categories];
    setCategories(updated);
    localStorage.setItem(`categories_${folderName}`, JSON.stringify(updated));
  };

  // 🔹 분류하기 (아직은 동작X)
  const handleClassify = () => {
    alert("AI 분류 기능은 추후 구현될 예정입니다 ");
  };

  return (
    <div className="category-page">
      <div className="category-header">
        <h2 className="category-title">📁 {folderName}</h2>
        <div className="category-actions">
          <button className="create-category-btn" onClick={handleCreateCategory}>
            + 카테고리 생성
          </button>
          <button className="classify-btn" onClick={handleClassify}>
            🔍 분류하기
          </button>
        </div>
      </div>

      <div className="category-list">
        {categories.length > 0 ? (
          categories.map((cat, i) => (
            <div key={i} className="category-card">
              🗂️ {cat.name}
            </div>
          ))
        ) : (
          <p className="empty-text">아직 생성된 카테고리가 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
