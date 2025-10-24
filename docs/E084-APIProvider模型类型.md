
## 任务目标
对API Provider配置表增加模型类型（api_kind）字段

## AI的角色
高级架构师，具有20多年大厂工作的经验
- 较强的IT项目整体设计功能
- 具有数据库的操作经验
- 超强的React设计和使用能力
- 了解前后端API交互能力

## 我的角色
全栈工程师，具有10多年大厂工作的经验

## 关键信息
- 项目信息：@README.md
- 表结构：@docker/init.sql
- 后端API接口：@backend/api/handlers/api_provider_handler.go
- 前端API接口：@frontend/src/services/index.ts

## 行为规则
- 严格验证当前项目的功能进行修订
- 确定增加功能的正确性，否则拒绝修改
- 拒绝修改其他页面和功能
- 完善前端模型类型
    OpenRouter
    Google Gemini
    OpenAI Compatible
    Anthropic
    Amazon Bedrock
    DeepSeek
    Ollama
    Claude Code
    阿里千问
    豆包
    智普
    讯飞星火
    百度千帆
    腾讯混元

## 交付格式
- 修订表结构及测试数据：@docker/init.sql
- 修订后端业务逻辑\测试数据\控制器
    - @backend/models/api_provider.go
    - @backend/services/api_provider_service.go
    - @backend/services/api_provider_service_test.go
    - @backend/api/handlers/api_provider_handler.go
- 完善 @frontend/src/components/APIConfigEdit.tsx 模型类型 及 保存功能
- 完善 @frontend/src/pages/APIConfig.tsx 中列表的模型链接测试功能
