import DOMPurify from 'dompurify';

/**
 * HTML 문자열을 sanitize하여 XSS 방지 후 안전하게 렌더링
 * Tiptap 등 리치 텍스트 에디터에서 저장된 HTML 표시 시 사용
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code',
      'a', 'span', 'div',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'style', 'class'],
  });
}

/**
 * HTML인지 여부 (간단 체크 - < 태그 포함 시)
 */
export function isHtmlContent(content: string): boolean {
  if (!content || typeof content !== 'string') return false;
  return /<[a-z][\s\S]*>/i.test(content);
}
