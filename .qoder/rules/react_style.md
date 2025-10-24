---
trigger: manual
---
# **React组件规则** (Specific Files: `src/**/*.jsx`)

## React组件开发规范
- 使用函数式组件和Hooks
- 组件名使用PascalCase
- Props使用TypeScript类型定义
- 使用默认export导出主组件
- 添加PropTypes或TypeScript类型检查

## 组件结构示例
```jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const UserProfile = ({ userId, onUpdate }) => {
    const [user, setUser] = useState(null);
  
    useEffect(() => {
        // 组件逻辑
    }, [userId]);
  
    return (
        <div className="user-profile">
        {/* 组件JSX */}
        </div>
    );
};

UserProfile.propTypes = {
    userId: PropTypes.string.isRequired,
    onUpdate: PropTypes.func
};

export default UserProfile;
```