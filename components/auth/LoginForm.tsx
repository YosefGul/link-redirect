'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/store/auth';
import { toast } from 'react-hot-toast';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FormError } from '@/components/ui/FormError';
import { extractAxiosError, isErrorStatus } from '@/lib/utils/error-utils';

export function LoginForm() {
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error) {
      const errorMessage = extractAxiosError(error);
      
      if (isErrorStatus(error, 401)) {
        setError('root', { message: 'Invalid email or password' });
      } else {
        setError('root', { message: errorMessage });
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      noValidate
      aria-label="Login form"
    >
      <FormError message={errors.root?.message} />
      
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        required
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        required
        error={errors.password?.message}
        {...register('password')}
      />

      <Button
        type="submit"
        isLoading={isSubmitting}
        disabled={isSubmitting}
        className="w-full"
        aria-label="Submit login form"
      >
        Login
      </Button>
    </form>
  );
}

