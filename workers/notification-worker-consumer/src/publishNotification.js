import { redis } from './redis.js';

export const publishNotification = async (recipientId, notification) => {
  const channel = `notifications:user:${recipientId}`;

  await redis.publish(
    channel,
    JSON.stringify(notification)
  );
};
