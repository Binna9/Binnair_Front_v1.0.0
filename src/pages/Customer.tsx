import MainLayout from '@/layouts/MainLayout';
import Board from '@/components/Board'; // Board 경로에 맞게 수정

export default function CustomerPage() {
  return (
    <MainLayout>
      <Board />
    </MainLayout>
  );
}
