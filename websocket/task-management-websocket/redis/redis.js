// redis.js
import { createClient } from "redis";

export const redisSubscriber = createClient({
  socket: {
    host: process.env.REDIS_SERVER,
    port: process.env.REDIS_PORT,
  },
});

redisSubscriber.on('error', (err) => {
  console.error('Redis error', err);
});

await redisSubscriber.connect();

const activeSubscriptions = new Set();

export const subscribeUserChannel = async (userId, onMessage) => {
  const channel = `notifications:user:${userId}`;

  if (activeSubscriptions.has(channel)) {
    return;
  }

  await redisSubscriber.subscribe(channel, (message) => {
    try {
      const notification = JSON.parse(message);
      const notif = {
        "event": "notification.created",
        "data" : notification
      }
      onMessage(notif);
    } catch (err) {
      console.error("Invalid notification payload", err);
    }
  });

  activeSubscriptions.add(channel);
};

export const unsubscribeUserChannel = async (userId) => {
  const channel = `notifications:user:${userId}`;

  if (!activeSubscriptions.has(channel)) {
    return;
  }

  await redisSubscriber.unsubscribe(channel);
  activeSubscriptions.delete(channel);
};

