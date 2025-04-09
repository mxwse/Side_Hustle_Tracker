import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bszwvquwbcihrimudukc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzend2cXV3YmNpaHJpbXVkdWtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwOTk5MjAsImV4cCI6MjA1OTY3NTkyMH0.Boz0j5EXTNIUZMag4_3s1RhEUn56AgpEg55bj3yDGhI'

export const supabase = createClient(supabaseUrl, supabaseKey)
