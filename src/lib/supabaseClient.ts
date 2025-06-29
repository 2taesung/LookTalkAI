import { createClient } from '@supabase/supabase-js';

// .env.local 파일에 Supabase URL과 anon key를 저장하고 불러오는 것이 안전합니다.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
