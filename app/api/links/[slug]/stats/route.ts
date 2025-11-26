import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getLinkStats } from '@/lib/link/service';

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
    const stats = await getLinkStats(slug, user.userId);
    
    // No BigInt in stats, but ensure it's serializable
    return NextResponse.json({ stats });
  } catch (error) {
    if (error instanceof Error) {
      const status = error.message === 'Link not found' ? 404 :
                     error.message === 'Unauthorized' ? 403 : 400;
      return NextResponse.json(
        { error: error.message },
        { status }
      );
    }

    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

