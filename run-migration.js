import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const sql = readFileSync('./app/sql/migrations/007_add_scenario_to_challenge_calendar.sql', 'utf8');

// Split SQL commands by semicolon and execute each one
const commands = sql.split(';').filter(cmd => cmd.trim());

for (const command of commands) {
  if (command.trim()) {
    console.log('Executing:', command.trim().substring(0, 100) + '...');
    const { error } = await supabase.rpc('execute_sql', { sql: command.trim() });
    if (error) {
      console.error('Error executing command:', error);
    } else {
      console.log('Success');
    }
  }
}