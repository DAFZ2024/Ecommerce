import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ahlhbjpnraddsrckjqzk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobGhianBucmFkZHNyY2tqcXprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NTYxNDQsImV4cCI6MjA2NzEzMjE0NH0.7-j83DhHaYQ01CeG7xZUlakQ9n0p5_wFqZZFgTTZcoc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);