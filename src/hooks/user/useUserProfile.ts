import {
  UserResponse,
  UserPasswordChangeRequest,
  UserUpdateRequest,
} from './../../types/UserTypes';
import { userService } from '@/services/UserService';
import { useState, useEffect } from 'react';

export const useProfile = (userId: string | null) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ 사용자 정보
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const userData = await userService.getUserById(userId);
        setUser(userData);
      } catch (err) {
        console.error('❌ 프로필 정보를 불러오는 중 오류 발생:', err);
        setError('❌ 프로필 정보를 불러오는 중 오류 발생');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  // ✅ 사용자 수정
  const updateUser = async (
    userId: string,
    userUpdateRequest: UserUpdateRequest
  ) => {
    try {
      await userService.updateUser(userId!, userUpdateRequest);
      setUser((prevUser) =>
        prevUser ? { ...prevUser, ...userUpdateRequest } : null
      );
    } catch (err) {
      console.error('❌ 사용자 정보를 업데이트하는 중 오류 발생:', err);
      setError('❌ 사용자 정보를 업데이트하는 중 오류 발생');
    }
  };

  // ✅ 사용자 삭제
  const deleteUser = async () => {
    try {
      await userService.deleteUser(userId!);
      setUser(null);
    } catch (err) {
      console.error('❌ 사용자를 삭제하는 중 오류 발생:', err);
      setError('❌ 사용자를 삭제하는 중 오류 발생');
    }
  };

  // ✅ 비밀번호 검증
  const verifyPassword = async (currentPassword: string): Promise<boolean> => {
    try {
      return await userService.verifyPassword(currentPassword);
    } catch (err) {
      console.error('❌ 비밀번호 검증 중 오류 발생:', err);
      setError('❌ 비밀번호 검증 중 오류 발생');
      return false;
    }
  };

  // ✅ 비밀번호 변경
  const changePassword = async (
    userPasswordChangeRequest: UserPasswordChangeRequest
  ): Promise<void> => {
    try {
      await userService.changePassword(userPasswordChangeRequest);
    } catch (err: unknown) {
      let errorMessage = '❌ 비밀번호 변경 중 예상치 못한 오류가 발생했습니다.';

      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as { response?: { data?: string } };
        if (axiosError.response?.data) {
          errorMessage = axiosError.response.data;
        }
      }
      console.error(errorMessage);
      setError(errorMessage);
      throw err;
    }
  };

  //  // ✅ 사용자 정보 새로고침 함수
  //  const refreshUserAddresses = async (): Promise<AddressResponse[] | undefined> => {
  //   try {
  //     if (!userId) return undefined;

  //     // 상태 업데이트
  //     setUser((prevUser) =>
  //       prevUser
  //         ? {
  //             ...prevUser,
  //             addresses: [...addresses], // ✅ 깊은 복사 적용 (새로운 배열 할당)
  //           }
  //         : prevUser
  //     );

  //     console.log('✅ 배송지 정보가 갱신되었습니다:', addresses);
  //     return addresses; // 배송지 배열 반환
  //   } catch (err) {
  //     console.error('❌ 배송지 정보를 새로고침하는 중 오류 발생:', err);
  //     setError('❌ 배송지 정보를 새로고침하는 중 오류 발생');
  //     return undefined;
  //   }
  // };

  // //  // ✅ 배송지 추가
  // //  const addAddress = async (addressRequest: AddressRequest) => {
  // //   try {
  // //     await addressService.createAddress(addressRequest);
  // //     // 배송지 목록 새로고침
  // //     const updatedAddresses = await addressService.getUserAddresses();
  // //     setUser((prevUser) =>
  // //       prevUser ? { ...prevUser, addresses: updatedAddresses } : null
  // //     );
  // //   } catch (err) {
  // //     console.error('❌ 배송지 추가 중 오류 발생:', err);
  // //     setError('❌ 배송지 추가 중 오류 발생');
  // //   }
  // // };

  // //   // ✅ 배송지 삭제
  // //   const deleteAddress = async (addressId: string) => {
  // //     try {
  // //       await addressService.removeAddress(addressId);
  // //       // 배송지 목록 새로고침
  // //       const updatedAddresses = await addressService.getUserAddresses();
  // //       setUser((prevUser) =>
  // //         prevUser ? { ...prevUser, addresses: updatedAddresses } : null
  // //       );
  // //     } catch (error) {
  // //       console.error('❌ 배송지 삭제 중 오류 발생:', error);
  // //       setError('❌ 배송지 삭제 중 오류 발생');
  // //     }
  // //   };

  //    // ✅ 기본 배송지 변경
  //    const setDefaultAddress = async (addressId: string) => {
  //     try {
  //       await addressService.updateDefaultAddress(addressId);
  //       // 배송지 목록 새로고침
  //       const updatedAddresses = await addressService.getUserAddresses();
  //       setUser((prevUser) =>
  //         prevUser ? { ...prevUser, addresses: updatedAddresses } : null
  //       );
  //     } catch (err) {
  //       console.error('❌ 기본 배송지 변경 중 오류 발생:', err);
  //       setError('❌ 기본 배송지 변경 중 오류 발생');
  //     }
  //   };

  return {
    user,
    loading,
    error,
    updateUser,
    deleteUser,
    verifyPassword,
    changePassword,
  };
};
