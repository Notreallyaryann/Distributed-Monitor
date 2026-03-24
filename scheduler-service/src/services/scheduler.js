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

export function startScheduler() {
    logger.info("Scheduler started");

    //cron expression means run every 1 min 
    cron.schedule("*/1 * * * *", async () => {
        const locked = await acquireLock();
        if (!locked) {
            return;
        }

        try {
            logger.info("Fetching monitors from Monitor Service");

            const { data } = await axios.get(
                `${MONITOR_SERVICE_URL}/monitors`
            );

            for (const monitor of data) {
                await queue.add(
                    "check",
                    monitor,
                    {
                        removeOnComplete: true, //if job finided then remove it 

                        attempts: 3,
                        backoff: {
                            type: "exponential", //wait btwn retries
                            delay: 5000
                        }
                    }
                );
            }

            logger.info({ count: data.length }, "Jobs pushed to queue");
        } catch (err) {
            logger.error({ error: err.message }, "Failed to fetch monitors or push jobs");
        } finally {
            // Release the lock early so other instances can pick up next tick
            await releaseLock();
        }
    });
}