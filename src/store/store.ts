import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/store/authSlice';
import { profileSlice } from '@/hooks/user/useUserImage';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
