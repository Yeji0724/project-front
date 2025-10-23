import React from "react";
import "../css/Footer.css";

const Footer = ({ isFixed = false }) => {
  return (
    <footer className={`footer ${isFixed ? "footer-fixed" : ""}`}>
      © 2025 사이트이름 | All Rights Reserved.
    </footer>
  );
};

export default Footer;
