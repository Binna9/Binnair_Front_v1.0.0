const NoticeBoard = () => {
  return (
    <div
      className="fixed left-4 top-1/2 transform -translate-y-1/2 w-64 h-[500px] 
      bg-white/50 backdrop-blur-lg border border-white/30 shadow-2xl shadow-black/50 
      rounded-2xl p-4 overflow-auto text-white"
    >
      {/* ✅ 타이틀 */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">Announcement</h2>

      {/* ✅ 공지사항 리스트 */}
      <ul className="space-y-3">
        <li className="bg-white/80 p-3 rounded-lg shadow-md text-gray-700">
          <strong> New User</strong>
          <p className="text-sm opacity-80">Discout 10 %</p>
        </li>
        <li className="bg-white/80 p-3 rounded-lg shadow-md text-gray-700">
          <strong> New Item</strong>
          <p className="text-sm opacity-80">"Vape Pro X"</p>
        </li>
        <li className="bg-white/80 p-3 rounded-lg shadow-md text-gray-700">
          <strong> Free</strong>
          <p className="text-sm opacity-80">This Weekend</p>
        </li>
      </ul>
    </div>
  );
};

export default NoticeBoard;
