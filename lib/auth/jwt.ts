import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { getServerEnv } from '../env.server';
import { JWTPayload } from '@/types/auth';
import { isValidJWTPayload } from '@/lib/utils/type-guards';

/**
 * Generate JWT token
 */
export function generateToken(payload: JWTPayload): string {
  const env = getServerEnv();
  const secret = String(env.JWT_SECRET);
  const expiresIn = env.JWT_EXPIRES_IN;
  return jwt.sign(payload, secret, {
    expiresIn,
  } as jwt.SignOptions);
}

/**
 * Verify JWT token (async for caching support)
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    // Check cache first
    const { getCachedToken, setCachedToken } = await import('./token-cache');
    const cached = await getCachedToken(token);
    if (cached) {
      // Validate role from cache using type guard
      const role = cached.role === 'ADMIN' || cached.role === 'USER' 
        ? cached.role as JWTPayload['role']
        : 'USER'; // Default to USER if invalid
      
      return {
        userId: cached.userId,
        username: cached.username,
        role,
      };
    }

    // If not in cache, verify with JWT
    const env = getServerEnv();
    const secret = String(env.JWT_SECRET);
    const decoded = jwt.verify(token, secret);
    
    // Use type guard to validate decoded payload
    if (!isValidJWTPayload(decoded)) {
      return null;
    }
    
    // Cache the verified token
    await setCachedToken(token, decoded);
    
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from request headers
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

/**
 * Get authenticated user from request (async)
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<JWTPayload | null> {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return await verifyToken(token);
}

