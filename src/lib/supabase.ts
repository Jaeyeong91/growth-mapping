import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rlreksqomrrbclwghtnk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJscmVrc3FvbXJyYmNsd2dodG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyOTE5MTMsImV4cCI6MjA4OTg2NzkxM30.2D6HC-_ib0uUc2xWBY827CLi2Ai_XcEiM2TjKEOsODI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
