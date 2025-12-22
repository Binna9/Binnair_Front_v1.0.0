import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import { RootState } from '@/store/store';
import { extractRolesFromToken } from '@/utils/jwtDecoder';

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
  userImageVersion: number | null;
  roles: string[];
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
  userImageVersion: null,
  roles: [],
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
      // Access Token에서 roles 추출
      state.roles = extractRolesFromToken(action.payload.accessToken);
    },
    loginSuccess: (state, action: PayloadAction<{ accessToken: string }>) => {
      state.accessToken = action.payload.accessToken;
      // Access Token에서 roles 추출
      state.roles = extractRolesFromToken(action.payload.accessToken);
    },
    setUser: (state, action: PayloadAction<AuthState['user']>) => {
      state.user = action.payload;
    },
    setImageVersion: (state, action: PayloadAction<number | null>) => {
      state.userImageVersion = action.payload;
    },
    updateRoles: (state) => {
      // accessToken이 변경되었을 때 roles 업데이트
      state.roles = extractRolesFromToken(state.accessToken);
    },
    logout: (state) => {
      state.accessToken = null;
      state.user = null;
      state.userImageVersion = null;
      state.roles = [];
      // localStorage 초기화
      storage.removeItem('persist:root');
    },
  },
});

export const { setCredentials, loginSuccess, setUser, setImageVersion, updateRoles, logout } =
  authSlice.actions;
export const selectAuth = (state: RootState) => state.auth;
export default authSlice.reducer;
