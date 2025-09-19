// Configuração do Supabase
// SUBSTITUA ESTES VALORES PELOS SEUS DADOS DO SUPABASE
const SUPABASE_URL = 'https://imbaetudzstpcyyvybry.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltYmFldHVkenN0cGN5eXZ5YnJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyODkyODcsImV4cCI6MjA3Mzg2NTI4N30.azvDGOxyV-nxkxuHtUWqc5ExpL6iTTStHgEGUN00h1s'

// Inicializar cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Exportar para uso em outros arquivos
window.supabaseClient = supabase