import "dotenv/config";
import express from "express";
import { Worker } from "bullmq";
import axios from "axios";
import { redis } from "./config/redis.js";
import { checkUrl } from "./services/checker.js";
import { logger } from "./utils/logger.js";
import { sendAlertEmail } from "./services/email.js";
import { isAllowed } from "./utils/rateLimiter.js";

//Health Server
const app = express();

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "worker-service",
        timestamp: new Date().toISOString()
    });
});

app.get("/ready", async (req, res) => {
    try {
        await redis.ping();
        res.status(200).json({
            status: "ready",
            service: "worker-service",
            redis: "connected",
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        logger.error({ err }, "Worker readiness check failed");
        res.status(503).json({
            status: "not ready",
            service: "worker-service",
            redis: "disconnected",
            timestamp: new Date().toISOString()
        });
    }
});

app.listen(4002, () => {
    logger.info("Worker health server running on port 4002");
});


// Verify email config is loaded
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.ALERT_EMAIL) {
    logger.warn("Email environment variables (EMAIL_USER, EMAIL_PASS, ALERT_EMAIL) are not set — email alerts will fail!");
}

const MONITOR_SERVICE_URL = process.env.MONITOR_SERVICE_URL ?? "http://localhost:4000";

const worker = new Worker(
    "monitorQueue",
    async job => {
        const { id, url } = job.data;

        //  Rate Limiting 
        const allowed = await isAllowed(url);
        if (!allowed) {
            logger.warn({ id, url }, "Job skipped — domain rate limited");
            return { skipped: true, reason: "rate-limited" };
        }

        // Check URL (with retries)
        const result = await checkUrl(url);

        const { data: monitor } = await axios.get(
            `${MONITOR_SERVICE_URL}/monitors/${id}`
        );

        const previousStatus = monitor.status;
        const newStatus = result.status;


        const statusChanged = previousStatus !== newStatus;
        let emailSent = undefined; // only set when status changes

        if (statusChanged) {
            logger.info(
                { id, from: previousStatus, to: newStatus },
                "Status changed — sending email"
            );

            emailSent = false;
            try {
                await sendAlertEmail({
                    url,
                    status: newStatus
                });
                logger.info({ id, url, status: newStatus }, "Alert email sent successfully");
                emailSent = true;
            } catch (emailError) {
                logger.error(
                    { id, url, error: emailError.message },
                    "Failed to send alert email"
                );
            }
        }

        await axios.patch(
            `${MONITOR_SERVICE_URL}/monitors/${id}`,
            {
                status: newStatus,
                lastCheckedAt: new Date(),
                ...(emailSent !== undefined && { emailSent }),
                latency: result.latency ?? null,
                httpStatus: result.httpStatus ?? null
            }
        );

        logger.info({ id, url, status: newStatus }, "Job processed");

        return result;
    },
    {
        connection: redis,
        concurrency: 5
    }
);