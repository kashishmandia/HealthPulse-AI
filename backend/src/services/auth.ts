import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { config } from '../config.js';
import { queryDatabase, queryDatabaseSingle, executeQuery } from '../db/index.js';
import type { DecodedToken } from '../middleware.js';

// Type placeholder since we can't import from shared/types during ts-node load
type User = any;

/**
 * Authentication Service
 * Handles user registration, login, token generation, and verification
 */

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Compare password with hash
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT token
 */
export function generateToken(userId: string, email: string, role: string): string {
  return jwt.sign(
    { userId, email, role },
    config.JWT_SECRET as string,
    { expiresIn: config.JWT_EXPIRES_IN as string } as any
  );
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): DecodedToken {
  try {
    return jwt.verify(token, config.JWT_SECRET) as DecodedToken;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Register a new patient
 */
export async function registerPatient(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  dateOfBirth: Date
): Promise<{ user: Partial<User>; token: string }> {
  const userId = uuid();
  const passwordHash = await hashPassword(password);

  try {
    // Insert user
    await executeQuery('users', 'insert', {
      id: userId,
      email,
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      role: 'PATIENT',
    });

    // Insert patient details
    await executeQuery('patients', 'insert', {
      user_id: userId,
      date_of_birth: dateOfBirth,
    });

    const token = generateToken(userId, email, 'PATIENT');

    return {
      user: {
        id: userId,
        email,
        firstName,
        lastName,
        role: 'PATIENT',
      },
      token,
    };
  } catch (error: any) {
    if (error.message?.includes('duplicate')) {
      throw new Error('Email already exists');
    }
    throw error;
  }
}

/**
 * Register a new provider
 */
export async function registerProvider(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  licenseNumber: string,
  specialization: string,
  hospital?: string
): Promise<{ user: Partial<User>; token: string }> {
  const userId = uuid();
  const passwordHash = await hashPassword(password);

  try {
    // Insert user
    await executeQuery('users', 'insert', {
      id: userId,
      email,
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      role: 'PROVIDER',
    });

    // Insert provider details
    await executeQuery('providers', 'insert', {
      user_id: userId,
      license_number: licenseNumber,
      specialization,
      hospital: hospital || null,
    });

    const token = generateToken(userId, email, 'PROVIDER');

    return {
      user: {
        id: userId,
        email,
        firstName,
        lastName,
        role: 'PROVIDER',
      },
      token,
    };
  } catch (error: any) {
    if (error.message?.includes('duplicate')) {
      throw new Error('Email already exists');
    }
    throw error;
  }
}

/**
 * Login user
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ user: Partial<User>; token: string }> {
  const user = await queryDatabaseSingle<any>('users', {
    match: { email },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  const token = generateToken(user.id, user.email, user.role);

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
    },
    token,
  };
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<Partial<User> | null> {
  const user = await queryDatabaseSingle<any>('users', {
    match: { id: userId },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}
