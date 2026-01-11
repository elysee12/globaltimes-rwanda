import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env file
config({ path: resolve(__dirname, '.env') });

export default {
  // Configuration file for Prisma CLI
  // Environment variables are loaded from .env file above
};
