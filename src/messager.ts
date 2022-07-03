import axios from "axios";

/**
 * Sends a notification to an admin user. Historically uses telegram bot.
 * @param text Text to send to notification hook
 */
export async function sendMessage(text: string) {
    const url = process.env.NOTIFICATION_HOOK + text;
    await axios.get(url);
}
