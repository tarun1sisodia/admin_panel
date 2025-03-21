import { createClient } from '@supabase/supabase-js'

// Use environment variables instead of hardcoding
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://otcqeieukikymmsjwfeu.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90Y3FlaWV1a2lreW1tc2p3ZmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MjA5MDMsImV4cCI6MjA1ODA5NjkwM30.M3D533la8914BPuHQkyHWnoxN5OM4N_-vVpMDvKDMbk'

export const supabase = createClient(supabaseUrl, supabaseKey)
