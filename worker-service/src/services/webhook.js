import axios from "axios";
import { logger } from "../utils/logger.js";

/**
 * Sends a notification to a generic Webhook URL
 * @param {Object} params
 * @param {string} params.url - Monitored URL
 * @param {string} params.status - New status (UP/DOWN)
 * @param {string} params.webhookUrl - Target Webhook URL
 */
export async function sendWebhookAlert({ url, status, webhookUrl }) {
    if (!webhookUrl) return;

    const payload = {
        event: "monitor_status_change",
        url: url,
        status: status,
        timestamp: new Date().toISOString(),
        message: status === "DOWN" ? `ALERT: ${url} is DOWN!` : `RECOVERED: ${url} is back UP.`
    };

    try {
        await axios.post(webhookUrl, payload, {
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Distributed-Monitor-Webhook"
            }
        });
        logger.info({ url, webhookUrl }, "Webhook alert sent successfully");
        return true;
    } catch (error) {
        logger.error(
            { url, error: error.message },
            "Failed to send Webhook alert"
        );
        return false;
    }
}
