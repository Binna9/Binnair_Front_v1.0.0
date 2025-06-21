import apiClient from '@/utils/apiClient';
import {
  PermissionResponse,
  PermissionRequest,
  PagedPermissionResponse,
} from '@/types/PermissionTypes';

// 페이지네이션 파라미터 타입 정의
interface PageRequest {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
}

export const permissionService = {
  // 권한 전체 조회
  getAllPermissions: async (
    pageRequest: PageRequest = {
      page: 0,
      size: 8,
      sort: 'createDatetime',
      direction: 'DESC',
    }
  ): Promise<PagedPermissionResponse | null> => {
    try {
      const { page, size, sort, direction } = pageRequest;
      const response = await apiClient.get<PagedPermissionResponse>(
        '/permissions',
        {
          params: {
            page,
            size,
            sort: `${sort},${direction}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('❌ 역할 전체 조회 실패:', error);
      return null;
    }
  },

  // 권한 개별 조회
  getPermissionById: async (
    permissionId: string
  ): Promise<PermissionResponse> => {
    const response = await apiClient.get<PermissionResponse>(
      `/permissions/${permissionId}`
    );
    return response.data;
  },

  // 권한 생성
  createPermission: async (
    permissionRequest: PermissionRequest
  ): Promise<void> => {
    await apiClient.post('/permissions', permissionRequest);
  },

  // 권한 수정
  updatePermission: async (
    permissionId: string,
    permissionRequest: PermissionRequest
  ): Promise<void> => {
    await apiClient.put(`/permissions/${permissionId}`, permissionRequest);
  },

  // 권한 삭제
  deletePermission: async (permissionId: string): Promise<void> => {
    await apiClient.delete(`/permissions/${permissionId}`);
  },
};
export default permissionService;
