import { useState, useEffect, useCallback } from 'react';
import fileService from '@/services/FileService';
import { FileRequest } from '@/types/File';
import { TargetType } from '@/types/TargetEnum';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setUserImage } from '@/store/authSlice';
import UserService from '@/services/UserService';

export const useUserImage = () => {
  const [profileImage, setProfileImage] = useState<string>(
    '/default-profile.png'
  );
  const userId = useSelector((state: RootState) => state.auth.user?.userId);
  const userImageUrl = useSelector(
    (state: RootState) => state.auth.userImageUrl
  );
  const dispatch = useDispatch();

  const fetchUserImage = useCallback(async () => {
    try {
      const imageUrl = await UserService.getUserImage();
      dispatch(setUserImage(imageUrl));
      setProfileImage(imageUrl);
    } catch (error) {
      console.error('사용자 이미지 로드 실패:', error);
      dispatch(setUserImage(null));
    }
  }, [dispatch]);

  useEffect(() => {
    if (!userImageUrl) {
      fetchUserImage();
    } else {
      setProfileImage(userImageUrl);
    }
  }, [userImageUrl, fetchUserImage]);

  const uploadProfileImage = async (file: File) => {
    try {
      if (!userId) {
        throw new Error('로그인이 필요합니다.');
      }

      const fileRequest: FileRequest = {
        targetType: TargetType.USER,
        targetId: userId,
      };

      // 파일 업로드
      const response = await fileService.uploadFiles(fileRequest, [file]);

      // 업로드된 이미지 URL로 프로필 이미지 업데이트
      if (response && response.files && response.files.length > 0) {
        const imageUrl = response.files[0].filePath;
        setProfileImage(imageUrl);
        dispatch(setUserImage(imageUrl));
        return imageUrl;
      }

      throw new Error('이미지 업로드에 실패했습니다.');
    } catch (error) {
      console.error('프로필 이미지 업로드 실패:', error);
      throw error;
    }
  };

  return {
    profileImage,
    uploadProfileImage,
    refreshImage: fetchUserImage,
  };
};
