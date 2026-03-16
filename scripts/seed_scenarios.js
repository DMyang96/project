
import { createClient } from '@supabase/supabase-js';

// Hardcoded from .env
const supabaseUrl = 'https://vaqkfrdcvyqighhnlfjk.supabase.co';
// Using SERVICE ROLE KEY
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhcWtmcmRjdnlxaWdoaG5sZmprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjE3NzY2OCwiZXhwIjoyMDg3NzUzNjY4fQ.tlGrqvJwWkDXvlra6_7IN9B0NaKIIC2Zyt9IM-tOfjQ';

const supabase = createClient(supabaseUrl, supabaseKey);

const mockUsers = [
  // 1. New User (Has Profile, No Activity)
  {
    email: 'newuser@test.com',
    password: 'password123',
    name: '陈新',
    role_desc: '新用户，刚注册完善简历，无投递无邀约',
    basicInfo: {
      gender: 'male',
      age: 25,
      height: 175,
      education: 'bachelor',
      occupation: '设计师',
      income: '15',
      location: '杭州',
    },
    relationshipHistory: '大学谈过一次，工作后比较忙。',
    requirements: {
      min_age: 22,
      max_age: 28,
      min_height: 160,
      education: ['bachelor'],
    }
  },
  // 2. Active User (Sent Applications, No Matches yet)
  {
    email: 'sender@test.com',
    password: 'password123',
    name: '张主动',
    role_desc: '主动型用户，投递了多个简历，等待回复',
    basicInfo: {
      gender: 'female',
      age: 27,
      height: 165,
      education: 'master',
      occupation: '教师',
      income: '20',
      location: '北京',
    },
    relationshipHistory: '性格开朗，希望能找到志同道合的人。',
    requirements: {
      min_age: 25,
      max_age: 35,
      min_height: 170,
      education: ['bachelor', 'master'],
    }
  },
  // 3. Popular User (Received Applications, No Actions yet)
  {
    email: 'receiver@test.com',
    password: 'password123',
    name: '李受欢迎',
    role_desc: '受欢迎用户，收到了一些投递申请，还未处理',
    basicInfo: {
      gender: 'male',
      age: 30,
      height: 182,
      education: 'phd',
      occupation: '医生',
      income: '50',
      location: '上海',
    },
    relationshipHistory: '工作稳定，诚心寻找另一半。',
    requirements: {
      min_age: 25,
      max_age: 30,
      min_height: 160,
      education: ['bachelor', 'master'],
    }
  },
  // 4. Matched User A (Has Match, Sent Invitation)
  {
    email: 'matched_a@test.com',
    password: 'password123',
    name: '王匹配A',
    role_desc: '匹配用户A，与B互选成功，并向B发起了邀约',
    basicInfo: {
      gender: 'male',
      age: 29,
      height: 178,
      education: 'master',
      occupation: '律师',
      income: '40',
      location: '深圳',
    },
    relationshipHistory: '寻找灵魂伴侣。',
    requirements: {
      min_age: 24,
      max_age: 30,
      min_height: 160,
      education: ['bachelor', 'master'],
    }
  },
  // 5. Matched User B (Has Match, Received Invitation)
  {
    email: 'matched_b@test.com',
    password: 'password123',
    name: '赵匹配B',
    role_desc: '匹配用户B，与A互选成功，收到了A的邀约',
    basicInfo: {
      gender: 'female',
      age: 28,
      height: 168,
      education: 'bachelor',
      occupation: '会计',
      income: '25',
      location: '深圳',
    },
    relationshipHistory: '期待一段稳定的感情。',
    requirements: {
      min_age: 26,
      max_age: 35,
      min_height: 170,
      education: ['bachelor', 'master', 'phd'],
    }
  },
   // 6. Matched User C (Has Match, No Invitation yet)
   {
    email: 'matched_c@test.com',
    password: 'password123',
    name: '孙匹配C',
    role_desc: '匹配用户C，与D互选成功，暂无邀约',
    basicInfo: {
      gender: 'male',
      age: 31,
      height: 180,
      education: 'master',
      occupation: '架构师',
      income: '60',
      location: '广州',
    },
    relationshipHistory: '宁缺毋滥。',
    requirements: {
      min_age: 25,
      max_age: 32,
      min_height: 160,
      education: ['bachelor', 'master'],
    }
  },
  // 7. Matched User D (Has Match, No Invitation yet)
  {
    email: 'matched_d@test.com',
    password: 'password123',
    name: '周匹配D',
    role_desc: '匹配用户D，与C互选成功，暂无邀约',
    basicInfo: {
      gender: 'female',
      age: 29,
      height: 165,
      education: 'master',
      occupation: '公务员',
      income: '20',
      location: '广州',
    },
    relationshipHistory: '希望能找个顾家的。',
    requirements: {
      min_age: 28,
      max_age: 35,
      min_height: 170,
      education: ['bachelor', 'master', 'phd'],
    }
  }
];

async function seed() {
  console.log('Starting comprehensive seed process (Version 2 - Better User Lookup)...');

  // 1. Clean up old test data
  console.log('Cleaning up old test data...');
  const { error: deleteError } = await supabase
    .from('users')
    .delete()
    .like('email', '%@test.com');
  
  if (deleteError) console.error('Error cleaning up:', deleteError);
  else console.log('Cleanup complete.');

  const userIds = {};

  // 2. Create Users and Profiles
  for (const user of mockUsers) {
    console.log(`Creating user: ${user.name} (${user.email})`);
    
    // Create User via Admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { name: user.name }
    });

    let userId;

    if (authError) {
      // console.log(`Error detail: ${authError.message}`); // Debug
      if (authError.message.includes('already has been registered') || authError.message.includes('unique constraint')) {
          // If already registered, we MUST fetch the user ID correctly.
          // Since listUsers might be paginated or slow, let's try to get user by email directly if possible?
          // No, Supabase Admin API doesn't have getUserByEmail directly exposed easily in JS client usually,
          // but let's assume we can list users.
          
          // Actually, we can try to sign in to get the ID if we know the password? No, that's rate limited.
          
          // Let's rely on listUsers but maybe iterate if needed, or just assume small list.
          // For now, let's assume the user IS in the listUsers response.
          const { data: users, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
          if (listError) {
            console.error('Error listing users:', listError);
            continue;
          }
          
          const existing = users.users.find(u => u.email === user.email);
          if (existing) {
              userId = existing.id;
              // console.log(`Found existing user ID: ${userId}`);
          } else {
              console.error(`Could not find existing user ID for ${user.email} even though create failed.`);
              continue;
          }
      } else {
          console.error(`Failed to create user ${user.email}: ${authError.message}`);
          continue;
      }
    } else {
        userId = authData.user.id;
    }

    if (!userId) {
        console.error('No user ID found, skipping');
        continue;
    }

    userIds[user.email] = userId;

    // Upsert public.users
    const { error: upsertUserError } = await supabase.from('users').upsert({
        id: userId,
        email: user.email,
        name: user.name,
        password_hash: 'managed_by_supabase_auth',
    });
    if (upsertUserError) console.error(`Error upserting user ${user.email}:`, upsertUserError);

    // Upsert Profile
    const { error: upsertProfileError } = await supabase.from('profiles').upsert({
        user_id: userId,
        basic_info: user.basicInfo,
        relationship_history: user.relationshipHistory,
        requirements: user.requirements,
        is_active: true,
    }, { onConflict: 'user_id' });
    if (upsertProfileError) console.error(`Error upserting profile ${user.email}:`, upsertProfileError);
  }

  // 3. Create Interactions (Applications & Matches & Invitations)

  // Helper to get ID safely
  const getUid = (email) => {
      const id = userIds[email];
      if (!id) console.error(`Missing ID for ${email}`);
      return id;
  };

  if (getUid('sender@test.com') && getUid('receiver@test.com')) {
    console.log('Creating Application: Sender -> Receiver');
    await supabase.from('applications').insert({
        sender_id: getUid('sender@test.com'),
        receiver_id: getUid('receiver@test.com'),
        status: 'pending',
        message: '你好，看了你的简历觉得很合适，希望能认识一下。'
    });
  }

  if (getUid('matched_a@test.com') && getUid('matched_b@test.com')) {
    console.log('Creating Mutual Match: A <-> B');
    const u1 = getUid('matched_a@test.com');
    const u2 = getUid('matched_b@test.com');
    
    // Clean up existing potential matches/applications first to avoid duplicates if re-running
    await supabase.from('matches').delete().or(`user1_id.eq.${u1},user2_id.eq.${u1},user1_id.eq.${u2},user2_id.eq.${u2}`);
    await supabase.from('applications').delete().or(`sender_id.eq.${u1},receiver_id.eq.${u1},sender_id.eq.${u2},receiver_id.eq.${u2}`);
    await supabase.from('invitations').delete().or(`sender_id.eq.${u1},receiver_id.eq.${u1},sender_id.eq.${u2},receiver_id.eq.${u2}`);

    await supabase.from('applications').insert({
        sender_id: u1,
        receiver_id: u2,
        status: 'accepted',
        message: '你好，很有眼缘。'
    });
    await supabase.from('applications').insert({
        sender_id: u2,
        receiver_id: u1,
        status: 'accepted',
        message: '你好呀。'
    });
    
    await supabase.from('matches').insert({
        user1_id: u1 < u2 ? u1 : u2,
        user2_id: u1 < u2 ? u2 : u1,
        match_score: 95,
        match_reasons: { reason: 'Manual Seed Match' }
    });

    console.log('Creating Invitation: A -> B');
    await supabase.from('invitations').insert({
        sender_id: u1,
        receiver_id: u2,
        meeting_type: 'coffee',
        proposed_time: new Date(Date.now() + 86400000 * 3).toISOString(),
        location: '星巴克(万象城店)',
        status: 'pending'
    });
  }

  if (getUid('matched_c@test.com') && getUid('matched_d@test.com')) {
    console.log('Creating Mutual Match: C <-> D');
    const u3 = getUid('matched_c@test.com');
    const u4 = getUid('matched_d@test.com');

     // Clean up
    await supabase.from('matches').delete().or(`user1_id.eq.${u3},user2_id.eq.${u3},user1_id.eq.${u4},user2_id.eq.${u4}`);
    await supabase.from('applications').delete().or(`sender_id.eq.${u3},receiver_id.eq.${u3},sender_id.eq.${u4},receiver_id.eq.${u4}`);
    
    await supabase.from('applications').insert({
        sender_id: u3,
        receiver_id: u4,
        status: 'accepted'
    });
    await supabase.from('applications').insert({
        sender_id: u4,
        receiver_id: u3,
        status: 'accepted'
    });
    await supabase.from('matches').insert({
        user1_id: u3 < u4 ? u3 : u4,
        user2_id: u3 < u4 ? u4 : u3,
        match_score: 88,
        match_reasons: { reason: 'Manual Seed Match' }
    });
  }

  console.log('Comprehensive seed process completed.');
}

seed();
