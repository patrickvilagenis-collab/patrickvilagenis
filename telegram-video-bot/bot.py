"""Bot de Telegram que descarga vídeos de YouTube y los envía por el chat.

Uso:
  1. Exporta TELEGRAM_BOT_TOKEN con el token de @BotFather.
  2. (Opcional) Exporta ALLOWED_USER_IDS="123456,789012" para restringir quién puede usarlo.
  3. python bot.py

Envíale un enlace de YouTube y te devuelve el vídeo. Con /audio <enlace>
te devuelve solo el audio en MP3 (requiere ffmpeg instalado).
"""

import asyncio
import logging
import os
import re
import tempfile
from pathlib import Path

import yt_dlp
from telegram import Update
from telegram.constants import ChatAction
from telegram.ext import (
    Application,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters,
)

logging.basicConfig(
    format="%(asctime)s %(levelname)s %(name)s: %(message)s", level=logging.INFO
)
logging.getLogger("httpx").setLevel(logging.WARNING)
log = logging.getLogger("video-bot")

# La API de bots de Telegram no permite enviar archivos de más de 50 MB.
MAX_BYTES = 49 * 1024 * 1024

# Calidades que se intentan en orden hasta que el archivo cabe en el límite.
QUALITY_LADDER = [720, 480, 360, 240]

YOUTUBE_URL_RE = re.compile(
    r"https?://(?:www\.|m\.)?(?:youtube\.com/(?:watch\?\S*?v=|shorts/|live/)|youtu\.be/)[\w\-?&=%.]+"
)


def _env(*names: str) -> str:
    """Devuelve la primera variable de entorno definida, sin importar mayúsculas."""
    lowered = {k.lower(): v for k, v in os.environ.items()}
    for name in names:
        if value := lowered.get(name.lower(), "").strip():
            return value
    return ""


def _allowed_ids() -> set[int]:
    raw = _env("ALLOWED_USER_IDS", "telegram_user_id")
    return {int(x) for x in raw.split(",") if x.strip()} if raw else set()


def _authorized(update: Update) -> bool:
    allowed = _allowed_ids()
    return not allowed or (update.effective_user and update.effective_user.id in allowed)


def _download_video(url: str, workdir: str) -> tuple[Path, dict]:
    """Descarga el vídeo probando calidades de mayor a menor hasta caber en 50 MB.

    Se ejecuta en un hilo aparte porque yt-dlp es bloqueante.
    """
    last_error: Exception | None = None
    for height in QUALITY_LADDER:
        outtmpl = str(Path(workdir) / f"%(id)s_{height}p.%(ext)s")
        opts = {
            "format": (
                f"bestvideo[height<={height}][ext=mp4]+bestaudio[ext=m4a]"
                f"/best[height<={height}][ext=mp4]/best[height<={height}]"
            ),
            "outtmpl": outtmpl,
            "merge_output_format": "mp4",
            "noplaylist": True,
            "quiet": True,
            "no_warnings": True,
        }
        try:
            with yt_dlp.YoutubeDL(opts) as ydl:
                info = ydl.extract_info(url, download=True)
                path = Path(ydl.prepare_filename(info))
                # Tras el merge la extensión final puede diferir de la prevista.
                if not path.exists():
                    path = path.with_suffix(".mp4")
            if path.stat().st_size <= MAX_BYTES:
                return path, info
            path.unlink(missing_ok=True)
            log.info("%s: %dp supera 50 MB, probando menor calidad", info.get("id"), height)
        except yt_dlp.utils.DownloadError as exc:
            last_error = exc
    if last_error:
        raise last_error
    raise RuntimeError(
        "El vídeo supera los 50 MB incluso en la calidad más baja. "
        "Telegram no permite que un bot envíe archivos mayores."
    )


def _download_audio(url: str, workdir: str) -> tuple[Path, dict]:
    opts = {
        "format": "bestaudio/best",
        "outtmpl": str(Path(workdir) / "%(id)s.%(ext)s"),
        "noplaylist": True,
        "quiet": True,
        "no_warnings": True,
        "postprocessors": [
            {"key": "FFmpegExtractAudio", "preferredcodec": "mp3", "preferredquality": "192"}
        ],
    }
    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=True)
        path = Path(ydl.prepare_filename(info)).with_suffix(".mp3")
    if path.stat().st_size > MAX_BYTES:
        path.unlink(missing_ok=True)
        raise RuntimeError("El audio supera los 50 MB que permite Telegram.")
    return path, info


async def cmd_start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not _authorized(update):
        return
    await update.message.reply_text(
        "¡Hola! Envíame un enlace de YouTube y te devuelvo el vídeo.\n\n"
        "Comandos:\n"
        "• /audio <enlace> — solo el audio en MP3\n"
        "• /help — esta ayuda\n\n"
        "Límite: 50 MB por archivo (lo impone Telegram); si el vídeo es "
        "largo lo recibirás en menor calidad."
    )


async def cmd_audio(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not _authorized(update):
        return
    urls = YOUTUBE_URL_RE.findall(update.message.text or "")
    if not urls:
        await update.message.reply_text("Uso: /audio <enlace de YouTube>")
        return
    await _process(update, urls[0], audio=True)


async def handle_link(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not _authorized(update):
        return
    urls = YOUTUBE_URL_RE.findall(update.message.text or "")
    if not urls:
        await update.message.reply_text(
            "No veo ningún enlace de YouTube en ese mensaje 🤔"
        )
        return
    for url in urls:
        await _process(update, url, audio=False)


async def _process(update: Update, url: str, audio: bool) -> None:
    chat = update.effective_chat
    status = await update.message.reply_text(
        f"⏬ Descargando {'audio' if audio else 'vídeo'}…"
    )
    try:
        with tempfile.TemporaryDirectory(prefix="ytbot_") as workdir:
            downloader = _download_audio if audio else _download_video
            path, info = await asyncio.to_thread(downloader, url, workdir)

            await status.edit_text("📤 Enviando…")
            title = info.get("title", "vídeo")
            with path.open("rb") as fh:
                if audio:
                    await chat.send_action(ChatAction.UPLOAD_DOCUMENT)
                    await chat.send_audio(
                        fh,
                        title=title,
                        performer=info.get("uploader"),
                        duration=info.get("duration"),
                        filename=path.name,
                        read_timeout=300,
                        write_timeout=300,
                    )
                else:
                    await chat.send_action(ChatAction.UPLOAD_VIDEO)
                    await chat.send_video(
                        fh,
                        caption=title,
                        duration=info.get("duration"),
                        width=info.get("width"),
                        height=info.get("height"),
                        supports_streaming=True,
                        filename=path.name,
                        read_timeout=300,
                        write_timeout=300,
                    )
        await status.delete()
    except Exception as exc:
        log.exception("Error procesando %s", url)
        await status.edit_text(f"❌ No pude procesar el enlace:\n{exc}")


def main() -> None:
    token = _env("TELEGRAM_BOT_TOKEN", "Telegram_bot_token")
    if not token:
        raise SystemExit(
            "Falta la variable de entorno TELEGRAM_BOT_TOKEN.\n"
            "Crea un bot con @BotFather y exporta el token:\n"
            "  export TELEGRAM_BOT_TOKEN='123456:ABC...'"
        )
    app = Application.builder().token(token).build()
    app.add_handler(CommandHandler(["start", "help"], cmd_start))
    app.add_handler(CommandHandler("audio", cmd_audio))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_link))
    log.info("Bot arrancado, esperando mensajes…")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
