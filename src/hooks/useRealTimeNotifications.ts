import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';
import type { Notification as NotificationModel } from '@/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Dinamik Socket URL - network IP uchun
const getSocketUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return `http://${window.location.hostname}:5000`;
  }
  return import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
};

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

/**
 * Real-time Notifications Hook
 * Socket.io orqali jonli xabarnomalar
 */
export function useRealTimeNotifications() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [newNotification, setNewNotification] = useState<NotificationModel | null>(null);
  const { user, isAuthenticated } = useAuth();
  const isConnectingRef = useRef(false);

  useEffect(() => {
    // Demo mode da Socket.io ni o'chirish
    if (DEMO_MODE) {
      return;
    }

    if (!isAuthenticated || !user) {
      // Disconnect if not authenticated
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Already connected or connecting
    if (socketRef.current?.connected || isConnectingRef.current) {
      return;
    }

    isConnectingRef.current = true;

    // Initialize Socket.io connection
    const socketUrl = getSocketUrl();
    const token = localStorage.getItem('vakans_token');

    const newSocket = io(`${socketUrl}/notifications`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      auth: {
        token: token,
        userId: user.id,
      },
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      isConnectingRef.current = false;
      logger.info('Socket connected', { userId: user.id });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      logger.info('Socket disconnected');
    });

    newSocket.on('connect_error', (error) => {
      setIsConnected(false);
      isConnectingRef.current = false;
      logger.error('Socket connection error', error);
    });

    // Listen for new notifications
    newSocket.on('notification', (notification: NotificationModel) => {
      logger.info('New notification received', { notification });
      setNewNotification(notification);

      // Request notification permission and show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-192x192.png',
          tag: notification.id,
        });
      }
    });

    // Listen for new messages
    newSocket.on('new_message', (data) => {
      logger.info('New message received', { data });
    });

    // Listen for job updates
    newSocket.on('job_update', (data) => {
      logger.info('Job update received', { data });
    });

    // Listen for application updates
    newSocket.on('application_update', (data) => {
      logger.info('Application update received', { data });
    });

    socketRef.current = newSocket;

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      isConnectingRef.current = false;
    };
  }, [isAuthenticated, user?.id]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        logger.info('Notification permission', { permission });
      });
    }
  }, []);

  const sendMessage = useCallback((event: string, data: unknown) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    } else {
      logger.warn('Socket not connected, cannot send message', { event, data });
    }
  }, [isConnected]);

  return {
    socket: socketRef.current,
    isConnected,
    newNotification,
    sendMessage,
  };
}

/**
 * Usage:
 * 
 * const { isConnected, newNotification } = useRealTimeNotifications();
 * 
 * useEffect(() => {
 *   if (newNotification) {
 *     toast.success(newNotification.title);
 *   }
 * }, [newNotification]);
 */
