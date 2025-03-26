export interface RegisterRequest {
  loginId: string; // 로그인 ID
  loginPassword: string; // 비밀번호
  confirmPassword: string; // 비밀번호 확인
  userName: string; // 사용자 명
  email: string; // 사용자 이메일
  nickName: string; // 사용자 별칭
  phoneNumber: string; // 핸드폰 번호
}
