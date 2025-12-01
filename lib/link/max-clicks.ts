/**
 * Check if link has reached max clicks
 * This is a pure utility function that can be used in both client and server components
 */
export function checkMaxClicks(link: { hits: bigint | number; maxClicks?: number | null }): {
  reached: boolean;
  remaining: number | null;
} {
  if (!link.maxClicks) {
    return {
      reached: false,
      remaining: null,
    };
  }

  const currentHits = Number(link.hits);
  const remaining = Math.max(0, link.maxClicks - currentHits);

  return {
    reached: currentHits >= link.maxClicks,
    remaining,
  };
}

