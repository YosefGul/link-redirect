import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCachedTarget, setCachedTarget, incrementHit } from '@/lib/cache';
import { logVisit } from '@/lib/analytics/logger';
import { checkRateLimit } from '@/lib/rate-limit';
import { checkLinkExpiration } from '@/lib/link/expiration-check';
import { isPasswordProtected } from '@/lib/link/password';
import { checkMaxClicks } from '@/lib/link/service';

// Force Node.js runtime for geoip-lite compatibility
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Rate limiting for redirects (more lenient)
    const rateLimit = await checkRateLimit(request, {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 1000, // 1000 requests per minute per IP
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '1000',
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          },
        }
      );
    }

    const { slug } = await params;

    // Fetch link from database (we need full link data for security checks)
    const link = await prisma.shortLink.findUnique({
      where: { slug },
    });

    if (!link) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }

    if (!link.isActive) {
      return NextResponse.json(
        { error: 'Link is inactive' },
        { status: 410 } // Gone
      );
    }

    // Check expiration
    const expirationStatus = checkLinkExpiration(link.expiresAt);
    if (expirationStatus.isExpired) {
      return NextResponse.json(
        { error: 'This link has expired' },
        { status: 410 } // Gone
      );
    }

    // Check max clicks
    const maxClicksStatus = checkMaxClicks(link);
    if (maxClicksStatus.reached) {
      return NextResponse.json(
        { error: 'This link has reached its maximum click limit' },
        { status: 410 } // Gone
      );
    }

    // Check password protection
    if (isPasswordProtected(link.passwordHash)) {
      // Check if password is already verified (via cookie/session)
      const verified = request.cookies.get(`link_${slug}_verified`);
      
      if (!verified || verified.value !== 'true') {
        // Redirect to password verification page
        const verifyUrl = new URL(`/${slug}/verify`, request.url);
        verifyUrl.searchParams.set('redirect', 'true');
        return NextResponse.redirect(verifyUrl.toString());
      }
    }

    // Get target URL (check cache first)
    let targetUrl = await getCachedTarget(slug);
    if (!targetUrl) {
      targetUrl = link.targetUrl;
      // Cache it for future requests
      await setCachedTarget(slug, targetUrl);
    }

    // Increment hit counter (async, non-blocking)
    incrementHit(slug).catch((error) => {
      console.error('Error incrementing hit:', error);
    });

    // Log visit (async, non-blocking)
    logVisit(link.id, request).catch((error) => {
      console.error('Error logging visit:', error);
    });

    // Return 302 redirect
    return NextResponse.redirect(targetUrl, { status: 302 });
  } catch (error) {
    console.error('Redirect error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

