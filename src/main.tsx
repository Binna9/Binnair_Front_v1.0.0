import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App'; // ✅ App 컴포넌트 불러오기
import './index.css';

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
