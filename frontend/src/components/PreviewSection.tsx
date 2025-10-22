import React from 'react';
import '../styles/app.css';
import { TemplateData } from '../utils/validation';

interface PreviewSectionProps {
  templateData: TemplateData;
}

/**
 * 预览组件
 * 用于显示生成的六要素提示词模板预览
 */
const PreviewSection: React.FC<PreviewSectionProps> = ({ templateData }) => {
  /**
   * 生成预览内容
   * @returns Markdown格式的预览内容
   */
  const generatePreview = (): string => {
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
   * 处理拷贝预览按钮点击
   * 使用Clipboard API将预览内容拷贝到剪贴板
   */
  const handleCopyPreview = (): void => {
    const previewContent = generatePreview();
    navigator.clipboard.writeText(previewContent)
      .then(() => {
        alert('预览内容已拷贝到剪贴板');
      })
      .catch(err => {
        console.error('拷贝失败:', err);
        alert('拷贝失败，请手动复制');
      });
  };

  return (
    <div className="preview-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="preview-title">预览</h2>
        <button className="btn btn-secondary" onClick={handleCopyPreview} style={{ minWidth: 'auto', padding: '8px 16px' }}>
          拷贝预览
        </button>
      </div>
      <div className="preview-content">
        {generatePreview()}
      </div>
    </div>
  );
};

export default PreviewSection;
