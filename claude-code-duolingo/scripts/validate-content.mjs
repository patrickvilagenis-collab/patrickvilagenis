// Valida que todos los content/**.json tengan los campos requeridos.
// Se ejecuta en CI antes de fusionar un PR de contenido.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = 'content'
const REQUIRED = ['id', 'level', 'unit', 'title', 'concept', 'challenge']
const CHALLENGE_TYPES = ['single-choice', 'multi-choice', 'order', 'fill-blank', 'free-text']

let errors = 0

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) { walk(p); continue }
    if (!p.endsWith('.json')) continue
    if (p.endsWith('manifest.json')) continue
    let data
    try { data = JSON.parse(readFileSync(p, 'utf8')) }
    catch (e) { console.error(`✗ JSON inválido: ${p}\n  ${e.message}`); errors++; continue }
    for (const field of REQUIRED) {
      if (!(field in data)) { console.error(`✗ ${p}: falta '${field}'`); errors++ }
    }
    const t = data.challenge?.type
    if (t && !CHALLENGE_TYPES.includes(t)) {
      console.error(`✗ ${p}: challenge.type '${t}' no válido`); errors++
    }
  }
}

walk(ROOT)
if (errors) { console.error(`\n${errors} error(es) de contenido.`); process.exit(1) }
console.log('✓ Contenido válido.')
