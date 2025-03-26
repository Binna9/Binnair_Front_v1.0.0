import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { registerUser } from '@/services/UserService';
import { useNotification } from '@/context/NotificationContext';

export const useRegister = () => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickName, setNickName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const notification = useNotification();
  const navigate = useNavigate();

  // 이미지 업로드
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // files 배열에 파일 추가
      setFiles([file]);

      // 이미지 미리보기 생성
      const previewUrl = URL.createObjectURL(file);
      setProfilePreview(previewUrl);
    }
  };

  useEffect(() => {
    return () => {
      if (profilePreview) {
        URL.revokeObjectURL(profilePreview);
      }
    };
  }, [profilePreview]);

  // 회원가입
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      notification.showAlert('AGREE', '약관에 동의해야 합니다.');
      return;
    }

    const registerData = {
      loginId,
      loginPassword: password,
      confirmPassword,
      nickName,
      userName,
      email,
      phoneNumber,
    };

    try {
      await registerUser(registerData, files);
      notification.showAlert('SUCCESS', '회원가입에 성공하셨습니다.', () => {
        navigate('/login');
      });
    } catch (error) {
      console.error('회원가입 오류:', error);
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
    files,
    agreeTerms,
    setAgreeTerms,
    handleImageUpload,
    handleRegister,
  };
};
