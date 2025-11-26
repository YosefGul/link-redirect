'use client';

import Link from 'next/link';
import { useLinks } from '@/hooks/useLinks';
import { useDeleteLink } from '@/hooks/useDeleteLink';
import { toast } from 'react-hot-toast';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { extractAxiosError, isErrorStatus, getErrorStatus } from '@/lib/utils/error-utils';

export function LinkList() {
  const { data: links = [], isLoading, error } = useLinks();
  const deleteMutation = useDeleteLink();

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this link?')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(slug);
      toast.success('Link deleted successfully');
    } catch (error) {
      const errorMessage = extractAxiosError(error);
      toast.error(errorMessage);
    }
  };

  if (error) {
    const errorMessage = extractAxiosError(error);
    const status = getErrorStatus(error);
    
    // If it's a "not found" error or empty response, show empty state instead
    if (errorMessage.toLowerCase().includes('not found') || 
        errorMessage.toLowerCase().includes('link not found') ||
        status === 404) {
      return <EmptyState />;
    }
    
    // Only show error for real errors (5xx, network errors, etc.)
    if (status !== null && status >= 500) {
      return (
        <div className="text-center py-8">
          <div className="bg-red-50 border-2 border-red-300 rounded-md p-4 max-w-md mx-auto">
            <p className="text-red-900 font-medium">{errorMessage}</p>
            <p className="text-sm text-red-700 mt-2">Please try again or create a new link.</p>
          </div>
        </div>
      );
    }
    
    // For other errors, show empty state (user might not have any links yet)
    return <EmptyState />;
  }

  const getShortUrl = (slug: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/${slug}`;
    }
    return `/${slug}`;
  };

  const copyToClipboard = (slug: string) => {
    const url = getShortUrl(slug);
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  if (isLoading) {
    return <SkeletonLoader count={5} />;
  }

  if (!isLoading && links.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-slate-200">
      <table className="min-w-full">
        <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Short Link
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Target URL
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Clicks
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {links.map((link, index) => (
            <tr 
              key={link.id}
              className="hover:bg-blue-50/50 transition-all duration-200 group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <code className="text-sm font-mono font-semibold bg-gradient-to-r from-blue-100 to-purple-100 px-3 py-1.5 rounded-lg text-blue-900 group-hover:shadow-md transition-shadow">
                    {link.slug}
                  </code>
                  <button
                    onClick={() => copyToClipboard(link.slug)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all hover:scale-110"
                    title="Copy link"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </td>
              <td className="px-6 py-4 max-w-xs">
                <a
                  href={link.targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline truncate block transition-all"
                >
                  {link.targetUrl}
                </a>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="text-sm font-semibold text-slate-700">{Number(link.hits)}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    link.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full mr-2 ${link.isActive ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                  {link.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/dashboard/links/${link.slug}`}
                    className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 hover:scale-105 transition-all"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </Link>
                  <Link
                    href={`/dashboard/links/${link.slug}/stats`}
                    className="inline-flex items-center px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 hover:scale-105 transition-all"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Stats
                  </Link>
                  <button
                    onClick={() => handleDelete(link.slug)}
                    className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 hover:scale-105 transition-all"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

