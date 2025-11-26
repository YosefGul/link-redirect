import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/middleware';
import { getLinkBySlug, updateLink, deleteLink } from '@/lib/link/service';

const updateLinkSchema = z.object({
  targetUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
  allowEdit: z.boolean().optional(),
  expiresAt: z.string().datetime().optional().nullable(),
  password: z.string().min(4).optional().nullable(),
  maxClicks: z.number().int().positive().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { user, error } = await requireAuth(request);

  if (error || !user) {
    return error || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { slug } = await params;
    const link = await getLinkBySlug(slug, user.userId);
    
    // Convert BigInt to number for JSON serialization
    const serializedLink = {
      ...link,
      hits: Number(link.hits),
    };
    
    return NextResponse.json({ link: serializedLink });
  } catch (error) {
    if (error instanceof Error && error.message === 'Link not found') {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    console.error('Get link error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { user, error } = await requireAuth(request);

  if (error || !user) {
    return error || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { slug } = await params;
    const body = await request.json();
    const validated = updateLinkSchema.parse(body);

    const link = await updateLink(slug, validated, user.userId);

    // Convert BigInt to number for JSON serialization
    const serializedLink = {
      ...link,
      hits: Number(link.hits),
    };

    return NextResponse.json({ link: serializedLink });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      const status = error.message === 'Link not found' ? 404 :
                     error.message === 'Unauthorized' ? 403 : 400;
      return NextResponse.json(
        { error: error.message },
        { status }
      );
    }

    console.error('Update link error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { user, error } = await requireAuth(request);

  if (error || !user) {
    return error || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { slug } = await params;
    await deleteLink(slug, user.userId);

    return NextResponse.json({ message: 'Link deleted successfully' });
  } catch (error) {
    if (error instanceof Error) {
      const status = error.message === 'Link not found' ? 404 :
                     error.message === 'Unauthorized' ? 403 : 400;
      return NextResponse.json(
        { error: error.message },
        { status }
      );
    }

    console.error('Delete link error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

