import React from 'react';
import {
  Bell,
  HelpCircle,
  MessageSquare,
  Mail,
  Edit,
  Trash2,
} from 'lucide-react';
import { BoardResponse } from '@/types/Board';

type BoardDetailProps = {
  board: BoardResponse;
  onBack: () => void;
  requireLogin: (callback: () => void) => void;
  handleEdit: (boardId: string) => void; // string 타입으로 수정
  handleDelete: (boardId: string) => void; // string 타입으로 수정
};

// 게시판 타입별 아이콘 매핑
const boardTypeIcons = {
  NOTICE: <Bell className="w-5 h-5 mr-2" />,
  FAQ: <HelpCircle className="w-5 h-5 mr-2" />,
  FREE: <MessageSquare className="w-5 h-5 mr-2" />,
  SUGGESTION: <Mail className="w-5 h-5 mr-2" />,
};

const BoardDetail: React.FC<BoardDetailProps> = ({
  board,
  onBack,
  requireLogin,
  handleEdit,
  handleDelete,
}) => {
  return (
    <div className="w-full">
      <button
        onClick={onBack}
        className="mb-4 px-3 py-1 bg-gray-200 text-gray-800 font-bold rounded-lg shadow-md hover:bg-gray-300 transition"
      >
        List Back
      </button>

      <div className="bg-gray-100 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            {/* 게시판 타입에 따른 아이콘 표시 */}
            {boardTypeIcons[board.boardType]}
            <span className="text-md font-medium text-gray-800">
              {board.boardType === 'NOTICE' && '공지사항'}
              {board.boardType === 'FAQ' && '자주 묻는 질문'}
              {board.boardType === 'FREE' && '자유게시판'}
              {board.boardType === 'SUGGESTION' && '문의하기'}
            </span>
          </div>

          {/* 수정 및 삭제 버튼 추가 */}
          <div className="flex space-x-2">
            <button
              onClick={() => requireLogin(() => handleEdit(board.boardId))}
              className="text-blue-500 hover:text-blue-700 transition"
              title="수정"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={() => requireLogin(() => handleDelete(board.boardId))}
              className="text-red-500 hover:text-red-700 transition"
              title="삭제"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-3">{board.title}</h1>

        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <div className="flex items-center text-gray-700 text-sm">
            <span className="font-medium">작성자: {board.writerName}</span>
            <span className="mx-2">•</span>
            <span>
              {new Date(board.createDatetime).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}{' '}
              {new Date(board.createDatetime).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          <div className="flex items-center text-gray-600 text-sm">
            <span>조회수: {board.views}</span>
            <span className="mx-2">•</span>
            <span>좋아요: {board.likes}</span>
          </div>
        </div>

        {/* 본문 내용 */}
        <div className="min-h-[200px] mb-6 whitespace-pre-wrap">
          {board.content}
        </div>

        {/* 첨부파일 */}
        {board.filePath && (
          <div className="mt-4 p-3 bg-gray-200 rounded-lg">
            <p className="font-medium">📎 첨부파일</p>
            <a
              href={board.filePath}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {board.filePath.split('/').pop()}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardDetail;
