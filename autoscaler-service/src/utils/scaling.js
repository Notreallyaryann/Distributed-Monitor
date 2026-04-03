export function calculateScalingDecision({
    queueDepth,
    runningWorkers,
    minWorkers,
    maxWorkers,
    scaleUpThreshold,
    scaleDownThreshold
}) {
    // Scale up if queue is backing up
    if (queueDepth > scaleUpThreshold && runningWorkers < maxWorkers) {
        return { action: 'SCALE_UP', target: runningWorkers + 1 };
    }

    // Scale down if queue is empty
    else if (queueDepth < scaleDownThreshold && runningWorkers > minWorkers) {
        return { action: 'SCALE_DOWN', target: runningWorkers - 1 };
    }

    // Steady state
    return { action: 'NONE', target: runningWorkers };
}
