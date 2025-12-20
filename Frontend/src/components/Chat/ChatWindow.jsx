import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Send, Image as ImageIcon, Loader2 } from 'lucide-react';
import { getMessages, sendMessage, addMessage } from '../../Store/messageSlice';

const ChatWindow = ({ receiverId, receiverName, onClose }) => {
    const dispatch = useDispatch();
    const { messages, loading: messagesLoading } = useSelector(state => state.message);
    const { user: currentUser } = useSelector(state => state.auth);
    const { socket } = useSelector(state => state.auth);

    const [text, setText] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (receiverId) {
            dispatch(getMessages(receiverId));
        }
    }, [dispatch, receiverId]);

    useEffect(() => {
        if (socket) {
            socket.on("newMessage", (newMessage) => {
                // Determine if this message belongs to the current chat
                if (newMessage.sender === receiverId || newMessage.receiver === receiverId) {
                    dispatch(addMessage(newMessage));
                }
            });

            return () => {
                socket.off("newMessage");
            };
        }
    }, [socket, receiverId, dispatch]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if ((!text.trim() && !image) || sending) return;

        setSending(true);
        const formData = new FormData();
        formData.append('text', text);
        if (image) {
            formData.append('image', image);
        }

        try {
            await dispatch(sendMessage({ id: receiverId, formData })).unwrap();
            setText('');
            setImage(null);
            setPreview(null);
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setSending(false);
        }
    };

    if (!currentUser) return null;

    return (
        <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 z-50">
            {/* Header */}
            <div className="p-4 bg-primary text-primary-foreground flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                        {receiverName?.[0]?.toUpperCase()}
                    </div>
                    <span className="font-semibold">{receiverName}</span>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-secondary/30 space-y-4">
                {messagesLoading && messages.length === 0 ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.sender === currentUser._id;
                        return (
                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl p-3 ${isMe
                                    ? 'bg-primary text-primary-foreground rounded-br-none'
                                    : 'bg-card border border-border text-foreground rounded-bl-none'
                                    }`}>
                                    {msg.image && (
                                        <img src={msg.image} alt="Sent" className="rounded-lg mb-2 max-w-full" />
                                    )}
                                    {msg.message && <p className="text-sm">{msg.message}</p>}
                                    <span className="text-[10px] opacity-70 block text-right mt-1">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-card border-t border-border">
                {preview && (
                    <div className="mb-2 relative w-fit">
                        <img src={preview} alt="Preview" className="h-16 rounded-lg border border-border" />
                        <button
                            type="button"
                            onClick={() => { setImage(null); setPreview(null); }}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <label className="p-2 cursor-pointer hover:bg-secondary rounded-full text-muted-foreground transition">
                        <ImageIcon className="w-5 h-5" />
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="flex-1 bg-secondary/50 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                    <button
                        type="submit"
                        disabled={sending || (!text.trim() && !image)}
                        className="p-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 disabled:opacity-50 transition"
                    >
                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatWindow;
