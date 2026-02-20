import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import MainPage from '@/pages/MainPage';
import BoardPage from './pages/BoardPage';
import Login from '@/pages/LoginPage';
import DashBoardPage from './pages/DashBoardPage';
import TradePage from './pages/TradePage';
import SettingPage from './pages/SettingPage';
import AuthWrapper from './components/auth/AuthWrapper';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Provider } from 'react-redux';
import { useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor, type AppDispatch } from './store/store';
import { NotificationProvider } from './context/NotificationContext';
import { useNotification } from './context/NotificationContext';
import { setupNotificationInterceptor } from './utils/apiClient';
import { useEffect, useLayoutEffect } from 'react';
import { ThemeProvider } from './context/Theme/ThemeProvider';
import '@/index.css';
import { routeTransitionFinished, routeTransitionStarted } from '@/store/slices/uiSlice';
import { GlobalLoadingOverlay } from '@/components/ui/GlobalLoadingOverlay';

function NotificationInterceptorSetup({ children }) {
  const { showToast } = useNotification();

  useLayoutEffect(() => {
    const cleanupInterceptor = setupNotificationInterceptor(showToast);

    return () => {
      cleanupInterceptor();
    };
  }, [showToast]);

  return <>{children}</>;
}

function AppRoutes() {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  // 라우트 전환에도 로딩 딜레이(최소 유지)를 적용
  useEffect(() => {
    dispatch(routeTransitionStarted());
    const t = window.setTimeout(() => {
      dispatch(routeTransitionFinished());
    }, 450);
    return () => window.clearTimeout(t);
  }, [dispatch, location.pathname]);

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
          <Route
            path="/trade"
            element={
              <ProtectedRoute requiredRoles={['ROLE_ADMIN' , 'ROLE_USER' , 'ROLE_SYSTEM']}>
                <TradePage />
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
                <BoardPage />
            }
          />
          <Route
            path="/setting"
            element={
                <SettingPage />
            }
          />
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
                  <GlobalLoadingOverlay showDelayMs={0} minVisibleMs={450} />
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
