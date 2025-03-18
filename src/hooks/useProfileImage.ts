import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'; // useDispatch 추가
import { selectAuth } from '@/store/authSlice';
import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit'; // createSlice 추가

export const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    profileImage: null,
  },
  reducers: {
    setProfileImage: (state, action) => {
      state.profileImage = action.payload;
    },
  },
});

export const { setProfileImage } = profileSlice.actions;
export const selectProfileImage = (state) => state.profile.profileImage;

export function useProfileImage() {
  const dispatch = useDispatch();
  const profileImage = useSelector(selectProfileImage);
  const { accessToken } = useSelector(selectAuth);

  // 사용자 이미지 반환
  useEffect(() => {
    const fetchProfileImage = async () => {
      if (!accessToken) {
        console.error('❌ No token found, skipping profile image fetch.');
        return;
      }

      try {
        const response = await fetch(`/users/image`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          console.error('❌ Failed to fetch profile image:', response.status);
          return;
        }

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);

        console.log('✅ Profile image URL fetched:', imageUrl);
        dispatch(setProfileImage(imageUrl));
      } catch (error) {
        console.error('❌ Error fetching profile image:', error);
      }
    };

    fetchProfileImage();
  }, [accessToken, dispatch]);

  // 사용자 이미지 업로드 기능
  const uploadProfileImage = async (file: File): Promise<string> => {
    if (!accessToken) {
      console.error('❌ No token found, skipping profile image upload.');
      return '';
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.put(`/users/image-upload`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        const imageUrl = URL.createObjectURL(file);
        dispatch(setProfileImage(imageUrl));
        return imageUrl;
      }
      return '';
    } catch (error) {
      console.error('❌ 프로필 이미지 업로드 실패:', error);
      return '';
    }
  };

  const updateProfileImage = (url: string) => {
    dispatch(setProfileImage(url));
  };

  return {
    profileImage,
    uploadProfileImage,
    setProfileImage: updateProfileImage,
  };
}
