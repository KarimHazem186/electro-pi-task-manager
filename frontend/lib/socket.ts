import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

/**
 * Get or create Socket.IO connection
 */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
    });
  }
  return socket;
}

/**
 * Connect to Socket.IO server
 */
export function connectSocket(): Socket {
  const socket = getSocket();
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
}

/**
 * Disconnect from Socket.IO server
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
  }
}

/**
 * React hook for Socket.IO connection
 */
export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = connectSocket();

    socketRef.current.on('connect', () => {
      console.log('✅ Socket connected:', socketRef.current?.id);
    });

    socketRef.current.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return () => {
      // Don't disconnect on unmount - keep connection alive
      // Only disconnect when user logs out
    };
  }, []);

  return socketRef.current;
}

/**
 * React hook for joining a project room
 */
export function useProjectSocket(projectId: string | null) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !projectId) return;

    // Join project room
    socket.emit('join-project', projectId);
    console.log(`📡 Joined project room: ${projectId}`);

    return () => {
      // Leave project room on unmount
      socket.emit('leave-project', projectId);
      console.log(`📡 Left project room: ${projectId}`);
    };
  }, [socket, projectId]);

  return socket;
}

/**
 * React hook for joining the per-user notification room.
 * Pass `null` when the user is not signed in to leave any previous room.
 */
export function useUserSocket(userId: string | null | undefined) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !userId) return;

    socket.emit('join-user', userId);
    console.log(`📡 Joined user room: ${userId}`);

    return () => {
      socket.emit('leave-user', userId);
      console.log(`📡 Left user room: ${userId}`);
    };
  }, [socket, userId]);

  return socket;
}

/**
 * React hook for listening to task events
 */
export function useTaskEvents(
  projectId: string | null,
  callbacks: {
    onTaskCreated?: (task: any) => void;
    onTaskUpdated?: (task: any) => void;
    onTaskDeleted?: (data: { id: string }) => void;
    onTaskStatusChanged?: (task: any) => void;
  }
) {
  const socket = useProjectSocket(projectId);

  useEffect(() => {
    if (!socket) return;

    if (callbacks.onTaskCreated) {
      socket.on('task:created', callbacks.onTaskCreated);
    }
    if (callbacks.onTaskUpdated) {
      socket.on('task:updated', callbacks.onTaskUpdated);
    }
    if (callbacks.onTaskDeleted) {
      socket.on('task:deleted', callbacks.onTaskDeleted);
    }
    if (callbacks.onTaskStatusChanged) {
      socket.on('task:status-changed', callbacks.onTaskStatusChanged);
    }

    return () => {
      socket.off('task:created');
      socket.off('task:updated');
      socket.off('task:deleted');
      socket.off('task:status-changed');
    };
  }, [socket, callbacks]);

  return socket;
}
