import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    Plus,
    Trash2,
    Microscope,
    FlaskConical,
    CloudSun,
    FileText,
    Sprout,
    Search,
    Bell,
    User as UserIcon,
    HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import chatService from '../services/chatService';
import { getDashboardOverview } from '../services/dashboardService';
import { toast } from 'react-hot-toast';
import Sidebar from '../components/common/Sidebar';
import ChatInterface from '../components/chat/ChatInterface';
import ErrorBoundary from '../components/common/ErrorBoundary';

/**
 * AI Assistant Page
 * Merged with Advanced UI features (Sidebar Cards, Clean Layout)
 * while maintaining robust local backend connection.
 */
export default function ChatPage() {
    const { user } = useAuth();

    // State Management
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [farmContext, setFarmContext] = useState(null);

    // 1. Initial Data Fetch (Context & History)
    useEffect(() => {
        const initData = async () => {
            try {
                // Fetch farm context for AI
                const overview = await getDashboardOverview();
                if (overview) {
                    setFarmContext({
                        location: "Coimbatore",
                        soilType: "Red Soil", // Should come from real user farm data
                        crops: ["Tomato"]     // Should come from real user farm data
                    });
                }

                // Fetch real history
                const historyResponse = await chatService.getHistory();
                if (historyResponse?.sessions) {
                    const mapped = historyResponse.sessions.map(s => ({
                        id: s.id,
                        title: s.messages?.[0]?.content?.slice(0, 30) + '...' || 'New Conversation',
                        messages: sanitizeMessages(s.messages),
                        updatedAt: s.updatedAt || new Date().toISOString()
                    }));
                    setConversations(mapped);
                }
            } catch (err) {
                console.error("ChatPage Init Error:", err);
            }
        };
        initData();
    }, []);

    // 2. Message Actions
    const sendMessage = async (content) => {
        if (!content?.trim()) return;

        const userMsg = {
            role: 'user',
            content: content.trim(),
            timestamp: new Date().toISOString()
        };

        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            // Send to Real Backend (chatService)
            const response = await chatService.sendMessage(
                content,
                activeConversation?.id,
                farmContext
            );

            const botMsg = {
                role: 'assistant',
                content: response.response,
                timestamp: new Date().toISOString()
            };

            const finalMessages = [...newMessages, botMsg];
            setMessages(finalMessages);

            // Update conversations list
            if (!activeConversation) {
                const newConv = {
                    id: response.sessionId,
                    title: content.slice(0, 30) + '...',
                    messages: finalMessages,
                    updatedAt: new Date().toISOString()
                };
                setConversations(prev => [newConv, ...prev]);
                setActiveConversation(newConv);
            } else {
                setConversations(prev => prev.map(c =>
                    c.id === activeConversation.id ? { ...c, messages: finalMessages } : c
                ));
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to get response");
        } finally {
            setIsLoading(false);
        }
    };

    const startNewChat = () => {
        setActiveConversation(null);
        setMessages([]);
    };

    const deleteChat = async (id) => {
        try {
            await chatService.deleteSession(id);
            setConversations(prev => prev.filter(c => c.id !== id));
            if (activeConversation?.id === id) startNewChat();
            toast.success("Conversation deleted");
        } catch (err) {
            toast.error("Failed to delete chat");
        }
    };

    // Helper: Sanitize history messages
    const sanitizeMessages = (msgs) => {
        if (!Array.isArray(msgs)) return [];
        return msgs.map(m => ({
            role: m.role || 'assistant',
            content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
            file_url: m.file_url || null,
            timestamp: m.timestamp || new Date().toISOString()
        }));
    };

    return (
        <ErrorBoundary>
            <div className="flex h-screen bg-gray-50/50 overflow-hidden">
                <Sidebar />

                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* Header: Design-matched to reference */}
                    <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between shrink-0">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 leading-tight">
                                Welcome back, {user?.firstName || 'Farmer'}! 👋
                            </h1>
                            <p className="text-sm text-gray-500">Here's what's happening with your farm today.</p>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-4 text-gray-400">
                                <Search className="w-5 h-5 cursor-pointer hover:text-emerald-600 transition-colors" />
                                <div className="relative cursor-pointer hover:text-emerald-600 transition-colors">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 border-l pl-6 border-gray-100">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-semibold text-gray-900">{user?.firstName || 'User'}</p>
                                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Farmer</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border-2 border-emerald-50">
                                    {user?.firstName?.[0] || 'U'}
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Content: 2-Column Grid */}
                    <div className="flex-1 p-6 overflow-hidden">
                        <div className="max-w-7xl mx-auto h-full grid grid-cols-12 gap-6">

                            {/* Left Panel: Conversations & Quick Tools */}
                            <div className="col-span-12 lg:col-span-3 flex flex-col h-full gap-4">

                                {/* 1. Conversations Card */}
                                <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-left-4 duration-500 max-h-[60%]">
                                    <div className="p-4 flex items-center justify-between border-b border-gray-50 bg-white/50">
                                        <h2 className="font-bold text-gray-800 text-sm">Conversations</h2>
                                        <button
                                            onClick={startNewChat}
                                            className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-100 active:scale-95"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                        {conversations.length === 0 ? (
                                            <div className="py-8 text-center px-4">
                                                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2">
                                                    <MessageSquare className="w-5 h-5 text-gray-300" />
                                                </div>
                                                <p className="text-xs text-gray-400 italic">No recent chats</p>
                                            </div>
                                        ) : (
                                            conversations.map(conv => (
                                                <div
                                                    key={conv.id}
                                                    className={`group relative p-2.5 rounded-xl cursor-pointer transition-all duration-200 ${activeConversation?.id === conv.id
                                                        ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50'
                                                        : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900 border border-transparent'
                                                        }`}
                                                    onClick={() => {
                                                        setActiveConversation(conv);
                                                        setMessages(conv.messages);
                                                    }}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${activeConversation?.id === conv.id ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-50 text-gray-400'
                                                            }`}>
                                                            <MessageSquare className="w-3.5 h-3.5" />
                                                        </div>
                                                        <span className="text-xs font-medium truncate pr-6">{conv.title}</span>
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); deleteChat(conv.id); }}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 hover:bg-white rounded-md transition-all shadow-sm"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* 2. WhatsApp Connect Card (New Feature) */}
                                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex flex-col items-center text-center space-y-3 shadow-sm">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-600">
                                        <MessageSquare className="w-5 h-5 fill-emerald-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-emerald-900 text-sm">Need Faster Help?</h3>
                                        <p className="text-xs text-emerald-700/80 mt-1">Connect with us on WhatsApp for instant farming updates.</p>
                                    </div>
                                    <button className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-200">
                                        Connect WhatsApp
                                    </button>
                                </div>

                            </div>

                            {/* Right Panel: Chat Content */}
                            <div className="col-span-12 lg:col-span-9 flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
                                <ChatInterface
                                    messages={messages}
                                    onSendMessage={sendMessage}
                                    isLoading={isLoading}
                                />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </ErrorBoundary>
    );
}
