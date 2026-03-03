import { Worker } from "bullmq";
import { redis } from "./config/redis.js";
import { checkUrl } from "./services/checker.js";
import { logger } from "./utils/logger.js";

const worker = new Worker(
    "monitorQueue",
    async job => {
        const { url } = job.data;

        const result = await checkUrl(url);

        logger.info({ result }, "Job processed");

        return result;
    },
    {
        connection: redis,
        concurrency: 5,
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 2000
        }
    }
);

worker.on("completed", job => {
    logger.info({ jobId: job.id }, "Completed");
});

worker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, error: err.message }, "Failed");
});

process.on("SIGTERM", async () => {
    await worker.close();
    process.exit(0);
});

logger.info("Worker started");