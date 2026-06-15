#!/bin/bash
# Setup script for systemd timer automation (6 AM CET daily)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_PATH="$SCRIPT_DIR/world_cup_briefing.py"
USERNAME=${SUDO_USER:-$(whoami)}

echo "⚠️  This script needs sudo privileges to setup systemd services"

# Check if script exists
if [ ! -f "$SCRIPT_PATH" ]; then
    echo "❌ Error: world_cup_briefing.py not found at $SCRIPT_PATH"
    exit 1
fi

# Make script executable
chmod +x "$SCRIPT_PATH"

# Install dependencies
echo "📦 Installing required Python packages..."
pip3 install requests -q

# Setup environment file in /etc
ENV_FILE="/etc/default/world_cup_briefing"
if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  Creating environment file at $ENV_FILE..."
    sudo tee "$ENV_FILE" > /dev/null << 'EOF'
# Telegram Configuration
Telegram_bot_token=YOUR_BOT_TOKEN_HERE
telegram_user_id=YOUR_USER_ID_HERE

# Optional: API-Football.com (RapidAPI)
FOOTBALL_API_KEY=YOUR_API_KEY_HERE
EOF
    sudo chmod 600 "$ENV_FILE"
    echo "🔒 Environment file secured (600 permissions)"
    echo "📝 Please edit $ENV_FILE with your credentials"
fi

# Create systemd service
SERVICE_FILE="/etc/systemd/system/world_cup_briefing.service"
echo "🔧 Creating systemd service at $SERVICE_FILE..."

sudo tee "$SERVICE_FILE" > /dev/null << EOF
[Unit]
Description=World Cup Daily Briefing to Telegram
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
User=$USERNAME
EnvironmentFile=$ENV_FILE
ExecStart=/usr/bin/python3 $SCRIPT_PATH
StandardOutput=journal
StandardError=journal
EOF

# Create systemd timer
TIMER_FILE="/etc/systemd/system/world_cup_briefing.timer"
echo "⏰ Creating systemd timer at $TIMER_FILE..."

sudo tee "$TIMER_FILE" > /dev/null << 'EOF'
[Unit]
Description=World Cup Daily Briefing Timer
Requires=world_cup_briefing.service

[Timer]
# Run at 6 AM CET (5 AM UTC in winter, 4 AM UTC in summer)
# Using CEST for consistency (Central European Summer Time)
OnCalendar=*-*-* 06:00:00 CET
Persistent=true

[Install]
WantedBy=timers.target
EOF

# Reload systemd daemon
echo "🔄 Reloading systemd daemon..."
sudo systemctl daemon-reload

# Enable and start timer
echo "✨ Enabling timer..."
sudo systemctl enable world_cup_briefing.timer

echo "▶️  Starting timer..."
sudo systemctl start world_cup_briefing.timer

echo ""
echo "✅ Systemd setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit $ENV_FILE with your Telegram credentials"
echo "2. Optional: Get API key from https://rapidapi.com/api-sports/api/api-football"
echo ""
echo "Useful commands:"
echo "   systemctl status world_cup_briefing.timer   # Check timer status"
echo "   systemctl list-timers                        # List all timers"
echo "   journalctl -u world_cup_briefing.service    # View service logs"
echo "   journalctl -u world_cup_briefing.service -f  # Follow logs in real-time"
echo "   sudo systemctl restart world_cup_briefing.timer  # Restart timer"
echo ""
echo "To test manually:"
echo "   source $ENV_FILE && python3 $SCRIPT_PATH"
echo ""
