'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShortLink } from '@/types/link';
import { CopyButton } from './CopyButton';
import { QRCodeModal } from './QRCodeModal';
import { checkLinkExpiration } from '@/lib/link/expiration-check';
import { isPasswordProtected } from '@/lib/link/password';
import { checkMaxClicks } from '@/lib/link/max-clicks';

interface LinkCardProps {
  link: ShortLink;
  onDelete?: (slug: string) => void;
}

export function LinkCard({ link, onDelete }: LinkCardProps) {
  const [showQRModal, setShowQRModal] = useState(false);
  const shortUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/${link.slug}`
      : `/${link.slug}`;

  const expirationStatus = checkLinkExpiration(link.expiresAt || null);
  const maxClicksStatus = checkMaxClicks({ ...link, maxClicks: link.maxClicks ?? null });
  const hasPassword = isPasswordProtected(link.passwordHash || null);

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <code className="text-lg font-mono bg-gray-100 px-3 py-1 rounded">
                {link.slug}
              </code>
              <CopyButton text={shortUrl} />
              <button
                onClick={() => setShowQRModal(true)}
                className="p-1 text-slate-600 hover:text-blue-600 transition-colors"
                title="Show QR Code"
                aria-label="Show QR Code"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </button>
            </div>
            <a
              href={link.targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm truncate block max-w-md"
            >
              {link.targetUrl}
            </a>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                link.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {link.isActive ? 'Active' : 'Inactive'}
            </span>
            {hasPassword && (
              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                🔒 Protected
              </span>
            )}
            {expirationStatus.isExpired && (
              <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                Expired
              </span>
            )}
            {expirationStatus.expiresAt && !expirationStatus.isExpired && (
              <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                Expires {expirationStatus.daysUntilExpiration === 1 ? 'today' : `in ${expirationStatus.daysUntilExpiration} days`}
              </span>
            )}
          </div>
        </div>

        {/* Max Clicks Progress */}
        {link.maxClicks && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Clicks: {Number(link.hits)} / {link.maxClicks}</span>
              <span>{maxClicksStatus.remaining !== null ? `${maxClicksStatus.remaining} remaining` : ''}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  maxClicksStatus.reached
                    ? 'bg-red-500'
                    : Number(link.hits) / link.maxClicks > 0.8
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{
                  width: `${Math.min(100, (Number(link.hits) / link.maxClicks) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{Number(link.hits)} clicks</span>
          <div className="flex gap-3">
            <Link
              href={`/dashboard/links/${link.slug}`}
              className="text-blue-600 hover:text-blue-800"
            >
              Edit
            </Link>
            <Link
              href={`/dashboard/links/${link.slug}/stats`}
              className="text-green-600 hover:text-green-800"
            >
              Stats
            </Link>
            {onDelete && (
              <button
                onClick={() => onDelete(link.slug)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      <QRCodeModal
        slug={link.slug}
        shortUrl={shortUrl}
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
      />
    </>
  );
}

