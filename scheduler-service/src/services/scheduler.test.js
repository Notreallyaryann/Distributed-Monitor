import { describe, it, expect, vi } from 'vitest';
import { addMonitorsToQueue } from './scheduler.js';

// Mock BullMQ's Queue
const mockQueue = {
    add: vi.fn().mockResolvedValue({ id: 'job-123' })
};

describe('Scheduler Service Logic', () => {
    it('should correctly add multiple monitors to the queue', async () => {
        const monitors = [
            { id: 1, url: 'https://example.com' },
            { id: 2, url: 'https://test.com' }
        ];

        await addMonitorsToQueue(monitors, mockQueue);

        // Verify the mock was called once per monitor
        expect(mockQueue.add).toHaveBeenCalledTimes(2);
        expect(mockQueue.add).toHaveBeenCalledWith(
            "check",
            monitors[0],
            expect.any(Object)
        );
    });
});
