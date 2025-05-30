import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-links">
          <a href="/terms">이용약관</a>
          <a href="/privacy">개인정보 처리방침</a>
          <a href="/support">고객센터</a>
        </div>
        <div className="footer-info">
          <p>© 2024 카라. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 