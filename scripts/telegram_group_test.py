#!/usr/bin/env python3
"""One-shot, explicitly triggered Telegram group connectivity check.

Does not connect to an AI model. Never prints tokens, user content or group IDs.
Reads only pending Bot API updates and responds to an owner-issued explicit command.
"""
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

role = os.getenv("BOT_ROLE", "").strip().lower()
token = os.getenv("BOT_TOKEN", "").strip()
owner = os.getenv("TELEGRAM_CHAT_ID", "").strip()
username = {"joy": "KiDD_Joy_Bot", "rose": "KiDD_Rose_Bot"}.get(role)
if not username:
    sys.exit("BOT_ROLE must be joy or rose.")
if not re.fullmatch(r"[0-9]+:[A-Za-z0-9_-]+", token):
    sys.exit("Missing or malformed bot token secret.")
if not owner.isdecimal():
    sys.exit("Missing or malformed TELEGRAM_CHAT_ID secret.")

def api(method, data=None):
    endpoint = "https://api.telegram.org/bot" + token + "/" + method
    request = urllib.request.Request(
        endpoint,
        data=urllib.parse.urlencode(data).encode() if data is not None else None,
        method="POST" if data is not None else "GET",
    )
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            result = json.load(response)
    except urllib.error.HTTPError as error:
        sys.exit(f"Telegram API HTTP {error.code} for {method}. Check webhook/token.")
    except Exception as error:
        sys.exit(f"Telegram API request failed ({type(error).__name__}) for {method}.")
    if not result.get("ok"):
        sys.exit(f"Telegram API rejected {method}.")
    return result["result"]

identity = api("getMe")
if identity.get("username", "").lower() != username.lower():
    sys.exit("Wrong bot token: username mismatch.")

# A pre-existing webhook and getUpdates cannot be used simultaneously.
webhook = api("getWebhookInfo")
if webhook.get("url"):
    sys.exit("A webhook is configured; getUpdates cannot run without changing that integration.")

updates = api("getUpdates", {"timeout": 0, "limit": 100, "allowed_updates": json.dumps(["message"])})
count = 0
latest = None
for update in updates:
    latest = max(latest or 0, update["update_id"])
    message = update.get("message") or {}
    chat = message.get("chat") or {}
    sender = message.get("from") or {}
    if chat.get("type") not in ("group", "supergroup"):
        continue
    if str(sender.get("id")) != owner:
        continue
    text = (message.get("text") or "").strip()
    # Restrict to a command explicitly directed to this bot, no chat monitoring.
    if text.lower().split(" ")[0] != ("/kidd_ping@" + username).lower():
        continue
    response = (
        "🌱 KiDD Joy: 공동연구실 메시지 수신·발신 시험 성공! "
        "아직 ChatGPT 자동대화가 연결된 상태는 아니야."
        if role == "joy" else
        "🌹 KiDD Rose: 공동연구실 메시지 수신·발신 시험 성공! "
        "아직 Claude 자동대화가 연결된 상태는 아니야."
    )
    api("sendMessage", {"chat_id": str(chat["id"]), "text": response, "reply_to_message_id": message["message_id"]})
    count += 1

if latest is not None:
    # Acknowledge checked updates after processing, to avoid replying twice.
    api("getUpdates", {"offset": latest + 1, "timeout": 0, "limit": 1})
print(f"Bot {role}: completed group connectivity check; matching commands replied to: {count}.")
