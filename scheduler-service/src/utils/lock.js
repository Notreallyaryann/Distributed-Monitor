import { redis } from "../config/redis.js";
import { logger } from "./logger.js";



const LOCK_KEY = "scheduler:lock";
const LOCK_TTL = parseInt(process.env.SCHEDULER_LOCK_TTL_SEC ?? "50", 10);

// Unique identity for this scheduler instance (pod/process)
const LOCK_VALUE = `scheduler-${process.pid}-${Date.now()}`;


export async function acquireLock() {
    // SET key value NX EX ttl  — atomic "set if not exists"
    const result = await redis.set(LOCK_KEY, LOCK_VALUE, "EX", LOCK_TTL, "NX");

    if (result === "OK") {
        logger.info({ instanceId: LOCK_VALUE, ttl: LOCK_TTL }, "Scheduler lock acquired");
        return true;
    }

    logger.warn({ instanceId: LOCK_VALUE }, "Could not acquire scheduler lock — another instance is active, skipping tick");
    return false;
}

export async function releaseLock() {
    const script = `
        if redis.call("GET", KEYS[1]) == ARGV[1] then
            return redis.call("DEL", KEYS[1])
        else
            return 0
        end
    `;

    const released = await redis.eval(script, 1, LOCK_KEY, LOCK_VALUE);

    if (released === 1) {
        logger.info({ instanceId: LOCK_VALUE }, "Scheduler lock released");
    }
}
