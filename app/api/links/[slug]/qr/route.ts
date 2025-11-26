import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getLinkBySlug } from '@/lib/link/service';
import { generateQRCode, generateQRCodeSVG, generateQRCodeBuffer } from '@/lib/qrcode/generator';

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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'png'; // png, svg, or buffer
    const size = parseInt(searchParams.get('size') || '300', 10);

    // Build the full short URL
    const origin = request.headers.get('origin') || request.nextUrl.origin;
    const shortUrl = `${origin}/${slug}`;

    // Generate QR code based on format
    if (format === 'svg') {
      const svg = await generateQRCodeSVG(shortUrl, { size });
      return new NextResponse(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    if (format === 'buffer' || format === 'download') {
      const buffer = await generateQRCodeBuffer(shortUrl, { size });
      return new NextResponse(buffer as unknown as BodyInit, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="qr-${slug}.png"`,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // Default: PNG data URL
    const dataUrl = await generateQRCode(shortUrl, { size });
    
    // Return as JSON with data URL
    return NextResponse.json({
      qrCode: dataUrl,
      url: shortUrl,
      format: 'png',
    });
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
    console.error('Generate QR code error:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}


