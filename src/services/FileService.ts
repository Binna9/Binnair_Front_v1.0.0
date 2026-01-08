import { FileRequest } from './../types/File';
import apiClient from '@/utils/apiClient';
import { store } from '@/store/store';

export const fileService = {
  // ✅ 파일 추가
  uploadFiles: async (fileData: FileRequest, files: File[] = []) => {
    const formData = new FormData();

    // ✅ fileData 객체를 타입 안전하게 FormData에 추가
    Object.keys(fileData).forEach((key) => {
      const typedKey = key as keyof FileRequest;
      const value = fileData[typedKey];

      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    // ✅ 파일 추가
    files.forEach((file) => {
      formData.append('files', file);
    });

    // ✅ 전송 - /files/upload 엔드포인트 사용
    const response = await apiClient.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  },

  // ✅ 파일 삭제 (단일)
  removeFile: async (fileId: string): Promise<void> => {
    await apiClient.post('/files/delete', [fileId], {
      headers: { 'Content-Type': 'application/json' },
    });
  },

  // ✅ 파일 다중 삭제
  removeFiles: async (fileIds: string[]): Promise<void> => {
    await apiClient.post('/files/delete', fileIds, {
      headers: { 'Content-Type': 'application/json' },
    });
  },

  // ✅ 파일 다운로드 (인증 포함)
  downloadFile: async (fileId: string, fileName: string): Promise<void> => {
    try {
      const { accessToken } = store.getState().auth;
      
      const response = await apiClient.get(`/files/${fileId}`, {
        responseType: 'blob',
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : '',
        },
      });

      // Blob URL 생성 및 다운로드
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('파일 다운로드 오류:', error);
      throw error;
    }
  },
};

export default fileService;
