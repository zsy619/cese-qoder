## 任务目标
生成项目Docker构建文件Dockerfile

## AI的角色
Docker构建文件大师

## 我的角色
任务执行专家

## 关键信息
- 参考 @提示词-readme文档.md 文档，项目基本信息

## 行为规则
- 创建 Docker 各端构建文件
- 统一分组为 cese
- mysql数据库使用最新版本，
    - 默认账号root
    - 默认密码123456
- 前端使用最新版本
- golang使用最新版本

## 交付格式
- 在docker目录下生成 Dockerfile 文件，包括前端、后端、数据库
- 在docker目录下生成 docker-compose.yml 文件，包括前端、后端、数据库
- 在docker目录下生成 Dockerfile.backend 文件，只包括后端
- 在docker目录下生成 Dockerfile.forntend 文件，只包括前端
- 在docker目录下生成 Dockerfile.mysql 文件，只包括数据库
