'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';

interface QRCodeDisplayProps {
  slug: string;
  shortUrl: string;
  size?: number;
}

export function QRCodeDisplay({ slug, shortUrl, size = 200 }: QRCodeDisplayProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/links/${slug}/qr?format=png&size=${size}`);
        setQrCode(response.data.qrCode);
        setError(null);
      } catch (err) {
        console.error('Error fetching QR code:', err);
        setError('Failed to generate QR code');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQRCode();
  }, [slug, size]);

  const handleDownload = async (format: 'png' | 'svg') => {
    try {
      const response = await axios.get(`/api/links/${slug}/qr?format=${format === 'png' ? 'buffer' : 'svg'}`, {
        responseType: format === 'png' ? 'blob' : 'text',
      });

      const blob = format === 'png' 
        ? response.data 
        : new Blob([response.data], { type: 'image/svg+xml' });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${slug}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading QR code:', err);
    }
  };

  const handleCopy = async () => {
    if (qrCode) {
      try {
        await navigator.clipboard.writeText(qrCode);
        // You might want to show a toast here
      } catch (err) {
        console.error('Error copying QR code:', err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <SkeletonLoader count={1} />
        <div className="mt-4 w-48 h-48 bg-slate-200 rounded animate-pulse" />
      </div>
    );
  }

  if (error || !qrCode) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">{error || 'Failed to load QR code'}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <img
          src={qrCode}
          alt={`QR code for ${shortUrl}`}
          className="w-full h-auto"
          style={{ maxWidth: `${size}px`, maxHeight: `${size}px` }}
        />
      </div>
      
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          type="button"
          variant="secondary"
          onClick={() => handleDownload('png')}
          size="sm"
        >
          Download PNG
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => handleDownload('svg')}
          size="sm"
        >
          Download SVG
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={handleCopy}
          size="sm"
        >
          Copy Image
        </Button>
      </div>
      
      <p className="text-sm text-slate-500 text-center max-w-xs">
        Scan this QR code to open {shortUrl}
      </p>
    </div>
  );
}


