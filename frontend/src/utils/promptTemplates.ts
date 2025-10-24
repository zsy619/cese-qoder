/**
 * 提示词模板工具
 * 负责加载和管理六要素的提示词模板
 */

/**
 * 六要素的类型
 */
export type ElementType = 'task' | 'ai_role' | 'my_role' | 'key_info' | 'behavior' | 'delivery';

/**
 * 要素名称映射
 */
export const ELEMENT_NAMES: Record<ElementType, string> = {
  task: '任务目标',
  ai_role: 'AI的角色',
  my_role: '我的角色',
  key_info: '关键信息',
  behavior: '行为规则',
  delivery: '交付格式',
};

/**
 * 提示词模板文件路径映射
 */
const TEMPLATE_PATHS: Record<ElementType, string> = {
  task: '/src/docs/提示词-任务目标.md',
  ai_role: '/src/docs/提示词-AI的角色.md',
  my_role: '/src/docs/提示词-我的角色.md',
  key_info: '/src/docs/提示词-关键信息.md',
  behavior: '/src/docs/提示词-行为规则.md',
  delivery: '/src/docs/提示词-交付格式.md',
};

/**
 * 模板缓存
 */
const templateCache: Map<ElementType, string> = new Map();

/**
 * 获取提示词模板
 * @param elementType 要素类型
 * @returns 提示词模板内容
 */
export const getPromptTemplate = async (elementType: ElementType): Promise<string> => {
  // 检查缓存
  if (templateCache.has(elementType)) {
    return templateCache.get(elementType)!;
  }

  try {
    const path = TEMPLATE_PATHS[elementType];
    const response = await fetch(path);
    
    if (!response.ok) {
      throw new Error(`Failed to load template: ${path}`);
    }
    
    const content = await response.text();
    templateCache.set(elementType, content);
    return content;
  } catch (error) {
    console.error(`Error loading template for ${elementType}:`, error);
    return '';
  }
};

/**
 * 获取要素名称
 * @param elementType 要素类型
 * @returns 要素名称
 */
export const getElementName = (elementType: ElementType): string => {
  return ELEMENT_NAMES[elementType] || '';
};

/**
 * 替换提示词模板中的占位符
 * @param template 模板内容
 * @param placeholders 占位符数据
 * @returns 替换后的内容
 */
export const replacePlaceholders = (
  template: string,
  placeholders: Record<string, string>
): string => {
  let result = template;
  Object.entries(placeholders).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, 'g'), value || '');
  });
  return result;
};

/**
 * 根据要素类型生成占位符数据
 * @param elementType 要素类型
 * @param data 六要素数据
 * @returns 占位符数据
 */
export const generatePlaceholders = (
  elementType: ElementType,
  data: {
    topic?: string;
    task?: string;
    ai_role?: string;
    my_role?: string;
    key_info?: string;
    behavior?: string;
    delivery?: string;
  }
): Record<string, string> => {
  const placeholders: Record<string, string> = {};

  // 所有模板都需要主题
  placeholders.topic = data.topic || '';

  // 根据不同要素类型，添加所需的占位符
  switch (elementType) {
    case 'task':
      // 任务目标只需要 topic
      break;

    case 'ai_role':
    case 'my_role':
      // AI角色和我的角色需要 topic 和 task
      placeholders.task = data.task || '';
      break;

    case 'key_info':
      // 关键信息需要 topic、task、ai_role
      placeholders.task = data.task || '';
      placeholders.ai_role = data.ai_role || '';
      break;

    case 'behavior':
      // 行为规则需要 topic、task、ai_role、key_info
      placeholders.task = data.task || '';
      placeholders.ai_role = data.ai_role || '';
      placeholders.key_info = data.key_info || '';
      break;

    case 'delivery':
      // 交付格式需要 topic、task、key_info、behavior
      placeholders.task = data.task || '';
      placeholders.key_info = data.key_info || '';
      placeholders.behavior = data.behavior || '';
      break;
  }

  return placeholders;
};
