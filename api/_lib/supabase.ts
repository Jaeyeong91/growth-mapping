import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rlreksqomrrbclwghtnk.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJscmVrc3FvbXJyYmNsd2dodG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyOTE5MTMsImV4cCI6MjA4OTg2NzkxM30.2D6HC-_ib0uUc2xWBY827CLi2Ai_XcEiM2TjKEOsODI';

// 서버사이드에서는 service_role key 사용 (RLS 우회), 없으면 anon key 사용
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY);
