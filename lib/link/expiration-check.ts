export interface ExpirationStatus {
  isExpired: boolean;
  expiresAt: Date | null;
  message?: string;
  daysUntilExpiration?: number;
}

/**
 * Check if a link is expired
 */
export function checkLinkExpiration(expiresAt: Date | null): ExpirationStatus {
  if (!expiresAt) {
    return {
      isExpired: false,
      expiresAt: null,
    };
  }

  const now = new Date();
  const expirationDate = new Date(expiresAt);
  
  // Compare in UTC to avoid timezone issues
  const nowUTC = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  const expiresUTC = new Date(expirationDate.getTime() + expirationDate.getTimezoneOffset() * 60000);

  const isExpired = nowUTC >= expiresUTC;
  
  if (isExpired) {
    return {
      isExpired: true,
      expiresAt: expirationDate,
      message: 'This link has expired',
    };
  }

  // Calculate days until expiration
  const diffTime = expiresUTC.getTime() - nowUTC.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let message = '';
  if (diffDays === 1) {
    message = 'This link expires in 1 day';
  } else if (diffDays <= 7) {
    message = `This link expires in ${diffDays} days`;
  } else {
    message = `This link expires on ${expirationDate.toLocaleDateString()}`;
  }

  return {
    isExpired: false,
    expiresAt: expirationDate,
    message,
    daysUntilExpiration: diffDays,
  };
}

/**
 * Check if link is expiring soon (within 7 days)
 */
export function isExpiringSoon(expiresAt: Date | null, thresholdDays: number = 7): boolean {
  if (!expiresAt) {
    return false;
  }

  const status = checkLinkExpiration(expiresAt);
  if (status.isExpired) {
    return false;
  }

  return (status.daysUntilExpiration || 0) <= thresholdDays;
}

/**
 * Validate expiration date (must be in the future)
 */
export function validateExpirationDate(expiresAt: Date | string | null): {
  valid: boolean;
  error?: string;
} {
  if (!expiresAt) {
    return { valid: true };
  }

  const expirationDate = new Date(expiresAt);
  const now = new Date();

  if (isNaN(expirationDate.getTime())) {
    return {
      valid: false,
      error: 'Invalid expiration date format',
    };
  }

  if (expirationDate <= now) {
    return {
      valid: false,
      error: 'Expiration date must be in the future',
    };
  }

  return { valid: true };
}


