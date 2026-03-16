
import { createClient } from '@supabase/supabase-js';

// Hardcoded from .env
const supabaseUrl = 'https://vaqkfrdcvyqighhnlfjk.supabase.co';
// Using SERVICE ROLE KEY
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhcWtmcmRjdnlxaWdoaG5sZmprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjE3NzY2OCwiZXhwIjoyMDg3NzUzNjY4fQ.tlGrqvJwWkDXvlra6_7IN9B0NaKIIC2Zyt9IM-tOfjQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteAllTestUsers() {
    console.log('Fetching all users...');
    const { data: { users }, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    
    if (error) {
        console.error('Error listing users:', error);
        return;
    }

    const testUsers = users.filter(u => u.email.endsWith('@test.com'));
    console.log(`Found ${testUsers.length} test users to delete.`);

    for (const user of testUsers) {
        console.log(`Deleting user ${user.email} (${user.id})...`);
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
        if (deleteError) {
            console.error(`Failed to delete ${user.email}:`, deleteError.message);
        } else {
            console.log(`Deleted ${user.email}`);
        }
    }
    console.log('Cleanup finished.');
}

deleteAllTestUsers();
