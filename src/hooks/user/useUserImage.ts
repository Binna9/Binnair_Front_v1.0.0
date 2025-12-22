import { useState, useEffect, useCallback, useRef } from 'react';
import fileService from '@/services/FileService';
import { FileRequest } from '@/types/File';
import { TargetType } from '@/types/TargetEnum';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setImageVersion } from '@/store/slices/authSlice';
import userService from '@/services/UserService';
import apiClient from '@/utils/apiClient';

export const useUserImage = () => {
  const userId = useSelector((state: RootState) => state.auth?.user?.userId);
  const accessToken = useSelector((state: RootState) => state.auth?.accessToken);
  const userImageVersion = useSelector(
    (state: RootState) => state.auth?.userImageVersion
  );
  const dispatch = useDispatch();
  const [profileImage, setProfileImage] = useState<string>('/default-profile.png');
  const blobUrlRef = useRef<string | null>(null);

  // 이전 blob URL 정리 (컴포넌트 언마운트 시)
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  // accessToken이 준비되지 않았을 때 refresh 시도
  const ensureAccessToken = useCallback(async (): Promise<boolean> => {
    if (accessToken) {
      return true;
    }

    // refreshToken이 있는지 확인 (쿠키 또는 localStorage)
    const hasRefreshToken = document.cookie.includes('refreshToken=') || 
                           localStorage.getItem('refreshToken');

    if (!hasRefreshToken) {
      return false;
    }

    try {
      // refresh 시도
      const response = await apiClient.post('/auth/refresh', {}, {
        withCredentials: true,
      });
      
      // accessToken이 자동으로 store에 저장됨 (apiClient interceptor 또는 AuthWrapper)
      return !!response.data?.accessToken;
    } catch (error) {
      console.error('accessToken 복구 실패:', error);
      return false;
    }
  }, [accessToken]);

  // 이미지를 인증된 요청으로 가져와서 blob URL 생성
  const fetchUserImage = useCallback(async () => {
    if (!userId) {
      dispatch(setImageVersion(null));
      setProfileImage('/default-profile.png');
      return;
    }

    // accessToken이 준비될 때까지 대기
    const hasToken = await ensureAccessToken();
    if (!hasToken && !accessToken) {
      console.warn('accessToken이 없어 이미지를 가져올 수 없습니다.');
      setProfileImage('/default-profile.png');
      return;
    }

    try {
      // 이전 blob URL 정리
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }

      // 인증된 요청으로 이미지 가져오기 (apiClient가 자동으로 Authorization 헤더 추가)
      // userService.getUserImage는 버전 파라미터를 지원하지 않으므로 직접 apiClient 사용
      const versionParam = userImageVersion ? `?v=${userImageVersion}` : '';
      const response = await apiClient.get<Blob>(`/users/image${versionParam}`, {
        responseType: 'blob',
      });

      const blobUrl = URL.createObjectURL(response.data);
      blobUrlRef.current = blobUrl;
      setProfileImage(blobUrl);

      // 이미지 버전 업데이트 (없으면 초기화)
      if (!userImageVersion) {
        const imageVersion = Date.now();
        dispatch(setImageVersion(imageVersion));
      }
    } catch (error) {
      console.error('사용자 이미지 로드 실패:', error);
      setProfileImage('/default-profile.png');
      
      // 403/401 에러가 아닌 경우에만 버전 초기화
      if (error.response?.status !== 403 && error.response?.status !== 401) {
        dispatch(setImageVersion(null));
      }
    }
  }, [dispatch, userId, userImageVersion, accessToken, ensureAccessToken]);

  useEffect(() => {
    if (!userId) {
      setProfileImage('/default-profile.png');
      // blob URL 정리
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      return;
    }

    // accessToken이 준비되면 이미지 가져오기
    if (accessToken) {
      fetchUserImage();
    } else {
      // accessToken이 없으면 준비될 때까지 대기
      ensureAccessToken().then((hasToken) => {
        if (hasToken) {
          fetchUserImage();
        }
      });
    }
  }, [userId, accessToken, userImageVersion, fetchUserImage, ensureAccessToken]);

  const uploadProfileImage = async (file: File) => {
    try {
      if (!userId) {
        throw new Error('로그인이 필요합니다.');
      }

      // accessToken 확인
      const hasToken = await ensureAccessToken();
      if (!hasToken && !accessToken) {
        throw new Error('인증 토큰이 필요합니다.');
      }

      const fileRequest: FileRequest = {
        targetType: TargetType.USER,
        targetId: userId,
      };

      await fileService.uploadFiles(fileRequest, [file]);

      // 업로드 성공 후 이미지 버전 업데이트 (캐시 무력화)
      const imageVersion = Date.now();
      dispatch(setImageVersion(imageVersion));
      // 버전이 업데이트되면 useEffect에서 자동으로 이미지 다시 로드됨
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
