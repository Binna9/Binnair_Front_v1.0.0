import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/store/authSlice';
import axios from 'axios';

export function useProfileImage(userId: string | null) {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { accessToken } = useSelector(selectAuth);

  useEffect(() => {
    if (!userId) {
      console.log('❌ No userId provided, skipping profile image fetch.');
      return;
    }

    console.log(`🔄 Fetching profile image for userId: ${userId}`);

    const fetchProfileImage = async () => {
      if (!accessToken) {
        console.error('❌ No token found, skipping profile image fetch.');
        return;
      }

      try {
        const response = await fetch(`/users/${userId}/image`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`, // ✅ Redux에서 가져온 토큰 사용
          },
        });

        if (!response.ok) {
          console.error('❌ Failed to fetch profile image:', response.status);
          return;
        }

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);

        console.log('✅ Profile image URL fetched:', imageUrl);
        setProfileImage(imageUrl);
      } catch (error) {
        console.error('❌ Error fetching profile image:', error);
      }
    };

    fetchProfileImage();
  }, [userId, accessToken]);

  // ✅ 프로필 이미지 업로드 기능 추가
  const uploadProfileImage = async (file: File) => {
    if (!accessToken) {
      console.error('❌ No token found, skipping profile image upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.put(
        `/users/${userId}/profile-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 200) {
        const imageUrl = URL.createObjectURL(file);
        setProfileImage(imageUrl);
      }
    } catch (error) {
      console.error('❌ 프로필 이미지 업로드 실패:', error);
    }
  };

  return { profileImage, uploadProfileImage };
}
