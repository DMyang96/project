
import { createClient } from '@supabase/supabase-js';

// Hardcoded from .env
const supabaseUrl = 'https://vaqkfrdcvyqighhnlfjk.supabase.co';
// Using SERVICE ROLE KEY
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhcWtmcmRjdnlxaWdoaG5sZmprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjE3NzY2OCwiZXhwIjoyMDg3NzUzNjY4fQ.tlGrqvJwWkDXvlra6_7IN9B0NaKIIC2Zyt9IM-tOfjQ';

const supabase = createClient(supabaseUrl, supabaseKey);

const mockUsers = [
  {
    email: 'zhangwei@test.com',
    password: 'password123',
    name: '张伟',
    basicInfo: {
      gender: 'male',
      age: 28,
      height: 178,
      education: 'bachelor',
      occupation: '软件工程师',
      income: '30',
      location: '北京',
    },
    relationshipHistory: '谈过两次恋爱，第一段大学时期，因为毕业异地分开。第二段工作后，因性格不合和平分手。希望能找到性格开朗，能够互相理解的伴侣。',
    requirements: {
      min_age: 24,
      max_age: 28,
      min_height: 160,
      education: ['bachelor', 'master'],
    }
  },
  {
    email: 'lina@test.com',
    password: 'password123',
    name: '李娜',
    basicInfo: {
      gender: 'female',
      age: 26,
      height: 165,
      education: 'master',
      occupation: '产品经理',
      income: '25',
      location: '北京',
    },
    relationshipHistory: '母胎单身，一直忙于学业和工作。性格比较慢热，希望能遇到一个有责任心，顾家的男生。',
    requirements: {
      min_age: 26,
      max_age: 32,
      min_height: 175,
      education: ['bachelor', 'master', 'phd'],
    }
  },
  {
    email: 'wangqiang@test.com',
    password: 'password123',
    name: '王强',
    basicInfo: {
      gender: 'male',
      age: 32,
      height: 180,
      education: 'master',
      occupation: '金融分析师',
      income: '50',
      location: '上海',
    },
    relationshipHistory: '有一段长达5年的感情，到了谈婚论嫁的阶段因为发展方向不同分开。现在心态成熟，希望能找个奔着结婚去的。',
    requirements: {
      min_age: 25,
      max_age: 30,
      min_height: 162,
      education: ['bachelor', 'master'],
    }
  },
  {
    email: 'zhaomin@test.com',
    password: 'password123',
    name: '赵敏',
    basicInfo: {
      gender: 'female',
      age: 29,
      height: 168,
      education: 'bachelor',
      occupation: '人力资源',
      income: '20',
      location: '上海',
    },
    relationshipHistory: '有过几段短暂的接触，觉得都不太合适。自己比较独立，希望对方也是一个有主见的人。',
    requirements: {
      min_age: 28,
      max_age: 35,
      min_height: 172,
      education: ['bachelor', 'master', 'phd'],
    }
  },
  {
    email: 'liuyang@test.com',
    password: 'password123',
    name: '刘洋',
    basicInfo: {
      gender: 'male',
      age: 30,
      height: 175,
      education: 'phd',
      occupation: '高校教师',
      income: '25',
      location: '广州',
    },
    relationshipHistory: '一直在读书，圈子比较小。性格温和，喜欢读书运动。希望能找个知书达理的女孩。',
    requirements: {
      min_age: 25,
      max_age: 30,
      min_height: 158,
      education: ['bachelor', 'master'],
    }
  }
];

async function seed() {
  console.log('Starting seed process (Clean & Create Real Accounts)...');

  // Clean up previous fake entries in public.users
  // We identify them by email domain @test.com
  // Note: deleting from public.users will cascade delete profiles because of FK constraint (ON DELETE CASCADE)
  console.log('Cleaning up old test data...');
  const { error: deleteError } = await supabase
    .from('users')
    .delete()
    .like('email', '%@test.com');
  
  if (deleteError) {
      console.error('Error cleaning up:', deleteError);
  } else {
      console.log('Cleanup complete.');
  }

  for (const user of mockUsers) {
    console.log(`Creating user: ${user.name} (${user.email})`);
    
    // 1. Create User via Admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { name: user.name }
    });

    let userId;

    if (authError) {
      console.error(`Error creating auth user ${user.email}:`, authError.message);
      if (authError.message.includes('already has been registered') || authError.message.includes('unique constraint')) {
          console.log('User exists in Auth, fetching ID...');
          // List users to find the ID
          const { data: users } = await supabase.auth.admin.listUsers();
          const existing = users.users.find(u => u.email === user.email);
          if (existing) {
              userId = existing.id;
          } else {
              console.error('Could not find existing user ID');
              continue;
          }
      } else {
          continue;
      }
    } else {
        userId = authData.user.id;
    }

    if (!userId) {
        console.error('No user ID found, skipping');
        continue;
    }

    // 2. Insert into public.users
    // Since we cleaned up, we can just insert. If auth user existed but public user was deleted, we insert.
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: user.email,
        name: user.name,
        password_hash: 'managed_by_supabase_auth',
      });

    if (userError) {
      console.error(`Error upserting public user for ${user.email}:`, userError.message);
    }

    // 3. Upsert Profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        basic_info: user.basicInfo,
        relationship_history: user.relationshipHistory,
        requirements: user.requirements,
        is_active: true,
      }, { onConflict: 'user_id' });

    if (profileError) {
      console.error(`Error creating profile for ${user.email}:`, profileError.message);
    } else {
      console.log(`Successfully created/updated profile for ${user.name}`);
    }
  }

  console.log('Seed process completed.');
}

seed();
