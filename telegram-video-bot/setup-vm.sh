#!/usr/bin/env bash
# Instala el bot como servicio systemd en una VM Ubuntu/Debian
# (Oracle Cloud Free, cualquier VPS o una Raspberry Pi).
#
# Uso: copia la carpeta telegram-video-bot a la máquina y ejecuta:
#   bash setup-vm.sh
set -euo pipefail

if [[ $EUID -eq 0 ]]; then SUDO=""; else SUDO="sudo"; fi
APP_DIR="$(cd "$(dirname "$0")" && pwd)"

read -rp "Token del bot (de @BotFather): " TOKEN
read -rp "Tu user id de Telegram (vacío = permitir a cualquiera): " USER_ID

echo "==> Instalando ffmpeg y Python…"
$SUDO apt-get update -qq
$SUDO apt-get install -y -qq ffmpeg python3-venv

echo "==> Creando entorno virtual e instalando dependencias…"
python3 -m venv "$APP_DIR/.venv"
"$APP_DIR/.venv/bin/pip" install -q --upgrade pip
"$APP_DIR/.venv/bin/pip" install -q -r "$APP_DIR/requirements.txt"

echo "==> Guardando credenciales en /etc/ytbot.env (solo legible por root)…"
$SUDO install -m 600 /dev/null /etc/ytbot.env
$SUDO tee /etc/ytbot.env >/dev/null <<EOF
TELEGRAM_BOT_TOKEN=$TOKEN
ALLOWED_USER_IDS=$USER_ID
EOF

echo "==> Creando servicio systemd…"
$SUDO tee /etc/systemd/system/ytbot.service >/dev/null <<EOF
[Unit]
Description=Telegram Video Bot
After=network-online.target
Wants=network-online.target

[Service]
User=$USER
EnvironmentFile=/etc/ytbot.env
WorkingDirectory=$APP_DIR
ExecStart=$APP_DIR/.venv/bin/python $APP_DIR/bot.py
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

$SUDO systemctl daemon-reload
$SUDO systemctl enable --now ytbot

echo
echo "✅ Bot instalado y arrancado."
echo "   Estado:        systemctl status ytbot"
echo "   Logs en vivo:  journalctl -u ytbot -f"
echo "   Actualizar yt-dlp si YouTube falla:"
echo "     $APP_DIR/.venv/bin/pip install -U yt-dlp && sudo systemctl restart ytbot"
