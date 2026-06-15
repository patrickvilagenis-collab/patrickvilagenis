#!/usr/bin/env python3
"""
World Cup Daily Briefing to Telegram
Fetches today's matches and yesterday's results, sends to Telegram daily at 6 AM CET
"""

import os
import sys
import json
import requests
from datetime import datetime, timedelta, timezone
import re
from typing import Optional, Tuple, List, Dict

# Configuration
TELEGRAM_BOT_TOKEN = os.getenv("Telegram_bot_token")
TELEGRAM_USER_ID = os.getenv("telegram_user_id")
FOOTBALL_API_KEY = os.getenv("FOOTBALL_API_KEY", "")  # Optional: https://www.api-football.com/

CET = timezone(timedelta(hours=1))
CEST = timezone(timedelta(hours=2))  # Summer time

class WorldCupBriefing:
    """Handles fetching World Cup data and sending Telegram messages"""

    def __init__(self):
        if not TELEGRAM_BOT_TOKEN or not TELEGRAM_USER_ID:
            raise ValueError("Missing required environment variables: Telegram_bot_token, telegram_user_id")

        self.bot_token = TELEGRAM_BOT_TOKEN
        self.user_id = TELEGRAM_USER_ID
        self.today = self._get_today_cet()
        self.yesterday = self.today - timedelta(days=1)

    def _get_today_cet(self) -> datetime:
        """Get today's date in CET/CEST"""
        now = datetime.now(CET)
        # Adjust for CEST (Central European Summer Time) if applicable
        if self._is_dst():
            now = datetime.now(CEST)
        return now.date()

    @staticmethod
    def _is_dst() -> bool:
        """Check if current date is in daylight saving time (CEST)"""
        today = datetime.now()
        # CEST: Last Sunday of March to Last Sunday of October
        march_last_sunday = datetime(today.year, 3, 31) - timedelta(days=(datetime(today.year, 3, 31).weekday() - 6) % 7)
        october_last_sunday = datetime(today.year, 10, 31) - timedelta(days=(datetime(today.year, 10, 31).weekday() - 6) % 7)
        return march_last_sunday <= today < october_last_sunday

    def fetch_todays_matches(self) -> List[Dict]:
        """Fetch matches scheduled for today"""
        matches = []

        try:
            # Try API-Football.com first
            if FOOTBALL_API_KEY:
                matches = self._fetch_from_api_football(self.today)
        except Exception as e:
            print(f"API-Football failed: {e}. Falling back to web scraping...")
            matches = self._fetch_from_espn(self.today)

        return matches

    def fetch_yesterdays_results(self) -> List[Dict]:
        """Fetch completed matches from yesterday"""
        results = []

        try:
            if FOOTBALL_API_KEY:
                results = self._fetch_from_api_football(self.yesterday, status="finished")
        except Exception as e:
            print(f"API-Football failed: {e}. Falling back to web scraping...")
            results = self._fetch_from_espn(self.yesterday, finished=True)

        return results

    def _fetch_from_api_football(self, date: datetime.date, status: str = "scheduled") -> List[Dict]:
        """Fetch matches from api-football.com"""
        headers = {"x-apisports-key": FOOTBALL_API_KEY}

        # Get current/last World Cup
        league_id = 1  # World Cup league ID

        params = {
            "league": league_id,
            "date": date.strftime("%Y-%m-%d"),
            "status": status
        }

        response = requests.get(
            "https://api-football-v1.p.rapidapi.com/v3/fixtures",
            headers=headers,
            params=params,
            timeout=10
        )
        response.raise_for_status()

        data = response.json()
        matches = []

        if data.get("response"):
            for fixture in data["response"]:
                match = {
                    "home_team": fixture["teams"]["home"]["name"],
                    "away_team": fixture["teams"]["away"]["name"],
                    "home_score": fixture["goals"]["home"],
                    "away_score": fixture["goals"]["away"],
                    "datetime": fixture["fixture"]["date"],
                    "status": fixture["fixture"]["status"]["short"],
                    "events": fixture.get("events", []) if status == "finished" else []
                }
                matches.append(match)

        return matches

    def _fetch_from_espn(self, date: datetime.date, finished: bool = False) -> List[Dict]:
        """Fallback: Fetch matches from ESPN web scraping"""
        date_str = date.strftime("%Y%m%d")
        url = f"https://www.espn.com/soccer/schedule?date={date_str}"

        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()

            # Simple regex-based parsing
            matches = []

            # This is a simplified approach - in production, use BeautifulSoup
            pattern = r'(\w+\s\w+)\s+vs\s+(\w+\s\w+)\s+(\d{1,2}:\d{2})\s*((?:\d+)-(?:\d+))?'

            for match_text in re.finditer(pattern, response.text):
                home = match_text.group(1)
                away = match_text.group(2)
                time = match_text.group(3)
                score = match_text.group(4)

                if finished and score:
                    home_score, away_score = score.split('-')
                    matches.append({
                        "home_team": home,
                        "away_team": away,
                        "home_score": int(home_score),
                        "away_score": int(away_score),
                    })
                elif not finished and not score:
                    matches.append({
                        "home_team": home,
                        "away_team": away,
                        "time": time,
                    })

            return matches
        except Exception as e:
            print(f"ESPN scraping failed: {e}")
            return []

    def format_briefing(self) -> str:
        """Format the complete briefing message"""
        today_matches = self.fetch_todays_matches()
        yesterday_results = self.fetch_yesterdays_results()

        # Determine timezone label
        tz_label = "CEST" if self._is_dst() else "CET"

        message = f"⚽ *MUNDIAL DE FÚTBOL - {self.today.strftime('%d/%m/%Y')}*\n"
        message += f"🌍 Zona horaria: *{tz_label}*\n"
        message += "=" * 50 + "\n\n"

        # Section 1: Today's matches
        message += "📅 *PARTIDOS HOY*\n"
        if today_matches:
            for match in today_matches:
                home = match.get("home_team", "TBD")
                away = match.get("away_team", "TBD")
                time_str = self._convert_to_cet(match.get("datetime", "TBD"))
                message += f"🕐 {time_str}\n"
                message += f"   {home} vs {away}\n"
            message += "\n"
        else:
            message += "❌ No hay partidos programados hoy\n\n"

        # Section 2: Yesterday's results
        message += "📊 *RESULTADOS DE AYER*\n"
        if yesterday_results:
            for result in yesterday_results:
                home = result.get("home_team", "TBD")
                away = result.get("away_team", "TBD")
                home_score = result.get("home_score", "-")
                away_score = result.get("away_score", "-")

                message += f"✅ {home} {home_score} - {away_score} {away}\n"

                # Add goal scorers if available
                events = result.get("events", [])
                if events:
                    goals = [e for e in events if e.get("type") == "goal"]
                    if goals:
                        for goal in goals:
                            player = goal.get("player", {}).get("name", "Unknown")
                            minute = goal.get("time", {}).get("elapsed", "-")
                            team = goal.get("team", {}).get("name", "")
                            message += f"   ⚽ {player} ({minute}') - {team}\n"
            message += "\n"
        else:
            message += "❌ No hay resultados disponibles\n\n"

        message += "=" * 50 + "\n"
        message += "_Actualización automática a las 6:00 AM CET_"

        return message

    @staticmethod
    def _convert_to_cet(datetime_str: str) -> str:
        """Convert datetime string to CET/CEST format"""
        if not datetime_str or datetime_str == "TBD":
            return "Hora TBD"

        try:
            # Try ISO format
            dt = datetime.fromisoformat(datetime_str.replace("Z", "+00:00"))

            # Convert to CET/CEST
            if WorldCupBriefing._is_dst():
                cet_dt = dt.astimezone(CEST)
            else:
                cet_dt = dt.astimezone(CET)

            return cet_dt.strftime("%H:%M CET")
        except Exception as e:
            print(f"Error parsing datetime: {e}")
            return datetime_str

    def send_to_telegram(self, message: str, retry_count: int = 1) -> bool:
        """Send message to Telegram with retry logic"""
        url = f"https://api.telegram.org/bot{self.bot_token}/sendMessage"

        payload = {
            "chat_id": self.user_id,
            "text": message,
            "parse_mode": "Markdown",
            "disable_web_page_preview": True
        }

        for attempt in range(retry_count):
            try:
                response = requests.post(url, json=payload, timeout=10)
                data = response.json()

                if data.get("ok"):
                    print("✅ Message sent to Telegram successfully")
                    return True
                else:
                    error = data.get("description", "Unknown error")
                    print(f"❌ Telegram API error: {error}")
                    if attempt < retry_count - 1:
                        print(f"   Retrying... ({attempt + 1}/{retry_count})")
                        continue
                    return False

            except requests.RequestException as e:
                print(f"❌ Request failed: {e}")
                if attempt < retry_count - 1:
                    print(f"   Retrying... ({attempt + 1}/{retry_count})")
                    continue
                return False

        return False

    def run(self) -> bool:
        """Execute the briefing process"""
        try:
            print(f"🔄 Generating World Cup briefing for {self.today}...")
            briefing = self.format_briefing()
            print("\n📝 Message preview:")
            print(briefing)
            print("\n📤 Sending to Telegram...")

            success = self.send_to_telegram(briefing, retry_count=2)
            return success
        except Exception as e:
            print(f"❌ Error: {e}")
            return False


def main():
    """Main entry point"""
    try:
        briefing = WorldCupBriefing()
        success = briefing.run()
        sys.exit(0 if success else 1)
    except ValueError as e:
        print(f"❌ Configuration error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
