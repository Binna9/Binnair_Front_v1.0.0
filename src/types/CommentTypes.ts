export interface CommentResponse {
  commentId: string; // 댓글 ID
  content: string; // 댓글 내용
  writerId: string; // 작성자 ID
  writerName: string; // 작성자 이름
  createDatetime: string; // 생성 날짜 (ISO 문자열)
  replies: CommentResponse[]; // 대댓글 리스트
}

export interface CommentRequest {
  boardId: string; // 게시글 ID
  parentId?: string; // 부모 댓글 ID (대댓글일 경우)
  content: string; // 댓글 내용
}

export interface CommentUpdateRequest {
  content: string;
}
