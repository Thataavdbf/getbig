import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Environment variable checks
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not defined');
  process.exit(1);
}

// Connection pool with error handling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

// Test connection immediately
pool.query('SELECT 1')
  .then(() => console.log('Database connected'))
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });

// Export database interface
export const db = drizzle(pool, { schema });