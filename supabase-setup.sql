-- Supabase Database Setup for PlayInMo
-- Run this SQL in your Supabase SQL Editor: https://fwijwjrbvbqavfoanjfd.supabase.co/project/default/sql

-- 1. User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    provider TEXT DEFAULT 'email',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User activities table
CREATE TABLE IF NOT EXISTS user_activities (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. User online status table
CREATE TABLE IF NOT EXISTS user_online_status (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    username TEXT NOT NULL,
    is_online BOOLEAN DEFAULT false,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_online_status ENABLE ROW LEVEL SECURITY;

-- 6. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own activities" ON user_activities;
DROP POLICY IF EXISTS "Users can insert own activities" ON user_activities;
DROP POLICY IF EXISTS "Users can view all chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can view all online status" ON user_online_status;
DROP POLICY IF EXISTS "Users can manage own status" ON user_online_status;

-- 6. Create RLS Policies for user_profiles
CREATE POLICY "Users can view all profiles" ON user_profiles 
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON user_profiles 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles 
    FOR UPDATE USING (auth.uid() = user_id);

-- 7. Create RLS Policies for user_activities
CREATE POLICY "Users can view own activities" ON user_activities 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities" ON user_activities 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. Create RLS Policies for chat_messages
CREATE POLICY "Users can view all chat messages" ON chat_messages 
    FOR SELECT USING (true);

CREATE POLICY "Users can insert chat messages" ON chat_messages 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 9. Create RLS Policies for user_online_status
CREATE POLICY "Users can view all online status" ON user_online_status 
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own status" ON user_online_status 
    FOR ALL USING (auth.uid() = user_id);

-- 10. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_online_status_user_id ON user_online_status(user_id);
CREATE INDEX IF NOT EXISTS idx_user_online_status_is_online ON user_online_status(is_online);

-- 11. Enable realtime for chat and online status
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE user_online_status;

-- Setup complete!
-- Don't forget to:
-- 1. Enable Google OAuth in Supabase Auth settings
-- 2. Add your domain to the allowed redirect URLs
-- 3. Test the authentication flow

SELECT 'Database setup completed successfully!' as status;