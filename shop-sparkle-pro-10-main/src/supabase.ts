import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pkctmpkkiupbozgwgwnz.supabase.co'
const supabaseKey = 'sb_publishable_9YHPKfM5GxKd0InP5A0xBQ_tSyq-Uk6'

export const supabase = createClient(supabaseUrl, supabaseKey)