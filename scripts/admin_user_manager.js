
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
const envPath = path.resolve(__dirname, '../.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const SUPABASE_URL = envConfig.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = envConfig.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file.');
  console.error('   Please ensure you have added your Service Role Key (not the anon key) to .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createUser(email, password) {
  console.log(`Creating user: ${email}...`);
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (error) {
    console.error('❌ Error creating user:', error.message);
  } else {
    console.log(`✅ User created successfully! ID: ${data.user.id}`);
  }
}

async function deleteUser(email) {
  console.log(`Finding user: ${email}...`);
  // First we need to find the user ID by email. 
  // listUsers does not allow filtering by email directly in all versions, 
  // but let's try to list and filter or use getUserById if we had ID.
  // Since we only have email, we have to list users. 
  // Note: listUsers is paginated. For a small boutique this is fine, but for scale this needs searchUser.
  
  // Try newer listUsers support or fallback to getting a page
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('❌ Error listing users:', listError.message);
    return;
  }

  const user = users.find(u => u.email === email);

  if (!user) {
    console.error(`❌ User not found with email: ${email}`);
    return;
  }

  console.log(`Deleting user ID: ${user.id}...`);
  const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

  if (deleteError) {
    console.error('❌ Error deleting user:', deleteError.message);
  } else {
    console.log(`✅ User deleted successfully: ${email}`);
  }
}

async function listUsers() {
  console.log('Fetching users...');
  
  // 1. Get all auth users
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('❌ Error listing users:', listError.message);
    return;
  }

  if (!users || users.length === 0) {
    console.log('No users found.');
    return;
  }

  // 2. Get all profiles to match roles
  const { data: profiles, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, role');

  if (profileError) {
    console.error('⚠️ Could not fetch user profiles (roles might be missing):', profileError.message);
  }

  // Map profiles by ID for easy lookup
  const profileMap = {};
  if (profiles) {
    profiles.forEach(p => {
      profileMap[p.id] = p.role;
    });
  }

  console.log('\nUser List:');
  console.log('---------------------------------------------------------------------------------');
  console.log(`${'ID'.padEnd(38)} | ${'Email'.padEnd(30)} | ${'Role'.padEnd(10)}`);
  console.log('---------------------------------------------------------------------------------');

  users.forEach(u => {
    const role = profileMap[u.id] || 'unknown';
    console.log(`${u.id.padEnd(38)} | ${u.email.padEnd(30)} | ${role.padEnd(10)}`);
  });
  console.log('---------------------------------------------------------------------------------');
  console.log(`Total: ${users.length} users\n`);
}

const command = process.argv[2];
const args = process.argv.slice(3);

if (command === 'create') {
  if (args.length < 2) {
    console.log('Usage: node admin_user_manager.js create <email> <password>');
  } else {
    createUser(args[0], args[1]);
  }
} else if (command === 'delete') {
  if (args.length < 1) {
    console.log('Usage: node admin_user_manager.js delete <email>');
  } else {
    deleteUser(args[0]);
  }
} else if (command === 'list') {
  listUsers();
} else {
  console.log('User Manager CLI');
  console.log('Usage:');
  console.log('  node scripts/admin_user_manager.js create <email> <password>  - Create a new user');
  console.log('  node scripts/admin_user_manager.js delete <email>             - Delete a user');
  console.log('  node scripts/admin_user_manager.js list                       - List all users and roles');
}
