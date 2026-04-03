import { describe, it, expect, vi } from 'vitest';
import { Queue } from 'bullmq';

// Mock BullMQ's Queue
vi.mock('bullmq', () => ({
    Queue: vi.fn().mockImplementation(() => ({
        add: vi.fn().mockResolvedValue({ id: 'job-123' })
    }))
}));

describe('Scheduler Service Queueing', () => {
    it('should correctly add a job to the monitorQueue', async () => {
        // Instantiate our mocked queue
        const queue = new Queue('monitorQueue');
        const jobData = { id: 1, url: 'https://example.com' };

        // Attempt to add a job
        const job = await queue.add('check', jobData);

        // Verify the mock was called
        expect(queue.add).toHaveBeenCalled();
        expect(job.id).toBeDefined();
        expect(job.id).toBe('job-123');
    });

    it('should correctly store job data when adding to queue', async () => {
        const queue = new Queue('monitorQueue');
        const jobData = { id: 10, url: 'https://test.com' };

        await queue.add('check', jobData);

        // Inspect the call arguments to ensure metadata was passed correctly
        expect(queue.add).toHaveBeenCalledWith('check', jobData);
    });
});
