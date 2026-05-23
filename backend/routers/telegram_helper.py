import os
import httpx
from typing import Optional

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")
TELEGRAM_API_BASE = "https://api.telegram.org"

class TelegramNotificationError(Exception):
    """Raised when Telegram notification fails."""
    pass

async def send_telegram_message(
    text: str,
    parse_mode: str = "HTML",
    disable_notification: bool = False,
) -> dict:
    """
    Send a message to the configured Telegram chat.
    
    Args:
        text: Message text (supports HTML if parse_mode='HTML')
        parse_mode: 'HTML' or 'Markdown'
        disable_notification: if True, sends without sound/vibration
        
    Returns:
        Response dict from Telegram API
        
    Raises:
        TelegramNotificationError: if bot token or chat ID missing, or request fails
    """
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        raise TelegramNotificationError("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured")

    url = f"{TELEGRAM_API_BASE}/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": text,
        "parse_mode": parse_mode,
        "disable_notification": disable_notification,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json=payload)
        response.raise_for_status()
        return response.json()
    except httpx.RequestError as exc:
        raise TelegramNotificationError(f"Telegram API request failed: {str(exc)}")
    except Exception as exc:
        raise TelegramNotificationError(f"Unexpected error sending Telegram message: {str(exc)}")

async def notify_campaign_created(campaign_name: str, channel: str, start_date: str) -> Optional[dict]:
    """Notify when a new campaign is created."""
    try:
        text = (
            f"<b>📢 New Campaign Created</b>\n"
            f"<b>Name:</b> {campaign_name}\n"
            f"<b>Channel:</b> {channel}\n"
            f"<b>Start Date:</b> {start_date}"
        )
        return await send_telegram_message(text)
    except TelegramNotificationError as exc:
        print(f"Failed to notify campaign creation: {str(exc)}")
        return None

async def notify_campaign_status_change(campaign_name: str, old_status: str, new_status: str) -> Optional[dict]:
    """Notify when a campaign status changes."""
    try:
        text = (
            f"<b>🔄 Campaign Status Changed</b>\n"
            f"<b>Campaign:</b> {campaign_name}\n"
            f"<b>Previous:</b> {old_status}\n"
            f"<b>New:</b> {new_status}"
        )
        return await send_telegram_message(text)
    except TelegramNotificationError as exc:
        print(f"Failed to notify campaign status change: {str(exc)}")
        return None

async def notify_content_published(title: str, platform: str, campaign: Optional[str] = None) -> Optional[dict]:
    """Notify when content is published."""
    try:
        campaign_info = f"\n<b>Campaign:</b> {campaign}" if campaign else ""
        text = (
            f"<b>📝 Content Published</b>\n"
            f"<b>Title:</b> {title}\n"
            f"<b>Platform:</b> {platform}"
            f"{campaign_info}"
        )
        return await send_telegram_message(text)
    except TelegramNotificationError as exc:
        print(f"Failed to notify content publication: {str(exc)}")
        return None

async def notify_referral_milestone(clicks: int, conversions: int, conversion_rate: float) -> Optional[dict]:
    """Notify when referral metrics reach milestones."""
    try:
        text = (
            f"<b>🎯 Referral Milestone</b>\n"
            f"<b>Clicks:</b> {clicks}\n"
            f"<b>Conversions:</b> {conversions}\n"
            f"<b>Conversion Rate:</b> {conversion_rate:.1f}%"
        )
        return await send_telegram_message(text)
    except TelegramNotificationError as exc:
        print(f"Failed to notify referral milestone: {str(exc)}")
        return None

async def notify_ai_execution(prompt_summary: str, provider: str, status: str = "success") -> Optional[dict]:
    """Notify when AI execution completes."""
    try:
        emoji = "✅" if status == "success" else "❌"
        text = (
            f"<b>{emoji} AI Execution {status.capitalize()}</b>\n"
            f"<b>Provider:</b> {provider}\n"
            f"<b>Prompt:</b> {prompt_summary[:100]}..."
        )
        return await send_telegram_message(text)
    except TelegramNotificationError as exc:
        print(f"Failed to notify AI execution: {str(exc)}")
        return None
