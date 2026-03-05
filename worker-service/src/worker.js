import "dotenv/config";
import { Worker } from "bullmq";
import axios from "axios";
import { redis } from "./config/redis.js";
import { checkUrl } from "./services/checker.js";
import { logger } from "./utils/logger.js";
import { sendAlertEmail } from "./services/email.js";

// Verify email config is loaded
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.ALERT_EMAIL) {
    logger.warn("Email environment variables (EMAIL_USER, EMAIL_PASS, ALERT_EMAIL) are not set — email alerts will fail!");
}

const worker = new Worker(
    "monitorQueue",
    async job => {
        const { id, url } = job.data;

        const result = await checkUrl(url);

        const { data: monitor } = await axios.get(
            `http://localhost:4000/monitors/${id}`
        );

        const previousStatus = monitor.status;
        const newStatus = result.status;

        if (previousStatus !== newStatus) {
            logger.info(
                { id, from: previousStatus, to: newStatus },
                "Status changed — sending email"
            );

            try {
                await sendAlertEmail({
                    url,
                    status: newStatus
                });
                logger.info({ id, url, status: newStatus }, "Alert email sent successfully");
            } catch (emailError) {
                logger.error(
                    { id, url, error: emailError.message },
                    "Failed to send alert email"
                );
            }
        }

        await axios.patch(
            `http://localhost:4000/monitors/${id}`,
            {
                status: newStatus,
                lastCheckedAt: new Date()
            }
        );

        logger.info({ id, status: newStatus }, "Job processed");

        return result;
    },
    {
        connection: redis,
        concurrency: 5
    }
);