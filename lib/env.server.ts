import { z } from 'zod';

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  REDIS_URL: z.string().url('REDIS_URL must be a valid URL').optional(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let validatedEnv: ServerEnv | null = null;

export function validateServerEnv(): ServerEnv {
  if (validatedEnv) {
    return validatedEnv;
  }

  // Skip validation during build phase
  // Environment variables will be validated at runtime
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    // Return a minimal valid config for build time
    // Actual validation will happen at runtime
    validatedEnv = {
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/db',
      REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
      JWT_SECRET: process.env.JWT_SECRET || 'build-time-secret-min-32-chars-long',
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
      NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
    };
    return validatedEnv;
  }

  try {
    validatedEnv = serverEnvSchema.parse({
      DATABASE_URL: process.env.DATABASE_URL,
      REDIS_URL: process.env.REDIS_URL,
      JWT_SECRET: process.env.JWT_SECRET,
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
      NODE_ENV: process.env.NODE_ENV,
    });
    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join('\n');
      throw new Error(`Invalid server environment variables:\n${errors}`);
    }
    throw error;
  }
}

export function getServerEnv(): ServerEnv {
  if (!validatedEnv) {
    return validateServerEnv();
  }
  return validatedEnv;
}

