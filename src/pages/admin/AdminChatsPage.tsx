import { Avatar, Badge, Card, Input, Modal, Skeleton } from '@/components/ui';
import { adminApi } from '@/lib/api';
import { formatRelativeTime, getFileUrl } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertTriangle,
    ArrowLeft,
    Building2,
    ChevronLeft,
    ChevronRight,
    Eye,
    MessageSquare,
    Search,
    Shield,
    Trash2,
    User,
    Users,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ChatRoom {
    id: string;
    participants: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatar?: string;
        companyName?: string;
        role: string;
    }[];
    lastMessage?: {
        content: string;
        createdAt: string;
        senderId: string;
    };
    job?: {
        id: string;
        title: string;
    };
    messageCount: number;
    createdAt: string;
    updatedAt: string;
}

interface ChatMessage {
    id: string;
    content: string;
    type: string;
    createdAt: string;
    isRead: boolean;
    sender: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatar?: string;
        companyName?: string;
        role: string;
    };
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export function AdminChatsPage() {
    // States
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoadingRooms, setIsLoadingRooms] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [messagesPagination, setMessagesPagination] = useState<Pagination>({ page: 1, limit: 100, total: 0, totalPages: 0 });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ type: 'room' | 'message'; id: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch rooms
    const fetchRooms = useCallback(async (page = 1) => {
        setIsLoadingRooms(true);
        try {
            const response = await adminApi.getChats({
                page,
                limit: 20,
                search: searchQuery || undefined,
            });
            if (response.success && response.data) {
                setRooms(response.data.data);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            toast.error('Chatlarni yuklashda xatolik');
        } finally {
            setIsLoadingRooms(false);
        }
    }, [searchQuery]);

    // Fetch messages
    const fetchMessages = useCallback(async (roomId: string, page = 1) => {
        setIsLoadingMessages(true);
        try {
            const response = await adminApi.getChatMessages(roomId, { page, limit: 100 });
            if (response.success && response.data) {
                setMessages(response.data.messages);
                setMessagesPagination(response.data.pagination);
                // Update selected room with full data
                if (response.data.room) {
                    setSelectedRoom(prev => prev ? { ...prev, ...response.data!.room } : null);
                }
            }
        } catch (error) {
            toast.error('Xabarlarni yuklashda xatolik');
        } finally {
            setIsLoadingMessages(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchRooms();
    }, [fetchRooms]);

    // Search debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchRooms(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Select room handler
    const handleSelectRoom = (room: ChatRoom) => {
        setSelectedRoom(room);
        fetchMessages(room.id);
    };

    // Delete handlers
    const handleDeleteClick = (type: 'room' | 'message', id: string) => {
        setDeleteTarget({ type, id });
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);

        try {
            if (deleteTarget.type === 'room') {
                const response = await adminApi.deleteChat(deleteTarget.id);
                if (response.success) {
                    toast.success('Chat o\'chirildi');
                    setRooms(prev => prev.filter(r => r.id !== deleteTarget.id));
                    if (selectedRoom?.id === deleteTarget.id) {
                        setSelectedRoom(null);
                        setMessages([]);
                    }
                }
            } else {
                const response = await adminApi.deleteChatMessage(deleteTarget.id);
                if (response.success) {
                    toast.success('Xabar o\'chirildi');
                    setMessages(prev => prev.filter(m => m.id !== deleteTarget.id));
                }
            }
        } catch (error) {
            toast.error('O\'chirishda xatolik');
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setDeleteTarget(null);
        }
    };

    // Get role badge
    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return <Badge variant="danger" className="text-xs"><Shield className="w-3 h-3 mr-1" />Admin</Badge>;
            case 'EMPLOYER':
                return <Badge variant="primary" className="text-xs"><Building2 className="w-3 h-3 mr-1" />Ish beruvchi</Badge>;
            default:
                return <Badge variant="default" className="text-xs"><User className="w-3 h-3 mr-1" />Ishchi</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
                        <MessageSquare className="w-7 h-7 text-primary-500" />
                        Chatlar boshqaruvi
                    </h1>
                    <p className="text-secondary-500 mt-1">
                        Barcha chatlarni ko'rish va boshqarish
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="default" className="text-sm">
                        <Users className="w-4 h-4 mr-1" />
                        {pagination.total} ta chat
                    </Badge>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
                {/* Rooms List */}
                <Card className="lg:col-span-1 flex flex-col overflow-hidden">
                    {/* Search */}
                    <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                            <Input
                                type="text"
                                placeholder="Foydalanuvchi qidirish..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Rooms */}
                    <div className="flex-1 overflow-y-auto">
                        {isLoadingRooms ? (
                            <div className="p-4 space-y-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <Skeleton className="w-12 h-12 rounded-full" />
                                        <div className="flex-1">
                                            <Skeleton className="h-4 w-3/4 mb-2" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : rooms.length === 0 ? (
                            <div className="p-8 text-center">
                                <MessageSquare className="w-12 h-12 mx-auto text-secondary-300 mb-3" />
                                <p className="text-secondary-500">Chatlar topilmadi</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-secondary-100 dark:divide-secondary-800">
                                {rooms.map((room) => (
                                    <motion.div
                                        key={room.id}
                                        whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                                        className={`p-4 cursor-pointer transition-colors ${selectedRoom?.id === room.id
                                                ? 'bg-primary-50 dark:bg-primary-900/20'
                                                : ''
                                            }`}
                                        onClick={() => handleSelectRoom(room)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="relative">
                                                <div className="flex -space-x-2">
                                                    {room.participants.slice(0, 2).map((p, idx) => (
                                                        <Avatar
                                                            key={p.id}
                                                            src={p.avatar ? getFileUrl(p.avatar) : undefined}
                                                            name={`${p.firstName} ${p.lastName}`}
                                                            size="sm"
                                                            className={`border-2 border-white dark:border-secondary-900 ${idx > 0 ? '-ml-2' : ''}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-medium text-secondary-900 dark:text-white truncate">
                                                        {room.participants.map(p => `${p.firstName} ${p.lastName}`).join(' ↔ ')}
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap gap-1 mb-1">
                                                    {room.participants.map(p => (
                                                        <span key={p.id}>{getRoleBadge(p.role)}</span>
                                                    ))}
                                                </div>
                                                {room.lastMessage && (
                                                    <p className="text-sm text-secondary-500 truncate">
                                                        {room.lastMessage.content}
                                                    </p>
                                                )}
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs text-secondary-400">
                                                        {formatRelativeTime(room.updatedAt)}
                                                    </span>
                                                    <Badge variant="default" className="text-xs">
                                                        {room.messageCount} xabar
                                                    </Badge>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteClick('room', room.id);
                                                }}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="p-4 border-t border-secondary-200 dark:border-secondary-700 flex items-center justify-between">
                            <button
                                onClick={() => fetchRooms(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-sm text-secondary-500">
                                {pagination.page} / {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => fetchRooms(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </Card>

                {/* Messages View */}
                <Card className="lg:col-span-2 flex flex-col overflow-hidden">
                    {selectedRoom ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setSelectedRoom(null)}
                                            className="lg:hidden p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800"
                                        >
                                            <ArrowLeft className="w-5 h-5" />
                                        </button>
                                        <div>
                                            <h3 className="font-semibold text-secondary-900 dark:text-white">
                                                {selectedRoom.participants.map(p => `${p.firstName} ${p.lastName}`).join(' ↔ ')}
                                            </h3>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {selectedRoom.participants.map(p => (
                                                    <span key={p.id} className="text-xs text-secondary-500">
                                                        {p.email}
                                                    </span>
                                                ))}
                                            </div>
                                            {selectedRoom.job && (
                                                <p className="text-sm text-primary-500 mt-1">
                                                    📋 {selectedRoom.job.title}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="default">
                                            {messagesPagination.total} xabar
                                        </Badge>
                                        <button
                                            onClick={() => handleDeleteClick('room', selectedRoom.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {isLoadingMessages ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : ''}`}>
                                                <div className={`max-w-[70%] ${i % 2 === 0 ? 'items-end' : ''}`}>
                                                    <Skeleton className="h-16 w-64 rounded-2xl" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <MessageSquare className="w-12 h-12 mx-auto text-secondary-300 mb-3" />
                                            <p className="text-secondary-500">Xabarlar yo'q</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Load more button */}
                                        {messagesPagination.page < messagesPagination.totalPages && (
                                            <div className="text-center">
                                                <button
                                                    onClick={() => fetchMessages(selectedRoom.id, messagesPagination.page + 1)}
                                                    className="text-sm text-primary-500 hover:underline"
                                                >
                                                    Eski xabarlarni yuklash
                                                </button>
                                            </div>
                                        )}

                                        {messages.map((message) => (
                                            <motion.div
                                                key={message.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="group"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <Avatar
                                                        src={message.sender.avatar ? getFileUrl(message.sender.avatar) : undefined}
                                                        name={`${message.sender.firstName} ${message.sender.lastName}`}
                                                        size="sm"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium text-secondary-900 dark:text-white">
                                                                {message.sender.firstName} {message.sender.lastName}
                                                            </span>
                                                            {getRoleBadge(message.sender.role)}
                                                            <span className="text-xs text-secondary-400">
                                                                {formatRelativeTime(message.createdAt)}
                                                            </span>
                                                        </div>
                                                        <div className="bg-secondary-100 dark:bg-secondary-800 rounded-2xl rounded-tl-none px-4 py-2 inline-block">
                                                            <p className="text-secondary-800 dark:text-secondary-200">
                                                                {message.content}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteClick('message', message.id)}
                                                        className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <Eye className="w-16 h-16 mx-auto text-secondary-300 mb-4" />
                                <h3 className="text-lg font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                                    Chatni tanlang
                                </h3>
                                <p className="text-secondary-500">
                                    Xabarlarni ko'rish uchun chap tarafdan chatni tanlang
                                </p>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <Modal
                        isOpen={showDeleteModal}
                        onClose={() => setShowDeleteModal(false)}
                        title="O'chirishni tasdiqlash"
                    >
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                                        {deleteTarget?.type === 'room' ? 'Chatni o\'chirish' : 'Xabarni o\'chirish'}
                                    </h3>
                                    <p className="text-secondary-500">
                                        {deleteTarget?.type === 'room'
                                            ? 'Bu chat va undagi barcha xabarlar o\'chiriladi'
                                            : 'Bu xabar butunlay o\'chiriladi'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-4 py-2 rounded-xl border border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800"
                                    disabled={isDeleting}
                                >
                                    Bekor qilish
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? 'O\'chirilmoqda...' : 'O\'chirish'}
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
}
