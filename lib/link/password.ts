import { hashPassword, verifyPassword } from '@/lib/auth/password';

/**
 * Hash password for link protection
 * Reuses the same bcrypt utility as user passwords
 */
export async function hashLinkPassword(password: string): Promise<string> {
  if (!password || password.length === 0) {
    throw new Error('Password cannot be empty');
  }
  
  if (password.length < 4) {
    throw new Error('Password must be at least 4 characters');
  }
  
  return hashPassword(password);
}

/**
 * Verify password for link protection
 */
export async function verifyLinkPassword(
  password: string,
  hash: string | null
): Promise<boolean> {
  if (!hash) {
    return false;
  }
  
  if (!password || password.length === 0) {
    return false;
  }
  
  return verifyPassword(password, hash);
}

/**
 * Check if link is password protected
 */
export function isPasswordProtected(passwordHash: string | null): boolean {
  return passwordHash !== null && passwordHash.length > 0;
}


