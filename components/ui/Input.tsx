import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, required, ...props }, ref) => {
    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold mb-2 text-slate-700"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-3
            border-2 rounded-xl
            text-slate-900 placeholder:text-slate-400
            bg-white
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            focus:scale-[1.01] transition-all duration-200
            ${error ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 hover:border-slate-300'}
            ${className}
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          aria-required={required}
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

