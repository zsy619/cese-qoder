---
trigger: always_on
alwaysApply: true
---
## 编码风格规范
- 使用单引号而不是双引号
- 缩进使用Tab，也就是4个空格
- 函数命名使用camelCase
- 常量使用UPPER_SNAKE_CASE
- 每行代码不超过160个字符
## 示例代码
```javascript
const API_BASE_URL = 'https://api.example.com';
const getUserData = (userId) => {
    return fetch(`${API_BASE_URL}/users/${userId}`);
};