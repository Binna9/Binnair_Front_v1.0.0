import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store/store';

interface AuthState {
  accessToken: string | null;
  user: {
    userId: string; // 사용자 ID
    loginId: string; // 로그인 ID
    username: string; // 사용자 명
    email?: string; // 사용자 이메일
    nickName?: string; // 사용자 별명
    phoneNumber?: string; // 사용자 핸드폰 번호
  } | null;
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
    // ✅ accessToken과 user 정보 저장
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
    },
  },
});

export const { setCredentials, loginSuccess, setUser, setUserImage, logout } =
  authSlice.actions;
export const selectAuth = (state: RootState) => state.auth;
export default authSlice.reducer;
