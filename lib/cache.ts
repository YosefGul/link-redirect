import { redis, CACHE_KEYS, CACHE_TTL } from './redis';

/**
 * Get cached target URL for a slug
 */
export async function getCachedTarget(slug: string): Promise<string | null> {
  try {
    return await redis.get(CACHE_KEYS.target(slug));
  } catch (error) {
    console.error('Error getting cached target:', error);
    return null;
  }
}

/**
 * Cache target URL for a slug
 */
export async function setCachedTarget(slug: string, target: string): Promise<void> {
  try {
    await redis.setex(CACHE_KEYS.target(slug), CACHE_TTL, target);
  } catch (error) {
    console.error('Error setting cached target:', error);
  }
}

/**
 * Invalidate slug from cache
 */
export async function invalidateSlug(slug: string): Promise<void> {
  try {
    await redis.del(CACHE_KEYS.target(slug));
    await redis.del(CACHE_KEYS.hits(slug));
  } catch (error) {
    console.error('Error invalidating slug:', error);
  }
}

/**
 * Increment hit counter atomically
 */
export async function incrementHit(slug: string): Promise<number> {
  try {
    const hits = await redis.incr(CACHE_KEYS.hits(slug));
    await redis.expire(CACHE_KEYS.hits(slug), CACHE_TTL);
    return hits;
  } catch (error) {
    console.error('Error incrementing hit:', error);
    return 0;
  }
}

/**
 * Get cached hit count
 */
export async function getCachedHits(slug: string): Promise<number> {
  try {
    const hits = await redis.get(CACHE_KEYS.hits(slug));
    return hits ? parseInt(hits, 10) : 0;
  } catch (error) {
    console.error('Error getting cached hits:', error);
    return 0;
  }
}

