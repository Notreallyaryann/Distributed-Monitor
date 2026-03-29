import path from 'node:path';
import pg from 'pg';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  earlyAccess: true,
  schema: path.join(import.meta.dirname, 'schema.prisma'),
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? '',
  },
  migrate: {
    async adapter() {
      const { PrismaPg } = await import('@prisma/adapter-pg');
      const pool = new pg.Pool({
        connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
      });
      return new PrismaPg(pool, { schema: 'public' });
    },
  },
});
