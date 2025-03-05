import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/store/authSlice'; // ✅ 변경된 경로

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
