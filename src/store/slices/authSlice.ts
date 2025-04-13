import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import { RootState } from '@/store/store';

interface User {
  userId: string;
  loginId: string;
  userName: string;
  email?: string;
  nickName?: string;
  phoneNumber?: string;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  userImageUrl: string | null;
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
  userImageUrl: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ accessToken: string; user: AuthState['user'] }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
    },
    loginSuccess: (state, action: PayloadAction<{ accessToken: string }>) => {
      state.accessToken = action.payload.accessToken;
    },
    setUser: (state, action: PayloadAction<AuthState['user']>) => {
      state.user = action.payload;
    },
    setUserImage: (state, action: PayloadAction<string | null>) => {
      state.userImageUrl = action.payload;
    },
    logout: (state) => {
      state.accessToken = null;
      state.user = null;
      state.userImageUrl = null;
      // localStorage 초기화
      storage.removeItem('persist:root');
    },
  },
});

export const { setCredentials, loginSuccess, setUser, setUserImage, logout } =
  authSlice.actions;
export const selectAuth = (state: RootState) => state.auth;
export default authSlice.reducer;
