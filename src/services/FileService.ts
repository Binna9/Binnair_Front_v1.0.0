import { FileRequest } from './../types/File';
import apiClient from '@/utils/apiClient';

export const fileService = {
  // ✅ 파일 추가
  uploadFiles: async (fileData: FileRequest, files: File[] = []) => {
    try {
      // ✅ FormData 객체 생성
      const formData = new FormData();

      // ✅ 회원가입 데이터를 FormData에 추가
      Object.keys(fileData).forEach((key) => {
        formData.append(key, (fileData as any)[key]);
      });

      // ✅ 파일 추가
      files.forEach((file) => {
        formData.append('files', file);
      });

      // ✅ 전송
      const response = await apiClient.post('/files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ✅ 파일 삭제
  removeFile: async (fileId: string): Promise<void> => {
    await apiClient.delete(`/files/${fileId}`);
  },
};

export default fileService;
