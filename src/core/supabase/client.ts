import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

//usiamo createBrowserClient per salvare la sessione nei cookie invece che nel localStorage,
//così il Middleware (SSR) può leggerla e autorizzare le pagine!
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)