import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANNON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey );
console.log('Supabase client initialized:');
export default supabase;