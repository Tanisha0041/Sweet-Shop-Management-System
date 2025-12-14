import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Sweet } from '../entities/Sweet';

// Test database instance
export let testDataSource: DataSource;

/**
 * Setup test database before all tests
 */
beforeAll(async () => {
  testDataSource = new DataSource({
    type: 'sqlite',
    database: ':memory:',
    entities: [User, Sweet],
    synchronize: true,
    logging: false,
  });
  
  await testDataSource.initialize();
});

/**
 * Clean up database after each test
 */
afterEach(async () => {
  if (testDataSource && testDataSource.isInitialized) {
    // Clear all tables
    const entities = testDataSource.entityMetadatas;
    for (const entity of entities) {
      const repository = testDataSource.getRepository(entity.name);
      await repository.clear();
    }
  }
});

/**
 * Close database connection after all tests
 */
afterAll(async () => {
  if (testDataSource && testDataSource.isInitialized) {
    await testDataSource.destroy();
  }
});
