-- ============================================
-- 快速修复脚本：重新插入正确的测试数据
-- 执行时间：2025-10-23
-- 说明：删除旧的测试数据，重新插入带有正确中文编码的数据
-- 注意：必须使用 --default-character-set=utf8mb4 连接
-- ============================================

USE `context_engine`;

-- 1. 确保表使用 utf8mb4 字符集
ALTER TABLE `cese_api_provider` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. 删除旧的测试数据
DELETE FROM `cese_api_provider` WHERE mobile IN ('13800138000', '13900139000');

-- 3. 重新插入正确的测试数据（使用 utf8mb4 编码）
INSERT INTO `cese_api_provider` (`mobile`, `name`, `api_key`, `api_url`, `api_model`, `api_version`, `api_status`, `api_open`, `api_remark`) VALUES
('13800138000', 'DeepSeek', 'sk-your-deepseek-key', 'https://api.deepseek.com', 'deepseek-chat', 'v1', 1, 1, 'DeepSeek官方API-私有'),
('13800138000', 'Ollama本地', 'local', 'http://localhost:11434', 'llama2', 'v1', 0, 0, 'Ollama本地部署-公开'),
('13900139000', 'OpenAI', 'sk-your-openai-key', 'https://api.openai.com', 'gpt-4', 'v1', 1, 0, 'OpenAI官方API-私有');

-- 4. 验证数据
SELECT id, name, api_remark FROM `cese_api_provider` WHERE mobile='13800138000';

-- ============================================
-- 修复完成
-- 执行命令：
-- docker exec -i mysql mysql -uroot -pPASSWORD --default-character-set=utf8mb4 context_engine < 003_fix_test_data.sql
-- ============================================
