import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './services/auth.js'; // <--- DIRECT IMPORT FIXES THE ISSUE

export interface DecodedToken {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
      userId?: string;
      userRole?: string;
    }
  }
}

/**
 * Middleware to verify JWT token
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.slice(7);
    
    // Now we call the imported function directly
    const decoded = verifyToken(token);

    req.user = decoded;
    req.userId = decoded.userId;
    req.userRole = decoded.role;

    next();
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
}

/**
 * Middleware to check user role
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}

/**
 * Error handling middleware
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  console.error('Error:', err);

  if (err.code === '23505') {
    res.status(409).json({ error: 'Resource already exists' });
    return;
  }

  if (err.code === '23503') {
    res.status(400).json({ error: 'Invalid foreign key reference' });
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({ error: message });
}

/**
 * 404 handler
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: 'Route not found' });
}