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
import HistoryPage from './pages/HistoryPage';
import DashBoardPage from './pages/DashBoardPage';
import TradePage from './pages/TradePage';
import SettingPage from './pages/SettingPage';
import AuthWrapper from './components/auth/AuthWrapper';
import GoogleAuthHandler from './components/auth/GoogleAuthHandler';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
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
          {/* 공개 라우트 */}
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/google" element={<GoogleAuthHandler />} />
          
          {/* 보호된 라우트 - 로그인 필요 */}
          <Route
            path="/trade"
            element={
              <ProtectedRoute requiredRoles={['ROLE_ADMIN' , 'ROLE_USER' , 'ROLE_SYSTEM']}>
                <TradePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-monitor"
            element={
              <ProtectedRoute requiredRoles={['ROLE_ADMIN' , 'ROLE_USER' , 'ROLE_SYSTEM']}>
                <AiMonitorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute requiredRoles={['ROLE_ADMIN' , 'ROLE_USER' , 'ROLE_SYSTEM']}>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRoles={['ROLE_ADMIN' , 'ROLE_USER' , 'ROLE_SYSTEM']}>
                <DashBoardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/board"
            element={
              <ProtectedRoute requiredRoles={['ROLE_ADMIN' , 'ROLE_USER' , 'ROLE_SYSTEM']}>
                <BoardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/setting"
            element={
              <ProtectedRoute requiredRoles={['ROLE_ADMIN']}>
                <SettingPage />
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={<Login />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
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
      </PersistGate>
    </Provider>
  );
}
