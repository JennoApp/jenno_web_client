import { createClient } from '@supabase/supabase-js'

export const supabase = createClient('https://mbdajufvdgrcjautenej.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZGFqdWZ2ZGdyY2phdXRlbmVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTg4NDg5MDQsImV4cCI6MjAxNDQyNDkwNH0.3FgvyPuVNqWFtWT5e0cjnHcpOh-WrRQE_XNBySM0IPs')