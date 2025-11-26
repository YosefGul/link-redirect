import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/middleware';
import { getUserLinks, createLink } from '@/lib/link/service';

const createLinkSchema = z.object({
  targetUrl: z.string().url(),
  slug: z.string().optional(),
  expiresAt: z.string().datetime().optional().nullable(),
  password: z.string().min(4).optional().nullable(),
  maxClicks: z.number().int().positive().optional().nullable(),
});

export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth(request);

  if (error || !user) {
    return error || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const links = await getUserLinks(user.userId);
    
    // Convert BigInt to string/number for JSON serialization
    const serializedLinks = (Array.isArray(links) ? links : []).map((link) => ({
      ...link,
      hits: Number(link.hits),
    }));
    
    return NextResponse.json({ links: serializedLinks });
  } catch (error) {
    console.error('Get links error:', error);
    
    // If it's a Prisma error or any initialization error, return empty array
    if (error instanceof Error && (
      error.message.includes('Prisma') ||
      error.message.includes('Unable to require') ||
      error.message.includes('libssl') ||
      error.name === 'PrismaClientInitializationError'
    )) {
      console.warn('Database error, returning empty array:', error.message);
      return NextResponse.json({ links: [] });
    }
    
    // For any other error, still return empty array to prevent UI errors
    console.warn('Unexpected error fetching links, returning empty array:', error);
    return NextResponse.json({ links: [] });
  }
}

export async function POST(request: NextRequest) {
  const { user, error } = await requireAuth(request);

  if (error || !user) {
    return error || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = createLinkSchema.parse(body);

    // Convert null to undefined for expiresAt
    const createData = {
      ...validated,
      expiresAt: validated.expiresAt || undefined,
      password: validated.password || undefined,
      maxClicks: validated.maxClicks || undefined,
    };

    const link = await createLink(createData, user.userId);

    // Convert BigInt to number for JSON serialization
    const serializedLink = {
      ...link,
      hits: Number(link.hits),
    };

    return NextResponse.json({ link: serializedLink }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    console.error('Create link error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

