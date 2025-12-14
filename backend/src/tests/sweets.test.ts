import request from 'supertest';
import { Express } from 'express';
import { createApp } from '../app';
import { testDataSource } from './setup';
import { User, UserRole } from '../entities/User';
import { Sweet, SweetCategory } from '../entities/Sweet';

/**
 * Sweets API Tests
 * Following TDD approach - tests written before implementation
 */
describe('Sweets API', () => {
  let app: Express;
  let userToken: string;
  let adminToken: string;

  beforeAll(async () => {
    app = await createApp(testDataSource);
  });

  beforeEach(async () => {
    // Create regular user and get token
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'user@example.com',
        username: 'regularuser',
        password: 'Password123!',
      });
    userToken = userResponse.body.data.token;

    // Create admin user
    const userRepo = testDataSource.getRepository(User);
    const adminUser = userRepo.create({
      email: 'admin@example.com',
      username: 'adminuser',
      password: 'Password123!',
      role: UserRole.ADMIN,
    });
    await userRepo.save(adminUser);

    // Login as admin
    const adminResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'Password123!',
      });
    adminToken = adminResponse.body.data.token;
  });

  describe('POST /api/sweets', () => {
    const sweetData = {
      name: 'Chocolate Truffle',
      description: 'Rich dark chocolate truffle',
      category: SweetCategory.CHOCOLATE,
      price: 5.99,
      quantity: 100,
    };

    it('should create a new sweet when authenticated', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send(sweetData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(sweetData.name);
      expect(response.body.data.price).toBe(sweetData.price);
      expect(response.body.data.id).toBeDefined();
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .send(sweetData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid price', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...sweetData, price: -5 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with missing name', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...sweetData, name: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/sweets', () => {
    beforeEach(async () => {
      // Create some sweets
      const sweetRepo = testDataSource.getRepository(Sweet);
      await sweetRepo.save([
        {
          name: 'Chocolate Bar',
          category: SweetCategory.CHOCOLATE,
          price: 3.99,
          quantity: 50,
        },
        {
          name: 'Gummy Bears',
          category: SweetCategory.CANDY,
          price: 2.49,
          quantity: 100,
        },
        {
          name: 'Chocolate Cake',
          category: SweetCategory.CAKE,
          price: 25.99,
          quantity: 10,
        },
      ]);
    });

    it('should return all sweets when authenticated', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/sweets/search', () => {
    beforeEach(async () => {
      const sweetRepo = testDataSource.getRepository(Sweet);
      await sweetRepo.save([
        {
          name: 'Dark Chocolate',
          category: SweetCategory.CHOCOLATE,
          price: 5.99,
          quantity: 50,
        },
        {
          name: 'Milk Chocolate',
          category: SweetCategory.CHOCOLATE,
          price: 4.99,
          quantity: 30,
        },
        {
          name: 'Gummy Worms',
          category: SweetCategory.CANDY,
          price: 1.99,
          quantity: 200,
        },
        {
          name: 'Vanilla Cookie',
          category: SweetCategory.COOKIE,
          price: 2.49,
          quantity: 75,
        },
      ]);
    });

    it('should search by name', async () => {
      const response = await request(app)
        .get('/api/sweets/search?name=chocolate')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter by category', async () => {
      const response = await request(app)
        .get(`/api/sweets/search?category=${SweetCategory.CANDY}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Gummy Worms');
    });

    it('should filter by price range', async () => {
      const response = await request(app)
        .get('/api/sweets/search?minPrice=2&maxPrice=5')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2); // Milk Chocolate and Vanilla Cookie
    });

    it('should combine filters', async () => {
      const response = await request(app)
        .get(`/api/sweets/search?category=${SweetCategory.CHOCOLATE}&maxPrice=5`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Milk Chocolate');
    });
  });

  describe('GET /api/sweets/:id', () => {
    let sweetId: string;

    beforeEach(async () => {
      const sweetRepo = testDataSource.getRepository(Sweet);
      const sweet = await sweetRepo.save({
        name: 'Test Sweet',
        category: SweetCategory.CANDY,
        price: 1.99,
        quantity: 10,
      });
      sweetId = sweet.id;
    });

    it('should return a sweet by id', async () => {
      const response = await request(app)
        .get(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(sweetId);
      expect(response.body.data.name).toBe('Test Sweet');
    });

    it('should return 404 for non-existent sweet', async () => {
      const response = await request(app)
        .get('/api/sweets/non-existent-id')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/sweets/:id', () => {
    let sweetId: string;

    beforeEach(async () => {
      const sweetRepo = testDataSource.getRepository(Sweet);
      const sweet = await sweetRepo.save({
        name: 'Original Sweet',
        category: SweetCategory.CANDY,
        price: 1.99,
        quantity: 10,
      });
      sweetId = sweet.id;
    });

    it('should update a sweet', async () => {
      const response = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Updated Sweet',
          price: 2.99,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Sweet');
      expect(response.body.data.price).toBe(2.99);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .send({ name: 'Updated Sweet' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/sweets/:id', () => {
    let sweetId: string;

    beforeEach(async () => {
      const sweetRepo = testDataSource.getRepository(Sweet);
      const sweet = await sweetRepo.save({
        name: 'Sweet to Delete',
        category: SweetCategory.CANDY,
        price: 1.99,
        quantity: 10,
      });
      sweetId = sweet.id;
    });

    it('should delete a sweet as admin', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify deletion
      const checkResponse = await request(app)
        .get(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should fail for non-admin users', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
