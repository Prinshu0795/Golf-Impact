require('dotenv').config();
const bcrypt = require('bcryptjs');
const supabase = require('./src/config/supabase');

async function seed() {
  console.log('🌱 Seeding test users...\n');

  const users = [
    {
      email: 'admin@golfimpact.com',
      password: 'Admin@123',
      full_name: 'Admin User',
      role: 'admin',
      donation_pct: 10,
    },
    {
      email: 'user@golfimpact.com',
      password: 'User@123',
      full_name: 'Test User',
      role: 'user',
      donation_pct: 10,
    },
  ];

  for (const u of users) {
    // Check if already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', u.email)
      .single();

    if (existing) {
      // Update the password hash in case it was wrong
      const password_hash = await bcrypt.hash(u.password, 12);
      const { error } = await supabase
        .from('users')
        .update({ password_hash, role: u.role, is_active: true })
        .eq('email', u.email);

      if (error) {
        console.error(`❌ Failed to update ${u.email}:`, error.message);
      } else {
        console.log(`✅ Updated existing user: ${u.email}`);
      }
    } else {
      // Insert new user
      const password_hash = await bcrypt.hash(u.password, 12);
      const { error } = await supabase.from('users').insert({
        email: u.email,
        password_hash,
        full_name: u.full_name,
        role: u.role,
        donation_pct: u.donation_pct,
        is_active: true,
      });

      if (error) {
        console.error(`❌ Failed to create ${u.email}:`, error.message);
      } else {
        console.log(`✅ Created user: ${u.email} (password: ${u.password})`);
      }
    }
  }

  console.log('\n✨ Done! Test credentials:');
  console.log('  User:  user@golfimpact.com  / User@123');
  console.log('  Admin: admin@golfimpact.com / Admin@123');
}

seed().catch(console.error);
