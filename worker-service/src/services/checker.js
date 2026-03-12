import axios from "axios";
import { logger } from "../utils/logger.js";


const RETRY_ATTEMPTS = parseInt(process.env.RETRY_ATTEMPTS ?? "3", 10);
const RETRY_DELAY_MS = parseInt(process.env.RETRY_DELAY_MS ?? "5000", 10);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function attemptCheck(url) {
    const start = Date.now();

    const response = await axios.get(url, {
        timeout: 5000,
        validateStatus: () => true
    });

    const latency = Date.now() - start;
    const isUp = response.status >= 200 && response.status < 400;

    return {
        status: isUp ? "UP" : "DOWN",
        latency,
        httpStatus: response.status
    };
}

export async function checkUrl(url) {
    let lastError = null;
    let lastResult = null;

    for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
        try {
            const result = await attemptCheck(url);

            if (result.status === "UP") {
                logger.info(
                    { url, attempt, httpStatus: result.httpStatus, latency: result.latency },
                    "URL is UP"
                );
                return { url, ...result };
            }

            // Got a DOWN HTTP response — log and retry
            logger.warn(
                { url, attempt, httpStatus: result.httpStatus },
                `Check returned DOWN (attempt ${attempt}/${RETRY_ATTEMPTS})`
            );
            lastResult = result;

        } catch (error) {
            // Network error (timeout, DNS failure, etc.)
            logger.warn(
                { url, attempt, error: error.message },
                `Check threw error (attempt ${attempt}/${RETRY_ATTEMPTS})`
            );
            lastError = error;
        }

        // Wait before retrying (skip delay after the last attempt)
        if (attempt < RETRY_ATTEMPTS) {
            await sleep(RETRY_DELAY_MS);
        }
    }

    // All attempts exhausted → site is truly DOWN
    logger.error(
        { url, attempts: RETRY_ATTEMPTS, error: lastError?.message },
        "All retry attempts failed — marking as DOWN"
    );

    return {
        url,
        status: "DOWN",
        latency: lastResult?.latency ?? null,
        httpStatus: lastResult?.httpStatus ?? null
    };
}