import "dotenv/config";
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
        "userEmail" TEXT NOT NULL,
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

    // Ensure userEmail column exists (if table already exists)
    try {
        await client.query(`ALTER TABLE "Monitor" ADD COLUMN IF NOT EXISTS "userEmail" TEXT NOT NULL DEFAULT 'unknown'`);
    } catch (e) {
        // column may already exist
    }

    // Drop old unique index and create new composite one
    await client.query(`
      DROP INDEX IF EXISTS "Monitor_url_key";
      CREATE UNIQUE INDEX IF NOT EXISTS "Monitor_url_userEmail_key" ON "Monitor"("url", "userEmail");
    `);

    // Ensure new columns exist
    try {
        await client.query(`ALTER TABLE "Monitor" ADD COLUMN IF NOT EXISTS "webhookUrl" TEXT`);
        await client.query(`ALTER TABLE "Monitor" ADD COLUMN IF NOT EXISTS "telegramToken" TEXT`);
        await client.query(`ALTER TABLE "Monitor" ADD COLUMN IF NOT EXISTS "telegramChatId" TEXT`);
    } catch (e) {
        // columns may already exist
    }

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
