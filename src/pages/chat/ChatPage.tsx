import { Avatar, Skeleton } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { chatApi } from '@/lib/api';
import { formatRelativeTime, getFileUrl } from '@/lib/utils';
import type { ChatMessage, ChatRoom } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeft, Check, CheckCheck, MessageSquare, Phone,
    Search, Send, Smile, Video
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export function ChatPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { roomId } = useParams<{ roomId?: string }>();
    const [searchParams] = useSearchParams();
    const queryRoomId = searchParams.get('room') || roomId;
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // States
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [isLoadingRooms, setIsLoadingRooms] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showMobileChat, setShowMobileChat] = useState(false);

    // Socket connection
    const {
        isConnected,
        newMessage: socketNewMessage,
        joinChatRoom,
        leaveChatRoom,
        sendTyping,
        typingUsers,
        onlineUsers: _onlineUsers,
        checkUserOnline,
        markChatRoomAsRead
    } = useSocket();

    // Typing indicator
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleTyping = useCallback(() => {
        if (!selectedRoom) return;

        sendTyping(selectedRoom.id, true);

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Stop typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            sendTyping(selectedRoom.id, false);
        }, 2000);
    }, [selectedRoom, sendTyping]);

    // Get typing users for current room
    const roomTypingUsers = typingUsers.filter(u => u.roomId === selectedRoom?.id && u.odamId !== user?.id);

    // Fetch rooms
    const fetchRooms = useCallback(async () => {
        setIsLoadingRooms(true);
        try {
            const response = await chatApi.getRooms();
            console.log('Chat rooms response:', response);
            if (response.success && response.data) {
                console.log('Rooms data:', response.data);
                setRooms(response.data);
                // If roomId in URL (either from params or query), select that room
                if (queryRoomId) {
                    const room = response.data.find(r => r.id === queryRoomId);
                    if (room) {
                        setSelectedRoom(room);
                        setShowMobileChat(true);
                    }
                }
            }
        } catch (error) {
            console.error('Chat rooms error:', error);
            toast.error('Suhbatlarni yuklashda xatolik');
        } finally {
            setIsLoadingRooms(false);
        }
    }, [queryRoomId]);

    // Fetch messages for selected room
    const fetchMessages = useCallback(async (room: ChatRoom) => {
        setIsLoadingMessages(true);
        try {
            console.log('📨 Fetching messages for room:', room.id);
            const response = await chatApi.getMessages(room.id);
            console.log('📨 Messages response:', response);
            if (response.success && response.data) {
                console.log('📨 Setting messages, count:', response.data.length);
                setMessages(response.data);
                // Mark as read via API and socket
                await chatApi.markAsRead(room.id);
                markChatRoomAsRead(room.id);
            } else {
                console.log('📨 Response not successful or no data');
            }
        } catch (error) {
            console.error('📨 Error fetching messages:', error);
            toast.error('Xabarlarni yuklashda xatolik');
        } finally {
            setIsLoadingMessages(false);
        }
    }, [markChatRoomAsRead]);

    // Initial load
    useEffect(() => {
        fetchRooms();
    }, [fetchRooms]);

    // Load messages when room selected
    useEffect(() => {
        if (selectedRoom) {
            fetchMessages(selectedRoom);
            joinChatRoom(selectedRoom.id);

            return () => {
                leaveChatRoom(selectedRoom.id);
            };
        }
    }, [selectedRoom, fetchMessages, joinChatRoom, leaveChatRoom]);

    // Handle new message from socket
    useEffect(() => {
        console.log('🔄 socketNewMessage changed:', socketNewMessage);
        console.log('🔄 selectedRoom:', selectedRoom?.id);

        if (socketNewMessage && selectedRoom) {
            console.log('🔄 Checking roomId match:', socketNewMessage.roomId, '===', selectedRoom.id);

            // Don't add own messages - they are added optimistically
            if (socketNewMessage.senderId === user?.id) {
                console.log('🔄 Own message, skipping (handled optimistically)');
                return;
            }

            if (socketNewMessage.roomId === selectedRoom.id) {
                setMessages(prev => {
                    // Check if message already exists
                    if (prev.find(m => m.id === socketNewMessage.id)) {
                        console.log('🔄 Message already exists, skipping');
                        return prev;
                    }
                    console.log('🔄 Adding new message to list');
                    return [...prev, socketNewMessage];
                });
            }
        }
    }, [socketNewMessage, selectedRoom, user?.id]);

    // Scroll to bottom when new message
    useEffect(() => {
        if (messages.length > 0) {
            // Use setTimeout to ensure DOM is updated
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [messages.length]);

    // Select room handler
    const handleSelectRoom = (room: ChatRoom) => {
        setSelectedRoom(room);
        setShowMobileChat(true);
        navigate(`/chat/${room.id}`, { replace: true });
    };

    // Send message handler
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedRoom || isSending) return;

        const content = newMessage.trim();
        setNewMessage('');
        setIsSending(true);

        try {
            // Optimistic update
            const optimisticMessage: ChatMessage = {
                id: `temp-${Date.now()}`,
                roomId: selectedRoom.id,
                senderId: user?.id || '',
                content,
                isRead: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            setMessages(prev => [...prev, optimisticMessage]);

            // Send via API
            const response = await chatApi.sendMessage(selectedRoom.id, content);

            if (response.success && response.data) {
                // Replace optimistic message with real one
                setMessages(prev => prev.map(m =>
                    m.id === optimisticMessage.id ? response.data! : m
                ));
            } else {
                // Remove optimistic message on error
                setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
                toast.error('Xabar yuborishda xatolik');
            }
        } catch (error) {
            toast.error('Xabar yuborishda xatolik');
        } finally {
            setIsSending(false);
        }
    };

    // Get other participant in room
    const getOtherParticipant = (room: ChatRoom) => {
        // First try participants array
        if (room.participants && room.participants.length > 0) {
            return room.participants.find(p => p.id !== user?.id) || null;
        }
        // Fallback to otherParticipant field from backend
        if ((room as any).otherParticipant) {
            return (room as any).otherParticipant;
        }
        return null;
    };

    // Filter rooms by search
    const filteredRooms = rooms.filter(room => {
        const other = getOtherParticipant(room);
        if (!other) {
            console.log('Room without other participant:', room);
            return true; // Show room anyway
        }
        const name = `${other.firstName || ''} ${other.lastName || ''}`.toLowerCase();
        return name.includes(searchQuery.toLowerCase());
    });

    // Mobile back handler
    const handleMobileBack = () => {
        setShowMobileChat(false);
        setSelectedRoom(null);
        navigate('/chat', { replace: true });
    };

    return (
        <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950">
            <div className="container mx-auto px-4 py-4 h-screen">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 mb-4"
                >
                    <motion.button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-xl bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <ArrowLeft className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                    </motion.button>
                    <div>
                        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Xabarlar</h1>
                        <p className="text-sm text-secondary-500">
                            {isConnected ? (
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    Online
                                </span>
                            ) : (
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-red-500" />
                                    Offline
                                </span>
                            )}
                        </p>
                    </div>
                </motion.div>

                {/* Chat Container */}
                <div className="flex gap-4 h-[calc(100vh-140px)] md:h-[calc(100vh-120px)]">
                    {/* Rooms List */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`w-full md:w-80 lg:w-96 bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 overflow-hidden flex flex-col ${showMobileChat ? 'hidden md:flex' : 'flex'}`}
                    >
                        {/* Search */}
                        <div className="p-4 border-b border-secondary-200 dark:border-secondary-800">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                                <input
                                    type="text"
                                    placeholder="Qidirish..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                        </div>

                        {/* Rooms */}
                        <div className="flex-1 overflow-y-auto">
                            {isLoadingRooms ? (
                                <div className="p-4 space-y-3">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <Skeleton className="w-12 h-12 rounded-full" />
                                            <div className="flex-1">
                                                <Skeleton className="h-4 w-24 mb-1" />
                                                <Skeleton className="h-3 w-32" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredRooms.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                    <MessageSquare className="w-16 h-16 text-secondary-300 mb-4" />
                                    <h3 className="font-semibold text-secondary-700 dark:text-secondary-300 mb-1">
                                        Suhbatlar yo'q
                                    </h3>
                                    <p className="text-sm text-secondary-500">
                                        Ish beruvchi yoki ishchiga yozing
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-secondary-100 dark:divide-secondary-800">
                                    {filteredRooms.map((room) => {
                                        const other = getOtherParticipant(room);
                                        const isSelected = selectedRoom?.id === room.id;
                                        const unread = room.unreadCount || 0;
                                        const displayName = other
                                            ? `${other.firstName || ''} ${other.lastName || ''}`.trim() || 'Foydalanuvchi'
                                            : 'Foydalanuvchi';
                                        const isOnline = other ? checkUserOnline(other.id) : false;

                                        return (
                                            <motion.button
                                                key={room.id}
                                                onClick={() => handleSelectRoom(room)}
                                                className={`w-full p-4 text-left hover:bg-secondary-50 dark:hover:bg-secondary-800/50 transition-colors ${isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
                                                whileHover={{ x: 4 }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <Avatar
                                                            src={getFileUrl(other?.avatar)}
                                                            name={displayName}
                                                            size="md"
                                                        />
                                                        {/* Online indicator */}
                                                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-secondary-900 ${isOnline ? 'bg-green-500' : 'bg-secondary-400'}`} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h3 className="font-semibold text-secondary-900 dark:text-white truncate">
                                                                {displayName}
                                                            </h3>
                                                            {room.lastMessageAt && (
                                                                <span className="text-xs text-secondary-400 flex-shrink-0">
                                                                    {formatRelativeTime(room.lastMessageAt)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm text-secondary-500 truncate">
                                                                {room.lastMessage || 'Suhbatni boshlang'}
                                                            </p>
                                                            {unread > 0 && (
                                                                <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-primary-500 text-white rounded-full">
                                                                    {unread}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Chat Area */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex-1 bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 overflow-hidden flex flex-col ${showMobileChat ? 'fixed inset-x-0 top-0 bottom-16 z-40 md:relative md:inset-auto md:bottom-auto rounded-none md:rounded-2xl' : 'hidden md:flex'}`}
                    >
                        {selectedRoom ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-secondary-200 dark:border-secondary-800 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={handleMobileBack}
                                            className="md:hidden p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800"
                                        >
                                            <ArrowLeft className="w-5 h-5" />
                                        </button>
                                        {(() => {
                                            const otherUser = getOtherParticipant(selectedRoom);
                                            const displayName = otherUser
                                                ? `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || 'Foydalanuvchi'
                                                : 'Foydalanuvchi';
                                            const isOnline = otherUser ? checkUserOnline(otherUser.id) : false;
                                            return (
                                                <>
                                                    <div className="relative">
                                                        <Avatar
                                                            src={getFileUrl(otherUser?.avatar)}
                                                            name={displayName}
                                                            size="md"
                                                        />
                                                        {/* Online indicator */}
                                                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-secondary-900 ${isOnline ? 'bg-green-500' : 'bg-secondary-400'}`} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-secondary-900 dark:text-white">
                                                            {displayName}
                                                        </h3>
                                                        {roomTypingUsers.length > 0 ? (
                                                            <p className="text-xs text-primary-500 animate-pulse">
                                                                yozmoqda...
                                                            </p>
                                                        ) : (
                                                            <p className={`text-xs ${isOnline ? 'text-green-500' : 'text-secondary-400'}`}>
                                                                {isOnline ? 'Online' : 'Offline'}
                                                            </p>
                                                        )}
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors">
                                            <Phone className="w-5 h-5 text-secondary-500" />
                                        </button>
                                        <button className="p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors">
                                            <Video className="w-5 h-5 text-secondary-500" />
                                        </button>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary-50 dark:bg-secondary-950/50">
                                    {isLoadingMessages ? (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-center">
                                            <MessageSquare className="w-16 h-16 text-secondary-300 mb-4" />
                                            <h3 className="font-semibold text-secondary-700 dark:text-secondary-300 mb-1">
                                                Xabarlar yo'q
                                            </h3>
                                            <p className="text-sm text-secondary-500">
                                                Suhbatni boshlash uchun xabar yozing
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <AnimatePresence mode="popLayout">
                                                {messages.map((message, index) => {
                                                    const isOwn = message.senderId === user?.id;
                                                    const showAvatar = !isOwn && (
                                                        index === 0 ||
                                                        messages[index - 1]?.senderId !== message.senderId
                                                    );

                                                    return (
                                                        <motion.div
                                                            key={message.id}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -20 }}
                                                            className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
                                                        >
                                                            {!isOwn && showAvatar && (
                                                                <Avatar
                                                                    src={getFileUrl(getOtherParticipant(selectedRoom)?.avatar)}
                                                                    name={getOtherParticipant(selectedRoom)?.firstName || 'User'}
                                                                    size="sm"
                                                                />
                                                            )}
                                                            {!isOwn && !showAvatar && <div className="w-8" />}
                                                            <div
                                                                className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${isOwn
                                                                    ? 'bg-primary-500 text-white rounded-br-md'
                                                                    : 'bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-bl-md shadow-sm'
                                                                    }`}
                                                            >
                                                                <p className="text-sm whitespace-pre-wrap break-words">
                                                                    {message.content}
                                                                </p>
                                                                <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-white/70' : 'text-secondary-400'}`}>
                                                                    <span className="text-[10px]">
                                                                        {new Date(message.createdAt).toLocaleTimeString('uz-UZ', {
                                                                            hour: '2-digit',
                                                                            minute: '2-digit',
                                                                        })}
                                                                    </span>
                                                                    {isOwn && (
                                                                        message.isRead ? (
                                                                            <CheckCheck className="w-3 h-3" />
                                                                        ) : (
                                                                            <Check className="w-3 h-3" />
                                                                        )
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </AnimatePresence>
                                            <div ref={messagesEndRef} />
                                        </>
                                    )}
                                </div>

                                {/* Message Input */}
                                <form onSubmit={handleSendMessage} className="sticky bottom-0 p-3 md:p-4 border-t border-secondary-200 dark:border-secondary-800 bg-white dark:bg-secondary-900 safe-area-bottom">
                                    {/* Typing indicator */}
                                    {roomTypingUsers.length > 0 && (
                                        <div className="mb-2 text-xs text-primary-500 animate-pulse flex items-center gap-2">
                                            <span className="flex gap-1">
                                                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </span>
                                            {roomTypingUsers.map(u => u.odamName).join(', ')} yozmoqda...
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <button
                                            type="button"
                                            className="hidden sm:block p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors flex-shrink-0"
                                        >
                                            <Smile className="w-5 h-5 text-secondary-500" />
                                        </button>
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => {
                                                setNewMessage(e.target.value);
                                                handleTyping();
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    if (newMessage.trim() && !isSending) {
                                                        handleSendMessage(e);
                                                    }
                                                }
                                            }}
                                            placeholder="Xabar yozing..."
                                            className="flex-1 min-w-0 px-4 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 focus:outline-none focus:border-primary-500 text-sm md:text-base transition-colors"
                                            disabled={isSending}
                                            autoComplete="off"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim() || isSending}
                                            className="p-2.5 md:p-3 rounded-xl bg-primary-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600 transition-colors flex-shrink-0"
                                        >
                                            {isSending ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Send className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center mb-6">
                                        <MessageSquare className="w-12 h-12 text-primary-500" />
                                    </div>
                                </motion.div>
                                <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">
                                    Xush kelibsiz!
                                </h2>
                                <p className="text-secondary-500 max-w-md">
                                    Suhbat boshlash uchun chap tomondagi ro'yxatdan biror kishini tanlang
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default ChatPage;
