import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sgipjakbnozvwlzogdhy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnaXBqYWtibm96dndsem9nZGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NDk5OTAsImV4cCI6MjA4NzIyNTk5MH0.HEkNXgNClx-ZYZIpSRBHF3w7IvJCUuH1jwXU-uGgJAE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
