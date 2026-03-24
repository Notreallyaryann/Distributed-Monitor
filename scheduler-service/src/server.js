import "dotenv/config";
import express from "express";
import { startScheduler } from "./services/scheduler.js";
import { logger } from "./utils/logger.js";
import { redis } from "./config/redis.js";

const app = express();

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "scheduler-service",
        timestamp: new Date().toISOString()
    });
});

app.get("/ready", async (req, res) => {
    try {
        // Ping Redis — if it responds the scheduler can push jobs
        await redis.ping();
        res.status(200).json({
            status: "ready",
            service: "scheduler-service",
            redis: "connected",
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        logger.error({ err }, "Readiness check failed — Redis unreachable");
        res.status(503).json({
            status: "not ready",
            service: "scheduler-service",
            redis: "disconnected",
            timestamp: new Date().toISOString()
        });
    }
});

app.listen(4001, () => {
    logger.info("Scheduler health server running on port 4001");
});

startScheduler();

//graceful shutdown handler
process.on("SIGTERM", () => {
    logger.info("Scheduler shutting down...");
    process.exit(0);
});