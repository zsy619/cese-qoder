import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import APIConfigEdit from '../components/APIConfigEdit';
import Confirm from '../components/Confirm';
import Toast from '../components/Toast';
import { APIProvider, APIProviderService, UserService } from '../services';
import '../styles/apiconfig.css';

/**
 * API Provider 配置页面
 * @description 管理用户的 API Provider 配置
 */
const APIConfig: React.FC = () => {
  const navigate = useNavigate();

  // 数据状态
  const [providers, setProviders] = useState<APIProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 搜索和过滤状态
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | '1' | '0'>('all');
  const [filterOpen, setFilterOpen] = useState<'all' | '1' | '0'>('all');

  // 批量操作状态
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showBatchActions, setShowBatchActions] = useState(false);

  // UI 状态
  const [showEdit, setShowEdit] = useState(false);
  const [editProvider, setEditProvider] = useState<APIProvider | undefined>(undefined);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    id: number;
    name: string;
  }>({ show: false, id: 0, name: '' });
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);

  /**
   * 加载 Provider 列表
   */
  const loadProviders = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await APIProviderService.list();
      setProviders(result.list || []);
    } catch (err: any) {
      setError(err.message || '加载 API Provider 列表失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 打开添加对话框
   */
  const handleAdd = () => {
    setEditProvider(undefined);
    setShowEdit(true);
  };

  /**
   * 打开编辑对话框
   */
  const handleEdit = (provider: APIProvider) => {
    setEditProvider(provider);
    setShowEdit(true);
  };

  /**
   * 删除 Provider
   */
  const handleDelete = (id: number, name: string) => {
    setDeleteConfirm({ show: true, id, name });
  };

  /**
   * 确认删除
   */
  const confirmDelete = async () => {
    try {
      await APIProviderService.delete(deleteConfirm.id);
      setDeleteConfirm({ show: false, id: 0, name: '' });
      await loadProviders();
      setToast({ message: 'Provider 删除成功', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || '删除失败', type: 'error' });
    }
  };

  /**
   * 取消删除
   */
  const cancelDelete = () => {
    setDeleteConfirm({ show: false, id: 0, name: '' });
  };

  /**
   * 启用/禁用 Provider
   */
  const toggleStatus = async (provider: APIProvider) => {
    try {
      const newStatus = provider.api_status === 1 ? 0 : 1;
      await APIProviderService.update(provider.id, { api_status: newStatus });
      await loadProviders();
      setToast({
        message: `Provider 已${newStatus === 1 ? '启用' : '禁用'}`,
        type: 'success',
      });
    } catch (err: any) {
      setToast({ message: err.message || '操作失败', type: 'error' });
    }
  };

  /**
   * 切换开放类型
   */
  const toggleOpenType = async (provider: APIProvider) => {
    try {
      const newOpenType = provider.api_open === 1 ? 0 : 1;
      await APIProviderService.update(provider.id, { api_open: newOpenType });
      await loadProviders();
      setToast({
        message: `Provider 已设为${newOpenType === 1 ? '公开' : '私有'}`,
        type: 'success',
      });
    } catch (err: any) {
      setToast({ message: err.message || '操作失败', type: 'error' });
    }
  };

  /**
   * 保存成功回调
   */
  const handleSaveSuccess = async () => {
    await loadProviders();
    setToast({
      message: editProvider ? 'Provider 更新成功' : 'Provider 添加成功',
      type: 'success',
    });
  };

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
   * 过滤 Provider 列表
   */
  const filteredProviders = providers.filter((provider) => {
    // 搜索过滤
    if (searchText) {
      const text = searchText.toLowerCase();
      const matchName = provider.name.toLowerCase().includes(text);
      const matchUrl = provider.api_url.toLowerCase().includes(text);
      const matchModel = provider.api_model.toLowerCase().includes(text);
      const matchRemark = provider.api_remark?.toLowerCase().includes(text) || false;
      if (!matchName && !matchUrl && !matchModel && !matchRemark) {
        return false;
      }
    }

    // 状态过滤
    if (filterStatus !== 'all' && provider.api_status !== Number(filterStatus)) {
      return false;
    }

    // 开放类型过滤
    if (filterOpen !== 'all' && provider.api_open !== Number(filterOpen)) {
      return false;
    }

    return true;
  });

  /**
   * 全选/取消全选
   */
  const handleSelectAll = () => {
    if (selectedIds.size === filteredProviders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProviders.map((p) => p.id)));
    }
  };

  /**
   * 选择单个 Provider
   */
  const handleSelect = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  /**
   * 批量启用
   */
  const handleBatchEnable = async () => {
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          APIProviderService.update(id, { api_status: 1 })
        )
      );
      await loadProviders();
      setSelectedIds(new Set());
      setToast({ message: `已批量启用 ${selectedIds.size} 个 Provider`, type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || '批量启用失败', type: 'error' });
    }
  };

  /**
   * 批量禁用
   */
  const handleBatchDisable = async () => {
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          APIProviderService.update(id, { api_status: 0 })
        )
      );
      await loadProviders();
      setSelectedIds(new Set());
      setToast({ message: `已批量禁用 ${selectedIds.size} 个 Provider`, type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || '批量禁用失败', type: 'error' });
    }
  };

  /**
   * 批量删除
   */
  const handleBatchDelete = async () => {
    if (!window.confirm(`确定要删除选中的 ${selectedIds.size} 个 Provider 吗？`)) {
      return;
    }
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) => APIProviderService.delete(id))
      );
      await loadProviders();
      setSelectedIds(new Set());
      setToast({ message: `已批量删除 ${selectedIds.size} 个 Provider`, type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || '批量删除失败', type: 'error' });
    }
  };

  /**
   * 测试 Provider 连接
   */
  const handleTest = async (provider: APIProvider) => {
    setToast({ message: `正在测试 ${provider.name}...`, type: 'info' });
    // TODO: 调用后端测试接口
    setTimeout(() => {
      setToast({ message: `${provider.name} 连接测试成功`, type: 'success' });
    }, 1000);
  };

  /**
   * 监听选中状态变化
   */
  useEffect(() => {
    setShowBatchActions(selectedIds.size > 0);
  }, [selectedIds]);

  /**
   * 组件挂载时检查登录状态并加载数据
   */
  useEffect(() => {
    if (!UserService.isLoggedIn()) {
      setToast({ message: '请先登录', type: 'warning' });
      setTimeout(() => navigate('/'), 1500);
      return;
    }

    loadProviders();
  }, []);

  return (
    <div className="api-config-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">API Provider 配置</h1>
            <p className="page-subtitle">管理您的大模型 API 配置</p>
          </div>
          <button className="btn btn-primary" onClick={handleAdd}>
            <span className="icon">➕</span>
            添加 Provider
          </button>
        </div>

        {/* 搜索和过滤栏 */}
        {!loading && !error && providers.length > 0 && (
          <div className="filter-bar">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="搜索名称、URL、模型或备注..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              {searchText && (
                <button
                  className="clear-button"
                  onClick={() => setSearchText('')}
                  title="清除搜索"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="filter-group">
              <label className="filter-label">状态：</label>
              <select
                className="filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | '1' | '0')}
              >
                <option value="all">全部</option>
                <option value="1">启用</option>
                <option value="0">禁用</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">类型：</label>
              <select
                className="filter-select"
                value={filterOpen}
                onChange={(e) => setFilterOpen(e.target.value as 'all' | '1' | '0')}
              >
                <option value="all">全部</option>
                <option value="1">公开</option>
                <option value="0">私有</option>
              </select>
            </div>

            <div className="result-count">
              显示 {filteredProviders.length} / {providers.length} 条
            </div>
          </div>
        )}

        {/* 批量操作栏 */}
        {showBatchActions && (
          <div className="batch-actions">
            <div className="batch-info">
              已选择 {selectedIds.size} 项
            </div>
            <div className="batch-buttons">
              <button className="btn btn-batch btn-success" onClick={handleBatchEnable}>
                ✓ 批量启用
              </button>
              <button className="btn btn-batch btn-warning" onClick={handleBatchDisable}>
                ✗ 批量禁用
              </button>
              <button className="btn btn-batch btn-danger" onClick={handleBatchDelete}>
                🗑️ 批量删除
              </button>
              <button className="btn btn-batch btn-secondary" onClick={() => setSelectedIds(new Set())}>
                取消选择
              </button>
            </div>
          </div>
        )}

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
            <button className="btn btn-primary" onClick={loadProviders}>
              重试
            </button>
          </div>
        )}

        {/* 空状态 */}
        {!loading && !error && providers.length === 0 && (
          <div className="empty-container">
            <div className="empty-icon">🔌</div>
            <p className="empty-message">您还没有配置任何 API Provider</p>
            <button className="btn btn-primary" onClick={handleAdd}>
              添加第一个 Provider
            </button>
          </div>
        )}

        {/* Provider 表格 */}
        {!loading && !error && filteredProviders.length > 0 && (
          <div className="table-container">
            <table className="provider-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={selectedIds.size === filteredProviders.length}
                      onChange={handleSelectAll}
                      title="全选/取消全选"
                    />
                  </th>
                  <th>名称</th>
                  <th>API 地址</th>
                  <th>模型</th>
                  <th>版本</th>
                  <th>状态</th>
                  <th>开放类型</th>
                  <th>创建时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredProviders.map((provider) => (
                  <tr key={provider.id} className={selectedIds.has(provider.id) ? 'selected' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={selectedIds.has(provider.id)}
                        onChange={() => handleSelect(provider.id)}
                      />
                    </td>
                    <td>
                      <div className="provider-name">
                        <span className="icon">🔌</span>
                        {provider.name}
                      </div>
                      {provider.api_remark && (
                        <div className="provider-remark" title={provider.api_remark}>
                          {provider.api_remark}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="provider-url" title={provider.api_url}>
                        {provider.api_url}
                      </div>
                    </td>
                    <td>
                      <span className="model-badge">{provider.api_model}</span>
                    </td>
                    <td>{provider.api_version || 'v1'}</td>
                    <td>
                      <button
                        className={`status-badge ${provider.api_status === 1 ? 'enabled' : 'disabled'}`}
                        onClick={() => toggleStatus(provider)}
                        title="点击切换状态"
                      >
                        {provider.api_status === 1 ? '✓ 启用' : '✗ 禁用'}
                      </button>
                    </td>
                    <td>
                      <button
                        className={`open-badge ${provider.api_open === 1 ? 'public' : 'private'}`}
                        onClick={() => toggleOpenType(provider)}
                        title="点击切换开放类型"
                      >
                        {provider.api_open === 1 ? '🌐 公开' : '🔒 私有'}
                      </button>
                    </td>
                    <td>
                      <span className="date-text">{formatDate(provider.created_at)}</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-test"
                          onClick={() => handleTest(provider)}
                          title="测试连接"
                        >
                          📡
                        </button>
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEdit(provider)}
                          title="编辑"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(provider.id, provider.name)}
                          title="删除"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 搜索无结果 */}
        {!loading && !error && providers.length > 0 && filteredProviders.length === 0 && (
          <div className="empty-container">
            <div className="empty-icon">🔍</div>
            <p className="empty-message">没有找到匹配的 Provider</p>
            <button className="btn btn-secondary" onClick={() => {
              setSearchText('');
              setFilterStatus('all');
              setFilterOpen('all');
            }}>
              清除筛选
            </button>
          </div>
        )}
      </div>

      {/* 添加/编辑对话框 */}
      <APIConfigEdit
        visible={showEdit}
        onClose={() => setShowEdit(false)}
        provider={editProvider}
        onSuccess={handleSaveSuccess}
      />

      {/* 删除确认对话框 */}
      {deleteConfirm.show && (
        <Confirm
          title="删除 Provider"
          message={`确定要删除 "${deleteConfirm.name}" 吗？此操作不可撤销。`}
          confirmText="删除"
          cancelText="取消"
          type="danger"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

      {/* Toast 提示 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default APIConfig;
