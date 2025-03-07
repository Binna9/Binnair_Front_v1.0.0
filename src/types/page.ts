export interface Page<T> {
  content: T[]; // 실제 데이터 목록
  totalPages: number; // 전체 페이지 수
  totalElements: number; // 전체 항목 수
  size: number; // 한 페이지 크기
  number: number; // 현재 페이지 번호 (0부터 시작)
  first: boolean; // 첫 페이지 여부
  last: boolean; // 마지막 페이지 여부
}
