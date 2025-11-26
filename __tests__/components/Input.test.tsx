import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/Input';

describe('Input Component', () => {
  it('should render input with label', () => {
    render(<Input label="Test Input" />);
    expect(screen.getByLabelText(/test input/i)).toBeInTheDocument();
  });

  it('should display error message', () => {
    render(<Input label="Test Input" error="This field is required" />);
    expect(screen.getByText(/this field is required/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('should display helper text', () => {
    render(<Input label="Test Input" helperText="This is helpful" />);
    expect(screen.getByText(/this is helpful/i)).toBeInTheDocument();
  });

  it('should have proper ARIA attributes', () => {
    render(
      <Input
        label="Test Input"
        required
        error="Error message"
        id="test-input"
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAttribute('id', 'test-input');
  });

  it('should handle user input', async () => {
    const user = userEvent.setup();
    render(<Input label="Test Input" />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'test value');

    expect(input).toHaveValue('test value');
  });

  it('should show required indicator', () => {
    render(<Input label="Test Input" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });
});

