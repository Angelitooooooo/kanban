import { io } from 'socket.io-client';

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000';

const socket = io(API_BASE_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Socket disconnected');
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

export default socket;
