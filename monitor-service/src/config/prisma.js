import pkg from "@prisma/client";

const { PrismaClient } = pkg;

// For Prisma v7+, datasource is configured via DATABASE_URL environment variable
export const prisma = new PrismaClient({
  log: [
    {
      emit: "stdout",
      level: "error",
    },
  ],
});