import { TargetType } from './TargetEnum';
import { FileType } from './FileEnum';

export interface FileResponse {
  fileId: string; // 파일 ID
  targetId: string; // 타겟 ID
  targetType: TargetType; // 타겟 타입
  filePath: string; // 파일 경로
  fileSize: number; // 파일 크기
  fileExtension: string; // 파일 확장자
  fileType?: FileType; // 파일 타입
  originalFileName?: string; // 원본 파일 이름
}

export interface FileRequest {
  targetType: string; // 파일 타입
  targetId: string; // 파일 ID
}
