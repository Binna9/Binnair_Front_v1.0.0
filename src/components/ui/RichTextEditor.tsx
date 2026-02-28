import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import { FileHandler } from '@tiptap/extension-file-handler';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Heading1,
  Quote,
  Code,
  Minus,
  GripVertical,
  ImagePlus,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

function parseHeightToPx(s: string): number {
  const match = s.match(/^(\d+(?:\.\d+)?)(rem|px)$/);
  if (!match) return 400;
  const val = parseFloat(match[1]);
  return match[2] === 'rem' ? val * 16 : val;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = '내용을 입력하세요',
  className = '',
  minHeight = '8rem',
}: RichTextEditorProps) {
  const minHeightPx = parseHeightToPx(minHeight);
  const [height, setHeight] = useState<number | null>(null);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const rect = containerRef.current?.getBoundingClientRect();
      const currentHeight = height ?? rect?.height ?? minHeightPx;
      startYRef.current = e.clientY;
      startHeightRef.current = currentHeight;

      const onMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.clientY - startYRef.current;
        const newHeight = Math.max(minHeightPx, startHeightRef.current + delta);
        setHeight(newHeight);
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    [height, minHeightPx]
  );

  const imageInputRef = useRef<HTMLInputElement>(null);

  const insertImageFromFile = useCallback((editorInstance: { chain: () => { focus: () => { setImage: (a: { src: string }) => { run: () => boolean } } } }, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      editorInstance.chain().focus().setImage({ src: reader.result as string }).run();
    };
    reader.readAsDataURL(file);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: { class: 'max-w-full h-auto rounded-lg' },
        resize: {
          enabled: true,
          directions: ['bottom-left', 'bottom-right', 'top-left', 'top-right'],
          minWidth: 50,
          minHeight: 50,
          alwaysPreserveAspectRatio: true,
        },
      }),
      FileHandler.configure({
        allowedMimeTypes: undefined,
        onDrop: (editorInstance, files) => {
          const imageFile = files.find((f) => f.type.startsWith('image/'));
          if (imageFile) insertImageFromFile(editorInstance, imageFile);
        },
        onPaste: (editorInstance, files) => {
          const imageFile = files.find((f) => f.type.startsWith('image/'));
          if (imageFile) insertImageFromFile(editorInstance, imageFile);
        },
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[6rem] p-3 text-sm text-gray-900',
      },
      handleDOMEvents: {
        dragover: (view, event) => {
          if (event.dataTransfer?.types.includes('Files')) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
          }
        },
        dragenter: (view, event) => {
          if (event.dataTransfer?.types.includes('Files')) {
            event.preventDefault();
          }
        },
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value === '' && editor.getHTML() === '<p></p>') return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [value, editor]);

  const handleImageUpload = useCallback(() => {
    imageInputRef.current?.click();
  }, []);

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        editor.chain().focus().setImage({ src: dataUrl }).run();
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    },
    [editor]
  );

  const ToolbarButton = useCallback(
    ({
      onClick,
      isActive,
      children,
      title,
    }: {
      onClick: () => void;
      isActive?: boolean;
      children: React.ReactNode;
      title: string;
    }) => (
      <button
        type="button"
        onClick={onClick}
        title={title}
        className={`p-2 rounded hover:bg-zinc-200 transition text-gray-700 ${
          isActive ? 'bg-zinc-300' : ''
        }`}
      >
        {children}
      </button>
    ),
    []
  );

  if (!editor) return null;

  const handleContainerDrop = useCallback(
    (e: React.DragEvent) => {
      const files = e.dataTransfer?.files;
      if (!files?.length || !editor) return;
      if (!e.target || (e.target as Element).closest?.('.ProseMirror')) return;
      e.preventDefault();
      e.stopPropagation();
      const imageFile = Array.from(files).find((f) => f.type.startsWith('image/'));
      if (imageFile) insertImageFromFile(editor, imageFile);
    },
    [editor, insertImageFromFile]
  );

  const handleContainerDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer?.types.includes('Files')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`border border-gray-300 rounded-lg overflow-hidden bg-white relative flex flex-col ${className}`}
      style={{
        minHeight,
        ...(height !== null && { height: `${height}px` }),
      }}
      onDragOver={handleContainerDragOver}
      onDragEnter={handleContainerDragOver}
      onDrop={handleContainerDrop}
    >
      {/* 툴바 */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-zinc-50">
        {/* 글자 스타일 */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="굵게"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="기울임"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="밑줄"
        >
          <Underline className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="취소선"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>
        <div className="w-px h-5 bg-gray-300 mx-1" />
        {/* 정렬 (토글: 같은 버튼 다시 누르면 해제) */}
        <ToolbarButton
          onClick={() =>
            editor.isActive({ textAlign: 'left' })
              ? editor.chain().focus().unsetTextAlign().run()
              : editor.chain().focus().setTextAlign('left').run()
          }
          isActive={editor.isActive({ textAlign: 'left' })}
          title="왼쪽 정렬"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.isActive({ textAlign: 'center' })
              ? editor.chain().focus().unsetTextAlign().run()
              : editor.chain().focus().setTextAlign('center').run()
          }
          isActive={editor.isActive({ textAlign: 'center' })}
          title="가운데 정렬"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.isActive({ textAlign: 'right' })
              ? editor.chain().focus().unsetTextAlign().run()
              : editor.chain().focus().setTextAlign('right').run()
          }
          isActive={editor.isActive({ textAlign: 'right' })}
          title="오른쪽 정렬"
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>
        <div className="w-px h-5 bg-gray-300 mx-1" />
        {/* 목록/블록 */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="글머리 기호"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="번호 매기기"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="제목 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="인용구"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="코드"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="구분선"
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>
        <div className="w-px h-5 bg-gray-300 mx-1" />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
        <ToolbarButton
          onClick={handleImageUpload}
          title="이미지 삽입"
        >
          <ImagePlus className="w-4 h-4" />
        </ToolbarButton>
      </div>
      {/* 에디터 영역 - dragover/dragenter preventDefault로 파일 드롭 시 새 탭 열림 방지 */}
      <div
        className="flex-1 min-h-[6rem] overflow-auto"
        onDragOver={(e) => {
          if (e.dataTransfer?.types.includes('Files')) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
          }
        }}
        onDragEnter={(e) => {
          if (e.dataTransfer?.types.includes('Files')) {
            e.preventDefault();
          }
        }}
      >
        <EditorContent editor={editor} />
      </div>
      {/* 오른쪽 하단 리사이즈 핸들 */}
      <div
        role="button"
        tabIndex={0}
        onMouseDown={handleResizeStart}
        className="absolute bottom-0 right-0 w-8 h-8 flex items-center justify-center cursor-ns-resize hover:bg-zinc-200/80 rounded-tl-lg transition-colors"
        title="드래그하여 높이 조절"
        aria-label="에디터 높이 조절"
      >
        <GripVertical className="w-4 h-4 text-zinc-500 rotate-90" />
      </div>
      <style>{`
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        .tiptap p { margin: 0.25em 0; }
        .tiptap { font-size: 0.875rem; }
        .tiptap img { max-width: 100%; height: auto; border-radius: 0.5rem; }
        /* 이미지 리사이즈 핸들 스타일 */
        .tiptap [data-resize-handle] {
          width: 10px;
          height: 10px;
          background: #3b82f6;
          border: 1px solid white;
          border-radius: 2px;
          cursor: nwse-resize;
          z-index: 10;
        }
        .tiptap [data-resize-handle="bottom-right"] { cursor: nwse-resize; }
        .tiptap [data-resize-handle="bottom-left"] { cursor: nesw-resize; }
        .tiptap [data-resize-handle="top-right"] { cursor: nesw-resize; }
        .tiptap [data-resize-handle="top-left"] { cursor: nwse-resize; }
      `}</style>
    </div>
  );
}
