// ===========================================
// Socket Context
// Real-time WebSocket connection manager
// ===========================================

import { useAuth } from '@/contexts/AuthContext';
import type { Application, ChatMessage, ChatRoom, Job, Notification } from '@/types';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

// Production and development Socket URL
const getSocketUrl = () => {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;

        // Production domain
        if (hostname === 'vakans.uz' || hostname === 'www.vakans.uz') {
            return 'https://vakans.uz';
        }

        // Server IP
        if (hostname === '77.237.239.235') {
            return 'http://77.237.239.235:5000';
        }

        // Other network IPs (dev)
        if (hostname !== 'localhost') {
            return `http://${hostname}:5000`;
        }
    }

    // Local development
    return import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
};

interface TypingUser {
    odamId: string;
    odamName: string;
    roomId: string;
}

// Admin stats update interface
interface AdminStatsUpdate {
    type: 'user' | 'job' | 'application' | 'chat';
    action: 'create' | 'update' | 'delete';
    data?: any;
}

interface SocketContextType {
    // Connection status
    isConnected: boolean;
    notificationsSocket: Socket | null;
    chatSocket: Socket | null;
    connectionError: string | null;
    reconnect: () => void;

    // Notifications
    unreadNotificationsCount: number;
    newNotification: Notification | null;
    clearNewNotification: () => void;
    markNotificationAsRead: (id: string) => void;
    markAllNotificationsAsRead: () => void;

    // Chat
    newMessage: ChatMessage | null;
    clearNewMessage: () => void;
    sendChatMessage: (roomId: string, message: string) => void;
    joinChatRoom: (roomId: string) => void;
    leaveChatRoom: (roomId: string) => void;
    sendTyping: (roomId: string, isTyping: boolean) => void;
    typingUsers: TypingUser[];
    onlineUsers: string[];

    // Chat rooms
    chatRooms: ChatRoom[];
    setChatRooms: React.Dispatch<React.SetStateAction<ChatRoom[]>>;
    unreadMessagesCount: number;
    markChatRoomAsRead: (roomId: string) => void;
    resetUnreadMessages: () => void;

    // Job updates
    onJobUpdate: (callback: (job: Job) => void) => () => void;
    onJobCreate: (callback: (job: Job) => void) => () => void;
    onJobDelete: (callback: (jobId: string) => void) => () => void;

    // Application updates
    onApplicationUpdate: (callback: (app: Application) => void) => () => void;
    onApplicationCreate: (callback: (app: Application) => void) => () => void;

    // Admin stats updates
    onAdminStatsUpdate: (callback: (update: AdminStatsUpdate) => void) => () => void;

    // User online status
    checkUserOnline: (userId: string) => boolean;

    // Last update timestamp for polling fallback
    lastUpdateTimestamp: number;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated } = useAuth();

    // Socket refs
    const notificationsSocketRef = useRef<Socket | null>(null);
    const chatSocketRef = useRef<Socket | null>(null);

    // Connection status
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState(Date.now());

    // Notifications state
    const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
    const [newNotification, setNewNotification] = useState<Notification | null>(null);

    // Chat state
    const [newMessage, setNewMessage] = useState<ChatMessage | null>(null);
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
    const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

    // Event callbacks
    const jobUpdateCallbacks = useRef<Set<(job: Job) => void>>(new Set());
    const jobCreateCallbacks = useRef<Set<(job: Job) => void>>(new Set());
    const jobDeleteCallbacks = useRef<Set<(jobId: string) => void>>(new Set());
    const applicationUpdateCallbacks = useRef<Set<(app: Application) => void>>(new Set());
    const applicationCreateCallbacks = useRef<Set<(app: Application) => void>>(new Set());
    const adminStatsUpdateCallbacks = useRef<Set<(update: AdminStatsUpdate) => void>>(new Set());

    // Update timestamp whenever there's a real-time event
    const triggerUpdate = useCallback(() => {
        setLastUpdateTimestamp(Date.now());
    }, []);

    // Reconnect function
    const reconnect = useCallback(() => {
        console.log('🔄 Manual reconnect triggered');
        if (notificationsSocketRef.current) {
            notificationsSocketRef.current.disconnect();
            notificationsSocketRef.current.connect();
        }
        if (chatSocketRef.current) {
            chatSocketRef.current.disconnect();
            chatSocketRef.current.connect();
        }
    }, []);

    // Initialize sockets when authenticated
    useEffect(() => {
        if (!isAuthenticated || !user) {
            // Disconnect if not authenticated
            disconnectAll();
            return;
        }

        const token = localStorage.getItem('vakans_token');
        if (!token) return;

        const socketUrl = getSocketUrl();

        // Track JWT failure to avoid infinite reconnect loop
        let jwtFailureCount = 0;
        const maxJwtFailures = 2;

        // Connect to Notifications namespace
        const notificationsSocket = io(`${socketUrl}/notifications`, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5, // Limited reconnection attempts
            timeout: 20000,
            auth: { token, userId: user.id },
        });

        notificationsSocket.on('connect', () => {
            console.log('🔔 Notifications socket connected');
            setIsConnected(true);
            setConnectionError(null);
            // Request initial counts on connect
            notificationsSocket.emit('getUnreadCount');
        });

        notificationsSocket.on('disconnect', (reason) => {
            console.log('🔔 Notifications socket disconnected:', reason);
            setIsConnected(false);
            // Auto-reconnect for certain disconnect reasons
            if (reason === 'io server disconnect') {
                // Server initiated disconnect, need to manually reconnect
                notificationsSocket.connect();
            }
        });

        notificationsSocket.on('connect_error', async (error) => {
            console.error('🔔 Notifications socket error:', error.message);
            setConnectionError(error.message);
            // If JWT expired, try to refresh token and reconnect
            if (error.message.includes('jwt expired') || error.message.includes('jwt malformed')) {
                jwtFailureCount++;
                console.log(`🔑 Token expired (attempt ${jwtFailureCount}/${maxJwtFailures}), attempting refresh...`);

                // Stop reconnecting after max attempts
                if (jwtFailureCount >= maxJwtFailures) {
                    console.log('🔑 Max JWT failures reached, stopping reconnection');
                    notificationsSocket.disconnect();
                    localStorage.removeItem('vakans_token');
                    localStorage.removeItem('vakans_user');
                    window.location.href = '/login';
                    return;
                }

                try {
                    // Try to refresh token via API
                    const response = await fetch(`${getSocketUrl()}/api/v1/auth/refresh`, {
                        method: 'POST',
                        credentials: 'include',
                    });
                    if (response.ok) {
                        const data = await response.json();
                        if (data.success && data.data?.token) {
                            localStorage.setItem('vakans_token', data.data.token);
                            // Update socket auth and reconnect
                            notificationsSocket.auth = { token: data.data.token, userId: user.id };
                            jwtFailureCount = 0; // Reset counter on success
                            setTimeout(() => notificationsSocket.connect(), 500);
                        }
                    } else {
                        // Token refresh failed, user needs to login again
                        console.log('🔑 Token refresh failed, user should re-login');
                        notificationsSocket.disconnect();
                        localStorage.removeItem('vakans_token');
                        localStorage.removeItem('vakans_user');
                        window.location.href = '/login';
                    }
                } catch (refreshError) {
                    console.error('Token refresh error:', refreshError);
                    notificationsSocket.disconnect();
                }
            }
        });

        notificationsSocket.on('reconnect', (attemptNumber) => {
            console.log('🔔 Reconnected after', attemptNumber, 'attempts');
            setIsConnected(true);
            setConnectionError(null);
            triggerUpdate();
        });

        // Listen for notifications
        notificationsSocket.on('notification', (notification: Notification) => {
            console.log('📬 New notification:', notification);
            setNewNotification(notification);
            setUnreadNotificationsCount((prev) => prev + 1);
            triggerUpdate();

            // Show toast notification
            toast.info(notification.title, {
                description: notification.message,
                duration: 5000,
            });

            // Show browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(notification.title, {
                    body: notification.message,
                    icon: '/icons/icon-192x192.png',
                });
            }
        });

        notificationsSocket.on('unreadCount', ({ count }: { count: number }) => {
            setUnreadNotificationsCount(count);
        });

        // Listen for job updates
        notificationsSocket.on('job_update', (job: Job) => {
            console.log('📋 Job update:', job);
            jobUpdateCallbacks.current.forEach((cb) => cb(job));
            triggerUpdate();
            // Notify admin dashboard
            adminStatsUpdateCallbacks.current.forEach((cb) => cb({ type: 'job', action: 'update', data: job }));
        });

        // Listen for application updates
        notificationsSocket.on('application_update', (app: Application) => {
            console.log('📝 Application update:', app);
            applicationUpdateCallbacks.current.forEach((cb) => cb(app));
            triggerUpdate();
            // Notify admin dashboard
            adminStatsUpdateCallbacks.current.forEach((cb) => cb({ type: 'application', action: 'update', data: app }));
        });

        // Listen for new application
        notificationsSocket.on('application_created', (app: Application) => {
            console.log('📝 New application:', app);
            applicationCreateCallbacks.current.forEach((cb) => cb(app));
            triggerUpdate();
            // Notify admin dashboard
            adminStatsUpdateCallbacks.current.forEach((cb) => cb({ type: 'application', action: 'create', data: app }));
        });

        // Listen for job created
        notificationsSocket.on('job_created', (job: Job) => {
            console.log('📋 New job:', job);
            jobCreateCallbacks.current.forEach((cb) => cb(job));
            triggerUpdate();
            // Notify admin dashboard
            adminStatsUpdateCallbacks.current.forEach((cb) => cb({ type: 'job', action: 'create', data: job }));
        });

        // Listen for job deleted
        notificationsSocket.on('job_deleted', ({ jobId }: { jobId: string }) => {
            console.log('🗑️ Job deleted:', jobId);
            jobDeleteCallbacks.current.forEach((cb) => cb(jobId));
            triggerUpdate();
            // Notify admin dashboard
            adminStatsUpdateCallbacks.current.forEach((cb) => cb({ type: 'job', action: 'delete', data: { jobId } }));
        });

        // Listen for user events (for admin)
        notificationsSocket.on('user_created', (userData: any) => {
            console.log('👤 New user:', userData);
            triggerUpdate();
            adminStatsUpdateCallbacks.current.forEach((cb) => cb({ type: 'user', action: 'create', data: userData }));
        });

        notificationsSocket.on('user_update', (userData: any) => {
            console.log('👤 User update:', userData);
            triggerUpdate();
            adminStatsUpdateCallbacks.current.forEach((cb) => cb({ type: 'user', action: 'update', data: userData }));
        });

        // Listen for admin stats refresh event
        notificationsSocket.on('stats_refresh', () => {
            console.log('📊 Stats refresh requested');
            triggerUpdate();
        });

        notificationsSocketRef.current = notificationsSocket;

        // Track JWT failure for chat socket
        let chatJwtFailureCount = 0;

        // Connect to Chat namespace
        const chatSocket = io(`${socketUrl}/chat`, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5, // Limited reconnection attempts
            timeout: 20000,
            auth: { token, userId: user.id },
        });

        chatSocket.on('connect', () => {
            console.log('💬 Chat socket connected');
            chatJwtFailureCount = 0; // Reset on successful connect
        });

        chatSocket.on('disconnect', (reason) => {
            console.log('💬 Chat socket disconnected:', reason);
            if (reason === 'io server disconnect') {
                chatSocket.connect();
            }
        });

        chatSocket.on('connect_error', async (error) => {
            console.error('💬 Chat socket error:', error.message);
            // If JWT expired, try to refresh token and reconnect
            if (error.message.includes('jwt expired') || error.message.includes('jwt malformed')) {
                chatJwtFailureCount++;
                console.log(`🔑 Chat socket: Token expired (attempt ${chatJwtFailureCount}/${maxJwtFailures})`);

                // Stop reconnecting after max attempts
                if (chatJwtFailureCount >= maxJwtFailures) {
                    console.log('🔑 Chat socket: Max JWT failures reached, stopping');
                    chatSocket.disconnect();
                    return;
                }

                // Token refresh is handled by notifications socket, just wait and retry
                setTimeout(() => {
                    const newToken = localStorage.getItem('vakans_token');
                    if (newToken) {
                        chatSocket.auth = { token: newToken, userId: user.id };
                        chatSocket.connect();
                    }
                }, 2000);
            }
        });

        chatSocket.on('reconnect', (attemptNumber) => {
            console.log('💬 Chat reconnected after', attemptNumber, 'attempts');
            triggerUpdate();
        });

        // Listen for new messages (backend sends 'newMessage' with {roomId, message})
        chatSocket.on('newMessage', (data: { roomId: string; message: ChatMessage }) => {
            console.log('💬 New message:', data);
            // Ensure message has roomId
            const message: ChatMessage = {
                ...data.message,
                roomId: data.roomId
            };
            setNewMessage(message);
            triggerUpdate();

            // Notify admin dashboard about new chat activity
            adminStatsUpdateCallbacks.current.forEach((cb) => cb({ type: 'chat', action: 'create', data: message }));

            // Only increment unread if message is not from current user
            if (message.senderId !== user?.id) {
                // Update unread count
                setUnreadMessagesCount((prev) => prev + 1);

                // Update chat room last message and unread count
                setChatRooms((prev) => prev.map((room) => {
                    if (room.id === data.roomId) {
                        return {
                            ...room,
                            lastMessage: message.content,
                            lastMessageAt: message.createdAt,
                            unreadCount: (room.unreadCount || 0) + 1,
                        };
                    }
                    return room;
                }));
            } else {
                // Just update last message for own messages
                setChatRooms((prev) => prev.map((room) => {
                    if (room.id === data.roomId) {
                        return {
                            ...room,
                            lastMessage: message.content,
                            lastMessageAt: message.createdAt,
                        };
                    }
                    return room;
                }));
            }
        });

        chatSocket.on('messagesRead', (data: { roomId: string; readBy: string }) => {
            console.log('✅ Messages read:', data);
        });

        // Listen for typing events (backend sends 'userTyping')
        chatSocket.on('userTyping', (data: { roomId: string; userId: string; isTyping: boolean; userName?: string }) => {
            console.log('⌨️ Typing event:', data);
            if (data.isTyping) {
                setTypingUsers((prev) => {
                    if (prev.find((u) => u.odamId === data.userId && u.roomId === data.roomId)) {
                        return prev;
                    }
                    return [...prev, { odamId: data.userId, odamName: data.userName || 'Foydalanuvchi', roomId: data.roomId }];
                });
            } else {
                setTypingUsers((prev) => prev.filter((u) => !(u.odamId === data.userId && u.roomId === data.roomId)));
            }
        });

        // Listen for online users
        chatSocket.on('onlineUsers', (users: string[]) => {
            console.log('👥 Online users:', users);
            setOnlineUsers(users);
        });

        chatSocket.on('userOnline', (userId: string) => {
            console.log('🟢 User online:', userId);
            setOnlineUsers((prev) => {
                if (prev.includes(userId)) return prev;
                return [...prev, userId];
            });
        });

        chatSocket.on('userOffline', (userId: string) => {
            console.log('🔴 User offline:', userId);
            setOnlineUsers((prev) => prev.filter((id) => id !== userId));
        });

        // Listen for unread messages count
        chatSocket.on('unreadCount', ({ count }: { count: number }) => {
            setUnreadMessagesCount(count);
        });

        chatSocketRef.current = chatSocket;

        // Cleanup
        return () => {
            disconnectAll();
        };
    }, [isAuthenticated, user]);

    const disconnectAll = useCallback(() => {
        if (notificationsSocketRef.current) {
            notificationsSocketRef.current.disconnect();
            notificationsSocketRef.current = null;
        }
        if (chatSocketRef.current) {
            chatSocketRef.current.disconnect();
            chatSocketRef.current = null;
        }
        setIsConnected(false);
    }, []);

    const clearNewNotification = useCallback(() => {
        setNewNotification(null);
    }, []);

    const clearNewMessage = useCallback(() => {
        setNewMessage(null);
    }, []);

    const sendChatMessage = useCallback((roomId: string, message: string) => {
        if (chatSocketRef.current?.connected) {
            chatSocketRef.current.emit('sendMessage', { roomId, message });
        }
    }, []);

    const joinChatRoom = useCallback((roomId: string) => {
        if (chatSocketRef.current?.connected) {
            chatSocketRef.current.emit('joinRoom', { roomId });
        }
    }, []);

    const leaveChatRoom = useCallback((roomId: string) => {
        if (chatSocketRef.current?.connected) {
            chatSocketRef.current.emit('leaveRoom', { roomId });
        }
    }, []);

    const markChatRoomAsRead = useCallback((roomId: string) => {
        if (chatSocketRef.current?.connected) {
            chatSocketRef.current.emit('markRead', { roomId });
        }
        // Update local state and recalculate total unread
        setChatRooms(prev => {
            const room = prev.find(r => r.id === roomId);
            const roomUnread = room?.unreadCount || 0;

            // Update total unread count
            if (roomUnread > 0) {
                setUnreadMessagesCount(current => Math.max(0, current - roomUnread));
            }

            // Update room's unread count
            return prev.map(r =>
                r.id === roomId ? { ...r, unreadCount: 0 } : r
            );
        });
    }, []);

    const resetUnreadMessages = useCallback(() => {
        setUnreadMessagesCount(0);
        setChatRooms(prev => prev.map(room => ({ ...room, unreadCount: 0 })));
    }, []);

    const sendTyping = useCallback((roomId: string, isTyping: boolean) => {
        if (chatSocketRef.current?.connected && user) {
            chatSocketRef.current.emit('typing', {
                roomId,
                isTyping,
                odamId: user.id,
                odamName: `${user.firstName} ${user.lastName}`
            });
        }
    }, [user]);

    const markNotificationAsRead = useCallback((id: string) => {
        if (notificationsSocketRef.current?.connected) {
            notificationsSocketRef.current.emit('markAsRead', { notificationId: id });
            setUnreadNotificationsCount((prev) => Math.max(0, prev - 1));
        }
    }, []);

    const markAllNotificationsAsRead = useCallback(() => {
        if (notificationsSocketRef.current?.connected) {
            notificationsSocketRef.current.emit('markAllAsRead');
            setUnreadNotificationsCount(0);
        }
    }, []);

    const checkUserOnline = useCallback((userId: string) => {
        return onlineUsers.includes(userId);
    }, [onlineUsers]);

    const onJobUpdate = useCallback((callback: (job: Job) => void) => {
        jobUpdateCallbacks.current.add(callback);
        return () => {
            jobUpdateCallbacks.current.delete(callback);
        };
    }, []);

    const onJobCreate = useCallback((callback: (job: Job) => void) => {
        jobCreateCallbacks.current.add(callback);
        return () => {
            jobCreateCallbacks.current.delete(callback);
        };
    }, []);

    const onJobDelete = useCallback((callback: (jobId: string) => void) => {
        jobDeleteCallbacks.current.add(callback);
        return () => {
            jobDeleteCallbacks.current.delete(callback);
        };
    }, []);

    const onApplicationUpdate = useCallback((callback: (app: Application) => void) => {
        applicationUpdateCallbacks.current.add(callback);
        return () => {
            applicationUpdateCallbacks.current.delete(callback);
        };
    }, []);

    const onApplicationCreate = useCallback((callback: (app: Application) => void) => {
        applicationCreateCallbacks.current.add(callback);
        return () => {
            applicationCreateCallbacks.current.delete(callback);
        };
    }, []);

    const onAdminStatsUpdate = useCallback((callback: (update: AdminStatsUpdate) => void) => {
        adminStatsUpdateCallbacks.current.add(callback);
        return () => {
            adminStatsUpdateCallbacks.current.delete(callback);
        };
    }, []);

    return (
        <SocketContext.Provider
            value={{
                isConnected,
                notificationsSocket: notificationsSocketRef.current,
                chatSocket: chatSocketRef.current,
                connectionError,
                reconnect,

                // Notifications
                unreadNotificationsCount,
                newNotification,
                clearNewNotification,
                markNotificationAsRead,
                markAllNotificationsAsRead,

                // Chat
                newMessage,
                clearNewMessage,
                sendChatMessage,
                joinChatRoom,
                leaveChatRoom,
                sendTyping,
                typingUsers,
                onlineUsers,

                // Chat rooms
                chatRooms,
                setChatRooms,
                unreadMessagesCount,
                markChatRoomAsRead,
                resetUnreadMessages,

                // Job events
                onJobUpdate,
                onJobCreate,
                onJobDelete,

                // Application events
                onApplicationUpdate,
                onApplicationCreate,

                // Admin stats events
                onAdminStatsUpdate,

                // Utility
                checkUserOnline,
                lastUpdateTimestamp,
            }}
        >
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
}

export default SocketContext;
