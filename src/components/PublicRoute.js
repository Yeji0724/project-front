import React from "react";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");

  if (token && userId) {
    // 로그인 상태면 SelectPage로 리다이렉트
    return <Navigate to="/select" replace />;
  }

  return children;
};

export default PublicRoute;