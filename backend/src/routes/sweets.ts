import { Router, Response } from 'express';
import { validationResult } from 'express-validator';
import { DataSource } from 'typeorm';
import { SweetService } from '../services/SweetService';
import { Sweet, SweetCategory } from '../entities/Sweet';
import { createAuthMiddleware, adminOnly, AuthRequest } from '../middleware/auth';
import { sweetsData } from '../seed';
import {
  createSweetValidation,
  updateSweetValidation,
  searchSweetValidation,
  purchaseValidation,
  restockValidation,
} from '../middleware/validators';

/**
 * Create sweet routes
 * @param dataSource - TypeORM DataSource
 * @returns Express Router
 */
export const createSweetRoutes = (dataSource: DataSource): Router => {
  const router = Router();
  const sweetService = new SweetService(dataSource);
  const authMiddleware = createAuthMiddleware(dataSource);

  // All sweet routes require authentication
  router.use(authMiddleware);

  /**
   * POST /api/sweets
   * Create a new sweet
   */
  router.post('/', createSweetValidation, async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array(),
        });
        return;
      }

      const sweet = await sweetService.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Sweet created successfully',
        data: sweet,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create sweet',
      });
    }
  });

  /**
   * GET /api/sweets
   * Get all sweets
   */
  router.get('/', async (req: AuthRequest, res: Response) => {
    try {
      const sweets = await sweetService.findAll();

      res.status(200).json({
        success: true,
        data: sweets,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sweets',
      });
    }
  });

  /**
   * POST /api/sweets/reseed
   * Clear and reseed database with sample data
   */
  router.post('/reseed', async (req: AuthRequest, res: Response) => {
    try {
      const sweetRepo = dataSource.getRepository(Sweet);
      
      // Clear all sweets
      await sweetRepo.clear();
      
      // Add sample sweets
      for (const sweetData of sweetsData) {
        const sweet = sweetRepo.create(sweetData);
        await sweetRepo.save(sweet);
      }

      const sweets = await sweetRepo.find();

      res.status(200).json({
        success: true,
        message: `Database reseeded with ${sweets.length} sweets`,
        data: sweets,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to reseed database',
      });
    }
  });

  /**
   * GET /api/sweets/search
   * Search sweets with filters
   */
  router.get('/search', searchSweetValidation, async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array(),
        });
        return;
      }

      const { name, category, minPrice, maxPrice } = req.query;

      const sweets = await sweetService.search({
        name: name as string | undefined,
        category: category as SweetCategory | undefined,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      });

      res.status(200).json({
        success: true,
        data: sweets,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to search sweets',
      });
    }
  });

  /**
   * GET /api/sweets/:id
   * Get a sweet by ID
   */
  router.get('/:id', async (req: AuthRequest, res: Response) => {
    try {
      const sweet = await sweetService.findById(req.params.id);

      if (!sweet) {
        res.status(404).json({
          success: false,
          message: 'Sweet not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: sweet,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sweet',
      });
    }
  });

  /**
   * PUT /api/sweets/:id
   * Update a sweet
   */
  router.put('/:id', updateSweetValidation, async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array(),
        });
        return;
      }

      const sweet = await sweetService.update(req.params.id, req.body);

      if (!sweet) {
        res.status(404).json({
          success: false,
          message: 'Sweet not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Sweet updated successfully',
        data: sweet,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update sweet',
      });
    }
  });

  /**
   * DELETE /api/sweets/:id
   * Delete a sweet (Admin only)
   */
  router.delete('/:id', adminOnly, async (req: AuthRequest, res: Response) => {
    try {
      const deleted = await sweetService.delete(req.params.id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Sweet not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Sweet deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete sweet',
      });
    }
  });

  /**
   * POST /api/sweets/:id/purchase
   * Purchase a sweet
   */
  router.post('/:id/purchase', purchaseValidation, async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array(),
        });
        return;
      }

      const quantity = req.body.quantity || 1;
      const sweet = await sweetService.purchase(req.params.id, quantity);

      res.status(200).json({
        success: true,
        message: `Successfully purchased ${quantity} ${sweet.name}`,
        data: sweet,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to purchase';
      const statusCode = message.includes('not found') ? 404 : 400;

      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  });

  /**
   * POST /api/sweets/:id/restock
   * Restock a sweet (Admin only)
   */
  router.post('/:id/restock', adminOnly, restockValidation, async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array(),
        });
        return;
      }

      const { quantity } = req.body;
      const sweet = await sweetService.restock(req.params.id, quantity);

      res.status(200).json({
        success: true,
        message: `Successfully restocked ${quantity} ${sweet.name}`,
        data: sweet,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to restock';
      const statusCode = message.includes('not found') ? 404 : 400;

      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  });

  return router;
};
