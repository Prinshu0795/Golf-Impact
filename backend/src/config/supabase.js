const { createClient } = require('@supabase/supabase-js');

// Clean up env vars in case they were copy-pasted into Vercel with literal quotes or spaces
const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/^"|"$/g, '').trim();
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_KEY || '').replace(/^"|"$/g, '').trim();

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

module.exports = supabase;
