import { PrismaClient } from '../generated/prisma'; // adjust if your generated client path differs

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'], // optional: logs SQL queries
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
