import { Queue } from "bullmq";
import cron from "node-cron";
import axios from "axios";
import { redis } from "../config/redis.js";
import { logger } from "../utils/logger.js";

const queue = new Queue("monitorQueue", {
    connection: redis
});

export function startScheduler() {
    logger.info("Scheduler started");

    cron.schedule("*/1 * * * *", async () => {
        try {
            logger.info("Fetching monitors from Monitor Service");

            const { data } = await axios.get(
                "http://localhost:4000/monitors"
            );

            for (const monitor of data) {
                await queue.add(
                    "check",
                    monitor,
                    {
                        removeOnComplete: true,
                        attempts: 1
                    }
                );
            }

            logger.info("Jobs pushed to queue");
        } catch (err) {
            logger.error("Failed to fetch monitors");
        }
    });
}