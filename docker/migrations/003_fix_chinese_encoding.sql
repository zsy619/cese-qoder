-- ============================================
-- 数据库迁移脚本：修复中文乱码问题
-- 执行时间：2025-10-23
-- 说明：将表和字段转换为 utf8mb4 字符集，修复中文乱码
-- ============================================

USE `context_engine`;

-- 1. 检查表的当前字符集
SHOW TABLE STATUS WHERE Name = 'cese_api_provider';

-- 2. 转换表字符集为 utf8mb4
ALTER TABLE `cese_api_provider` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3. 明确指定 api_remark 字段的字符集
ALTER TABLE `cese_api_provider` 
MODIFY COLUMN `api_remark` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '备注说明';

-- 4. 修复现有的乱码数据（如果数据已经是错误编码存储的）
-- 注意：这里假设数据是以 latin1 错误存储的 utf8 数据
-- UPDATE `cese_api_provider` 
-- SET `api_remark` = CONVERT(CAST(CONVERT(api_remark USING latin1) AS BINARY) USING utf8mb4)
-- WHERE `api_remark` IS NOT NULL AND `api_remark` != '';

-- 5. 验证修改结果
SHOW FULL COLUMNS FROM `cese_api_provider` WHERE Field = 'api_remark';

-- 6. 同时修复其他可能有中文的表
ALTER TABLE `cese_user` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `cese_template` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- 迁移完成
-- ============================================
