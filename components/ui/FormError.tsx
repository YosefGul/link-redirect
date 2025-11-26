interface FormErrorProps {
  message?: string;
  className?: string;
}

export function FormError({ message, className = '' }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      className={`bg-red-50 border-2 border-red-200 rounded-xl p-4 animate-slide-down ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="h-4 w-4 text-red-600"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-semibold text-red-800">{message}</p>
        </div>
      </div>
    </div>
  );
}

