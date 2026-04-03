import axios from "axios";
import { logger } from "../utils/logger.js";

/**
 * Sends a notification to Telegram bot
 * @param {Object} params
 * @param {string} params.url - Monitored URL
 * @param {string} params.status - New status (UP/DOWN)
 * @param {string} params.token - Telegram Bot Token
 * @param {string} params.chatId - Telegram Chat ID
 */
export async function sendTelegramAlert({ url, status, token, chatId }) {
    if (!token || !chatId) return;

    const message = 
        status === "DOWN"
            ? `🚨 *MONITOR ALERT*\n\nYour site *${url}* is *DOWN*!\n\n🕒 Time: ${new Date().toISOString()}`
            : `✅ *MONITOR RECOVERED*\n\nYour site *${url}* is *BACK UP*.\n\n🕒 Time: ${new Date().toISOString()}`;

    try {
        const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;
        await axios.post(telegramUrl, {
            chat_id: chatId,
            text: message,
            parse_mode: "Markdown"
        });
        logger.info({ url, chatId }, "Telegram alert sent successfully");
        return true;
    } catch (error) {
        logger.error(
            { url, error: error.response?.data?.description || error.message },
            "Failed to send Telegram alert"
        );
        return false;
    }
}
