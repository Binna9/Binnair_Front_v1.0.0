import { Page } from './page';

export interface UserResponse {
  userId: string; // 사용자 ID
  loginId: string; // 로그인 ID
  userName: string; // 사용자 명
  email?: string; // 사용자 이메일
  nickName?: string; // 사용자 별명
  phoneNumber?: string; // 사용자 핸드폰 번호
  imageUrl?: string; // 프로필 이미지 URL
  active?: boolean; // 계정 활성화 상태
  roles?: string[]; // 사용자 역할 목록
}

export interface AuthState {
  user: UserResponse | null;
  accessToken: string | null;
  refreshToken: string | null;
  userImageVersion: number | null;
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

export interface userActiveRequest {
  userId: string;
  active: boolean;
}

// 역할 부여 요청 타입 정의
export interface UserRoleRequest {
  userId: string;
  roleName: string;
}

// 역할 부여 리스트 요청 타입 정의
export interface UserRoleListRequest {
  userRoleRequests: UserRoleRequest[];
}

export type PagedUserResponse = Page<UserResponse>;
