
## 任务目标
实现API Provider相关功能

## AI的角色
react+typescript高级工程师，具有20多年大厂工作的经验

## 我的角色
前端开发者，具有10多年大厂工作的经验

## 关键信息
- 需求描述：完成API Provider相关添加、查询、删除功能
- 表结构：@docker/init.sql
- 鉴权接口：@frontend/src/services/index.ts

## 行为规则
- @frontend/src/pages/APIConfig.tsx 菜单增加登录按钮
    - 表格形式，列表展示，具有删除、修改、查看功能
    - 设置添加按钮，点击弹出 APIConfigEdit 组件
    - 界面介绍：输入框显示对应图标+提示语，点击登录按钮进行参数校验
- @frontend/src/components/APIConfigEdit.tsx APIProvider添加或编辑组件
    - 功能可参考vscode插件cline的实现
    - 界面介绍：输入框显示对应图标+提示语
    - name ： 下来选择
    - api_url： 输入框，必填，如果下来选项是某个具体的APIProvider，则该输入框为该APIProvider的api_url，自动填入
    - api_model： 输入框，非必填
    - api_status：单选框
    - api_open: 单选框
    - api_remark： 多行文本
- @frontend/src/components/Header.tsx 菜单添加 API Config 菜单
    - 只有在登录状态时才显示
    - 点击菜单跳转到 APIConfig 页面

## 交付格式
- 生成 @frontend/src/pages/APIConfig.tsx APIProvider列表页面
- 生成 @frontend/src/components/APIConfigEdit.tsx APIProvider添加或编辑组件
- 修订 @frontend/src/components/Header.tsx 菜单
