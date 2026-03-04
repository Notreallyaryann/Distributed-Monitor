import { startScheduler } from "./services/scheduler.js";
import { logger } from "./utils/logger.js";

startScheduler();

process.on("SIGTERM", () => {
    logger.info("Scheduler shutting down...");
    process.exit(0);
});