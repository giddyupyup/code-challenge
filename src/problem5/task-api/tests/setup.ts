import { config } from 'dotenv-flow';

config({ path: '.', node_env: process.env.NODE_ENV || 'test' });

// Ensure DATABASE_URL is set for tests
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://test_user:test_password@localhost:5432/task_api_test?schema=public';
