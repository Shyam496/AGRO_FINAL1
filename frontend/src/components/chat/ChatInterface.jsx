import React, { useRef, useEffect, useState } from 'react';
import {
    Send,
    User as UserIcon,
    Bot,
    Paperclip,
    Loader2,
    X,
    Volume2,
    VolumeX,
    Sparkles,
    CheckCircle2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ChatInterface Component
 * Upgraded with Markdown, File Upload UI, and Smooth Animations.
 */
export default function ChatInterface({ messages, onSendMessage, isLoading }) {
    const [input, setInput] = useState('');
    const [isTTSActive, setIsTTSActive] = useState(true);
    const messagesEndRef = useRef(null);

    // Initial prompts from the design reference (kept for compatibility)
    const quickPrompts = [
        "What's the best time to plant wheat?",
        "How to control aphids in my cotton crop?",
        "What fertilizer should I use for rice?",
        "Is it good to harvest now?",
        "Tell me about PM-KISAN scheme"
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        onSendMessage(input.trim());
        setInput('');
    };



    const toggleTTS = () => setIsTTSActive(!isTTSActive);

    // Filter "system" messages if any, though usually backend handles roles
    const displayMessages = messages.filter(m => m.role !== 'system');

    return (
        <div className="flex flex-col h-full bg-white relative">
            {/* 1. Interface Header */}
            <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-inner">
                        <Bot className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm leading-none mb-1">AgroMind Assistant</h3>
                        <p className="text-[10px] text-gray-500 font-medium">Your AI farming advisor</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleTTS}
                        title={isTTSActive ? "Disable Voice" : "Enable Voice"}
                        className={`p-2 rounded-xl transition-all duration-200 ${isTTSActive
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'text-gray-400 hover:bg-gray-50 border border-transparent hover:border-gray-100'
                            }`}
                    >
                        {isTTSActive ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* 2. Chat Contents */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                {displayMessages.length === 0 ? (
                    /* High-Fidelity Empty State (Reference Match) */
                    <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-700">
                        <div className="relative">
                            <motion.div
                                initial={{ rotate: -10, scale: 0.9 }}
                                animate={{ rotate: 0, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="w-24 h-24 rounded-[2rem] bg-emerald-50 flex items-center justify-center border-2 border-emerald-100 shadow-xl shadow-emerald-500/5"
                            >
                                <Bot className="w-12 h-12 text-emerald-600" />
                            </motion.div>
                            <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-2xl bg-emerald-600 flex items-center justify-center text-white border-4 border-white shadow-lg">
                                <Sparkles className="w-4 h-4" />
                            </div>
                        </div>

                        <div className="space-y-4 text-center">
                            <h2 className="text-4xl font-black text-gray-900 tracking-tight">
                                Hello! I'm <span className="text-emerald-600">AgroMind</span> 🌾
                            </h2>
                            <p className="text-gray-500 leading-relaxed text-sm max-w-sm mx-auto font-medium">
                                I'm here to help with crop diseases, fertilizer calculations, recipes, and weather advice.
                            </p>
                        </div>

                        {/* Quick Action Chips */}
                        <div className="flex flex-wrap items-center justify-center gap-2.5 px-4">
                            {quickPrompts.map((prompt, idx) => (
                                <motion.button
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    onClick={() => onSendMessage(prompt)}
                                    className="px-4 py-2.5 text-xs font-semibold text-gray-700 bg-white border border-gray-100 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50/50 hover:text-emerald-700 transition-all shadow-sm hover:shadow-emerald-100 active:scale-95 flex items-center gap-2 group"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-200 group-hover:bg-emerald-500 transition-colors"></div>
                                    {prompt}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Active Chat Flow */
                    <AnimatePresence mode="popLayout">
                        {displayMessages.map((m, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${m.role === 'user'
                                    ? 'bg-emerald-600 border-emerald-500 text-white'
                                    : 'bg-white border-gray-100 text-emerald-600'
                                    }`}>
                                    {m.role === 'user' ? <UserIcon className="w-5 h-5" /> : <Bot className="w-6 h-6" />}
                                </div>

                                <div className={`relative max-w-[85%] p-5 rounded-3xl text-sm leading-relaxed shadow-sm ${m.role === 'user'
                                    ? 'bg-emerald-600 text-white rounded-tr-none'
                                    : 'bg-white border border-gray-50 text-gray-800 rounded-tl-none'
                                    }`}>
                                    {/* Markdown Content */}
                                    <div className={`prose prose-sm max-w-none ${m.role === 'user' ? 'text-white prose-invert' : 'text-gray-800'}`}>
                                        <ReactMarkdown
                                            components={{
                                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                                ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                                                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                                                li: ({ children }) => <li className="">{children}</li>,
                                                strong: ({ children }) => <strong className={`font-bold ${m.role === 'user' ? 'text-white' : 'text-gray-900'}`}>{children}</strong>,
                                                h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-4 first:mt-0">{children}</h1>,
                                                h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-3">{children}</h2>,
                                                h3: ({ children }) => <h3 className="text-sm font-bold mb-1 mt-2">{children}</h3>,
                                                code: ({ inline, children }) =>
                                                    inline
                                                        ? <code className={`px-1 rounded text-xs font-mono ${m.role === 'user' ? 'bg-emerald-700/50' : 'bg-gray-100'}`}>{children}</code>
                                                        : <pre className="bg-gray-900 text-white p-3 rounded-xl text-xs overflow-x-auto my-2"><code>{children}</code></pre>
                                            }}
                                        >
                                            {typeof m.content === 'string' ? m.content : JSON.stringify(m.content)}
                                        </ReactMarkdown>
                                    </div>

                                    {/* File Attachment Display */}
                                    {m.file_url && (
                                        <img
                                            src={m.file_url}
                                            alt="Uploaded attachment"
                                            className="mt-3 rounded-xl max-h-48 object-cover border border-white/20"
                                        />
                                    )}

                                    <div className={`text-[9px] mt-3 font-bold uppercase tracking-wider opacity-40 flex items-center gap-1.5 ${m.role === 'user' ? 'justify-end' : ''}`}>
                                        {m.role === 'assistant' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                                        {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Verified'}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}

                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-4"
                    >
                        <div className="w-10 h-10 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center">
                            <Bot className="w-6 h-6 text-gray-200" />
                        </div>
                        <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm flex items-center gap-3">
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                            <span className="text-sm text-gray-500 font-medium">Thinking...</span>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* 3. Input Console (Enhanced Premium Design) */}
            <div className="p-6 bg-gradient-to-br from-white via-emerald-50/20 to-white border-t border-gray-100 sticky bottom-0 z-20 backdrop-blur-sm">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                    <div className="relative group">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isLoading ? "AgroMind is thinking..." : "Ask me anything about farming..."}
                            disabled={isLoading}
                            className="w-full pl-6 pr-16 py-5 bg-white border-2 border-gray-200/80 rounded-[2rem] outline-none focus:border-emerald-500 focus:shadow-xl focus:shadow-emerald-500/10 transition-all duration-300 text-sm font-medium placeholder:text-gray-400 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/5"
                        />

                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className={`p-3.5 rounded-[1.5rem] transition-all duration-300 ${!input.trim() || isLoading
                                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                    : 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-95 hover:scale-105'
                                    }`}
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </form>

                <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60 mt-4">
                    AgroMind AI can make mistakes. Verify critical farm info.
                </p>
            </div>
        </div>
    );
}
