# 🌍 World Cup Daily Briefing to Telegram

Automated script that sends a daily World Cup briefing to Telegram at 6 AM CET, including:
- ⏰ Today's scheduled matches with kickoff times
- 📊 Yesterday's match results with goal scorers and minute details
- 🌍 Proper timezone conversion (CET/CEST)

## 📋 Prerequisites

- **Python 3.7+**
- **Telegram Bot** (create one with [@BotFather](https://t.me/botfather))
- **Telegram User ID** (get it with [@userinfobot](https://t.me/userinfobot))
- **Linux/macOS** (for cron or systemd)
- **Internet connection**

### Getting Telegram Credentials

1. **Get your Telegram Bot Token:**
   - Open Telegram and search for `@BotFather`
   - Send `/start` and follow `/newbot` instructions
   - Copy the token (format: `123456789:ABCdefGHIjklMNOpqrSTUvwxyz`)

2. **Get your Telegram User ID:**
   - Open Telegram and search for `@userinfobot`
   - Send any message and it will show your ID (a number like `1234567890`)

### Optional: Get API-Football.com Key

For more reliable data, get a free API key:
1. Visit [https://rapidapi.com/api-sports/api/api-football](https://rapidapi.com/api-sports/api/api-football)
2. Sign up for free tier
3. Copy your API key
4. Use it in the setup

## 🚀 Installation

### Option A: Using Cron (Simple)

```bash
# Make the setup script executable
chmod +x setup_cron.sh

# Run the setup
./setup_cron.sh
```

Then edit the environment file:
```bash
nano .env
# Fill in:
# Telegram_bot_token=YOUR_TOKEN
# telegram_user_id=YOUR_ID
# FOOTBALL_API_KEY=YOUR_KEY (optional)
```

Verify cron job:
```bash
crontab -l | grep world_cup
```

---

### Option B: Using Systemd Timer (Recommended)

```bash
# Make the setup script executable
chmod +x setup_systemd.sh

# Run the setup (requires sudo)
sudo ./setup_systemd.sh
```

Then edit the environment file:
```bash
sudo nano /etc/default/world_cup_briefing
# Fill in your credentials
```

Check timer status:
```bash
systemctl status world_cup_briefing.timer
```

## 🧪 Testing

Before relying on automation, test manually:

```bash
# For cron setup
source .env && python3 world_cup_briefing.py

# For systemd setup
source /etc/default/world_cup_briefing && python3 world_cup_briefing.py
```

You should receive a Telegram message immediately.

## 📝 Message Format

```
⚽ MUNDIAL DE FÚTBOL - 15/06/2026
🌍 Zona horaria: CEST
==================================================

📅 PARTIDOS HOY
🕐 15:00 CET
   Argentina vs France

🕐 18:00 CET
   Brazil vs Germany

📊 RESULTADOS DE AYER
✅ Spain 2 - 1 Portugal
   ⚽ Pedri (35') - Spain
   ⚽ Vinicius (67') - Brazil
   ⚽ Ronaldo (45') - Portugal

==================================================
_Actualización automática a las 6:00 AM CET_
```

## 🔧 Troubleshooting

### Test if Python can send to Telegram

```bash
python3 -c "
import os, requests
token = os.getenv('Telegram_bot_token')
user_id = os.getenv('telegram_user_id')
requests.post(f'https://api.telegram.org/bot{token}/sendMessage', 
  json={'chat_id': user_id, 'text': 'Test message'})
"
```

### Check Cron Logs

```bash
# View recent logs
tail -f /tmp/world_cup_briefing.log

# Check if cron ran
grep CRON /var/log/syslog  # Linux
log stream --predicate 'process == "cron"'  # macOS
```

### Check Systemd Logs

```bash
# View service logs
journalctl -u world_cup_briefing.service -n 50

# Follow logs in real-time
journalctl -u world_cup_briefing.service -f

# Check timer next run
systemctl list-timers world_cup_briefing.timer
```

### Common Issues

| Issue | Solution |
|-------|----------|
| "Missing environment variables" | Ensure `.env` or `/etc/default/world_cup_briefing` is properly configured |
| "No module named 'requests'" | Run `pip3 install requests` |
| Message not received | Check Telegram token & user ID are correct |
| Wrong timezone | Script auto-detects CET/CEST. Verify your system timezone: `timedatectl` |
| Cron not running | Add `-l` option: `crontab -l` to verify it exists |

## 📊 How It Works

1. **Runs at 6 AM CET** (automatically adjusted for daylight saving)
2. **Fetches data** from API-Football.com or ESPN (fallback)
3. **Converts times** to CET/CEST automatically
4. **Formats message** with markdown for Telegram
5. **Sends via Telegram Bot API** with retry logic (up to 2 attempts)
6. **Logs** all actions to file/journal for debugging

## 🔐 Security Notes

- Credentials stored in environment variables (not in code)
- For systemd: credentials in `/etc/default/` with restricted permissions (600)
- For cron: credentials in `.env` with restricted permissions (suggested)
- Set permissions:
  ```bash
  chmod 600 .env                              # For cron
  sudo chmod 600 /etc/default/world_cup_briefing  # For systemd
  ```

## 🛑 Removing Automation

### Remove Cron Job
```bash
crontab -e
# Delete the world_cup_briefing.py line and save
```

### Remove Systemd Timer
```bash
sudo systemctl disable --now world_cup_briefing.timer
sudo systemctl disable --now world_cup_briefing.service
sudo rm /etc/systemd/system/world_cup_briefing.*
sudo systemctl daemon-reload
```

## 📈 Advanced Customization

### Change Execution Time

**For Cron:**
Edit crontab and change the time field (5:30 runs at 5:30 UTC = 6:30 AM CET in winter):
```bash
# Current: 30 5 * * * (5:30 AM UTC)
# For 7 AM CET in winter: 6 6 * * *
# For 8 AM CET: 7 6 * * *
crontab -e
```

**For Systemd:**
Edit timer and change `OnCalendar`:
```bash
sudo nano /etc/systemd/system/world_cup_briefing.timer
# Change: OnCalendar=*-*-* 06:00:00 CET
# To: OnCalendar=*-*-* 08:00:00 CET
sudo systemctl daemon-reload
sudo systemctl restart world_cup_briefing.timer
```

### Use Different World Cup Year

Edit `world_cup_briefing.py` and modify league IDs or APIs if World Cup year changes.

### Send to Multiple Chats

Modify `send_to_telegram()` to loop through multiple `telegram_user_id` values.

## 📞 Support

If you encounter issues:
1. Check logs (cron or systemd)
2. Test manually with `python3 world_cup_briefing.py`
3. Verify credentials are correct
4. Check internet connection
5. Verify World Cup matches exist on the queried date

---

**Last Updated:** 2026-06-15  
**Version:** 1.0
