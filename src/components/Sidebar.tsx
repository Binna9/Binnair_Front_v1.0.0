export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-100 h-screen p-4">
      <ul>
        <li className="p-2 hover:bg-gray-200 rounded-md">🏠 Dashboard</li>
        <li className="p-2 hover:bg-gray-200 rounded-md">📁 Projects</li>
        <li className="p-2 hover:bg-gray-200 rounded-md">⚙️ Settings</li>
      </ul>
    </aside>
  );
}
