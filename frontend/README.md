# 上下文工程六要素小工具 - 前端

## 项目结构

```
src/
├── components/          # React组件
│   ├── Header.js        # 头部组件
│   ├── Footer.js        # 底部组件
│   ├── SixElementCard.js # 六要素卡片组件
│   └── PreviewSection.js # 预览组件
├── pages/              # 页面组件
│   ├── HomePage.js      # 首页
│   └── TemplatePage.js  # 模板生成页面
├── services/           # API服务
│   └── api.js          # API接口封装
├── styles/             # 样式文件
│   ├── global.css      # 全局样式
│   └── app.css         # 应用样式
├── utils/              # 工具函数
│   └── helpers.js      # 辅助函数
├── App.js              # 主应用组件
├── index.js            # 入口文件
└── main.jsx            # React渲染入口
```

## 技术栈

- React 18
- React Router v6
- CSS Modules (全局样式和组件样式)

## 开发环境搭建

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm start
```

3. 构建生产版本：
```bash
npm run build
```

## 功能说明

### 六要素模板生成
根据用户输入的主题，自动生成完整的六要素提示词模板：
1. 任务目标
2. AI的角色
3. 我的角色
4. 关键信息
5. 行为规则
6. 交付格式

### 模板管理
- 保存模板到后端数据库
- 导出模板为Markdown或JSON格式
- 实时预览生成的提示词

## 组件说明

### Header.js
页面头部导航组件，包含项目标题和导航链接。

### Footer.js
页面底部组件，显示版权信息。

### SixElementCard.js
六要素卡片组件，用于输入每个要素的内容。

### PreviewSection.js
预览组件，实时显示生成的提示词模板。

### HomePage.js
首页组件，展示项目介绍和功能特点。

### TemplatePage.js
模板生成页面，包含六要素输入表单和操作按钮。

## API服务

### api.js
封装了与后端交互的API接口：
- getTemplates: 获取所有模板
- getTemplateById: 根据ID获取模板
- createTemplate: 创建新模板
- updateTemplate: 更新模板
- deleteTemplate: 删除模板
- exportTemplateAsMarkdown: 导出为Markdown
- exportTemplateAsJSON: 导出为JSON

## 工具函数

### helpers.js
提供常用的工具函数：
- debounce: 防抖函数
- throttle: 节流函数
- formatDate: 格式化日期
- generateId: 生成随机ID
- deepClone: 深拷贝对象
- validateEmail: 验证邮箱格式
- validatePhone: 验证手机号格式