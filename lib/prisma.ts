import { PrismaClient } from '@prisma/client';
import { validateServerEnv } from './env.server';

// Validate environment variables on import
if (typeof window === 'undefined') {
  try {
    validateServerEnv();
  } catch (error) {
    console.error('Environment validation failed:', error);
    throw error;
  }
}

// Type assertion is necessary here because globalThis doesn't have a PrismaClient type
// This pattern is safe and commonly used in Next.js to prevent multiple Prisma instances
// during hot reloading in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

