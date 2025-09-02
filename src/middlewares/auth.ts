import type { Request, Response, NextFunction } from 'express';
import { getAuth } from '../config/firebase.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string | undefined;
    name?: string | undefined;
    picture?: string | undefined;
    email_verified?: boolean | undefined;
    customClaims?: Record<string, any> | undefined;
  };
}

export const verifyFirebaseToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authorization header missing or invalid format',
        error: 'MISSING_AUTH_HEADER',
      });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];

    if (!idToken) {
      res.status(401).json({
        success: false,
        message: 'ID token missing',
        error: 'MISSING_ID_TOKEN',
      });
      return;
    }

    // Verify the ID token
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(idToken);

    // Attach user information to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || undefined,
      name: decodedToken.name || undefined,
      picture: decodedToken.picture || undefined,
      email_verified: decodedToken.email_verified || undefined,
      customClaims: decodedToken.customClaims || undefined,
    };

    next();
  } catch (error) {
    console.error('Firebase token verification error:', error);

    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: 'INVALID_TOKEN',
    });
  }
};

export const requireAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED',
      });
      return;
    }

    // Check if user has admin role in custom claims
    const isAdmin =
      req.user.customClaims?.isAdmin === true || req.user.customClaims?.role === 'admin';

    if (!isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Admin access required',
        error: 'INSUFFICIENT_PERMISSIONS',
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Admin verification error:', error);

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR',
    });
  }
};

export const requireEmployer = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED',
      });
      return;
    }

    // Check if user has employer role in custom claims
    const isEmployer =
      req.user.customClaims?.isEmployer === true ||
      req.user.customClaims?.role === 'employer' ||
      req.user.customClaims?.role === 'admin';

    if (!isEmployer) {
      res.status(403).json({
        success: false,
        message: 'Employer access required',
        error: 'INSUFFICIENT_PERMISSIONS',
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Employer verification error:', error);

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR',
    });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No auth header, continue without user
      next();
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];

    if (!idToken) {
      // No token, continue without user
      next();
      return;
    }

    // Try to verify the token, but don't fail if invalid
    try {
      const auth = getAuth();
      const decodedToken = await auth.verifyIdToken(idToken);

      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || undefined,
        name: decodedToken.name || undefined,
        picture: decodedToken.picture || undefined,
        email_verified: decodedToken.email_verified || undefined,
        customClaims: decodedToken.customClaims || undefined,
      };
    } catch (error) {
      // Token is invalid, but we continue without user
      console.warn('Optional auth token verification failed:', error);
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
};
