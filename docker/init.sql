-- ============================================
-- 上下文工程六要素小工具 - 数据库初始化脚本
-- ============================================

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS context_engine DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE context_engine;

-- ============================================
-- 删除旧表（如果存在）
-- ============================================
DROP TABLE IF EXISTS `cese_template`;
DROP TABLE IF EXISTS `cese_user`;

-- ============================================
-- 用户表 (cese_user)
-- ============================================
CREATE TABLE `cese_user` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
  `phone` VARCHAR(11) NOT NULL UNIQUE COMMENT '手机号码',
  `password` VARCHAR(255) NOT NULL COMMENT '加密后的密码',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ============================================
-- 六要素模板表 (cese_template)
-- ============================================
CREATE TABLE `cese_template` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '模板ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `topic` VARCHAR(255) NOT NULL COMMENT '主题',
  `task_objective` TEXT COMMENT '任务目标',
  `ai_role` TEXT COMMENT 'AI的角色',
  `my_role` TEXT COMMENT '我的角色',
  `key_information` TEXT COMMENT '关键信息',
  `behavior_rule` TEXT COMMENT '行为规则',
  `delivery_format` TEXT COMMENT '交付格式',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_topic` (`topic`),
  INDEX `idx_created_at` (`created_at`),
  CONSTRAINT `fk_template_user` FOREIGN KEY (`user_id`) REFERENCES `cese_user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='六要素模板表';

-- ============================================
-- 插入测试数据
-- ============================================
-- 插入测试用户（密码: Test@123456）
INSERT INTO `cese_user` (`phone`, `password`) VALUES
('13800138000', '$2a$10$YourHashedPasswordHere123456789012345678901234567890');

-- 插入示例模板
INSERT INTO `cese_template` (`user_id`, `topic`, `task_objective`, `ai_role`, `my_role`, `key_information`, `behavior_rule`, `delivery_format`) VALUES
(1, '写作助手', '帮助用户生成高质量的文章内容', '写作专家', '内容创作者', '需要创作的文章主题和目标读者', '使用清晰的结构和生动的语言', 'Markdown格式'),
(1, '代码审查助手', '协助进行代码质量审查和优化建议', '高级软件工程师', '开发人员', '代码片段、项目技术栈、代码规范', '遵循最佳实践、提供具体改进建议', '结构化文本报告');

-- ============================================
-- 完成
-- ============================================