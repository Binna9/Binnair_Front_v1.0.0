import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import MainPage from '@/pages/MainPage';
import Login from '@/pages/LoginPage';
import Register from '@/pages/RegisterPage';
import BoardPage from './pages/BoardPage';
import ForgotPassword from '@/pages/PasswordChangePage';
import AiMonitorPage from './pages/AiMonitorPage';
import AuthWrapper from './components/auth/AuthWrapper';
import GoogleAuthHandler from './components/auth/GoogleAuthHandler';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { NotificationProvider } from './context/NotificationContext';
import { useNotification } from './context/NotificationContext';
import { setupNotificationInterceptor } from './utils/apiClient';
import { useEffect } from 'react';
import { ThemeProvider } from './context/Theme/ThemeProvider';
import '@/index.css';

function NotificationInterceptorSetup({ children }) {
  const { showToast } = useNotification();

  useEffect(() => {
    const cleanupInterceptor = setupNotificationInterceptor(showToast);

    return () => {
      cleanupInterceptor();
    };
  }, [showToast]);

  return <>{children}</>;
}

function AppRoutes() {
  const location = useLocation();

  return (
    // 화면 랜더링 전환
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
          {/* <Route path="/event" element={<EventPage />} /> */}
          {/* <Route path="/product" element={<ProductPage />} /> */}
          <Route path="/board" element={<BoardPage />} />
          <Route path="/ai-monitor" element={<AiMonitorPage />} />
          {/* <Route path="/cart" element={<CartPage />} /> */}
          <Route path="*" element={<Login />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <NotificationProvider>
          <Router>
            <NotificationInterceptorSetup>
              <AuthWrapper>
                <AppRoutes />
              </AuthWrapper>
            </NotificationInterceptorSetup>
          </Router>
        </NotificationProvider>
      </ThemeProvider>
    </Provider>
  );
}
