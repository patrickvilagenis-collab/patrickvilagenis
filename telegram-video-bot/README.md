# Telegram Video Bot

Bot de Telegram al que le envías enlaces de **YouTube** y te devuelve el
**vídeo descargado** directamente en el chat. También puede enviarte solo
el **audio en MP3**.

> ⚠️ Úsalo solo con contenido propio o cuya descarga tengas permitida.

## Funcionamiento

- Le mandas un mensaje con uno o varios enlaces de YouTube (`youtube.com`,
  `youtu.be`, Shorts…) y te responde con el vídeo.
- `/audio <enlace>` → te devuelve solo el audio en MP3.
- **Límite de 50 MB por archivo** (lo impone la API de bots de Telegram).
  El bot intenta primero 720p y va bajando la calidad (480p → 360p → 240p)
  hasta que el archivo cabe. Si ni en 240p cabe, te avisa.

## Instalación

Requisitos: Python 3.10+ y **ffmpeg** (para unir vídeo+audio y para los MP3).

```bash
# Linux (Debian/Ubuntu)
sudo apt install ffmpeg
# Windows: descarga ffmpeg de https://ffmpeg.org y añádelo al PATH

cd telegram-video-bot
pip install -r requirements.txt
```

## Crear el bot en Telegram

1. Abre Telegram y habla con [@BotFather](https://t.me/BotFather).
2. Envía `/newbot`, elige nombre y usuario (debe acabar en `bot`).
3. Copia el **token** que te da (algo como `123456:ABC-DEF...`).

## Ejecutar

```bash
export TELEGRAM_BOT_TOKEN="123456:ABC-DEF..."

# Opcional: restringe el bot a tus usuarios (tu ID lo da @userinfobot)
export ALLOWED_USER_IDS="123456789"

python bot.py
```

En Windows (PowerShell):

```powershell
$env:TELEGRAM_BOT_TOKEN = "123456:ABC-DEF..."
python bot.py
```

El bot funciona por *polling*: no necesita servidor ni dominio, basta con
dejarlo corriendo en cualquier máquina con internet (tu PC, una Raspberry
Pi, un VPS…).

## Mantenerlo corriendo 24/7 (opcional)

En un servidor Linux con `systemd`:

```ini
# /etc/systemd/system/ytbot.service
[Unit]
Description=Telegram Video Bot
After=network-online.target

[Service]
Environment=TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
Environment=ALLOWED_USER_IDS=123456789
WorkingDirectory=/ruta/a/telegram-video-bot
ExecStart=/usr/bin/python3 bot.py
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now ytbot
```

## Problemas frecuentes

- **"El vídeo supera los 50 MB…"** → es el límite de Telegram para bots;
  usa `/audio` o un vídeo más corto.
- **Errores de yt-dlp** → YouTube cambia a menudo; actualiza con
  `pip install -U yt-dlp`.
- **No responde a nadie** → revisa que tu ID esté en `ALLOWED_USER_IDS`
  (o deja la variable vacía para permitir a todo el mundo).
