import { Router, Response } from 'express';
import { validationResult } from 'express-validator';
import { DataSource } from 'typeorm';
import { AuthService } from '../services/AuthService';
import { registerValidation, loginValidation } from '../middleware/validators';
import { createAuthMiddleware, AuthRequest } from '../middleware/auth';

/**
 * Create authentication routes
 * @param dataSource - TypeORM DataSource
 * @returns Express Router
 */
export const createAuthRoutes = (dataSource: DataSource): Router => {
  const router = Router();
  const authService = new AuthService(dataSource);
  const authMiddleware = createAuthMiddleware(dataSource);

  /**
   * POST /api/auth/register
   * Register a new user
   */
  router.post('/register', registerValidation, async (req: AuthRequest, res: Response) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array(),
        });
        return;
      }

      const { email, username, password } = req.body;
      const result = await authService.register({ email, username, password });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      const statusCode = message.includes('already exists') ? 409 : 500;
      
      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  });

  /**
   * POST /api/auth/login
   * Login a user
   */
  router.post('/login', loginValidation, async (req: AuthRequest, res: Response) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array(),
        });
        return;
      }

      const { email, password } = req.body;
      const result = await authService.login({ email, password });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      
      res.status(401).json({
        success: false,
        message,
      });
    }
  });

  /**
   * GET /api/auth/me
   * Get current user profile
   */
  router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Not authenticated',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: req.user.toJSON(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get user profile',
      });
    }
  });

  return router;
};
