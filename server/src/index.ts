import mongoose from 'mongoose';
import { createApp } from './app.js';

const DEFAULT_PORT = 4000;
const DB_CONNECT_TIMEOUT_MS = 5000;

const port = Number(process.env.PORT) || DEFAULT_PORT;
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('MONGODB_URI is not set. Copy .env.example to .env and add your connection string.');
  process.exit(1);
}

try {
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: DB_CONNECT_TIMEOUT_MS });
} catch (error) {
  console.error('Could not connect to MongoDB. Check MONGODB_URI and your Atlas IP access list.');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

const server = createApp().listen(port, (error) => {
  if (error) {
    console.error(`Could not start the server on port ${port}:`, error.message);
    process.exit(1);
  }
  console.log(`API listening on http://localhost:${port}`);
});

function shutdown() {
  server.close(async () => {
    await mongoose.disconnect();
    process.exit(0);
  });
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
