-- ============================================
-- 数据库迁移脚本：将 api_key 字段改为可选
-- 执行时间：2025-10-23
-- 说明：将 cese_api_provider 表的 api_key 字段从 NOT NULL 改为 NULL
-- ============================================

USE `cese`;

-- 修改 api_key 字段为可选
ALTER TABLE `cese_api_provider` 
MODIFY COLUMN `api_key` VARCHAR(255) NULL COMMENT 'API密钥（可选）';

-- 验证修改结果
DESC `cese_api_provider`;

-- ============================================
-- 迁移完成
-- ============================================
