import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from './pages/ForgotPassword';

export default function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

// ✅ 애니메이션 적용된 라우트 관리 컴포넌트
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence>
      {' '}
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, scale: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1 }} // ✅ 높이 변화 방지
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
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />{' '}
          <Route path="*" element={<Login />} />{' '}
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}
