import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://kirgavtasvgsohbaqjkx.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcmdhdnRhc3Znc29oYmFxamt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNzU1MDgsImV4cCI6MjA2Mjk1MTUwOH0.H-UCEdslVFh19Pl2B-fZrCITL91RY271mrocM56v0Jw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
