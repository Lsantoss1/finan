
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

try {
  const envFile = readFileSync('.env.local', 'utf8');
  const lines = envFile.split('\n');
  lines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) process.env[key.trim()] = value.trim();
  });
} catch (e) {}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function testDashboard() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return console.log("No user session");

  const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const end = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString();

  console.log("Testing RPC get_dashboard_stats...");
  const { data, error } = await supabase.rpc('get_dashboard_stats', { 
    p_user_id: user.id, 
    p_start_date: start, 
    p_end_date: end 
  });

  if (error) {
    console.error("RPC Error:", error);
  } else {
    console.log("RPC Success!", data);
  }
}

testDashboard();
