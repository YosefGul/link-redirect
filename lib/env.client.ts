import { z } from 'zod';

const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().optional(),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

let validatedClientEnv: ClientEnv | null = null;

export function validateClientEnv(): ClientEnv {
  if (validatedClientEnv) {
    return validatedClientEnv;
  }

  try {
    validatedClientEnv = clientEnvSchema.parse({
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    });
    return validatedClientEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join('\n');
      throw new Error(`Invalid client environment variables:\n${errors}`);
    }
    throw error;
  }
}

export function getClientEnv(): ClientEnv {
  if (!validatedClientEnv) {
    return validateClientEnv();
  }
  return validatedClientEnv;
}

