
-- Fix RLS for invitations table
CREATE POLICY "Users can manage own invitations" ON invitations
    FOR ALL USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Fix RLS for matches table (enable it and add policy)
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own matches" ON matches
    FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Explicitly allowing insert/update might be needed if frontend does it, 
-- but usually matches are created by system or via server functions. 
-- For now, let's allow users to insert if they match user1 or user2 (though backend logic is safer)
CREATE POLICY "Users can insert own matches" ON matches
    FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Fix applications query issue by ensuring profiles can be accessed via users
-- (This is usually handled by PostgREST automatically detecting FKs, but we just verify permissions)
-- Profiles policy already exists: "Users can view own profile" AND "View active profiles" (is_active=true)
-- This should be enough for public profiles.
