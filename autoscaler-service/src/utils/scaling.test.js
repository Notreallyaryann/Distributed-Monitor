import { describe, it, expect } from 'vitest';
import { calculateScalingDecision } from './scaling.js';

describe('Autoscaling Decision Logic', () => {
    const config = {
        minWorkers: 1,
        maxWorkers: 10,
        scaleUpThreshold: 100,
        scaleDownThreshold: 20
    };

    it('should suggest scaling UP when queue depth exceeds threshold', () => {
        const decision = calculateScalingDecision({
            queueDepth: 150, // > 100
            runningWorkers: 2,
            ...config
        });

        expect(decision.action).toBe('SCALE_UP');
        expect(decision.target).toBe(3);
    });

    it('should suggest scaling DOWN when queue depth is below threshold', () => {
        const decision = calculateScalingDecision({
            queueDepth: 10, // < 20
            runningWorkers: 5,
            ...config
        });

        expect(decision.action).toBe('SCALE_DOWN');
        expect(decision.target).toBe(4);
    });

    it('should suggest NO ACTION when in steady state', () => {
        const decision = calculateScalingDecision({
            queueDepth: 50, // Between 20 and 100
            runningWorkers: 3,
            ...config
        });

        expect(decision.action).toBe('NONE');
        expect(decision.target).toBe(3);
    });

    it('should not scale UP beyond maxWorkers', () => {
        const decision = calculateScalingDecision({
            queueDepth: 500,
            runningWorkers: 10, // already at max
            ...config
        });

        expect(decision.action).toBe('NONE');
    });

    it('should not scale DOWN below minWorkers', () => {
        const decision = calculateScalingDecision({
            queueDepth: 0,
            runningWorkers: 1, // already at min
            ...config
        });

        expect(decision.action).toBe('NONE');
    });
});
