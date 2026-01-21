import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Notification as NotificationModel } from '@/types';
import { logger } from '@/lib/logger';
import { useAuth } from '@/contexts/AuthContext';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

/**
 * Real-time Notifications Hook
 * Socket.io orqali jonli xabarnomalar
 */
export function useRealTimeNotifications() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [newNotification, setNewNotification] = useState<NotificationModel | null>(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Demo mode da Socket.io ni o'chirish
    if (DEMO_MODE) {
      return;
    }

    if (!isAuthenticated || !user) {
      // Disconnect if not authenticated
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Initialize Socket.io connection
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      auth: {
        userId: user.id,
      },
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      logger.info('Socket connected', { userId: user.id });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      logger.info('Socket disconnected');
    });

    newSocket.on('connect_error', (error) => {
      setIsConnected(false);
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
      // You can handle new messages separately if needed
    });

    // Listen for job updates
    newSocket.on('job_update', (data) => {
      logger.info('Job update received', { data });
    });

    // Listen for application updates
    newSocket.on('application_update', (data) => {
      logger.info('Application update received', { data });
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        logger.info('Notification permission', { permission });
      });
    }
  }, []);

  const sendMessage = (event: string, data: unknown) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    } else {
      logger.warn('Socket not connected, cannot send message', { event, data });
    }
  };

  return {
    socket,
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
