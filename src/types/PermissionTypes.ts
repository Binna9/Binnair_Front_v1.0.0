export interface PermissionResponse {
  permissionId: string; // 권한 ID
  permissionName: string; // 권한 명
  permissionDescription: string; // 권한 설명
}

export interface PermissionRequest {
  permissionName: string; // 권한 명
  permissionDescription: string; // 권한 설명
}

export interface PageInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface PagedPermissionResponse {
  content: PermissionResponse[];
  page: PageInfo;
}
