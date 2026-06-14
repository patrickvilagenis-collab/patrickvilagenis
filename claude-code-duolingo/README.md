# Claude Code Duolingo

Plataforma e-learning estilo **Duolingo** para aprender **Claude** y **Claude Code** desde
cero hasta ecosistemas avanzados (MCP, skills, tools, subagentes). Mobile-first, gamificada
y con perfiles en la nube.

## Arquitectura (resumen)

- **Frontend:** PWA responsive (HTML + CSS + JS) con [Vite](https://vitejs.dev).
- **Backend / Auth / Datos:** [Supabase](https://supabase.com) (Postgres + Auth + RLS).
- **Contenido como datos:** lecciones en `content/**.json`, editables por Pull Request.
- **Despliegue:** GitHub Pages vía GitHub Actions.

> Especificación completa en [`docs/ESPECIFICACION_CLAUDE_CODE_DUOLINGO.md`](docs/ESPECIFICACION_CLAUDE_CODE_DUOLINGO.md).

## Puesta en marcha (local, gratis)

```bash
npm install
cp .env.example .env   # rellena SUPABASE_URL y SUPABASE_ANON_KEY
npm run dev            # servidor local de desarrollo
```

### Backend (Supabase)

1. Crea un proyecto en https://supabase.com
2. Ejecuta `supabase/schema.sql` (tablas + RLS) en el SQL editor.
3. Ejecuta `supabase/seed.sql` (crea el usuario `admin`).
4. Activa Auth con email/contraseña.

## Estructura

```
src/        # frontend (Vite + PWA)
content/    # lecciones como JSON (contenido como datos)
supabase/   # schema.sql, seed.sql, edge functions
scripts/    # validador de contenido
docs/       # especificación
.github/    # CI/CD
```

## Niveles

1. **Básico** — qué es Claude, prompts, casos de uso.
2. **Intermedio** — Claude Code en acción (instalar, bucle agéntico, CLAUDE.md, slash commands).
3. **Avanzado** — MCP, skills, tools, subagentes, hooks, ecosistemas completos.

## Licencia

MIT
