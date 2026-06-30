import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabaseUrl = "https://pxxbwzfxhapbzpznabbe.supabase.co";

const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4eGJ3emZ4aGFwYnpwem5hYmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNDE4MDAsImV4cCI6MjA5NDYxNzgwMH0.v4QD86JrDeIBvBnRfKaq2xWy1_9IYmcLp61UmtoZdE4";

export const supabase = createClient(supabaseUrl, supabaseKey);