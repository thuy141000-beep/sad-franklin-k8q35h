import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Dòng này nối file màu sắc vào ứng dụng
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);