import { Queue } from "bullmq";
import cron from "node-cron";
import axios from "axios";
import { redis } from "../config/redis.js";
import { logger } from "../utils/logger.js";
import { acquireLock, releaseLock } from "../utils/lock.js";

const MONITOR_SERVICE_URL = process.env.MONITOR_SERVICE_URL ?? "http://localhost:4000";

const queue = new Queue("monitorQueue", {
    connection: redis
});

export async function addMonitorsToQueue(monitors, queue) {
    for (const monitor of monitors) {
        await queue.add(
            "check",
            monitor,
            {
                jobId: `check-${monitor.id}`,
                removeOnComplete: true,
                removeOnFail: { count: 100 },
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 5000
                }
            }
        );
    }
}

export function startScheduler() {
    logger.info("Scheduler started");

    cron.schedule("*/1 * * * *", async () => {
        const locked = await acquireLock();
        if (!locked) return;

        try {
            logger.info("Fetching monitors from Monitor Service");
            const { data } = await axios.get(`${MONITOR_SERVICE_URL}/monitors`);
            await addMonitorsToQueue(data, queue);
            logger.info({ count: data.length }, "Jobs pushed to queue");
        } catch (err) {
            logger.error({ error: err.message }, "Failed to fetch monitors or push jobs");
        } finally {
            await releaseLock();
        }
    });
}