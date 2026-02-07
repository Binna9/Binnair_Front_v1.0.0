import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('root 엘리먼트를 찾을 수 없습니다!');
}

const root = createRoot(rootElement);
root.render(<App />);
