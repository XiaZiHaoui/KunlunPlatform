
-- 创建会话表 (Replit Auth 需要)
CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY NOT NULL,
    email VARCHAR UNIQUE,
    first_name VARCHAR,
    last_name VARCHAR,
    profile_image_url VARCHAR,
    role VARCHAR NOT NULL DEFAULT 'user', -- 'user', 'vip', 'admin'
    vip_expires_at TIMESTAMP,
    daily_usage INTEGER NOT NULL DEFAULT 0,
    last_usage_reset TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建AI模型表
CREATE TABLE IF NOT EXISTS kun (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    display_name VARCHAR NOT NULL,
    provider VARCHAR NOT NULL,
    description TEXT,
    accuracy INTEGER, -- 准确率百分比
    speed VARCHAR, -- 'fast', 'medium', 'slow'
    category VARCHAR, -- 'text', 'image', 'code', 'multimodal'
    is_active BOOLEAN NOT NULL DEFAULT true,
    requires_vip BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 创建对话表
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    model_id INTEGER NOT NULL REFERENCES kun(id),
    title VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建消息表
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 创建支付记录表
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount VARCHAR NOT NULL, -- 使用VARCHAR避免小数解析问题
    method VARCHAR NOT NULL, -- 'alipay', 'wechat'
    status VARCHAR NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 创建使用统计表
CREATE TABLE IF NOT EXISTS usage_stats (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    model_id INTEGER NOT NULL REFERENCES kun(id),
    date TIMESTAMP NOT NULL DEFAULT NOW(),
    request_count INTEGER NOT NULL DEFAULT 1
);

-- 插入默认AI模型数据
INSERT INTO kun (name, display_name, provider, description, accuracy, speed, category, is_active, requires_vip) VALUES
('deepseek-chat', '深度求索DeepSeek', 'DeepSeek', '免费开源的中文大语言模型，擅长代码生成、逻辑推理和中文对话', 92, 'fast', 'text', true, false),
('qwen2.5-72b', '通义千问Qwen2.5', 'Alibaba', '阿里巴巴最新开源模型，在中文理解和生成方面表现优异', 94, 'fast', 'text', true, false),
('glm-4-9b', '智谱清言GLM-4', 'Zhipu AI', '智谱AI开源模型，支持多轮对话和复杂推理任务', 91, 'medium', 'text', true, false),
('llama3.1-8b', '美洲驼Llama3.1', 'Meta', 'Meta开源的先进语言模型，在多种任务上表现出色', 90, 'fast', 'text', true, false),
('gpt-4o-mini', '龙神GPT-4o Mini', 'OpenAI', 'OpenAI轻量版模型，平衡性能与成本，适合日常对话', 88, 'fast', 'text', true, true),
('claude-3-haiku', '凤凰Claude Haiku', 'Anthropic', 'Anthropic快速响应模型，注重安全性和准确性', 89, 'fast', 'text', true, true)
ON CONFLICT (name) DO NOTHING;

-- 将您的账户设置为管理员 (请替换为您的实际用户ID)
-- 这个用户ID需要从您的Replit用户信息中获取
INSERT INTO users (id, email, role, created_at, updated_at) VALUES 
('43800881', '2311938209@qq.com', 'admin', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
role = 'admin',
updated_at = NOW();
