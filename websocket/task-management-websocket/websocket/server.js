import "dotenv/config";
import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import {
  subscribeUserChannel,
  unsubscribeUserChannel
} from '../redis/redis.js';

const wss = new WebSocketServer({ port: 8080 });

const userSockets = new Map();
// userId => Set<WebSocket>

const addSocket = (userId, socket) => {
  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
  }
  userSockets.get(userId).add(socket);
};

const removeSocket = async (userId, socket) => {
  const sockets = userSockets.get(userId);
  if (!sockets) return;

  console.log(`sockets count for user ${userId} -> ${sockets.size}`)

  sockets.delete(socket);

  if (sockets.size === 0) {
    userSockets.delete(userId);
    await unsubscribeUserChannel(userId);
    console.log(`socket removed`);
  }
};

wss.on('connection', async (socket, request) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    const token = url.searchParams.get('token');

    if (!token) {
      socket.close(1008, 'Missing token');
      return;
    }

    const payload = jwt.verify(token, process.env.WS_TOKEN_SECRET);
    const { sub: userId, exp } = payload;

    console.log(`sub ${userId} - expiresIn ${exp}`);

    socket.user = { userId, exp };
    socket.isAlive = true;

    addSocket(userId, socket);

    // subscribe to redis pub/sub channel on first socket initiate for a userId and execute callback every receiving message
    if (userSockets.get(userId).size === 1) {
      await subscribeUserChannel(userId, (notification) => {
        const sockets = userSockets.get(userId);
        if (!sockets) return;

        for (const ws of sockets) {
          if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify(notification));
          }
        }
      });
    }

    socket.on("pong", () => {
      console.log(
        `Pong from ${socket.user?.userId}`
      );
      socket.isAlive = true;
    });

    const now = Math.floor(Date.now() / 1000);
    const ttl = (exp - now) * 1000;

    if (ttl <= 0) {
      socket.close(1008, 'Token expired');
      return;
    }

    socket.expireTimer = setTimeout(() => {
      socket.close(4001, 'Token expired');
    }, ttl);

    socket.on('close', async () => {
      clearTimeout(socket.expireTimer);
      await removeSocket(userId, socket);
    });

  } catch (err) {
    console.log(`error ${err}`);
    socket.close(1008, 'Invalid token');
  }
});

const HEARTBEAT_INTERVAL = 30_000;

const heartbeatInterval = setInterval(() => {
  for (const socket of wss.clients) {
    if (socket.readyState !== socket.OPEN) {
      continue;
    }

    if (!socket.isAlive) {
      console.log(
        `Terminate inactive socket (${socket.user?.userId})`
      );

      socket.terminate();
      continue;
    }

    socket.isAlive = false;
    socket.ping();
  }
}, HEARTBEAT_INTERVAL);

wss.on("close", () => {
  clearInterval(heartbeatInterval);
});
