import 'reflect-metadata';
import dotenv from 'dotenv';
import { createApp } from './app';
import { initializeDatabase } from './config/database';
import { Sweet, SweetCategory } from './entities/Sweet';
import { sweetsData } from './seed';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

/**
 * Auto-seed the database if empty
 */
const autoSeed = async (dataSource: any): Promise<void> => {
  const sweetRepo = dataSource.getRepository(Sweet);
  const count = await sweetRepo.count();
  
  if (count === 0) {
    console.log('🌱 Database is empty, seeding with sample data...');
    for (const sweetData of sweetsData) {
      const sweet = sweetRepo.create(sweetData);
      await sweetRepo.save(sweet);
      console.log(`  Added: ${sweet.name}`);
    }
    console.log(`✅ Seeded ${sweetsData.length} sweets!`);
  } else {
    console.log(`📦 Database has ${count} sweets`);
  }
};

/**
 * Start the server
 */
const startServer = async (): Promise<void> => {
  try {
    // Initialize database
    console.log('Initializing database...');
    const dataSource = await initializeDatabase(false);

    // Auto-seed if empty
    await autoSeed(dataSource);

    // Create and configure app
    const app = await createApp(dataSource);

    // Start listening
    app.listen(PORT, () => {
      console.log(`🍬 Sweet Shop API is running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
