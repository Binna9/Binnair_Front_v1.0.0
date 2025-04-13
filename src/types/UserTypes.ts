import { Page } from './page';

export interface UserResponse {
  userId: string; // 사용자 ID
  loginId: string; // 로그인 ID
  userName: string; // 사용자 명
  email?: string; // 사용자 이메일
  nickName?: string; // 사용자 별명
  phoneNumber?: string; // 사용자 핸드폰 번호
  imageUrl?: string; // 프로필 이미지 URL
}

export interface AuthState {
  user: UserResponse | null;
  accessToken: string | null;
  refreshToken: string | null;
  userImageUrl: string | null;
}

export interface UserRequest {
  loginId: string; // 로그인 ID
  loginPassword: string;
  username: string; // 사용자 명
  email?: string; // 사용자 이메일
  nickName?: string; // 사용자 별명
  phoneNumber?: string; // 사용자 핸드폰 번호
}

export interface UserUpdateRequest {
  username?: string;
  email?: string;
  nickName?: string;
  phoneNumber?: string;
}

export interface UserPasswordChangeRequest {
  currentPassword: string; // 현재 비밀번호
  newPassword: string; // 새 비밀번호
  confirmPassword: string; // 새 비밀번호 확인
}

export type PagedUserResponse = Page<UserResponse>;
