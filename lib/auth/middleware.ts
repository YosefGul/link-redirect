import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from './jwt';
import { JWTPayload } from '@/types/auth';

/**
 * Require authentication middleware (async)
 */
export async function requireAuth(request: NextRequest): Promise<{ user: JWTPayload | null; error: NextResponse | null }> {
  const user = await getAuthenticatedUser(request);
  
  if (!user) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }

  return { user, error: null };
}

/**
 * Require admin role middleware (async)
 */
export async function requireAdmin(request: NextRequest): Promise<{ user: JWTPayload | null; error: NextResponse | null }> {
  const { user, error } = await requireAuth(request);
  
  if (error) {
    return { user: null, error };
  }

  if (user?.role !== 'ADMIN') {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      ),
    };
  }

  return { user, error: null };
}

