import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyLinkPassword } from '@/lib/link/password';
import { checkLinkExpiration } from '@/lib/link/expiration-check';
import { checkMaxClicks } from '@/lib/link/service';

const verifyPasswordSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { password } = verifyPasswordSchema.parse(body);

    // Fetch link
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
        { status: 410 }
      );
    }

    // Check expiration
    const expirationStatus = checkLinkExpiration(link.expiresAt);
    if (expirationStatus.isExpired) {
      return NextResponse.json(
        { error: 'This link has expired' },
        { status: 410 }
      );
    }

    // Check max clicks
    const maxClicksStatus = checkMaxClicks(link);
    if (maxClicksStatus.reached) {
      return NextResponse.json(
        { error: 'This link has reached its maximum click limit' },
        { status: 410 }
      );
    }

    // Verify password
    const isValid = await verifyLinkPassword(password, link.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Set verification cookie (expires in 1 hour)
    const response = NextResponse.json({
      success: true,
      message: 'Password verified',
    });

    response.cookies.set(`link_${slug}_verified`, 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Password verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


