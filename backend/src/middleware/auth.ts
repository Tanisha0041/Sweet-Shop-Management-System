import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../entities/User';
import { DataSource } from 'typeorm';

/**
 * Extended Request interface with user data
 */
export interface AuthRequest extends Request {
  user?: User;
  userId?: string;
}

/**
 * JWT payload interface
 */
interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

/**
 * Create authentication middleware
 * @param dataSource - TypeORM DataSource
 * @returns Authentication middleware function
 */
export const createAuthMiddleware = (dataSource: DataSource) => {
  const userRepository = dataSource.getRepository(User);

  /**
   * Authentication middleware
   * Verifies JWT token and attaches user to request
   */
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get token from header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'No authentication token provided',
        });
        return;
      }

      const token = authHeader.split(' ')[1];

      // Verify token
      const secret = process.env.JWT_SECRET || 'default-secret';
      const decoded = jwt.verify(token, secret) as JwtPayload;

      // Get user from database
      const user = await userRepository.findOne({
        where: { id: decoded.userId },
      });

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      // Attach user to request
      req.user = user;
      req.userId = user.id;

      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }
  };
};

/**
 * Admin authorization middleware
 * Must be used after authentication middleware
 */
export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  if (req.user.role !== UserRole.ADMIN) {
    res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
    return;
  }

  next();
};
