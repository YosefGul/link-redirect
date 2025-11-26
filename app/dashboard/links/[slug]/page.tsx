'use client';

import { use } from 'react';
import { EditLinkForm } from '@/components/dashboard/EditLinkForm';
import { QRCodeDisplay } from '@/components/dashboard/QRCodeDisplay';
import { useLink } from '@/hooks/useLink';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { checkLinkExpiration } from '@/lib/link/expiration-check';
import { isPasswordProtected } from '@/lib/link/password';
import { checkMaxClicks } from '@/lib/link/service';

export default function EditLinkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const { data: link, isLoading } = useLink(resolvedParams.slug);

  if (isLoading) {
    return <SkeletonLoader count={3} />;
  }

  if (!link) {
    return null;
  }

  const shortUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${link.slug}`
    : `/${link.slug}`;

  const expirationStatus = checkLinkExpiration(link.expiresAt || null);
  const maxClicksStatus = checkMaxClicks({ ...link, maxClicks: link.maxClicks ?? null });
  const hasPassword = isPasswordProtected(link.passwordHash || null);

  return (
    <div className="max-w-4xl mx-auto animate-slide-up">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2" id="page-heading">
          Edit Link
        </h1>
        <p className="text-slate-600">Update your short link configuration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* QR Code Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4">QR Code</h2>
          <QRCodeDisplay slug={link.slug} shortUrl={shortUrl} />
        </div>

        {/* Security Info Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Security & Status</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Expiration</h3>
              {expirationStatus.isExpired ? (
                <p className="text-red-600">This link has expired</p>
              ) : expirationStatus.expiresAt ? (
                <p className="text-slate-600">
                  Expires: {new Date(expirationStatus.expiresAt).toLocaleString()}
                  {expirationStatus.daysUntilExpiration && (
                    <span className="ml-2 text-sm">
                      ({expirationStatus.daysUntilExpiration} days remaining)
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-green-600">No expiration date set</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Password Protection</h3>
              {hasPassword ? (
                <p className="text-blue-600">🔒 Password protected</p>
              ) : (
                <p className="text-slate-600">No password protection</p>
              )}
            </div>

            {link.maxClicks && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Click Limit</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-slate-600">
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
                  {maxClicksStatus.reached && (
                    <p className="text-red-600 text-sm">Maximum clicks reached</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-slate-200">
        <EditLinkForm slug={resolvedParams.slug} />
      </div>
    </div>
  );
}

