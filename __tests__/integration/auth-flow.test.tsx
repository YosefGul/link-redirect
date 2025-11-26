import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuthStore } from '@/store/auth';
import { renderWithProviders } from '../utils/test-utils';

jest.mock('@/store/auth');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('Authentication Flow', () => {
  const mockLogin = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      login: mockLogin,
    });

    // Mock router push
    jest.mock('next/navigation', () => ({
      useRouter: () => ({
        push: mockPush,
      }),
    }));
  });

  it('should complete login flow successfully', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue(undefined);

    renderWithProviders(<LoginForm />);

    // Fill in form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');

    // Submit form
    await user.click(screen.getByRole('button', { name: /login/i }));

    // Verify login was called
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should handle login errors', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValue({
      response: {
        status: 401,
        data: { error: 'Invalid credentials' },
      },
    });

    renderWithProviders(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });
});

