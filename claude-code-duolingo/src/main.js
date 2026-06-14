import './styles/main.css'
import { supabase } from './lib/supabase.js'

// Router mínimo basado en hash. Las vistas reales se desarrollan en src/views/.
const routes = {
  '#/login':   () => '<h1>Iniciar sesión / Crear cuenta</h1><p>Pantalla de auth (Supabase).</p>',
  '#/home':    () => '<h1>Mapa de niveles</h1><p>Árbol de lecciones cargado desde /content.</p>',
  '#/profile': () => '<h1>Perfil</h1><p>Progreso, logros e historial.</p>',
}

async function render() {
  const app = document.getElementById('app')
  const { data: { session } } = await supabase.auth.getSession()
  if (!session && location.hash !== '#/login') { location.hash = '#/login' }
  const view = routes[location.hash] || routes['#/home']
  app.innerHTML = view()
}

window.addEventListener('hashchange', render)
window.addEventListener('load', render)
