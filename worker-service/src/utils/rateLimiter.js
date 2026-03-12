import { redis } from "../config/redis.js";
import { logger } from "./logger.js";

//  Rate Limiter (per domain, sliding window via Redis)

const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX ?? "5", 10);
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? "60000", 10);
const WINDOW_SEC = Math.ceil(WINDOW_MS / 1000);


function getDomain(url) {
    try {
        return new URL(url).hostname;
    } catch {
        return url;
    }
}


export async function isAllowed(url) {
    const domain = getDomain(url);
    const key = `ratelimit:${domain}`;

    const script = `
        local current = redis.call("INCR", KEYS[1])
        if current == 1 then
            redis.call("EXPIRE", KEYS[1], ARGV[1])
        end
        return current
    `;

    const count = await redis.eval(script, 1, key, WINDOW_SEC);

    if (count > MAX_REQUESTS) {
        logger.warn(
            { domain, count, max: MAX_REQUESTS, windowSec: WINDOW_SEC },
            "Rate limit exceeded — skipping check"
        );
        return false;
    }

    return true;
}
