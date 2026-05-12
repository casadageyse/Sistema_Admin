import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://rswphybvejatosjqwyyx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzd3BoeWJ2ZWphdG9zanF3eXl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1OTUyNjEsImV4cCI6MjA5NDE3MTI2MX0.6cL_lwvj9kOulxL3E87w6dVgFT-rMiyOebIE7wsaUUI'
)
