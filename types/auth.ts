import { UserRole } from '@prisma/client';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export interface JWTPayload {
  userId: string;
  username: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

