'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateLink } from '@/hooks/useCreateLink';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormError } from '@/components/ui/FormError';
import { createLinkSchema, type CreateLinkFormData } from '@/lib/validations/link';
import { useState } from 'react';
import { extractAxiosError } from '@/lib/utils/error-utils';

export function CreateLinkForm() {
  const router = useRouter();
  const createMutation = useCreateLink();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CreateLinkFormData>({
    resolver: zodResolver(createLinkSchema),
    mode: 'onChange',
    defaultValues: {
      targetUrl: '',
      slug: '',
      expiresAt: '',
      password: '',
      maxClicks: undefined,
    },
  });

  const onSubmit = async (data: CreateLinkFormData) => {
    try {
      await createMutation.mutateAsync({
        targetUrl: data.targetUrl,
        slug: data.slug || undefined,
        expiresAt: data.expiresAt || undefined,
        password: data.password || undefined,
        maxClicks: data.maxClicks,
      });
      toast.success('Link created successfully!');
      router.push('/dashboard');
    } catch (error) {
      const errorMessage = extractAxiosError(error);
      
      if (errorMessage.toLowerCase().includes('slug')) {
        setError('slug', { message: 'This slug is already taken' });
      } else {
        setError('root', { message: errorMessage });
      }
    }
  };

  const isLoading = isSubmitting || createMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormError message={errors.root?.message} />

      <Input
        label="Target URL"
        type="url"
        placeholder="https://example.com"
        required
        autoComplete="url"
        error={errors.targetUrl?.message}
        {...register('targetUrl')}
      />

      <Input
        label="Custom Slug (optional)"
        type="text"
        placeholder="Leave empty for auto-generated"
        error={errors.slug?.message}
        helperText="Only letters, numbers, hyphens, and underscores. 3-64 characters."
        {...register('slug')}
      />

      {/* Advanced Options */}
      <div className="border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          <span>{showAdvanced ? '▼' : '▶'}</span>
          Advanced Options (Optional)
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4 pl-6">
            <Input
              label="Expiration Date (optional)"
              type="datetime-local"
              error={errors.expiresAt?.message}
              helperText="Link will expire after this date"
              {...register('expiresAt')}
            />

            <div>
              <Input
                label="Password Protection (optional)"
                type={showPassword ? 'text' : 'password'}
                placeholder="Leave empty for no password"
                error={errors.password?.message}
                helperText="Protect link with a password"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-slate-500 mt-1"
              >
                {showPassword ? 'Hide' : 'Show'} password
              </button>
            </div>

            <Input
              label="Maximum Clicks (optional)"
              type="number"
              placeholder="Leave empty for unlimited"
              error={errors.maxClicks?.message}
              helperText="Link will stop working after this many clicks"
              min={1}
              {...register('maxClicks', { valueAsNumber: true })}
            />
          </div>
        )}
      </div>

      <div className="flex space-x-4">
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Create Link
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

