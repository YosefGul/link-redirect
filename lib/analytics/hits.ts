import { prisma } from '@/lib/prisma';
import { getCachedHits } from '@/lib/cache';

/**
 * Sync hit counts from Redis to database
 * This should be called periodically (e.g., via cron job)
 */
export async function syncHitsToDB(): Promise<void> {
  try {
    // Get all active links
    const links = await prisma.shortLink.findMany({
      where: { isActive: true },
      select: { id: true, slug: true },
    });

    // Sync each link's hit count
    for (const link of links) {
      const cachedHits = await getCachedHits(link.slug);
      if (cachedHits > 0) {
        // Update database with cached hits
        await prisma.shortLink.update({
          where: { id: link.id },
          data: {
            hits: {
              increment: cachedHits,
            },
          },
        });
      }
    }
  } catch (error) {
    console.error('Error syncing hits to DB:', error);
  }
}

