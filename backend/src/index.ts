import 'reflect-metadata';
import dotenv from 'dotenv';
import { createApp } from './app';
import { initializeDatabase } from './config/database';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

/**
 * Start the server
 */
const startServer = async (): Promise<void> => {
  try {
    // Initialize database
    console.log('Initializing database...');
    const dataSource = await initializeDatabase(false);

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
