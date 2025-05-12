export interface ChatMessage {
  id: string; // 메시지 고유 ID
  sender: string; // 메시지 보낸 사람
  content: string; // 메시지 내용
  timestamp: Date; // 메시지 보낸 시간
}

export interface ChatState {
  messages: ChatMessage[]; // 메시지 목록
  isConnected: boolean; // 웹소켓 연결 상태
}
