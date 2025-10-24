-- ============================================
-- 数据库迁移脚本：为 API Provider 表增加 api_kind 字段
-- 执行时间：2025-10-23
-- 说明：增加模型类型字段，支持14种主流模型类型
-- ============================================

USE `context_engine`;

-- 1. 检查表的当前结构
DESC `cese_api_provider`;

-- 2. 添加 api_kind 字段
ALTER TABLE `cese_api_provider` 
ADD COLUMN `api_kind` VARCHAR(50) NOT NULL DEFAULT 'OpenAI Compatible' COMMENT '模型类型' AFTER `name`;

-- 3. 添加索引以提升查询性能
CREATE INDEX `idx_api_kind` ON `cese_api_provider`(`api_kind`);

-- 4. 更新现有数据的 api_kind 字段
-- 根据 name 或 api_url 自动推断模型类型
UPDATE `cese_api_provider` SET `api_kind` = 'DeepSeek' WHERE `name` LIKE '%DeepSeek%' OR `api_url` LIKE '%deepseek%';
UPDATE `cese_api_provider` SET `api_kind` = 'Ollama' WHERE `name` LIKE '%Ollama%' OR `api_url` LIKE '%11434%';
UPDATE `cese_api_provider` SET `api_kind` = 'OpenAI Compatible' WHERE `name` LIKE '%OpenAI%' OR `api_url` LIKE '%openai%';
UPDATE `cese_api_provider` SET `api_kind` = '阿里千问' WHERE `name` LIKE '%千问%' OR `api_url` LIKE '%dashscope%';
UPDATE `cese_api_provider` SET `api_kind` = '豆包' WHERE `name` LIKE '%豆包%' OR `api_url` LIKE '%volces%';
UPDATE `cese_api_provider` SET `api_kind` = 'Google Gemini' WHERE `name` LIKE '%Gemini%' OR `api_url` LIKE '%generativelanguage%';
UPDATE `cese_api_provider` SET `api_kind` = 'Anthropic' WHERE `name` LIKE '%Claude%' OR `api_url` LIKE '%anthropic%';
UPDATE `cese_api_provider` SET `api_kind` = '智普' WHERE `name` LIKE '%智普%' OR `name` LIKE '%智景%' OR `api_url` LIKE '%bigmodel%';
UPDATE `cese_api_provider` SET `api_kind` = '讯飞星火' WHERE `name` LIKE '%讯飞%' OR `name` LIKE '%星火%' OR `api_url` LIKE '%xf-yun%';
UPDATE `cese_api_provider` SET `api_kind` = '百度千帆' WHERE `name` LIKE '%百度%' OR `name` LIKE '%千帆%' OR `api_url` LIKE '%baidubce%';
UPDATE `cese_api_provider` SET `api_kind` = '腾讯混元' WHERE `name` LIKE '%腾讯%' OR `name` LIKE '%混元%' OR `api_url` LIKE '%hunyuan%';

-- 5. 验证修改结果
SELECT id, name, api_kind, api_url FROM `cese_api_provider` ORDER BY id;

-- 6. 显示表结构
SHOW FULL COLUMNS FROM `cese_api_provider`;

-- ============================================
-- 迁移完成
-- 执行命令（示例）：
-- docker exec -i mysql mysql -uroot -pPASSWORD --default-character-set=utf8mb4 context_engine < 004_add_api_kind.sql
-- ============================================
