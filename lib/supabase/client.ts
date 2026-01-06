import { createBrowserClient } from "@supabase/ssr";
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export function createClient() {
  return createBrowserClient(supabaseUrl as string, supabaseAnonKey as string);
}
