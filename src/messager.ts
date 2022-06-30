import axios from "axios";

export async function sendMessage(text: string) {
    const url = process.env.NOTIFICATION_HOOK + text;
    await axios.get(url);
}
