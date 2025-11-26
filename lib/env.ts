import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('24h'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  try {
    return envSchema.parse({
      DATABASE_URL: process.env.DATABASE_URL,
      REDIS_URL: process.env.REDIS_URL,
      JWT_SECRET: process.env.JWT_SECRET,
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
      NODE_ENV: process.env.NODE_ENV,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid environment variables: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
    }
    throw error;
  }
}

