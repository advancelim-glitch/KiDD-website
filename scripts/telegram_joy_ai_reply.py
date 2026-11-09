#!/usr/bin/env python3
"""On-demand KiDD Joy group AI response. No persistent service or chat history."""
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

telegram_token = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
openai_key = os.environ.get("OPENAI_API_KEY", "").strip()
owner = os.environ.get("TELEGRAM_CHAT_ID", "").strip()
if not re.fullmatch(r"[0-9]+:[A-Za-z0-9_-]+", telegram_token):
    sys.exit("Missing or malformed TELEGRAM_BOT_TOKEN.")
if not openai_key.startswith("sk-"):
    sys.exit("Missing or malformed OPENAI_API_KEY (must be actual API key).")
if not owner.isdecimal():
    sys.exit("Missing TELEGRAM_CHAT_ID owner ID.")

def fetch_json(url, body=None, headers=None):
    data = json.dumps(body, ensure_ascii=False).encode("utf-8") if body is not None else None
    request = urllib.request.Request(url, data=data, headers=headers or {}, method="POST" if body is not None else "GET")
    try:
        with urllib.request.urlopen(request, timeout=45) as resp:
            result = json.load(resp)
    except urllib.error.HTTPError as err:
        # Do not include URLs or response bodies: URLs contain Telegram bot tokens.
        service = "OpenAI" if "api.openai.com" in url else "Telegram"
        operation = url.rsplit("/", 1)[-1] if service == "Telegram" else "responses"
        sys.exit(f"{service} HTTP {err.code} during {operation}. Check request format and access.")
    except Exception as err:
        sys.exit(f"API connection failed ({type(err).__name__}).")
    return result

def tg(method, params=None):
    url = "https://api.telegram.org/bot" + telegram_token + "/" + method
    result = fetch_json(url, params, {"Content-Type": "application/json; charset=utf-8"} if params is not None else None)
    if not result.get("ok"):
        sys.exit(f"Telegram API rejected {method}.")
    return result["result"]

me = tg("getMe")
if me.get("username", "").lower() != "kidd_joy_bot":
    sys.exit("Telegram secret belongs to an unexpected bot.")
if tg("getWebhookInfo").get("url"):
    sys.exit("Telegram webhook already configured; refuse competing getUpdates polling.")

updates = tg("getUpdates", {"timeout": 0, "limit": 100, "allowed_updates": ["message"]})
# Acknowledge only at the end. Pick one fresh, owner-originated, group command.
matches = []
for update in updates:
    message = update.get("message", {})
    chat, sender = message.get("chat", {}), message.get("from", {})
    text = (message.get("text") or "").strip()
    if chat.get("type") not in ("group", "supergroup") or str(sender.get("id")) != owner:
        continue
    if int(message.get("date", 0)) < int(time.time()) - 900:
        continue
    found = re.match(r"^/joy(?:@KiDD_Joy_Bot)?(?:\s+)(.+)$", text, re.I | re.S)
    if found:
        matches.append((message, found.group(1)[:1200]))

if not matches:
    sys.exit("No fresh authorized /joy message found. Send a new /joy question in the group and run workflow once; no API charge.")

message, prompt = matches[-1]
response = fetch_json(
    "https://api.openai.com/v1/responses",
    {
        "model": "gpt-4.1-mini",
        "instructions": (
            "너는 KiDD 공동연구실의 GPT 기반 AI 연구원 조이 시험 인스턴스다. "
            "연구 윤리, 근거와 불확실성 구분, 경청과 숙의의 원칙을 지켜라. "
            "기존 ChatGPT 대화의 기억이나 권한에 접근할 수 있다고 주장하지 마라. "
            "한국어로 간결히 답하고 800자 이내로 작성해라."
        ),
        "input": prompt,
        "max_output_tokens": 350,
        "store": False,
    },
    {"Authorization": "Bearer " + openai_key, "Content-Type": "application/json"},
)
chunks = []
for item in response.get("output", []):
    for part in item.get("content", []):
        if part.get("type") == "output_text":
            chunks.append(part.get("text", ""))
answer = "\n".join(chunks).strip()
if not answer:
    sys.exit("OpenAI returned no output_text. No Telegram message sent.")
tg("sendMessage", {
    "chat_id": message["chat"]["id"],
    "reply_to_message_id": message["message_id"],
    "text": "🌱 KiDD Joy (API 시험)\n" + answer[:1600],
})
# Acknowledge consumed updates only if response succeeded.
if updates:
    tg("getUpdates", {"offset": max(x["update_id"] for x in updates) + 1, "timeout": 0, "limit": 1})
print("SUCCESS: one owner-authorized, group AI reply sent. Message content not logged.")
