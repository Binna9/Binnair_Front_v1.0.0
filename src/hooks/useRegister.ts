import { useState, useEffect } from 'react';
import { registerUser } from '@/services/authService';

export const useRegister = () => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickName, setNickName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);

  useEffect(() => {
    return () => {
      if (profilePreview) {
        URL.revokeObjectURL(profilePreview);
      }
    };
  }, [profilePreview]);

  // ✅ 프로필 이미지 업로드 처리
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // 이전 blob URL 해제
      if (profilePreview) {
        URL.revokeObjectURL(profilePreview);
      }

      // 새 blob URL 생성
      const newPreviewUrl = URL.createObjectURL(file);
      setProfilePreview(newPreviewUrl);
      setProfileImage(file);
    }
  };

  // 회원가입 처리
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert('약관에 동의해야 합니다.');
      return;
    }
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    const formData = new FormData();
    formData.append('loginId', loginId);
    formData.append('loginPassword', password);
    formData.append('nickName', nickName);
    formData.append('userName', userName);
    formData.append('email', email);
    formData.append('phoneNumber', phoneNumber);
    if (profileImage) formData.append('userFile', profileImage);

    try {
      await registerUser(formData);
      alert('회원가입에 성공하셨습니다.');
      window.location.href = '/login';
    } catch (error) {
      alert('회원가입 실패: ' + error);
    }
  };

  return {
    loginId,
    setLoginId,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    nickName,
    setNickName,
    userName,
    setUserName,
    email,
    setEmail,
    phoneNumber,
    setPhoneNumber,
    profilePreview,
    profileImage,
    handleImageUpload,
    agreeTerms,
    setAgreeTerms,
    handleRegister,
  };
};
