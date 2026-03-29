import "dotenv/config";
import Redis from "ioredis";
import Docker from "dockerode";
import { logger } from "./utils/logger.js";

const redis = new Redis({
    host: process.env.REDIS_HOST || "redis",
    port: process.env.REDIS_PORT || 6379
});

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

// Configuration
const MIN_WORKERS = parseInt(process.env.MIN_WORKERS || "1");
const MAX_WORKERS = parseInt(process.env.MAX_WORKERS || "10");
const QUEUE_NAME = "monitorQueue";
const CHECK_INTERVAL = parseInt(process.env.CHECK_INTERVAL || "30000");
const SCALE_UP_THRESHOLD = parseInt(process.env.SCALE_UP_THRESHOLD || "100"); // Queue jobs > 100
const SCALE_DOWN_THRESHOLD = parseInt(process.env.SCALE_DOWN_THRESHOLD || "20"); // Queue jobs < 20
const DOCKER_COMPOSE_PROJECT = process.env.DOCKER_COMPOSE_PROJECT || "distributed-monitor";

let currentWorkerCount = MIN_WORKERS;


async function getQueueDepth() {
    try {
        const queueKey = `bull:${QUEUE_NAME}:`;
        const jobs = await redis.llen(`${queueKey}wait`);
        return jobs;
    } catch (error) {
        logger.error({ error: error.message }, "Failed to get queue depth");
        return 0;
    }
}

async function getCurrentWorkerCount() {
    try {
        const containers = await docker.listContainers({ all: true });
        const workerContainers = containers.filter(
            c => c.Names.some(name => name.includes(`${DOCKER_COMPOSE_PROJECT}-worker-`))
        );
        return workerContainers.filter(c => c.State === "running").length;
    } catch (error) {
        logger.error({ error: error.message }, "Failed to get current worker count");
        return currentWorkerCount;
    }
}

async function createWorker(workerId) {
    try {
        const container = await docker.createContainer({
            Image: `${DOCKER_COMPOSE_PROJECT}-worker-service:latest`,
            name: `${DOCKER_COMPOSE_PROJECT}-worker-${workerId}-${Date.now()}`,
            Env: [
                `REDIS_HOST=${process.env.REDIS_HOST || "redis"}`,
                `REDIS_PORT=${process.env.REDIS_PORT || "6379"}`,
                `MONITOR_SERVICE_URL=${process.env.MONITOR_SERVICE_URL || "http://monitor-service:4000"}`,
                `EMAIL_USER=${process.env.EMAIL_USER || ""}`,
                `EMAIL_PASS=${process.env.EMAIL_PASS || ""}`,
                `ALERT_EMAIL=${process.env.ALERT_EMAIL || ""}`
            ],
            HostConfig: {
                RestartPolicy: {
                    Name: "on-failure",
                    MaximumRetryCount: 5
                }
            },
            NetworkMode: `${DOCKER_COMPOSE_PROJECT}_default`
        });

        await container.start();
        logger.info({ containerId: container.id.substring(0, 12), workerId }, "Worker started");
        return true;
    } catch (error) {
        logger.error({ error: error.message, workerId }, "Failed to create worker");
        return false;
    }
}

async function removeWorker() {
    try {
        const containers = await docker.listContainers({ all: true });
        const workerContainers = containers
            .filter(c => c.Names.some(name => name.includes(`${DOCKER_COMPOSE_PROJECT}-worker-`)))
            .filter(c => c.State === "running")
            .sort((a, b) => a.Created - b.Created); // Remove oldest first

        if (workerContainers.length === 0) {
            logger.warn("No worker containers to remove");
            return false;
        }

        const containerToRemove = docker.getContainer(workerContainers[0].Id);
        await containerToRemove.stop({ t: 10 });
        await containerToRemove.remove();

        logger.info(
            { containerId: workerContainers[0].Id.substring(0, 12) },
            "Worker stopped and removed"
        );
        return true;
    } catch (error) {
        logger.error({ error: error.message }, "Failed to remove worker");
        return false;
    }
}

async function autoscaleLoop() {
    try {
        const queueDepth = await getQueueDepth();
        const runningWorkers = await getCurrentWorkerCount();

        logger.info(
            { queueDepth, runningWorkers, minWorkers: MIN_WORKERS, maxWorkers: MAX_WORKERS },
            "Autoscaler check"
        );

        // Scale up if queue is backing up
        if (queueDepth > SCALE_UP_THRESHOLD && runningWorkers < MAX_WORKERS) {
            logger.warn(
                { queueDepth, threshold: SCALE_UP_THRESHOLD, currentWorkers: runningWorkers },
                "Queue backing up — scaling up"
            );
            const newWorkerId = runningWorkers + 1;
            await createWorker(newWorkerId);
            currentWorkerCount = newWorkerId;
        }

        // Scale down if queue is empty
        else if (queueDepth < SCALE_DOWN_THRESHOLD && runningWorkers > MIN_WORKERS) {
            logger.info(
                { queueDepth, threshold: SCALE_DOWN_THRESHOLD, currentWorkers: runningWorkers },
                "Queue empty — scaling down"
            );
            await removeWorker();
            currentWorkerCount = runningWorkers - 1;
        }

        // Steady state
        else {
            logger.debug(
                { queueDepth, currentWorkers: runningWorkers },
                "Steady state — no scaling needed"
            );
        }
    } catch (error) {
        logger.error({ error: error.message }, "Autoscaler loop error");
    }

    // Run next check
    setTimeout(autoscaleLoop, CHECK_INTERVAL);
}

// Health check server  
import express from "express";
const app = express();
const port = 4003;

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "autoscaler-service",
        timestamp: new Date().toISOString(),
        currentWorkers: currentWorkerCount
    });
});

app.get("/metrics", async (req, res) => {
    try {
        const queueDepth = await getQueueDepth();
        const runningWorkers = await getCurrentWorkerCount();
        res.status(200).json({
            queueDepth,
            runningWorkers,
            minWorkers: MIN_WORKERS,
            maxWorkers: MAX_WORKERS,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    logger.info(`Autoscaler health check server running on port ${port}`);
});


// Start autoscaler
logger.info(
    {
        minWorkers: MIN_WORKERS,
        maxWorkers: MAX_WORKERS,
        scaleUpThreshold: SCALE_UP_THRESHOLD,
        scaleDownThreshold: SCALE_DOWN_THRESHOLD,
        checkInterval: CHECK_INTERVAL
    },
    "Autoscaler starting"
);

autoscaleLoop();

// Graceful shutdown
process.on("SIGTERM", () => {
    logger.info("Autoscaler shutting down...");
    redis.disconnect();
    process.exit(0);
});
