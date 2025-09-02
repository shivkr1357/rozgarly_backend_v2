import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { setupCommunityNamespace } from './community.js';
import { getAuth } from '../config/firebase.js';

export const initSockets = (server: HttpServer): Server => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify Firebase token
      const auth = getAuth();
      const decodedToken = await auth.verifyIdToken(token);

      // Attach user info to socket
      socket.data.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture,
      };

      console.log('Socket authenticated', {
        userId: decodedToken.uid,
        socketId: socket.id,
      });

      next();
    } catch (error) {
      console.error('Socket authentication failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        socketId: socket.id,
      });
      next(new Error('Authentication failed'));
    }
  });

  // Connection event
  io.on('connection', socket => {
    console.log('Socket connected', {
      userId: socket.data.user?.uid,
      socketId: socket.id,
    });

    // Handle disconnection
    socket.on('disconnect', reason => {
      console.log('Socket disconnected', {
        userId: socket.data.user?.uid,
        socketId: socket.id,
        reason,
      });
    });

    // Handle errors
    socket.on('error', error => {
      console.error('Socket error', {
        userId: socket.data.user?.uid,
        socketId: socket.id,
        error: error.message,
      });
    });
  });

  // Setup namespaces
  setupCommunityNamespace(io);

  return io;
};
