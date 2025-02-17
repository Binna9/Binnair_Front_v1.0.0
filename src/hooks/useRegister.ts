import { useState } from 'react';

export function useRegister() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickName, setNickName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // 🔹 회원가입 처리
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ 비밀번호 확인 (컬럼 없음 → 입력값 일치 여부만 체크)
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!agreeTerms) {
      alert('서비스 이용 약관에 동의해야 합니다.');
      return;
    }

    const formData = new FormData();
    formData.append('loginId', loginId);
    formData.append('loginPassword', password);
    formData.append('userName', userName);
    formData.append('email', email);
    formData.append('nickName', nickName);
    formData.append('phoneNumber', phoneNumber);
    if (profileImage) {
      formData.append('userFile', profileImage);
    }

    try {
      const response = await fetch('/registers', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('회원가입에 성공하셨습니다!'); // ✅ 팝업창 표시
        window.location.href = '/login'; // ✅ 로그인 페이지로 이동
      } else {
        const errorData = await response.json();
        alert(`회원가입 실패: ${errorData.message}`);
      }
    } catch (error) {
      console.error('회원가입 오류:', error);
      alert('회원가입 중 오류가 발생했습니다.');
    }
  };

  // 🔹 프로필 이미지 업로드
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setProfileImage(event.target.files[0]);
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
    profileImage,
    handleImageUpload,
    agreeTerms,
    setAgreeTerms,
    handleRegister,
  };
}
