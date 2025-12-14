import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Sweet } from '../entities/Sweet';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

/**
 * Database configuration for the Sweet Shop application.
 * Uses SQLite for persistent storage.
 */

// Production/Development database
export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: process.env.DATABASE_PATH || path.join(__dirname, '../../data/sweetshop.db'),
  entities: [User, Sweet],
  synchronize: true, // Auto-sync schema (disable in production)
  logging: process.env.NODE_ENV === 'development',
});

// Test database (separate file for isolation)
export const TestDataSource = new DataSource({
  type: 'sqlite',
  database: ':memory:', // Use in-memory for tests only (faster)
  entities: [User, Sweet],
  synchronize: true,
  logging: false,
});

/**
 * Initialize the database connection
 * @param isTest - Whether to use test database
 */
export const initializeDatabase = async (isTest: boolean = false): Promise<DataSource> => {
  const dataSource = isTest ? TestDataSource : AppDataSource;
  
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
    console.log(`Database initialized (${isTest ? 'test' : 'production'} mode)`);
  }
  
  return dataSource;
};

/**
 * Close the database connection
 */
export const closeDatabase = async (isTest: boolean = false): Promise<void> => {
  const dataSource = isTest ? TestDataSource : AppDataSource;
  
  if (dataSource.isInitialized) {
    await dataSource.destroy();
    console.log('Database connection closed');
  }
};
