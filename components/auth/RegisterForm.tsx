'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/store/auth';
import { toast } from 'react-hot-toast';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FormError } from '@/components/ui/FormError';
import { PasswordStrength } from '@/components/ui/PasswordStrength';
import { extractAxiosError } from '@/lib/utils/error-utils';

export function RegisterForm() {
  const register = useAuthStore((state) => state.register);
  const router = useRouter();

  const {
    register: registerField,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await register(data.username, data.email, data.password);
      toast.success('Registration successful!');
      router.push('/dashboard');
    } catch (error) {
      const errorMessage = extractAxiosError(error);
      
      if (errorMessage.toLowerCase().includes('username')) {
        setError('username', { message: 'Username already taken' });
      } else if (errorMessage.toLowerCase().includes('email')) {
        setError('email', { message: 'Email already registered' });
      } else {
        setError('root', { message: errorMessage });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormError message={errors.root?.message} />

      <Input
        label="Username"
        type="text"
        autoComplete="username"
        required
        minLength={3}
        maxLength={30}
        error={errors.username?.message}
        helperText="3-30 characters, letters, numbers, hyphens, and underscores only"
        {...registerField('username')}
      />

      <Input
        label="Email"
        type="email"
        autoComplete="email"
        required
        error={errors.email?.message}
        {...registerField('email')}
      />

      <div>
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          error={errors.password?.message}
          {...registerField('password')}
        />
        <PasswordStrength password={password || ''} />
      </div>

      <Input
        label="Confirm Password"
        type="password"
        autoComplete="new-password"
        required
        minLength={6}
        error={errors.confirmPassword?.message}
        {...registerField('confirmPassword')}
      />

      <Button
        type="submit"
        isLoading={isSubmitting}
        disabled={isSubmitting}
        className="w-full"
      >
        Register
      </Button>
    </form>
  );
}

