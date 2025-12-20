import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Trash2, ArrowLeft, Search, Image as ImageIcon, Menu, Loader2, Send } from 'lucide-react';
import { getMessages, sendMessage, addMessage, getChatPartners, setSelectedUser, deleteChat, deleteMessage, removeMessage } from '../Store/messageSlice';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ChatPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // Redux State
    const { messages, chatPartners, selectedUser, loading: messagesLoading } = useSelector(state => state.message);
    const { user: currentUser, onlineUsers, socket } = useSelector(state => state.auth);

    // Local State
    const [text, setText] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [sending, setSending] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Mobile sidebar toggle
    const [unreadUsers, setUnreadUsers] = useState(new Set());
    const messagesEndRef = useRef(null);

    // Context Menu State
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, messageId: null });
    const longPressTimer = useRef(null);

    // Initialize: Fetch Partners & Handle Navigation State
    useEffect(() => {
        dispatch(getChatPartners());
    }, [dispatch]);

    useEffect(() => {
        if (location.state?.dealerId && location.state?.dealerName) {
            dispatch(setSelectedUser({ _id: location.state.dealerId, name: location.state.dealerName, username: location.state.dealerName }));
            setIsSidebarOpen(false); // On mobile, go to chat
        } else {
            // If accessing Inbox directly, clear selection to show the list/empty state
            dispatch(setSelectedUser(null));
            setIsSidebarOpen(true); // Ensure sidebar is open to pick a chat
        }
    }, [location.state, dispatch]);

    // Fetch messages when selectedUser changes
    useEffect(() => {
        if (selectedUser?._id) {
            dispatch(getMessages(selectedUser._id));
            // Clear unread mark when selecting user
            setUnreadUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(selectedUser._id);
                return newSet;
            });
            // Also refresh partners to clear backend unread count
            dispatch(getChatPartners());
        }
    }, [dispatch, selectedUser]);

    // Socket Listener for New Messages
    useEffect(() => {
        if (socket) {
            const handleNewMessage = (newMessage) => {
                // If I sent it, it's already added by sendMessage thunk
                if (newMessage.sender === currentUser._id) return;

                if (selectedUser && (newMessage.sender === selectedUser._id || newMessage.receiver === selectedUser._id)) {
                    dispatch(addMessage(newMessage));
                    // If chat is open, mark as read immediately in backend (optional but good UI)
                    // Currently relying on getMessages call when opening, but live updates might need an API call to mark read
                } else {
                    // Mark as unread if not currently open
                    setUnreadUsers(prev => new Set(prev).add(newMessage.sender));
                }

                // Refresh partners list to bubble up new conversations and update last message
                dispatch(getChatPartners());
            };

            socket.on("newMessage", handleNewMessage);
            return () => {
                socket.off("newMessage", handleNewMessage);
            };
        }
    }, [socket, selectedUser, dispatch, currentUser._id]);

    // Socket Listener for Deletion
    useEffect(() => {
        if (socket) {
            const handleMessageDeleted = (deletedMessageId) => {
                dispatch(removeMessage(deletedMessageId));
            };
            socket.on("messageDeleted", handleMessageDeleted);
            return () => {
                socket.off("messageDeleted", handleMessageDeleted);
            };
        }
    }, [socket, dispatch]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Close menu on click elsewhere
    useEffect(() => {
        const handleClick = () => setContextMenu({ visible: false, x: 0, y: 0, messageId: null });
        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, []);


    // Handlers
    const handleSend = async (e) => {
        e.preventDefault();
        if ((!text.trim() && !image) || !selectedUser || sending) return;

        setSending(true);
        const formData = new FormData();
        formData.append('text', text);
        if (image) formData.append('image', image);

        try {
            await dispatch(sendMessage({ id: selectedUser._id, formData })).unwrap();
            setText('');
            setImage(null);
            setPreview(null);
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setSending(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleContextMenu = (e, msgId) => {
        e.preventDefault();
        setContextMenu({
            visible: true,
            x: e.pageX,
            y: e.pageY,
            messageId: msgId
        });
    };

    const handleTouchStart = (msgId, e) => {
        longPressTimer.current = setTimeout(() => {
            const touch = e.touches[0];
            setContextMenu({
                visible: true,
                x: touch.pageX,
                y: touch.pageY,
                messageId: msgId
            });
        }, 500); // 500ms long press
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };

    const handleDeleteMessageAction = () => {
        if (contextMenu.messageId) {
            dispatch(deleteMessage(contextMenu.messageId));
        }
        setContextMenu({ visible: false, x: 0, y: 0, messageId: null });
    };

    const handleDeleteChat = () => {
        dispatch(deleteChat(selectedUser._id));
        dispatch(setSelectedUser(null));
    };

    const isOnline = (userId) => {
        return Array.isArray(onlineUsers) && onlineUsers.includes(String(userId));
    };

    if (!currentUser) return <div className="h-screen flex items-center justify-center">Please login to view chats.</div>;

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar - Chat Partners */}
            <div className={`w-full md:w-80 border-r border-border bg-card flex flex-col transition-all duration-300 absolute md:relative z-20 h-full ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate('/')} className="p-2 hover:bg-secondary rounded-full transition-colors mr-1" title="Back to Home">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h2 className="font-bold text-xl">Messages</h2>
                    </div>
                </div>
                {/* Search */}
                <div className="p-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input type="text" placeholder="Search chats..." className="w-full pl-9 pr-4 py-2 rounded-lg bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {chatPartners.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground text-sm">No conversations yet.</div>
                    ) : (
                        chatPartners.map(partner => (
                            <div
                                key={partner._id}
                                onClick={() => {
                                    dispatch(setSelectedUser(partner));
                                    setIsSidebarOpen(false);
                                    // Clear unread
                                    setUnreadUsers(prev => {
                                        const newSet = new Set(prev);
                                        newSet.delete(partner._id);
                                        return newSet;
                                    });
                                }}
                                className={`p-4 border-b border-border/50 cursor-pointer hover:bg-secondary/50 transition-colors flex items-center gap-3 ${selectedUser?._id === partner._id ? 'bg-secondary' : ''}`}
                            >
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                        {partner.username?.[0]?.toUpperCase()}
                                    </div>
                                    {isOnline(partner._id) && (
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full"></span>
                                    )}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className={`text-sm truncate ${(unreadUsers.has(partner._id) || partner.unreadCount > 0) ? 'font-bold text-primary' : 'font-semibold'}`}>
                                            {partner.username}
                                        </h4>
                                        {partner.lastMessage && (
                                            <span className={`text-[10px] whitespace-nowrap ml-2 ${(unreadUsers.has(partner._id) || partner.unreadCount > 0) ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                                                {new Date(partner.lastMessage.createdAt).toLocaleDateString() === new Date().toLocaleDateString()
                                                    ? new Date(partner.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                    : new Date(partner.lastMessage.createdAt).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className={`text-xs truncate ${(unreadUsers.has(partner._id) || partner.unreadCount > 0) ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                                            {partner.lastMessage?.image ? (
                                                <span className="flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Photo</span>
                                            ) : (
                                                partner.lastMessage?.message || partner.email
                                            )}
                                        </p>
                                        {(unreadUsers.has(partner._id) || partner.unreadCount > 0) && (
                                            <div className="flex items-center gap-1">
                                                {partner.unreadCount > 0 && <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">{partner.unreadCount}</span>}
                                                <span className="w-2.5 h-2.5 bg-blue-500 rounded-full ml-2 flex-shrink-0 animate-pulse"></span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-background relative w-full">
                {selectedUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-border flex items-center gap-3 bg-card/50 backdrop-blur-sm shadow-sm sticky top-0 z-10">
                            <button className="md:hidden p-2 -ml-2" onClick={() => setIsSidebarOpen(true)}>
                                <Menu className="w-5 h-5" />
                            </button>
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                                    {selectedUser.username?.[0]?.toUpperCase()}
                                </div>
                                {isOnline(selectedUser._id) && (
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold">{selectedUser.username}</h3>
                                {isOnline(selectedUser._id) && <span className="text-xs text-green-500 font-medium">Online</span>}
                            </div>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <button
                                        className="p-2 hover:bg-destructive/10 text-destructive rounded-full transition-colors"
                                        title="Delete Conversation"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the conversation history with {selectedUser.username}.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteChat} className="bg-destructive text-white hover:bg-destructive/90">
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-secondary/10 relative">
                            {messagesLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
                                    const isMe = senderId == currentUser._id;
                                    return (
                                        <div
                                            key={idx}
                                            className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                                        >
                                            <div
                                                className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm relative group ${isMe
                                                    ? 'bg-primary text-primary-foreground rounded-br-none'
                                                    : 'bg-card text-card-foreground border border-border rounded-bl-none'
                                                    }`}
                                                onContextMenu={(e) => isMe && handleContextMenu(e, msg._id)}
                                                onTouchStart={(e) => isMe && handleTouchStart(msg._id, e)}
                                                onTouchEnd={handleTouchEnd}
                                            >
                                                {msg.image && (
                                                    <div className="mb-3 overflow-hidden rounded-xl">
                                                        <img src={msg.image} alt="Shared" className="w-full h-auto object-cover max-h-64 cursor-pointer hover:scale-[1.02] transition-transform" />
                                                    </div>
                                                )}
                                                {msg.message && <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.message}</p>}
                                                <div className={`text-[10px] mt-1.5 flex items-center gap-1 opacity-70 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                            <div ref={messagesEndRef} />

                            {/* Context Menu */}
                            {contextMenu.visible && (
                                <div
                                    className="fixed z-50 bg-card border border-border shadow-xl rounded-lg overflow-hidden animate-in fade-in zoom-in-95"
                                    style={{ top: contextMenu.y, left: contextMenu.x }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                        onClick={handleDeleteMessageAction}
                                        className="flex items-center gap-2 px-4 py-2 hover:bg-destructive/10 text-destructive text-sm w-full text-left"
                                    >
                                        <Trash2 className="w-4 h-4" /> Delete Message
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 md:p-6 bg-card border-t border-border">
                            <form onSubmit={handleSend} className="relative flex items-end gap-3 max-w-4xl mx-auto">
                                {preview && (
                                    <div className="absolute bottom-full left-0 mb-4 p-2 bg-card rounded-xl border border-border shadow-lg animate-in zoom-in-95">
                                        <img src={preview} alt="Preview" className="h-24 rounded-lg object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => { setImage(null); setPreview(null) }}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                )}

                                <label className="p-3 rounded-full hover:bg-secondary cursor-pointer transition text-muted-foreground hover:text-primary">
                                    <ImageIcon className="w-6 h-6" />
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                </label>

                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    className="flex-1 bg-secondary/50 hover:bg-secondary focus:bg-background border-2 border-transparent focus:border-primary/20 rounded-2xl px-5 py-3 outline-none transition-all placeholder:text-muted-foreground/50"
                                />

                                <button
                                    type="submit"
                                    disabled={sending || (!text.trim() && !image)}
                                    className="p-3 bg-primary text-primary-foreground rounded-full hover:opacity-90 disabled:opacity-50 disabled:grayscale transition shadow-lg hover:shadow-primary/25 active:scale-95"
                                >
                                    {sending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                        <div className="w-24 h-24 bg-secondary/50 rounded-full flex items-center justify-center mb-6">
                            <Menu className="w-10 h-10 opacity-20" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">Select a Conversation</h3>
                        <p className="max-w-md">Choose a contact from the sidebar to start chatting or visit the car listings to connect with new dealers.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
