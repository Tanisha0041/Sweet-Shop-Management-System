import request from 'supertest';
import { Express } from 'express';
import { createApp } from '../app';
import { testDataSource } from './setup';
import { User, UserRole } from '../entities/User';
import { Sweet, SweetCategory } from '../entities/Sweet';

/**
 * Inventory API Tests (Purchase & Restock)
 * Following TDD approach - tests written before implementation
 */
describe('Inventory API', () => {
  let app: Express;
  let userToken: string;
  let adminToken: string;
  let sweetId: string;

  beforeAll(async () => {
    app = await createApp(testDataSource);
  });

  beforeEach(async () => {
    // Create regular user and get token
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'buyer@example.com',
        username: 'buyeruser',
        password: 'Password123!',
      });
    userToken = userResponse.body.data.token;

    // Create admin user
    const userRepo = testDataSource.getRepository(User);
    const adminUser = userRepo.create({
      email: 'stockadmin@example.com',
      username: 'stockadmin',
      password: 'Password123!',
      role: UserRole.ADMIN,
    });
    await userRepo.save(adminUser);

    // Login as admin
    const adminResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'stockadmin@example.com',
        password: 'Password123!',
      });
    adminToken = adminResponse.body.data.token;

    // Create a sweet for inventory tests
    const sweetRepo = testDataSource.getRepository(Sweet);
    const sweet = await sweetRepo.save({
      name: 'Inventory Test Sweet',
      category: SweetCategory.CANDY,
      price: 2.99,
      quantity: 10,
    });
    sweetId = sweet.id;
  });

  describe('POST /api/sweets/:id/purchase', () => {
    it('should purchase a sweet successfully', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 2 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.quantity).toBe(8); // 10 - 2 = 8
      expect(response.body.message).toContain('purchased');
    });

    it('should purchase 1 by default if no quantity specified', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.quantity).toBe(9); // 10 - 1 = 9
    });

    it('should fail when purchasing more than available stock', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 100 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Insufficient stock');
    });

    it('should fail when sweet is out of stock', async () => {
      // Set quantity to 0
      const sweetRepo = testDataSource.getRepository(Sweet);
      await sweetRepo.update(sweetId, { quantity: 0 });

      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 1 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Insufficient stock');
    });

    it('should fail with invalid quantity', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: -5 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .send({ quantity: 1 })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail for non-existent sweet', async () => {
      const response = await request(app)
        .post('/api/sweets/non-existent-id/purchase')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 1 })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/sweets/:id/restock', () => {
    it('should restock a sweet as admin', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 50 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.quantity).toBe(60); // 10 + 50 = 60
      expect(response.body.message).toContain('restocked');
    });

    it('should fail for non-admin users', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 50 })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .send({ quantity: 50 })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid quantity', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: -10 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with zero quantity', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 0 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail for non-existent sweet', async () => {
      const response = await request(app)
        .post('/api/sweets/non-existent-id/restock')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 50 })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
