import express from "express";
import monitorRoutes from "./routes/monitor.routes.js";
import { logger } from "./utils/logger.js";

const app = express();

app.use(express.json());
app.use("/monitors", monitorRoutes);

app.listen(4000, () => {
    logger.info("Monitor Service running on port 4000");
});