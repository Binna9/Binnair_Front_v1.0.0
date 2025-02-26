import { X, Send } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function ChatPopUp({
  isOpen,
  closePopup,
}: {
  isOpen: boolean;
  closePopup: () => void;
}) {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState({
    x: window.innerWidth - 550,
    y: window.innerHeight / 2 - 275,
  });

  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // 첫 메시지 자동 추가
  useEffect(() => {
    if (isOpen) {
      setMessages(['반갑습니다! 무엇을 도와드릴까요? 😊']);
    }
  }, [isOpen]);

  // 메시지 입력 후 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      setMessages((prev) => [...prev, input]); // 메시지 추가
      setInput(''); // 입력창 초기화
    }
  };

  // 마우스 드래그 이동
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (dragging) {
      setPosition({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  return (
    <>
      {/* ChatPopUp 본체 (사이드바를 가리지 않고 살짝 오른쪽으로 띄우기) */}
      <div
        className={`fixed bg-white shadow-xl rounded-lg w-[420px] h-[550px] flex flex-col z-50 transition-transform duration-300 ${
          isOpen
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-90 pointer-events-none'
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          position: 'fixed',
          cursor: dragging ? 'grabbing' : 'grab',
        }}
      >
        {/* 헤더 영역 (마우스로 드래그 가능) */}
        <div
          className="flex justify-between items-center px-4 py-3 border-b cursor-grab"
          onMouseDown={handleMouseDown}
        >
          <h3 className="text-lg font-bold">💬 Chat</h3>
          <button
            onClick={closePopup}
            className="p-1 rounded-full hover:bg-gray-200"
          >
            <X size={18} />
          </button>
        </div>
        {/* 채팅 메시지 영역 (아래로 누적되는 형태) */}
        <div className="flex-1 p-4 overflow-y-auto space-y-2 flex flex-col">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg max-w-[80%] break-words ${
                index === 0
                  ? 'bg-blue-500 text-white self-start'
                  : 'bg-gray-200 self-end'
              }`}
            >
              {msg}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 입력창 + 전송 버튼 */}
        <div className="p-3 border-t flex items-center">
          <input
            type="text"
            className="flex-1 p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="메시지를 입력하세요..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            className="ml-2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </>
  );
}
