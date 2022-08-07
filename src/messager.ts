import axios from "axios";
import { globalConfig } from "./index";

/**
 * Sends a notification to an admin user. Historically uses telegram bot.
 * @param text Text to send to notification hook
 */
export async function sendMessage(text: string) {
    if (globalConfig.notificationHook) {
        const url = globalConfig.notificationHook + text;
        await axios.get(url);
    }
}
