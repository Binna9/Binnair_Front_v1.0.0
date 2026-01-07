import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ChatMessage } from '@/types/chat';
import { X, Send, Settings } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import apiClient from '../../utils/apiClient';

interface RealTimeChatPopupProps {
  isOpen: boolean;
  closePopup: () => void;
}

interface ChatMessageResponse {
  sender: string;
  content: string;
  timestamp: string;
}

// 환경별 WebSocket URL 설정
const getWebSocketUrl = () => {
  const isDevelopment = import.meta.env.MODE === 'development';
  const baseUrl = import.meta.env.VITE_WS_URL;

  if (baseUrl) {
    return baseUrl;
  }

  return isDevelopment
    ? 'ws://localhost:8080/websocket'
    : 'wss://www.binnair.com/websocket';
};

const WS_URL = getWebSocketUrl();

export default function RealTimeChatPopup({
  isOpen,
  closePopup,
}: RealTimeChatPopupProps) {
  const { accessToken, user } = useSelector((state: RootState) => state.auth);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState({
    x: window.innerWidth - 460,
    y: window.innerHeight / 2 - 210,
  });

  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const [opacity, setOpacity] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  // 채팅 기록을 가져오는 함수
  const fetchChatHistory = useCallback(async () => {
    try {
      const { data: history } = await apiClient.get<ChatMessageResponse[]>(
        '/chats'
      );
      const formattedHistory = history.map((msg) => ({
        id: Date.now().toString(),
        sender: msg.sender,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
      }));

      setMessages(formattedHistory);
    } catch (error) {
      console.error('채팅 기록 조회 에러:', error);
    }
  }, []);

  useEffect(() => {
    if (isOpen && accessToken) {
      // 채팅 기록 먼저 가져오기
      fetchChatHistory();

      // 웹소켓 연결
      console.log('웹소켓 연결 시도:', WS_URL);
      const ws = new WebSocket(`${WS_URL}?token=${accessToken}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('웹소켓 연결 성공');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        console.log('메시지 수신:', event.data);

        const serverMessage = JSON.parse(event.data);

        console.log('📦 받은 메시지 객체:', serverMessage);

        const message: ChatMessage = {
          id: Date.now().toString(),
          sender: serverMessage.sender,
          content: serverMessage.content,
          timestamp: new Date(serverMessage.timestamp),
        };
        setMessages((prev) => [...prev, message]);
      };

      ws.onclose = (event) => {
        console.log('웹소켓 연결 종료:', event.code, event.reason);
        setIsConnected(false);
      };

      ws.onerror = (error) => {
        console.error('웹소켓 에러:', error);
        setIsConnected(false);
      };

      return () => {
        console.log('웹소켓 연결 해제');
        ws.close();
      };
    }
  }, [isOpen, accessToken, fetchChatHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!inputMessage.trim() || !wsRef.current) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: user?.userName || '알 수 없음',
      content: inputMessage,
      timestamp: new Date(),
    };

    wsRef.current.send(
      JSON.stringify({
        id: message.id,
        sender: message.sender,
        content: message.content,
        timestamp: message.timestamp.toISOString(),
      })
    );
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (dragging) {
        setPosition({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      }
    },
    [dragging, offset]
  );

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
  }, [dragging, offset, handleMouseMove]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed shadow-xl w-[340px] h-[430px] flex flex-col z-50 transition-transform duration-300 rounded-lg overflow-hidden ${
        isOpen
          ? 'opacity-100 scale-100'
          : 'opacity-0 scale-90 pointer-events-none'
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        position: 'fixed',
        cursor: dragging ? 'grabbing' : 'grab',
        opacity: opacity,
        backgroundColor: 'rgb(250, 250, 250)',
      }}
    >
      <div
        className="flex justify-between items-center px-2.5 py-2.5 border-b cursor-grab bg-white"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-bold">💬 실시간 채팅</h3>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              isConnected
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {isConnected ? '연결됨' : '연결 끊김'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-0.5 rounded-full hover:bg-gray-200"
          >
            <Settings size={14} />
          </button>
          <button
            onClick={closePopup}
            className="p-0.5 rounded-full hover:bg-gray-200"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="px-2.5 py-1.5 border-b bg-white">
          <div className="flex items-center gap-1.5">
            <span className="text-xs">투명도</span>
            <input
              type="range"
              min="0.3"
              max="1"
              step="0.01"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs">{Math.round(opacity * 100)}%</span>
          </div>
        </div>
      )}

      <div className="flex-1 p-2 overflow-y-auto space-y-1 flex flex-col bg-white">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-2.5 rounded-md max-w-[85%] break-words text-xs ${
              message.sender === user?.userName
                ? 'bg-blue-500 text-white self-end'
                : 'bg-zinc-200 self-start'
            }`}
          >
            <div className="font-semibold text-[10px] mb-0.5">{message.sender}</div>
            {message.content}
            <div className="text-[10px] mt-0.5 opacity-70">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-2.5 border-t flex items-center bg-white">
        <input
          type="text"
          className="flex-1 p-2 text-xs border rounded-full focus:outline-none focus:ring-1 focus:ring-zinc-400"
          placeholder="메시지를 입력하세요..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={!isConnected}
        />
        <button
          onClick={sendMessage}
          disabled={!isConnected || !inputMessage.trim()}
          className="ml-1.5 p-1 bg-zinc-500 text-white rounded-full hover:bg-zinc-600 transition disabled:opacity-50"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
