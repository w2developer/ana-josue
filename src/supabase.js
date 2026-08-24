import { createClient } from '@supabase/supabase-js'

// Variáveis do .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Inicia o Supabase
export const supabase = createClient(supabaseUrl, supabaseKey)