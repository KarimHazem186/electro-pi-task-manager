import { Server } from 'socket.io';

let io;

/**
 * Initialize Socket.IO
 * 
 * NOTE: Socket.IO real-time features work when running locally or on platforms
 * that support persistent connections (e.g., Render, Fly.io, Railway).
 * They are NOT active on Vercel production deployment due to serverless 
 * architecture limitations (no support for long-lived WebSocket connections).
 * 
 * All core REST APIs remain fully functional in all environments.
 */
export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id);

    // Join project room
    socket.on('join-project', (projectId) => {
      socket.join(`project:${projectId}`);
      console.log(`Socket ${socket.id} joined project:${projectId}`);
    });

    // Leave project room
    socket.on('leave-project', (projectId) => {
      socket.leave(`project:${projectId}`);
      console.log(`Socket ${socket.id} left project:${projectId}`);
    });

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });

  return io;
};

/**
 * Get Socket.IO instance
 */
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

/**
 * Emit events to specific rooms
 */
export const emitToProject = (projectId, event, data) => {
  if (io) {
    io.to(`project:${projectId}`).emit(event, data);
  }
};

export const emitTaskCreated = (projectId, task) => {
  emitToProject(projectId, 'task:created', task);
};

export const emitTaskUpdated = (projectId, task) => {
  emitToProject(projectId, 'task:updated', task);
};

export const emitTaskDeleted = (projectId, taskId) => {
  emitToProject(projectId, 'task:deleted', { id: taskId });
};

export const emitTaskStatusChanged = (projectId, task) => {
  emitToProject(projectId, 'task:status-changed', task);
};
