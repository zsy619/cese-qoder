/**
 * 表单验证工具函数
 */

// 模板数据接口
export interface TemplateData {
  topic: string;
  taskObjective: string;
  aiRole: string;
  myRole: string;
  keyInformation: string;
  behaviorRules: string;
  deliveryFormat: string;
}

// 验证结果接口
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// 字段类型
export type FieldName = keyof TemplateData;

/**
 * 验证模板数据
 * @param templateData - 模板数据
 * @returns 验证结果 { isValid: boolean, errors: object }
 */
export const validateTemplateData = (templateData: TemplateData): ValidationResult => {
  const errors: Record<string, string> = {};

  // 验证主题字段
  if (!templateData.topic || templateData.topic.trim() === '') {
    errors.topic = '主题不能为空';
  } else if (templateData.topic.length > 100) {
    errors.topic = '主题长度不能超过100个字符';
  }

  // 验证任务目标字段
  if (!templateData.taskObjective || templateData.taskObjective.trim() === '') {
    errors.taskObjective = '任务目标不能为空';
  }

  // 验证AI角色字段
  if (!templateData.aiRole || templateData.aiRole.trim() === '') {
    errors.aiRole = 'AI角色不能为空';
  }

  // 验证我的角色字段
  if (!templateData.myRole || templateData.myRole.trim() === '') {
    errors.myRole = '我的角色不能为空';
  }

  // 验证关键信息字段
  if (!templateData.keyInformation || templateData.keyInformation.trim() === '') {
    errors.keyInformation = '关键信息不能为空';
  }

  // 验证行为规则字段
  if (!templateData.behaviorRules || templateData.behaviorRules.trim() === '') {
    errors.behaviorRules = '行为规则不能为空';
  }

  // 验证交付格式字段
  if (!templateData.deliveryFormat || templateData.deliveryFormat.trim() === '') {
    errors.deliveryFormat = '交付格式不能为空';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * 验证单个字段
 * @param field - 字段名
 * @param value - 字段值
 * @returns 错误信息，如果没有错误则返回null
 */
export const validateField = (field: FieldName, value: string): string | null => {
  switch (field) {
    case 'topic':
      if (!value || value.trim() === '') {
        return '主题不能为空';
      } else if (value.length > 100) {
        return '主题长度不能超过100个字符';
      }
      return null;
    case 'taskObjective':
      if (!value || value.trim() === '') {
        return '任务目标不能为空';
      }
      return null;
    case 'aiRole':
      if (!value || value.trim() === '') {
        return 'AI角色不能为空';
      }
      return null;
    case 'myRole':
      if (!value || value.trim() === '') {
        return '我的角色不能为空';
      }
      return null;
    case 'keyInformation':
      if (!value || value.trim() === '') {
        return '关键信息不能为空';
      }
      return null;
    case 'behaviorRules':
      if (!value || value.trim() === '') {
        return '行为规则不能为空';
      }
      return null;
    case 'deliveryFormat':
      if (!value || value.trim() === '') {
        return '交付格式不能为空';
      }
      return null;
    default:
      return null;
  }
};
