import React, { useRef, useState } from 'react';
import '../styles/app.css';

// 扩展 Window 接口以支持 webkitSpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

interface SixElementCardProps {
  title: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isTextarea?: boolean;
  error?: string;
}

/**
 * 六要素卡片组件
 * 用于显示和输入六要素中的单个要素
 * 支持单行文本和多行文本输入
 */
const SixElementCard: React.FC<SixElementCardProps> = ({ title, value, onChange, placeholder, isTextarea = false, error }) => {
  const [isListening, setIsListening] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // 字数统计
  const charCount = value ? value.length : 0;

  // 初始化语音识别
  const initSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('您的浏览器不支持语音识别功能，请使用Chrome浏览器');
      return null;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'zh-CN';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        onChange(value + finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('语音识别错误:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return recognition;
  };

  // 处理语音输入按钮点击
  const handleSpeechInput = () => {
    if (!recognitionRef.current) {
      recognitionRef.current = initSpeechRecognition();
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // 处理最大化按钮点击
  const handleFullscreen = () => {
    setShowFullscreen(true);
  };

  // 处理关闭全屏
  const handleCloseFullscreen = () => {
    setShowFullscreen(false);
  };

  // 处理全屏输入框变化
  const handleFullscreenChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  // 语音图标SVG
  const MicrophoneIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
    </svg>
  );

  // 停止录音图标SVG
  const StopIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="2"/>
    </svg>
  );

  // 全屏图标SVG
  const FullscreenIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
    </svg>
  );

  return (
    <>
      <div className="element-card">
        <h3 className="element-title">{title}</h3>
        <div className="input-container">
          {isTextarea ? (
            <div className="textarea-wrapper">
              <div className="textarea-container">
                <textarea
                  ref={textareaRef}
                  className={`textarea element-input ${error ? 'error' : ''}`}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={placeholder}
                  rows={6}
                />
                <button 
                  className={`speech-button ${isListening ? 'listening' : ''}`}
                  onClick={handleSpeechInput}
                  title={isListening ? "停止语音输入" : "开始语音输入"}
                >
                  {isListening ? <StopIcon /> : <MicrophoneIcon />}
                </button>
              </div>
              <div className="input-footer">
                <span className="char-count">{charCount} 字符</span>
                <button 
                  className="fullscreen-button"
                  onClick={handleFullscreen}
                  title="全屏编辑"
                >
                  <FullscreenIcon />
                </button>
              </div>
            </div>
          ) : (
            <div className="input-wrapper">
              <input
                type="text"
                className={`form-input element-input ${error ? 'error' : ''}`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
              />
              <button 
                className={`speech-button ${isListening ? 'listening' : ''}`}
                onClick={handleSpeechInput}
                title={isListening ? "停止语音输入" : "开始语音输入"}
              >
                {isListening ? <StopIcon /> : <MicrophoneIcon />}
              </button>
            </div>
          )}
        </div>
        {error && <div className="error-message">{error}</div>}
      </div>

      {/* 全屏编辑模态框 */}
      {showFullscreen && (
        <div className="fullscreen-modal">
          <div className="fullscreen-content">
            <div className="fullscreen-header">
              <h3>{title} - 全屏编辑</h3>
              <button className="close-button" onClick={handleCloseFullscreen}>×</button>
            </div>
            <textarea
              className="fullscreen-textarea"
              value={value}
              onChange={handleFullscreenChange}
              placeholder={placeholder}
              autoFocus
            />
            <div className="fullscreen-footer">
              <span className="char-count">{charCount} 字符</span>
              <button className="btn btn-secondary" onClick={handleCloseFullscreen}>完成</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SixElementCard;