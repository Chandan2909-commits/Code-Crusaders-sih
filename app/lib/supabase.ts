import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database schema for chat storage
export const createChatTables = async () => {
  // Create chats table
  await supabase.rpc('create_chats_table', {});
  
  // Create messages table
  await supabase.rpc('create_messages_table', {});
};