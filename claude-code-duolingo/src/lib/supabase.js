import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anon) {
  console.warn('Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY en .env')
}

export const supabase = createClient(url, anon)

// --- Perfil y progreso (cada usuario su propia fila; protegido por RLS) ---

export async function getProfile() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  return data
}

export async function getProgress() {
  const { data } = await supabase.from('lesson_progress').select('*')
  return data ?? []
}

export async function completeLesson(lessonId, score, xp) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('lesson_progress').upsert({
    user_id: user.id,
    lesson_id: lessonId,
    status: 'completed',
    score,
    completed_at: new Date().toISOString(),
  })
  await supabase.rpc('add_xp', { amount: xp }) // función SQL que suma XP y registra actividad
}
