import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Confirm from '../components/Confirm';
import Toast from '../components/Toast';
import { Template, TemplateService, UserService } from '../services';
import '../styles/mytemplate.css';

/**
 * 我的模板页面
 * @description 显示当前用户创建的所有模板，支持查看、编辑、删除和导出
 */
const MyTemplate: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    id: number;
    topic: string;
  }>({ show: false, id: 0, topic: '' });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  
  /**
   * 根据屏幕分辨率计算合适的分页大小
   */
  const calculatePageSize = (): number => {
    const height = window.innerHeight;
    // 根据屏幕高度动态计算
    // 每个卡片大约200px高度，减去头部、底部等固定高度约300px
    const availableHeight = height - 300;
    const cardHeight = 200;
    const calculatedSize = Math.floor(availableHeight / cardHeight);
    
    // 限制在合理范围内：最小6个，最大20个
    return Math.max(6, Math.min(20, calculatedSize));
  };
  
  const [pageSize] = useState(() => calculatePageSize());

  /**
   * 加载模板列表
   */
  const loadTemplates = async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const result = await TemplateService.list({
        page,
        page_size: pageSize,
      });

      setTemplates(result.list || []);
      setTotalPages(Math.ceil((result.total || 0) / pageSize));
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.message || '加载模板列表失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 删除模板
   */
  const handleDelete = (id: number, topic: string) => {
    setDeleteConfirm({ show: true, id, topic });
  };

  /**
   * 确认删除
   */
  const confirmDelete = async () => {
    try {
      await TemplateService.delete(deleteConfirm.id);
      // 关闭确认对话框
      setDeleteConfirm({ show: false, id: 0, topic: '' });
      // 刷新列表
      await loadTemplates(currentPage);
      // 显示成功提示
      setToast({ message: '模板删除成功', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || '删除失败', type: 'error' });
    }
  };

  /**
   * 取消删除
   */
  const cancelDelete = () => {
    setDeleteConfirm({ show: false, id: 0, topic: '' });
  };

  /**
   * 导出模板
   */
  const handleExport = (template: Template, format: 'markdown' | 'json' | 'txt') => {
    try {
      TemplateService.download(template, format, template.topic);
      setToast({ message: '导出成功', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || '导出失败', type: 'error' });
    }
  };

  /**
   * 组件挂载时检查登录状态并加载数据
   * 注意：空依赖数组确保仅在组件挂载时执行一次，避免重复调用API
   */
  useEffect(() => {
    if (!UserService.isLoggedIn()) {
      setToast({ message: '请先登录', type: 'warning' });
      setTimeout(() => navigate('/'), 1500);
      return;
    }

    loadTemplates(1);
  }, []); // 空依赖数组是有意为之，仅挂载时执行

  /**
   * 格式化日期
   */
  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * 分页处理
   */
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      loadTemplates(page);
    }
  };

  return (
    <div className="my-template-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">我的模板</h1>
          <p className="page-subtitle">管理您创建的所有上下文工程六要素模板</p>
        </div>

        {/* 加载状态 */}
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>加载中...</p>
          </div>
        )}

        {/* 错误状态 */}
        {error && !loading && (
          <div className="error-container">
            <p className="error-message">⚠️ {error}</p>
            <button className="btn btn-primary" onClick={() => loadTemplates(currentPage)}>
              重试
            </button>
          </div>
        )}

        {/* 空状态 */}
        {!loading && !error && templates.length === 0 && (
          <div className="empty-container">
            <div className="empty-icon">📝</div>
            <p className="empty-message">您还没有创建任何模板</p>
            <button className="btn btn-primary" onClick={() => navigate('/template')}>
              创建第一个模板
            </button>
          </div>
        )}

        {/* 模板列表 */}
        {!loading && !error && templates.length > 0 && (
          <>
            <div className="template-list">
              {templates.map((template) => (
                <div key={template.id} className="template-card">
                  <div className="template-card-header">
                    <h3 className="template-card-title">{template.topic}</h3>
                    <span className="template-card-date">
                      {formatDate(template.created_at)}
                    </span>
                  </div>

                  <div className="template-card-body">
                    {template.task_objective && (
                      <div className="template-field">
                        <span className="field-label">任务目标：</span>
                        <span className="field-value">{template.task_objective}</span>
                      </div>
                    )}
                    {template.ai_role && (
                      <div className="template-field">
                        <span className="field-label">AI角色：</span>
                        <span className="field-value">{template.ai_role}</span>
                      </div>
                    )}
                    {template.my_role && (
                      <div className="template-field">
                        <span className="field-label">我的角色：</span>
                        <span className="field-value">{template.my_role}</span>
                      </div>
                    )}
                  </div>

                  <div className="template-card-footer">
                    <div className="template-actions">
                      <button
                        className="action-btn export-btn"
                        onClick={() => handleExport(template, 'markdown')}
                        title="导出为Markdown"
                      >
                        📄 MD
                      </button>
                      <button
                        className="action-btn export-btn"
                        onClick={() => handleExport(template, 'json')}
                        title="导出为JSON"
                      >
                        📋 JSON
                      </button>
                      {/* <button
                        className="action-btn export-btn"
                        onClick={() => handleExport(template, 'txt')}
                        title="导出为TXT"
                      >
                        📃 TXT
                      </button> */}
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(template.id, template.topic)}
                        title="删除模板"
                      >
                        🗑️ 删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  title="上一页"
                >
                  ◀
                </button>
                <span className="pagination-info">
                  第 {currentPage} / {totalPages} 页
                </span>
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  title="下一页"
                >
                  ▶
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 删除确认对话框 */}
      {deleteConfirm.show && (
        <Confirm
          title="删除模板"
          message={`确定要删除模板“${deleteConfirm.topic}”吗？删除后将无法恢复。`}
          confirmText="删除"
          cancelText="取消"
          type="danger"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

      {/* Toast提示 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={3000}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default MyTemplate;
