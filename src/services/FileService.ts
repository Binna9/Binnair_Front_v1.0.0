import { FileRequest } from './../types/File';
import apiClient from '@/utils/apiClient';

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

    // ✅ 전송
    const response = await apiClient.post('/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  },

  // ✅ 파일 삭제
  removeFile: async (fileId: string): Promise<void> => {
    await apiClient.delete(`/files/${fileId}`);
  },
};

export default fileService;
