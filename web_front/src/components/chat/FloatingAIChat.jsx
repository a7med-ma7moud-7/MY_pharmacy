import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { aiService } from '../../services/api';
import { Bot, X, Send, Sparkles, RotateCcw, Maximize2 } from 'lucide-react';

const INITIAL_MESSAGE = {
    sender: 'bot',
    text: 'أهلاً بك في صيدليتي! أنا مساعدك الطبي الذكي 🤖. كيف يمكنني مساعدتك اليوم بخصوص الأدوية أو الأعراض؟',
};

const QUICK_PROMPTS = [
    'الجرعة الآمنة للباراسيتامول؟',
    'نصائح لتناول المضادات الحيوية',
    'بدائل المسكنات لمرضى المعدة',
];

const FloatingAIChat = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([INITIAL_MESSAGE]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    if (location.pathname === '/ai-chat') return null;

    const sendQuery = async (textToSend) => {
        const userText = (textToSend ?? message).trim();
        if (!userText || loading) return;

        setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
        setMessage('');
        setLoading(true);

        try {
            const res = await aiService.askQuestion(userText);
            const reply =
                res.data?.answer ||
                res.data?.reply ||
                'عذراً، لم أتمكن من معالجة السؤال حالياً.';
            setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
        } catch (err) {
            const errMsg =
                err.response?.data?.answer ||
                'حدث خطأ في الاتصال بالمساعد الذكي. يرجى المحاولة لاحقاً.';
            setMessages((prev) => [...prev, { sender: 'bot', text: errMsg }]);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = (e) => {
        e.preventDefault();
        sendQuery(message);
    };

    return (
        <>
            {/* Floating Action Button */}
            {!isOpen && (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 left-6 z-40 h-14 px-4 sm:px-5 rounded-full bg-gradient-to-tr from-[#093d2b] via-[#0f6848] to-[#10ac84] text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2.5 group cursor-pointer animate-pulse-glow"
                    title="اسأل الصيدلي الذكي"
                >
                    <div className="relative flex items-center justify-center">
                        <Bot className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full ring-2 ring-[#0f6848]"></span>
                    </div>
                    <span className="hidden sm:inline text-xs font-extrabold tracking-wide">
                        الصيدلي الذكي
                    </span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 left-6 z-50 w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col h-[500px] animate-scaleIn">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#093d2b] via-[#0f6848] to-[#10ac84] text-white p-4 flex items-center justify-between shadow-md">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm relative">
                                <Bot className="w-6 h-6 text-white" />
                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-300 rounded-full border-2 border-[#0f6848]"></span>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm font-almarai flex items-center gap-1 text-white">
                                    <span>الصيدلي الذكي</span>
                                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                </h4>
                                <span className="text-[11px] text-emerald-100 block">متصل الآن للإجابة الفورية</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Link
                                to="/ai-chat"
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 hover:bg-white/20 rounded-xl transition-colors text-white/90 hover:text-white"
                                title="فتح في شاشة كاملة"
                            >
                                <Maximize2 className="w-4 h-4" />
                            </Link>
                            <button
                                type="button"
                                onClick={() => setMessages([INITIAL_MESSAGE])}
                                className="p-1.5 hover:bg-white/20 rounded-xl transition-colors text-white/90 hover:text-white cursor-pointer"
                                title="محادثة جديدة"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 hover:bg-white/20 rounded-xl transition-colors text-white cursor-pointer"
                                title="إغلاق"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/70">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex animate-fadeInUp ${
                                    msg.sender === 'user' ? 'justify-start' : 'justify-end'
                                }`}
                            >
                                <div
                                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                                        msg.sender === 'user'
                                            ? 'bg-gradient-to-r from-[#0f6848] to-[#14875e] text-white rounded-tr-none shadow-sm'
                                            : 'bg-white text-slate-800 border border-slate-100 shadow-sm rounded-tl-none'
                                    }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {messages.length === 1 && !loading && (
                            <div className="pt-2 space-y-1.5">
                                <span className="text-[11px] text-slate-400 font-bold block">اقتراحات سريعة:</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {QUICK_PROMPTS.map((q, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => sendQuery(q)}
                                            className="text-[11px] bg-white hover:bg-emerald-50 text-[#0f6848] border border-emerald-200 px-3 py-1 rounded-full font-semibold transition-all cursor-pointer"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {loading && (
                            <div className="flex justify-end">
                                <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2 text-xs text-slate-500">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                    </div>
                                    <span>يكتب الرد الطبي...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Form */}
                    <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="اكتب سؤالك الطبي هنا..."
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                        />
                        <button
                            type="submit"
                            disabled={loading || !message.trim()}
                            className="bg-gradient-to-r from-[#0f6848] to-[#14875e] text-white p-2.5 rounded-xl disabled:opacity-40 transition-all hover:shadow-md active:scale-95 cursor-pointer"
                        >
                            <Send className="w-4 h-4 -scale-x-100" />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default FloatingAIChat;
