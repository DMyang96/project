-- 创建表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 简历表 (profiles)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    basic_info JSONB NOT NULL,
    relationship_history TEXT NOT NULL,
    requirements JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);

-- 申请表 (applications)
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sender_id, receiver_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_applications_sender_id ON applications(sender_id);
CREATE INDEX IF NOT EXISTS idx_applications_receiver_id ON applications(receiver_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

-- 邀约表 (invitations)
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    meeting_type VARCHAR(50) NOT NULL,
    proposed_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_invitations_sender_id ON invitations(sender_id);
CREATE INDEX IF NOT EXISTS idx_invitations_receiver_id ON invitations(receiver_id);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);

-- 匹配表 (matches)
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
    match_score FLOAT NOT NULL,
    match_reasons JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_matches_user1_id ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2_id ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_score ON matches(match_score DESC);
-- Unique index for matches to prevent duplicates regardless of order
CREATE UNIQUE INDEX IF NOT EXISTS idx_matches_unique_pair ON matches (LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id));

-- 基本读取权限
GRANT SELECT ON users TO anon;
GRANT SELECT ON profiles TO anon;
GRANT SELECT ON matches TO anon;

-- 认证用户完整权限
GRANT ALL PRIVILEGES ON users TO authenticated;
GRANT ALL PRIVILEGES ON profiles TO authenticated;
GRANT ALL PRIVILEGES ON applications TO authenticated;
GRANT ALL PRIVILEGES ON invitations TO authenticated;
GRANT ALL PRIVILEGES ON matches TO authenticated;

-- RLS策略示例
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的完整信息
-- Note: Policy names must be unique per table
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

-- 用户只能查看活跃的简历
DROP POLICY IF EXISTS "View active profiles" ON profiles;
CREATE POLICY "View active profiles" ON profiles
    FOR SELECT USING (is_active = true);

-- 用户只能管理自己的申请
DROP POLICY IF EXISTS "Users can manage own applications" ON applications;
CREATE POLICY "Users can manage own applications" ON applications
    FOR ALL USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
