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
  const [emailSubscription, setEmailSubscription] = useState(true);
  const [agreeAll, setAgreeAll] = useState(false);
  const [agreeServiceTerms, setAgreeServiceTerms] = useState(false);
  const [agreePrivacyPolicy, setAgreePrivacyPolicy] = useState(false);
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

  // 전체동의 시 개별 약관 동기화
  const handleAgreeAllChange = (checked: boolean | 'indeterminate') => {
    const value = checked === true;
    setAgreeAll(value);
    setAgreeServiceTerms(value);
    setAgreePrivacyPolicy(value);
  };

  // 개별 약관 변경 시 전체동의 동기화
  const handleServiceTermsChange = (checked: boolean | 'indeterminate') => {
    const value = checked === true;
    setAgreeServiceTerms(value);
    setAgreeAll(value && agreePrivacyPolicy);
  };

  const handlePrivacyPolicyChange = (checked: boolean | 'indeterminate') => {
    const value = checked === true;
    setAgreePrivacyPolicy(value);
    setAgreeAll(value && agreeServiceTerms);
  };

  // 회원가입
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeServiceTerms || !agreePrivacyPolicy) {
      notification.showAlert('AGREE', '필수 약관에 동의해야 합니다.');
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
    emailSubscription,
    setEmailSubscription,
    agreeAll,
    agreeServiceTerms,
    agreePrivacyPolicy,
    handleAgreeAllChange,
    handleServiceTermsChange,
    handlePrivacyPolicyChange,
    handleImageUpload,
    handleRegister,
  };
};
