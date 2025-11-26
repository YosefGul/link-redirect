'use client';

import { use, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormError } from '@/components/ui/FormError';
import { toast } from 'react-hot-toast';
import { extractAxiosError } from '@/lib/utils/error-utils';

export default function PasswordVerifyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`/api/links/${resolvedParams.slug}/verify`, {
        password,
      });

      if (response.data.success) {
        toast.success('Password verified! Redirecting...');
        
        // Redirect to the link (which will now work because cookie is set)
        setTimeout(() => {
          router.push(`/${resolvedParams.slug}`);
        }, 500);
      }
    } catch (error) {
      const errorMessage = extractAxiosError(error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Password Protected Link
          </h1>
          <p className="text-slate-600">
            This link is password protected. Please enter the password to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormError message={error || undefined} />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
            autoFocus
            disabled={isLoading}
          />

          <Button
            type="submit"
            isLoading={isLoading}
            disabled={isLoading || !password}
            className="w-full"
          >
            Verify & Continue
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.back()}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}


