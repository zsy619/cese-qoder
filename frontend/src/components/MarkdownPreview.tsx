import React from 'react';
import '../styles/markdown-preview.css';

interface MarkdownPreviewProps {
  content: string;
}

/**
 * Markdown预览组件
 * 将Markdown文本渲染为格式化的HTML，带有代码高亮样式
 */
const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content }) => {
  /**
   * 简单的Markdown解析器
   * 支持：标题、代码块、列表、加粗、斜体等
   */
  const parseMarkdown = (text: string): string => {
    let html = text;

    // 代码块
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre class="code-block"><code class="language-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>`;
    });

    // 行内代码
    html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // 标题
    html = html.replace(/^### (.*$)/gim, '<h3 class="md-h3">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="md-h2">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="md-h1">$1</h1>');

    // 加粗
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // 斜体
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // 无序列表
    html = html.replace(/^\s*[-*]\s+(.+)$/gim, '<li class="md-li">$1</li>');
    html = html.replace(/(<li class="md-li">.*<\/li>)/s, '<ul class="md-ul">$1</ul>');

    // 有序列表
    html = html.replace(/^\s*\d+\.\s+(.+)$/gim, '<li class="md-li">$1</li>');

    // 链接
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="md-link">$1</a>');

    // 段落（未被其他标签包裹的文本）
    html = html.replace(/^(?!<[h|u|o|p|c])(.+)$/gim, '<p class="md-p">$1</p>');

    // 水平线
    html = html.replace(/^---$/gim, '<hr class="md-hr">');

    // 换行
    html = html.replace(/\n\n/g, '<br class="md-br">');

    return html;
  };

  /**
   * 转义HTML特殊字符
   */
  const escapeHtml = (text: string): string => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  };

  return (
    <div 
      className="markdown-preview"
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  );
};

export default MarkdownPreview;
