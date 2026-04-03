import { describe, it, expect, vi } from 'vitest';
import { checkUrl } from './checker.js';
import axios from 'axios';

vi.mock('axios');

describe('Worker Service Checker', () => {
    it('should return UP when axios returns a 200 status', async () => {
        axios.get.mockResolvedValue({
            status: 200,
            statusText: 'OK',
            data: {}
        });

        const result = await checkUrl('https://google.com');
        expect(result.status).toBe('UP');
        expect(result.httpStatus).toBe(200);
    });

    it('should return DOWN when axios returns a 500 status', async () => {
        axios.get.mockResolvedValue({
            status: 500,
            statusText: 'Internal Server Error'
        });

        const result = await checkUrl('https://broken-site.com');
        expect(result.status).toBe('DOWN');
        expect(result.httpStatus).toBe(500);
    });

    it('should retry multiple times and return DOWN when axios consistently fails', async () => {
        axios.get.mockRejectedValue(new Error('Network Error'));

        // This will take a few seconds because of your retry delay
        const result = await checkUrl('https://unreachable-site.com');
        expect(result.status).toBe('DOWN');
    });
});
