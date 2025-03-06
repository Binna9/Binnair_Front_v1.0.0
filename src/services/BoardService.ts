import apiClient from '@/utils/apiClient';
import { BoardType, BoardResponse, BoardRequest } from '@/types/Board';

// ✅ 게시글 목록 조회
export const fetchBoards = async (
  boardType: BoardType
): Promise<BoardResponse[]> => {
  const response = await apiClient.get<BoardResponse[]>(
    `/boards?boardType=${boardType}`
  );
  return response.data;
};

// ✅ 게시글 개별 조회
export const fetchBoardById = async (
  boardId: string
): Promise<BoardResponse> => {
  const response = await apiClient.get<BoardResponse>(`/boards/${boardId}`);
  return response.data;
};

// ✅ 게시글 생성 (파일 포함)
export const createBoard = async ({
  boardType,
  title,
  content,
  file,
}: BoardRequest) => {
  const formData = new FormData();

  formData.append('boardType', boardType);
  formData.append('title', title);
  formData.append('content', content);

  if (file) {
    formData.append('file', file);
  }

  await apiClient.post('/boards', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// ✅ 게시글 수정 (파일 포함)
export const updateBoard = async (
  boardId: string,
  boardRequest: BoardRequest
) => {
  const formData = new FormData();

  // ✅ 기본 게시글 정보 추가
  formData.append('boardType', boardRequest.boardType);
  formData.append('title', boardRequest.title);
  formData.append('content', boardRequest.content);

  // ✅ 파일 추가 (옵션)
  if (boardRequest.file) {
    formData.append('file', boardRequest.file);
  }

  await apiClient.put(`/boards/${boardId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// ✅ 게시글 삭제
export const deleteBoard = async (boardId: string) => {
  await apiClient.delete(`/boards/${boardId}`);
};
