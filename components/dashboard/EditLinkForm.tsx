'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLink } from '@/hooks/useLink';
import { useUpdateLink } from '@/hooks/useUpdateLink';
import { toast } from 'react-hot-toast';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormError } from '@/components/ui/FormError';
import { CopyButton } from '@/components/dashboard/CopyButton';
import { updateLinkSchema, type UpdateLinkFormData } from '@/lib/validations/link';
import { checkLinkExpiration } from '@/lib/link/expiration-check';
import { isPasswordProtected } from '@/lib/link/password';
import { checkMaxClicks } from '@/lib/link/service';
import { UpdateLinkRequest } from '@/types/link';
import { extractAxiosError } from '@/lib/utils/error-utils';

export function EditLinkForm({ slug }: { slug: string }) {
  const { data: link, isLoading: isLoadingLink, error } = useLink(slug);
  const updateMutation = useUpdateLink(slug);
  const router = useRouter();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<UpdateLinkFormData>({
    resolver: zodResolver(updateLinkSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (error) {
      toast.error('Failed to load link');
      router.push('/dashboard');
    }
  }, [error, router]);

  useEffect(() => {
    if (link) {
      // Format expiration date for datetime-local input
      const expiresAt = link.expiresAt 
        ? new Date(link.expiresAt).toISOString().slice(0, 16)
        : null;

      reset({
        targetUrl: link.targetUrl,
        isActive: link.isActive,
        expiresAt: expiresAt || null,
        password: null,
        maxClicks: link.maxClicks || null,
      });
    }
  }, [link, reset]);

  const onSubmit = async (data: UpdateLinkFormData) => {
    try {
      // Map form data to UpdateLinkRequest type
      const updateData: UpdateLinkRequest = {
        targetUrl: data.targetUrl,
        isActive: data.isActive,
      };

      // Only include expiration if it's being changed
      if (data.expiresAt !== undefined) {
        updateData.expiresAt = data.expiresAt || null;
      }

      // Only include password if it's being changed
      if (changePassword) {
        updateData.password = data.password || null;
      }

      // Only include maxClicks if it's being changed
      if (data.maxClicks !== undefined) {
        updateData.maxClicks = data.maxClicks || null;
      }

      await updateMutation.mutateAsync(updateData);
      toast.success('Link updated successfully!');
      router.push('/dashboard');
    } catch (error) {
      const errorMessage = extractAxiosError(error);
      setError('root', { message: errorMessage });
    }
  };

  const isLoading = isSubmitting || updateMutation.isPending;
  
  const expirationStatus = link ? checkLinkExpiration(link.expiresAt || null) : null;
  const maxClicksStatus = link ? checkMaxClicks({ ...link, maxClicks: link.maxClicks || null }) : null;
  const hasPassword = link ? isPasswordProtected(link.passwordHash || null) : false;

  if (isLoadingLink) {
    return <SkeletonLoader count={3} />;
  }

  if (!link) {
    return null;
  }

  const shortUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/${slug}`
    : `/${slug}`;

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600 mb-1">Short URL:</p>
        <div className="flex items-center gap-2">
          <code className="text-lg font-mono flex-1">{shortUrl}</code>
          <CopyButton text={shortUrl} />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormError message={errors.root?.message} />

        <Input
          label="Target URL"
          type="url"
          required
          autoComplete="url"
          error={errors.targetUrl?.message}
          {...register('targetUrl')}
        />

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register('isActive')}
              className="rounded"
              aria-label="Link active status"
            />
            <span className="text-sm font-medium">Active</span>
          </label>
          <p className="mt-1 text-sm text-gray-500">
            Inactive links will not redirect visitors.
          </p>
        </div>

        {/* Security Status */}
        {link && (
          <div className="bg-slate-50 p-4 rounded-lg space-y-2">
            <h3 className="text-sm font-semibold text-slate-900">Security Status</h3>
            {expirationStatus && (
              <p className="text-sm text-slate-600">
                {expirationStatus.isExpired ? (
                  <span className="text-red-600">Expired</span>
                ) : expirationStatus.expiresAt ? (
                  <span>Expires: {new Date(expirationStatus.expiresAt).toLocaleString()}</span>
                ) : (
                  <span className="text-green-600">No expiration</span>
                )}
              </p>
            )}
            {hasPassword && (
              <p className="text-sm text-slate-600">
                <span className="text-blue-600">Password protected</span>
              </p>
            )}
            {maxClicksStatus && maxClicksStatus.remaining !== null && (
              <p className="text-sm text-slate-600">
                Clicks: {Number(link.hits)} / {link.maxClicks} 
                {maxClicksStatus.reached && <span className="text-red-600 ml-2">(Limit reached)</span>}
              </p>
            )}
          </div>
        )}

        {/* Advanced Options */}
        <div className="border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            <span>{showAdvanced ? '▼' : '▶'}</span>
            Advanced Options
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4 pl-6">
              <Input
                label="Expiration Date"
                type="datetime-local"
                error={errors.expiresAt?.message}
                helperText="Leave empty to remove expiration. Must be in the future."
                {...register('expiresAt')}
              />

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={changePassword}
                    onChange={(e) => setChangePassword(e.target.checked)}
                    className="rounded"
                  />
                  <label className="text-sm font-medium">Change Password</label>
                </div>
                {changePassword && (
                  <>
                    <Input
                      label="New Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Leave empty to remove password protection"
                      error={errors.password?.message}
                      helperText="Leave empty to remove password protection"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-xs text-slate-500 mt-1"
                    >
                      {showPassword ? 'Hide' : 'Show'} password
                    </button>
                  </>
                )}
                {!changePassword && hasPassword && (
                  <p className="text-xs text-slate-500">Password is set. Check &quot;Change Password&quot; to update or remove it.</p>
                )}
              </div>

              <Input
                label="Maximum Clicks"
                type="number"
                placeholder="Leave empty for unlimited"
                error={errors.maxClicks?.message}
                helperText="Leave empty to remove limit"
                min={1}
                {...register('maxClicks', { valueAsNumber: true })}
              />
            </div>
          )}
        </div>

        <div className="flex space-x-4">
          <Button
            type="submit"
            disabled={isLoading || !link.allowEdit}
            isLoading={isLoading}
          >
            Update Link
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>

        {!link.allowEdit && (
          <p className="text-sm text-yellow-600" role="alert">
            Editing is disabled for this link.
          </p>
        )}
      </form>
    </div>
  );
}

