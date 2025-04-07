import { useState } from 'react';
import { userService } from '@/services/UserService';

export const useUserImage = () => {
  const [profileImage, setProfileImage] = useState<string>('/default-profile.png');

  const uploadProfileImage = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      await userService.uploadUserImage(formData);
      const imageUrl = await userService.getUserImage();
      setProfileImage(imageUrl);
    } catch (error) {
      console.error('프로필 이미지 업로드 실패:', error);
      throw error;
    }
  };

  return {
    profileImage,
    uploadProfileImage,
  };
}; 