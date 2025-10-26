import { useEffect, useReducer, useState } from 'react';
import BatchAIGenerating from '../components/BatchAIGenerating';
import Login from '../components/Login';
import PreviewSection from '../components/PreviewSection';
import SixElementCard from '../components/SixElementCard';
import Toast, { ToastType } from '../components/Toast';
import { TemplateService, UserService } from '../services';
import '../styles/app.css';
import { clearTemplateCache, ElementType, generatePlaceholders, getPromptTemplate } from '../utils/promptTemplates';
import { FieldName, TemplateData, validateTemplateData } from '../utils/validation';

/**
 * Toast 状态接口
 */
interface ToastState {
  message: string;
  type: ToastType;
}

/**
 * Reducer Action 类型
 */
type TemplateAction =
  | { type: 'UPDATE_FIELD'; field: FieldName; value: string }
  | { type: 'RESET' }
  | { type: 'SET_DATA'; data: Partial<TemplateData> };

/**
 * 模板数据状态reducer
 * 用于管理六要素模板数据的状态
 * 
 * @param {TemplateData} state - 当前状态
 * @param {TemplateAction} action - 动作对象
 * @returns {TemplateData} 新状态
 */
const templateDataReducer = (state: TemplateData, action: TemplateAction): TemplateData => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return {
        ...state,
        [action.field]: action.value
      };
    case 'RESET':
      return {
        topic: '',
        taskObjective: '',
        aiRole: '',
        myRole: '',
        keyInformation: '',
        behaviorRules: '',
        deliveryFormat: ''
      };
    case 'SET_DATA':
      return {
        ...state,
        ...action.data
      };
    default:
      return state;
  }
};

/**
 * 六要素提示词模板生成页面
 * 提供表单输入六个要素的内容，并支持生成、保存、导出和预览功能
 */
const TemplatePage = () => {
  /**
   * 模板数据状态
   * 使用useReducer管理复杂的状态
   */
  const [templateData, dispatch] = useReducer(templateDataReducer, {
    topic: '',
    taskObjective: '',
    aiRole: '',
    myRole: '',
    keyInformation: '',
    behaviorRules: '',
    deliveryFormat: ''
  });

  /**
   * 表单错误状态
   */
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Toast 提示状态
   */
  const [toast, setToast] = useState<ToastState | null>(null);

  /**
   * 登录弹窗显示状态
   */
  const [showLogin, setShowLogin] = useState(false);

  /**
   * 批量生成弹窗显示状态
   */
  const [showBatchGenerate, setShowBatchGenerate] = useState(false);

  /**
   * 提示词模板缓存
   */
  const [promptTemplates, setPromptTemplates] = useState<Record<ElementType, string>>({} as Record<ElementType, string>);

  /**
   * 加载提示词模板
   */
  useEffect(() => {
    // 清除模板缓存以确保重新加载
    clearTemplateCache();
    
    const loadTemplates = async () => {
      const templates: Record<string, string> = {};
      const elementTypes: ElementType[] = ['task', 'ai_role', 'my_role', 'key_info', 'behavior', 'delivery'];
      
      for (const type of elementTypes) {
        try {
          const template = await getPromptTemplate(type);
          console.log(`Loaded template for ${type}:`, template);
          templates[type] = template;
          console.log(`Loaded template for ${type}:`, template ? 'SUCCESS' : 'EMPTY');
        } catch (error) {
          console.error(`加载 ${type} 模板失败:`, error);
        }
      }
      
      console.log('All templates loaded:', templates);
      setPromptTemplates(templates as Record<ElementType, string>);
    };
    
    loadTemplates();
  }, []);

  /**
   * 显示 Toast 提示
   * @param {string} message - 提示消息
   * @param {ToastType} type - 提示类型: success, error, warning, info
   */
  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type });
  };

  /**
   * 关闭 Toast 提示
   */
  const closeToast = () => {
    setToast(null);
  };

  /**
   * 处理输入框内容变化
   * @param {FieldName} field - 字段名
   * @param {string} value - 字段值
   */
  const handleInputChange = (field: FieldName, value: string) => {
    dispatch({
      type: 'UPDATE_FIELD',
      field,
      value
    });

    // 清除该字段的错误信息
    if (errors[field]) {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  /**
   * 处理生成模板按钮点击
   * 验证表单并生成模板
   */
  const handleGenerateTemplate = () => {
    // 检查登录状态
    if (!UserService.isLoggedIn()) {
      showToast('请先登录后再生成模板', 'warning');
      setShowLogin(true);
      return;
    }

    const validation = validateTemplateData(templateData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      showToast('请检查表单中的错误信息', 'error');
      return;
    }

    // 这里可以调用后端API生成模板
    console.log('生成模板:', templateData);
    showToast('模板生成成功！', 'success');
  };

  /**
   * 处理保存模板按钮点击
   * 验证表单并保存模板到后端API
   */
  const handleSaveTemplate = async () => {
    // 检查登录状态
    if (!UserService.isLoggedIn()) {
      showToast('请先登录后再保存模板', 'warning');
      setShowLogin(true);
      return;
    }

    const validation = validateTemplateData(templateData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      showToast('请检查表单中的错误信息', 'error');
      return;
    }

    try {
      // 调用后端API保存模板
      await TemplateService.create({
        topic: templateData.topic,
        task_objective: templateData.taskObjective,
        ai_role: templateData.aiRole,
        my_role: templateData.myRole,
        key_information: templateData.keyInformation,
        behavior_rule: templateData.behaviorRules,
        delivery_format: templateData.deliveryFormat,
      });
      
      showToast('模板保存成功！', 'success');
    } catch (error: any) {
      console.error('保存模板失败:', error);
      showToast(error.message || '保存失败，请重试', 'error');
    }
  };

  /**
   * 处理导出模板按钮点击
   * @param {string} format - 导出格式 (markdown|json)
   * TODO: 调用后端API导出模板
   */
  // @ts-ignore - 此函数保留供将来使用
  const handleExportTemplate = (format: string) => {
    const validation = validateTemplateData(templateData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      showToast('请检查表单中的错误信息');
      return;
    }

    // 这里可以导出模板为不同格式
    console.log('导出模板为', format, ':', templateData);
  };

  /**
   * 处理拷贝为Markdown格式按钮点击
   * 使用Clipboard API将Markdown格式内容拷贝到剪贴板
   */
  const handleCopyAsMarkdown = () => {
    const validation = validateTemplateData(templateData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      showToast('请检查表单中的错误信息', 'error');
      return;
    }

    const markdownContent = generateMarkdownTemplate();
    navigator.clipboard.writeText(markdownContent)
      .then(() => {
        showToast('Markdown格式已拷贝到剪贴板', 'success');
      })
      .catch(err => {
        console.error('拷贝失败:', err);
        showToast('拷贝失败，请手动复制', 'error');
      });
  };

  /**
   * 处理拷贝为JSON格式按钮点击
   * 使用Clipboard API将JSON格式内容拷贝到剪贴板
   */
  const handleCopyAsJSON = () => {
    const validation = validateTemplateData(templateData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      showToast('请检查表单中的错误信息', 'error');
      return;
    }

    const jsonContent = JSON.stringify(templateData, null, 2);
    navigator.clipboard.writeText(jsonContent)
      .then(() => {
        showToast('JSON格式已拷贝到剪贴板', 'success');
      })
      .catch(err => {
        console.error('拷贝失败:', err);
        showToast('拷贝失败，请手动复制', 'error');
      });
  };

  /**
   * 生成Markdown格式的模板内容
   * @returns {string} Markdown格式的模板内容
   */
  const generateMarkdownTemplate = () => {
    return `## 任务目标
${templateData.taskObjective || '[清晰描述你希望AI完成的具体任务]'}

## AI的角色
${templateData.aiRole || '[指定AI扮演的角色，如：专业文案、数据分析师、客服代表等]'}

## 我的角色
${templateData.myRole || '[说明你是谁，你在任务中的身份，如：产品经理、学习者、客户等]'}

## 关键信息
${templateData.keyInformation || '[提供任务必需的背景信息、数据、参考资料或文件链接]'}

## 行为规则
${templateData.behaviorRules || '[必须遵守的规则1]\n[必须遵守的规则2]\n[不可做的事情1]\n[不可做的事情2]'}

## 交付格式
${templateData.deliveryFormat || '[指定输出格式，如：Markdown表格、JSON、邮件正文、PPT大纲等]'}
`;
  };

  /**
   * 登录成功后的回调
   */
  const handleLoginSuccess = () => {
    showToast('登录成功！', 'success');
  };

  /**
   * 处理批量生成按钮点击
   */
  const handleBatchGenerate = () => {
    // 验证主题是否为空
    if (!templateData.topic || templateData.topic.trim() === '') {
      showToast('请先输入主题后再使用批量生成功能', 'warning');
      return;
    }

    setShowBatchGenerate(true);
  };

  /**
   * 批量生成成功的回调
   */
  const handleBatchGenerateSuccess = (results: Record<string, string>) => {
    // 将生成的结果填充到表单中
    const updates: Partial<TemplateData> = {};
    
    if (results.task) updates.taskObjective = results.task;
    if (results.ai_role) updates.aiRole = results.ai_role;
    if (results.my_role) updates.myRole = results.my_role;
    if (results.key_info) updates.keyInformation = results.key_info;
    if (results.behavior) updates.behaviorRules = results.behavior;
    if (results.delivery) updates.deliveryFormat = results.delivery;

    dispatch({ type: 'SET_DATA', data: updates });
    showToast('批量生成完成！', 'success');
  };

  return (
    <>
      {/* Toast 提示 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={3000}
          onClose={closeToast}
        />
      )}

      {/* 登录弹窗 */}
      <Login
        visible={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* 批量生成弹窗 */}
      <BatchAIGenerating
        visible={showBatchGenerate}
        onClose={() => setShowBatchGenerate(false)}
        topic={templateData.topic}
        onSuccess={handleBatchGenerateSuccess}
      />

      <div className="container">
      <div className="template-form">
        <h2 className="form-title">六要素提示词模板生成器</h2>
        
        <div className="topic-section">
          <SixElementCard
            title="主题"
            value={templateData.topic}
            onChange={(value) => handleInputChange('topic', value)}
            placeholder="请输入您要生成提示词的主题"
            isTextarea={false}
            error={errors.topic}
          />
        </div>

        <div className="six-elements-grid">
          <SixElementCard
            title="任务目标"
            value={templateData.taskObjective}
            onChange={(value) => handleInputChange('taskObjective', value)}
            placeholder="[清晰描述你希望AI完成的具体任务]"
            isTextarea={true}
            error={errors.taskObjective}
            promptTemplate={promptTemplates.task}
            placeholders={generatePlaceholders('task', {
              topic: templateData.topic,
            })}
          />
          <SixElementCard
            title="AI的角色"
            value={templateData.aiRole}
            onChange={(value) => handleInputChange('aiRole', value)}
            placeholder="[指定AI扮演的角色，如：专业文案、数据分析师、客服代表等]"
            isTextarea={true}
            error={errors.aiRole}
            promptTemplate={promptTemplates.ai_role}
            placeholders={generatePlaceholders('ai_role', {
              topic: templateData.topic,
              task: templateData.taskObjective,
            })}
          />
          <SixElementCard
            title="我的角色"
            value={templateData.myRole}
            onChange={(value) => handleInputChange('myRole', value)}
            placeholder="[说明你是谁，你在任务中的身份，如：产品经理、学习者、客户等]"
            isTextarea={true}
            error={errors.myRole}
            promptTemplate={promptTemplates.my_role}
            placeholders={generatePlaceholders('my_role', {
              topic: templateData.topic,
              task: templateData.taskObjective,
            })}
          />
          <SixElementCard
            title="关键信息"
            value={templateData.keyInformation}
            onChange={(value) => handleInputChange('keyInformation', value)}
            placeholder="[提供任务必需的背景信息、数据、参考资料或文件链接]"
            isTextarea={true}
            error={errors.keyInformation}
            promptTemplate={promptTemplates.key_info}
            placeholders={generatePlaceholders('key_info', {
              topic: templateData.topic,
              task: templateData.taskObjective,
              ai_role: templateData.aiRole,
            })}
          />
          <SixElementCard
            title="行为规则"
            value={templateData.behaviorRules}
            onChange={(value) => handleInputChange('behaviorRules', value)}
            placeholder="[必须遵守的规则1]\n[必须遵守的规则2]\n[不可做的事情1]\n[不可做的事情2]"
            isTextarea={true}
            error={errors.behaviorRules}
            promptTemplate={promptTemplates.behavior}
            placeholders={generatePlaceholders('behavior', {
              topic: templateData.topic,
              task: templateData.taskObjective,
              ai_role: templateData.aiRole,
              key_info: templateData.keyInformation,
            })}
          />
          <SixElementCard
            title="交付格式"
            value={templateData.deliveryFormat}
            onChange={(value) => handleInputChange('deliveryFormat', value)}
            placeholder="[指定输出格式，如：Markdown表格、JSON、邮件正文、PPT大纲等]"
            isTextarea={true}
            error={errors.deliveryFormat}
            promptTemplate={promptTemplates.delivery}
            placeholders={generatePlaceholders('delivery', {
              topic: templateData.topic,
              task: templateData.taskObjective,
              key_info: templateData.keyInformation,
              behavior: templateData.behaviorRules,
            })}
          />
        </div>

        <div className="template-actions">
          <button className="btn btn-primary" onClick={handleBatchGenerate}>
            🤖 AI批量生成
          </button>
          <button className="btn btn-primary" onClick={handleGenerateTemplate}>
            生成模板
          </button>
          <button className="btn btn-secondary" onClick={handleSaveTemplate}>
            保存模板
          </button>
          <button className="btn btn-secondary" onClick={handleCopyAsMarkdown}>
            拷贝Markdown
          </button>
          <button className="btn btn-secondary" onClick={handleCopyAsJSON}>
            拷贝JSON
          </button>
        </div>
      </div>

      <PreviewSection templateData={templateData} />
      </div>
    </>
  );
};

export default TemplatePage;