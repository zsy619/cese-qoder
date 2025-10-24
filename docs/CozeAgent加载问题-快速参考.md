# CozeAgent 加载问题修复 - 快速参考

## 🐛 问题
页面一直显示"加载提示词中..."，内容无法显示

## 🔍 原因
文件路径错误：`/src/docs/` 无法通过 HTTP 访问

## ✅ 解决方案

### 1. 移动文件
```bash
mkdir -p frontend/public/docs
cp -r frontend/src/docs/* frontend/public/docs/
```

### 2. 修改路径
```typescript
// 修改前
fetch('/src/docs/coze智能体提示词.md')

// 修改后
fetch('/docs/coze智能体提示词.md')
```

### 3. 文件列表
修改了 [`CozeAgent.tsx`](file:///Volumes/D/一堂/编程/氛围编程/上下文工程六要素/qoder/frontend/src/pages/CozeAgent.tsx) 中的 3 处路径：
- useEffect 中的 fetch 路径
- ImagePreview 的 src 属性
- img 标签的 src 属性

## 📋 核心规则

| 目录 | 访问方式 | 用途 |
|------|----------|------|
| `public/` | `/path/file` | 静态资源（图片、文档） |
| `src/` | `import` | 源代码和组件 |

## ✅ 验证
```bash
# 编译成功
npm run build

# 文件可访问
curl http://localhost:3000/docs/coze智能体提示词.md
```

**结果：** ✅ 页面正常加载，提示词完整显示
