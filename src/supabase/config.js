import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wmmrvwyjozyvcighevkn.supabase.co'
const supabaseAnonKey = 'sb_publishable_T9b_2SfYcL6GS8gUUCf52Q_1RZMy1Dm'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
