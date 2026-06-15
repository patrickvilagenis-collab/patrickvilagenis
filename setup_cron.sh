#!/bin/bash
# Setup script for cron-based automation (6 AM CET daily)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_PATH="$SCRIPT_DIR/world_cup_briefing.py"

# Check if script exists
if [ ! -f "$SCRIPT_PATH" ]; then
    echo "❌ Error: world_cup_briefing.py not found at $SCRIPT_PATH"
    exit 1
fi

# Make script executable
chmod +x "$SCRIPT_PATH"

# Check Python availability
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: python3 not found"
    exit 1
fi

# Install dependencies
echo "📦 Installing required Python packages..."
pip3 install requests -q

# Setup environment file
ENV_FILE="$SCRIPT_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  Creating .env file template..."
    cat > "$ENV_FILE" << 'EOF'
# Telegram Configuration
Telegram_bot_token=YOUR_BOT_TOKEN_HERE
telegram_user_id=YOUR_USER_ID_HERE

# Optional: API-Football.com (RapidAPI)
# Get free tier at: https://rapidapi.com/api-sports/api/api-football
FOOTBALL_API_KEY=YOUR_API_KEY_HERE
EOF
    echo "📝 Please edit $ENV_FILE with your credentials"
fi

# Setup cron job (6 AM CET = 5 AM UTC in winter, 4 AM UTC in summer)
# Using 5:30 AM UTC for flexibility (works both seasons)
CRON_COMMAND="30 5 * * * source $ENV_FILE && /usr/bin/python3 $SCRIPT_PATH >> /tmp/world_cup_briefing.log 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "world_cup_briefing.py"; then
    echo "⚠️  Cron job already exists. Skipping..."
else
    echo "🔧 Adding cron job..."
    (crontab -l 2>/dev/null; echo "$CRON_COMMAND") | crontab -
    echo "✅ Cron job installed"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit $ENV_FILE with your Telegram credentials"
echo "2. Optional: Get API key from https://rapidapi.com/api-sports/api/api-football"
echo "3. Run 'crontab -l' to verify the cron job"
echo "4. Check logs at /tmp/world_cup_briefing.log"
echo ""
echo "To test manually:"
echo "   source $ENV_FILE && python3 $SCRIPT_PATH"
echo ""
