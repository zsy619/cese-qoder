# 项目结构说明

## 整体目录结构

```
.
├── README.md
├── frontend/
├── backend/
├── docker/
├── docs/
└── 文档/
```

## 前端目录结构 (frontend/)

```
frontend/
├── src/
│   ├── components/     # React组件
│   ├── pages/          # 页面组件
│   ├── assets/         # 静态资源文件
│   ├── utils/          # 工具函数
│   ├── styles/         # 样式文件
│   ├── contexts/       # React Context
│   ├── services/       # API服务
│   ├── index.js        # 入口文件
│   ├── App.js          # 主应用组件
│   └── main.jsx        # React渲染入口
```

## 后端目录结构 (backend/)

```
backend/
├── main.go             # 程序入口
├── go.mod              # Go模块定义
├── api/                # API路由和处理器
├── config/             # 配置文件
├── models/             # 数据模型
├── services/           # 业务逻辑层
├── middleware/         # 中间件
└── utils/              # 工具函数
```

## Docker目录结构 (docker/)

```
docker/
├── Dockerfile.frontend # 前端Docker配置
├── Dockerfile.backend  # 后端Docker配置
├── docker-compose.yml  # Docker Compose配置
└── .dockerignore       # Docker忽略文件
```

## 文档目录结构 (docs/)

```
docs/
├── DEPLOYMENT.md       # 部署文档
├── API.md              # API接口文档
├── DEVELOPMENT.md      # 开发指南
└── PROJECT_STRUCTURE.md # 项目结构说明
```

## 其他文档 (文档/)

```
文档/
├── 上下文工程六要素.md
├── 提示词-reademe文档.md
└── 提示词-生成Docker构建文件.md
```

这个目录结构支持项目的多种部署方式：
1. **源码启动** - 直接运行前端和后端代码
2. **Docker启动** - 使用docker目录中的配置文件
3. **云函数启动** - 后端代码可以适配云函数环境