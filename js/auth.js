import { supabase } from "./supabase.auth.js";

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error("Session Error:", error);
    return null;
  }
  
  return session;
}