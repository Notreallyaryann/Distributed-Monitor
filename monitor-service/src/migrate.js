import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
});

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(`
      CREATE TABLE IF NOT EXISTS "Monitor" (
        "id" SERIAL NOT NULL,
        "url" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'UNKNOWN',
        "sslStatus" TEXT NOT NULL DEFAULT 'UNKNOWN',
        "sslExpiresAt" TIMESTAMP(3),
        "lastCheckedAt" TIMESTAMP(3),
        "emailSent" BOOLEAN NOT NULL DEFAULT false,
        "latency" INTEGER,
        "httpStatus" INTEGER,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Monitor_pkey" PRIMARY KEY ("id")
      );
    `);

    // Create unique index if not exists
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Monitor_url_key" ON "Monitor"("url");
    `);

    await client.query("COMMIT");
    console.log("Migrations applied successfully.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
