import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  // Fail loud in the console but don't crash the whole app — only the
  // contact form depends on this.
  console.error(
    'Supabase env vars missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). The contact form will not work.'
  )
}

export const supabase = createClient(url ?? '', key ?? '')
