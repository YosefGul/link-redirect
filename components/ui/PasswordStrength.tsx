interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const getStrength = (pwd: string): { score: number; label: string; color: string } => {
    let score = 0;
    
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { score: 2, label: 'Fair', color: 'bg-yellow-500' };
    if (score <= 4) return { score: 3, label: 'Good', color: 'bg-blue-500' };
    return { score: 4, label: 'Strong', color: 'bg-green-500' };
  };

  const strength = getStrength(password);

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-1">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${strength.color}`}
            style={{ width: `${(strength.score / 4) * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-600">{strength.label}</span>
      </div>
    </div>
  );
}

