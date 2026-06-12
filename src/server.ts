import { createApp } from './app';
import { connectDatabase } from './database/connection';
import { env } from './config/env';

const start = async (): Promise<void> => {
  await connectDatabase();
  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
