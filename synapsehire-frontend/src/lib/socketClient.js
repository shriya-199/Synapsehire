import { io } from 'socket.io-client';

export const createInterviewSocket = (accessToken) =>
  io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
    auth: { token: accessToken },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 4000,
    timeout: 10000
  });
