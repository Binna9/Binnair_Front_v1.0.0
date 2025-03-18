import { Page } from './page';
import { CommentResponse } from './Comment';

// ✅ 게시판 타입 (백엔드 ENUM과 일치)
export type BoardType = 'NOTICE' | 'FAQ' | 'FREE' | 'SUGGESTION';
export interface BoardResponse {
  boardId: string; // 게시글 ID
  boardType: BoardType; // 게시판 타입
  title: string; // 게시글 제목
  content: string; // 게시글 내용
  views: number; // 조회 수
  likes: number; // 좋아요 수
  writerId: string; // 작성자 ID
  writerName: string; // 작성자 이름
  filePath?: string; // 첨부 파일 경로 (옵션)
  createDatetime: string; // 생성 날짜 (ISO 문자열)
  modifyDatetime: string; // 수정 날짜 (ISO 문자열)
  comments: CommentResponse[]; // 댓글 리스트
}
export interface BoardRequest {
  boardType: BoardType; // 게시판 타입
  title: string; // 게시글 제목
  content: string; // 게시글 내용
  file?: File; // 파일 업로드 (옵션)
}

export type PagedBoardResponse = Page<BoardResponse>;
