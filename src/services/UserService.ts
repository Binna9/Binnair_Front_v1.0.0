import {
  UserResponse,
  UserUpdateRequest,
  UserPasswordChangeRequest,
  PagedUserResponse,
  UserRoleRequest,
} from '@/types/UserTypes';
import { RegisterRequest } from '@/types/RegisterTypes';
import apiClient from '@/utils/apiClient';

// 페이지네이션 파라미터 타입 정의
interface PageRequest {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
}

/** Register(회원가입) */
export const registerUser = async (
  registerData: RegisterRequest,
  files: File[] = []
) => {
  // ✅ FormData 객체 생성
  const formData = new FormData();

  // ✅ 회원가입 데이터를 FormData에 추가
  Object.keys(registerData).forEach((key) => {
    const typedKey = key as keyof RegisterRequest;
    const value = registerData[typedKey];

    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  // ✅ 파일 추가
  files.forEach((file) => {
    formData.append('files', file);
  });

  // ✅ 전송
  const response = await apiClient.post('/registers', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};

// 사용자 서비스 클래스
export const userService = {
  // 현재 사용자 조회
  fetchUser: async (): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>(`/users/fetch`);
    return response.data;
  },

  // 사용자 전체 조회
  getAllUsers: async (
    pageRequest: PageRequest = {
      page: 0,
      size: 9,
      sort: 'createDatetime',
      direction: 'DESC',
    }
  ): Promise<PagedUserResponse | null> => {
    try {
      const { page, size, sort, direction } = pageRequest;
      const response = await apiClient.get<PagedUserResponse>('/users', {
        params: {
          page,
          size,
          sort: `${sort},${direction}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('❌ 사용자 전체 조회 실패:', error);
      return null;
    }
  },

  // 특정 사용자 조회
  getUserById: async (userId: string): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>(`/users/${userId}`);
    return response.data;
  },

  // 사용자 정보 수정
  updateUser: async (
    userId: string,
    userUpdateRequest: UserUpdateRequest
  ): Promise<void> => {
    await apiClient.put(`/users/${userId}`, userUpdateRequest);
  },

  // 사용자 삭제
  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/users/${userId}`);
  },

  // 사용자 이미지 반환
  getUserImage: async () => {
    try {
      const response = await apiClient.get<Blob>(`/users/image`, {
        responseType: 'blob',
      });
      return response;
    } catch (error) {
      console.error('❌ 사용자 이미지 가져오기 실패:', error);
      throw error;
    }
  },

  // 현재 비밀번호 검증
  verifyPassword: async (password: string): Promise<boolean> => {
    const response = await apiClient.post<boolean>('/users/verify-password', {
      password,
    });
    return response.data;
  },

  // 비밀번호 변경
  changePassword: async (
    passwordChangeRequest: UserPasswordChangeRequest
  ): Promise<void> => {
    await apiClient.put('/users/change-password', passwordChangeRequest);
  },

  // 사용자 프로필 이미지 URL 가져오기
  getUserImageUrl: async (): Promise<string> => {
    const response = await apiClient.get<Blob>('/users/image', {
      responseType: 'blob',
    });
    return URL.createObjectURL(response.data);
  },

  // 사용자 역할 부여
  assignRoleToUser: async (roleName: string): Promise<void> => {
    const userRoleRequest: UserRoleRequest = { roleName };
    await apiClient.post(`/users/assign-role`, userRoleRequest);
  },
};

export default userService;
