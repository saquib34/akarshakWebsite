import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? 'Set' : 'Not Set');

const supabase = createClient(supabaseUrl, supabaseKey);

const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('centers').select('*').limit(1);
    if (error) {
      console.error('Supabase connection test failed:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return false;
    } else {
      console.log('Supabase connection successful');
      console.log('Sample data:', data);
      return true;
    }
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return false;
  }
};

export { supabase, testSupabaseConnection };