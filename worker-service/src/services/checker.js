import axios from "axios";
import { logger } from "../utils/logger.js";


export async function checkUrl(url) {
    try {
        const start = Date.now();

        const response = await axios.get(url, {
            timeout: 5000,
            validateStatus: () => true
        });

        const latency = Date.now() - start;

        const isUp = response.status >= 200 && response.status < 400;

        logger.info({ url, status: response.status, latency });

        return {
            url,
            status: isUp ? "UP" : "DOWN",
            latency
        };
    } catch (error) {
        logger.error({ url, error: error.message });

        return {
            url,
            status: "DOWN",
            latency: null
        };
    }
}