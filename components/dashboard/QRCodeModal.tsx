'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';

interface QRCodeModalProps {
  slug: string;
  shortUrl: string;
  isOpen: boolean;
  onClose: () => void;
  size?: number;
}

export function QRCodeModal({ slug, shortUrl, isOpen, onClose, size = 300 }: QRCodeModalProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
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
    }
  }, [slug, size, isOpen]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900">QR Code</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8">
            <SkeletonLoader count={1} />
            <div className="mt-4 w-48 h-48 bg-slate-200 rounded animate-pulse" />
          </div>
        ) : error || !qrCode ? (
          <div className="text-center p-8">
            <p className="text-red-600">{error || 'Failed to load QR code'}</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <img
                  src={qrCode}
                  alt={`QR code for ${shortUrl}`}
                  className="w-full h-auto"
                  style={{ maxWidth: `${size}px`, maxHeight: `${size}px` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleDownload('png')}
                  className="flex-1"
                >
                  Download PNG
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleDownload('svg')}
                  className="flex-1"
                >
                  Download SVG
                </Button>
              </div>
              
              <p className="text-sm text-slate-500 text-center">
                Scan this QR code to open {shortUrl}
              </p>
            </div>
          </>
        )}

        <div className="mt-6 flex justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}


