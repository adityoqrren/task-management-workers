import { createClient } from 'redis';

export const redis = createClient({
  socket: {
    host: process.env.REDIS_SERVER,
    port: process.env.REDIS_PORT,
  },
});

redis.on('error', (err) => {
  console.error('Redis error', err);
});

await redis.connect();
