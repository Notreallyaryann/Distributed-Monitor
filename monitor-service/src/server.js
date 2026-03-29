import express from "express";
import monitorRoutes from "./routes/monitor.routes.js";
import { logger } from "./utils/logger.js";
import { prisma } from "./config/prisma.js";

const app = express();

app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use("/monitors", monitorRoutes);

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "monitor-service",
        timestamp: new Date().toISOString()
    });
});

app.get("/ready", async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({
            status: "ready",
            service: "monitor-service",
            db: "connected",
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        logger.error({ err }, "Readiness check failed — DB unreachable");
        res.status(503).json({
            status: "not ready",
            service: "monitor-service",
            db: "disconnected",
            timestamp: new Date().toISOString()
        });
    }
});

app.listen(4000, () => {
    logger.info("Monitor Service running on port 4000");
});