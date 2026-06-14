#!/bin/bash
# Hook de inicio de sesión para Claude Code on the web.
# Instala las dependencias del proyecto para que las pruebas y el agente
# funcionen sin pasos manuales en cada sesión.
set -euo pipefail

# Solo en el entorno remoto (Claude Code on the web). En local no hace nada.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}"

# Dependencias (incluye `anthropic`, que es lo que necesita el sistema de agentes).
python3 -m pip install --quiet -r requirements.txt

# Permite ejecutar `python -m agente...` desde la raíz del repo en toda la sesión.
echo "export PYTHONPATH=\"${CLAUDE_PROJECT_DIR:-.}\"" >> "${CLAUDE_ENV_FILE:-/dev/null}"

echo "Hook de inicio: dependencias instaladas (anthropic listo)."
