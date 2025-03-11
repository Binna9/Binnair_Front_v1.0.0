import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';

import { AnimatePresence, motion } from 'framer-motion';
import MainPage from '@/pages/Main';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import EventPage from './pages/Event';
import CustomerPage from './pages/Customer';
import ProductPage from './pages/ProductPage';
import ForgotPassword from '@/pages/ForgotPassword';
import AuthWrapper from './components/auth/AuthWrapper';
import GoogleAuthHandler from './components/auth/GoogleAuthHandler';
import { Provider } from 'react-redux';
import { store } from './store/store';
import '@/index.css';

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        {/* ✅ 새로고침 시 accessToken 자동 갱신 실행 */}
        <AuthWrapper />
        <AnimatedRoutes />
      </Router>
    </Provider>
  );
}

// ✅ 페이지 애니메이션 관리
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, scale: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          width: '100%',
          backgroundColor: '#000',
          minHeight: '100vh',
          overflow: 'hidden',
        }}
      >
        <Routes location={location}>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/google" element={<GoogleAuthHandler />} />
          <Route path="/event" element={<EventPage />} />
          <Route path="/product" element={<ProductPage />} />
          <Route path="/customer" element={<CustomerPage />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}
