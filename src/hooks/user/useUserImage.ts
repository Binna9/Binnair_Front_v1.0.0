import { useState, useEffect, useCallback } from 'react';
import fileService from '@/services/FileService';
import { FileRequest } from '@/types/File';
import { TargetType } from '@/types/TargetEnum';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setUserImage } from '@/store/slices/authSlice';
import UserService from '@/services/UserService';

export const useUserImage = () => {
  const [profileImage, setProfileImage] = useState<string>(
    '/default-profile.png'
  );
  const userId = useSelector((state: RootState) => state.auth?.user?.userId);
  const userImageUrl = useSelector(
    (state: RootState) => state.auth?.userImageUrl
  );
  const dispatch = useDispatch();

  const fetchUserImage = useCallback(async () => {
    if (!userId) {
      dispatch(setUserImage(null));
      return;
    }
    try {
      const response = await UserService.getUserImage();
      const blobUrl = URL.createObjectURL(response.data);
      dispatch(setUserImage(blobUrl));
      setProfileImage(blobUrl);
    } catch (error) {
      console.error('사용자 이미지 로드 실패:', error);
      dispatch(setUserImage(null));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (!userId) {
      setProfileImage('/default-profile.png');
      return;
    }

    if (!userImageUrl) {
      fetchUserImage();
    } else {
      setProfileImage(userImageUrl);
    }
  }, [userImageUrl, fetchUserImage, userId]);

  const uploadProfileImage = async (file: File) => {
    try {
      if (!userId) {
        throw new Error('로그인이 필요합니다.');
      }

      const fileRequest: FileRequest = {
        targetType: TargetType.USER,
        targetId: userId,
      };

      await fileService.uploadFiles(fileRequest, [file]);

      // 업로드 성공 후 이미지 새로고침
      await fetchUserImage();
      return true;
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
