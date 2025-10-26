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
    task: '/docs/提示词-任务目标.md',
    ai_role: '/docs/提示词-AI的角色.md',
    my_role: '/docs/提示词-我的角色.md',
    key_info: '/docs/提示词-关键信息.md',
    behavior: '/docs/提示词-行为规则.md',
    delivery: '/docs/提示词-交付格式.md',
};

/**
 * 模板缓存
 */
const templateCache: Map<ElementType, string> = new Map();

/**
 * 清除模板缓存
 */
export const clearTemplateCache = () => {
    templateCache.clear();
};

/**
 * 获取提示词模板
 * @param elementType 要素类型
 * @returns 提示词模板内容
 */
export const getPromptTemplate = async (elementType: ElementType): Promise<string> => {
    // 检查缓存
    if (templateCache.has(elementType)) {
        const cached = templateCache.get(elementType)!;
        console.log(`Returning cached template for ${elementType}`);
        return cached;
    }

    try {
        const path = TEMPLATE_PATHS[elementType];
        console.log(`Fetching template from path: ${path}`);

        const response = await fetch(path, {
            method: 'GET',
            headers: {
                'Accept': 'text/markdown, text/plain, */*',
            },
            cache: 'no-cache',
        });

        if (!response.ok) {
            console.error(`Failed to load template: ${path}, status: ${response.status}`);
            throw new Error(`Failed to load template: ${path}, status: ${response.status}`);
        }

        // 检查 Content-Type
        const contentType = response.headers.get('Content-Type') || '';
        console.log(`Content-Type for ${elementType}:`, contentType);

        const content = await response.text();
        console.log(`Raw template content for ${elementType} (first 200 chars):`, content.substring(0, 200));
        console.log(`Template length: ${content.length} characters`);

        // 检查返回的内容是否为HTML（错误页面）
        const trimmedContent = content.trim();
        if (trimmedContent.startsWith('<!DOCTYPE') ||
            trimmedContent.startsWith('<html') ||
            trimmedContent.startsWith('<!doctype')) {
            console.error(`Template ${path} returned HTML content instead of markdown`);
            throw new Error(`模板文件加载失败：返回了HTML页面而不是Markdown内容。请检查后端静态文件服务配置。`);
        }

        // 确保内容不为空
        if (!content || trimmedContent === '') {
            console.error(`Template content is empty for ${path}`);
            throw new Error(`Template content is empty for ${path}`);
        }

        // 验证内容看起来像Markdown
        if (!trimmedContent.includes('#') && !trimmedContent.includes('##')) {
            console.warn(`Template ${path} doesn't look like markdown (no headers found)`);
        }

        templateCache.set(elementType, content);
        console.log(`✅ Template loaded and cached successfully for ${elementType}`);
        return content;
    } catch (error) {
        console.error(`❌ Error loading template for ${elementType}:`, error);
        // 返回空字符串而不是抛出错误，让上层处理
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
    console.log('📝 Replacing placeholders in template (first 200 chars):', template.substring(0, 200));
    console.log('📋 Placeholders to replace:', placeholders);

    // 按照占位符长度从长到短排序，避免短占位符先替换影响长占位符
    const sortedPlaceholders = Object.entries(placeholders).sort((a, b) => b[0].length - a[0].length);

    sortedPlaceholders.forEach(([key, value]) => {
        // 只替换非空值的占位符
        if (value !== undefined && value !== null) {
            const placeholder = `{{${key}}}`;
            const oldValue = result;

            // 使用 split 和 join 方法进行全局替换，避免正则表达式转义问题
            result = result.split(placeholder).join(value);

            const changed = oldValue !== result;
            console.log(`${changed ? '✅' : '⚠️'} Replaced ${placeholder} with "${value}". Changed: ${changed}`);
        }
    });

    console.log('✨ Final result after replacement (first 200 chars):', result.substring(0, 200));
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
            // AI角色需要 topic 和 task
            placeholders.task = data.task || '';
            break;

        case 'my_role':
            // 我的角色需要 topic 和 task
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

    console.log(`📦 Generated placeholders for ${elementType}:`, placeholders);
    return placeholders;
};
