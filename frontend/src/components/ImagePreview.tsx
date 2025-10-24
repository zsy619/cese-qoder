import React, { useEffect, useState } from 'react';
import '../styles/image-preview.css';

interface ImagePreviewProps {
  src: string;
  alt: string;
  onClose: () => void;
}

/**
 * 图片预览组件
 * 支持放大、缩小、旋转、下载等功能
 */
const ImagePreview: React.FC<ImagePreviewProps> = ({ src, alt, onClose }) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  /**
   * ESC键关闭预览
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // 禁止背景滚动
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  /**
   * 放大图片
   */
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  /**
   * 缩小图片
   */
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  /**
   * 重置缩放和旋转
   */
  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  /**
   * 顺时针旋转90度
   */
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  /**
   * 下载图片
   */
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = alt || 'image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="image-preview-overlay" onClick={onClose}>
      <div className="image-preview-container" onClick={(e) => e.stopPropagation()}>
        {/* 工具栏 */}
        <div className="image-preview-toolbar">
          <div className="toolbar-left">
            <span className="image-title">{alt}</span>
          </div>
          <div className="toolbar-right">
            <button
              className="toolbar-btn"
              onClick={handleZoomOut}
              title="缩小 (Ctrl + -)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13H5v-2h14v2z"/>
              </svg>
            </button>
            <span className="zoom-level">{Math.round(scale * 100)}%</span>
            <button
              className="toolbar-btn"
              onClick={handleZoomIn}
              title="放大 (Ctrl + +)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </button>
            <button
              className="toolbar-btn"
              onClick={handleRotate}
              title="旋转 (R)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.55 5.55L11 1v3.07C7.06 4.56 4 7.92 4 12s3.05 7.44 7 7.93v-2.02c-2.84-.48-5-2.94-5-5.91s2.16-5.43 5-5.91V10l4.55-4.45zM19.93 11c-.17-1.39-.72-2.73-1.62-3.89l-1.42 1.42c.54.75.88 1.6 1.02 2.47h2.02zM13 17.9v2.02c1.39-.17 2.74-.71 3.9-1.61l-1.44-1.44c-.75.54-1.59.89-2.46 1.03zm3.89-2.42l1.42 1.41c.9-1.16 1.45-2.5 1.62-3.89h-2.02c-.14.87-.48 1.72-1.02 2.48z"/>
              </svg>
            </button>
            <button
              className="toolbar-btn"
              onClick={handleReset}
              title="重置 (0)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
              </svg>
            </button>
            <button
              className="toolbar-btn"
              onClick={handleDownload}
              title="下载"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"/>
              </svg>
            </button>
            <button
              className="toolbar-btn close-btn"
              onClick={onClose}
              title="关闭 (ESC)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* 图片显示区域 */}
        <div className="image-preview-content">
          <img
            src={src}
            alt={alt}
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transition: 'transform 0.3s ease',
            }}
            draggable={false}
          />
        </div>

        {/* 提示信息 */}
        <div className="image-preview-hints">
          <span>💡 提示：点击背景或按 ESC 键关闭预览</span>
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;
