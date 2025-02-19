export interface NoticeBoardResponse {
  boardId: string;
  boardType: string;
  title: string;
  content: string;
  writeId: string;
  writeName: string;
  createDatetime: string; // ISO 날짜 형식 (문자열)
  modifyDatetime: string;
}
