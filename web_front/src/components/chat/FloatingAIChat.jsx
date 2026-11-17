import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { aiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import AiSuggestionCards from './AiSuggestionCards';
import AiMessageExtras from './AiMessageExtras';
import { GUEST_AI_TOKEN_KEY } from '../../pages/AIChat';
import { Bot, X, Send, Sparkles, RotateCcw, Maximize2 } from 'lucide-react';

const INITIAL_MESSAGES = {
    ar: {
        sender: 'bot',
        isWelcome: true,
        text: 'أهلاً بك في صيدليتي! أنا مساعدك الطبي الذكي 🤖. كيف يمكنني مساعدتك اليوم بخصوص الأدوية أو الأعراض؟',
    },
    en: {
        sender: 'bot',
        isWelcome: true,
        text: 'Welcome to Saydalety! I am your AI Pharmacist Assistant 🤖. How can I help you today with medications or symptoms?',
    },
};

const QUICK_PROMPTS_BY_LANG = {
    ar: [
        'الجرعة الآمنة للباراسيتامول؟',
        'نصائح لتناول المضادات الحيوية',
        'بدائل المسكنات لمرضى المعدة',
    ],
    en: [
        'Safe paracetamol dosage?',
        'Tips for taking antibiotics',
        'Painkiller alternatives for sensitive stomach',
    ],
};

const renderFormattedText = (text) => {
    if (!text) return null;
    const parts = String(text).split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*\n]+\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <strong key={i} className="font-extrabold">
                    {part.slice(2, -2)}
                </strong>
            );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return (
                <code
                    key={i}
                    className="px-1 py-0.5 rounded bg-emerald-50 text-[#0f6848] font-bold"
                >
                    {part.slice(1, -1)}
                </code>
            );
        }
        if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
            return (
                <span key={i} className="text-slate-600 font-medium">
                    {part.slice(1, -1)}
                </span>
            );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
    });
};

const FloatingAIChat = () => {
    const location = useLocation();
    const { user } = useAuth();
    const { lang } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([INITIAL_MESSAGES[lang] || INITIAL_MESSAGES.ar]);
    const [chatId, setChatId] = useState(null);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const prevUserIdRef = useRef(user?.id ?? null);

    useEffect(() => {
        setMessages((prev) => {
            if (prev.length === 1 && prev[0]?.isWelcome) {
                return [INITIAL_MESSAGES[lang] || INITIAL_MESSAGES.ar];
            }
            return prev;
        });
    }, [lang]);

    useEffect(() => {
        const curId = user?.id ?? null;
        if (prevUserIdRef.current !== curId) {
            const oldToken = sessionStorage.getItem(GUEST_AI_TOKEN_KEY);
            if (oldToken) {
                sessionStorage.removeItem(GUEST_AI_TOKEN_KEY);
                aiService.endGuestSession(oldToken).catch(() => {});
            }
            setChatId(null);
            setMessages([INITIAL_MESSAGES[lang] || INITIAL_MESSAGES.ar]);
            prevUserIdRef.current = curId;
        }
    }, [user, lang]);

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
            const guestToken = !user ? sessionStorage.getItem(GUEST_AI_TOKEN_KEY) : null;
            const res = await aiService.askQuestion(userText, user ? chatId : null, guestToken);
            const data = res.data || {};
            if (!user && data.guest_session_token) {
                sessionStorage.setItem(GUEST_AI_TOKEN_KEY, data.guest_session_token);
            }
            const reply =
                data.answer ||
                data.reply ||
                'عذراً، لم أتمكن من معالجة السؤال حالياً.';
            setMessages((prev) => [
                ...prev,
                {
                    sender: 'bot',
                    text: reply,
                    language: data.language || 'ar',
                    retrievalMode: data.retrieval_mode || null,
                    references: data.references || [],
                    suggestions: data.suggestions || null,
                    expertAssistance: data.expert_assistance || null,
                    guestRestricted: Boolean(data.guest_restricted),
                    isEmergency: Boolean(data.is_emergency),
                },
            ]);
            if (user && data.chat_id) {
                setChatId(data.chat_id);
            }
        } catch (err) {
            if (err.response?.data?.code === 'GUEST_SESSION_EXPIRED') {
                sessionStorage.removeItem(GUEST_AI_TOKEN_KEY);
            }
            const errMsg =
                err.response?.data?.answer ||
                err.response?.data?.message ||
                'حدث خطأ في الاتصال بالمساعد الذكي. يرجى المحاولة لاحقاً.';
            setMessages((prev) => [...prev, { sender: 'bot', text: errMsg, isError: true }]);
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
            {/* Subtle Compact Floating Action Button */}
            {!isOpen && (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    aria-label="الصيدلي الذكي"
                    className="fixed bottom-6 left-6 z-40 w-13 h-13 rounded-full bg-[#0f6848] hover:bg-[#0b5239] text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer"
                    title="اسأل الصيدلي الذكي"
                >
                    <Bot className="w-6 h-6" />
                    <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"></span>
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
                                onClick={() => { setMessages([INITIAL_MESSAGES[lang] || INITIAL_MESSAGES.ar]); setChatId(null); }}
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
                                className={`flex animate-fadeInUp ${msg.sender === 'user' ? 'justify-start' : 'justify-end'
                                    }`}
                            >
                                <div
                                    data-no-i18n={msg.isWelcome ? undefined : 'true'}
                                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${msg.sender === 'user'
                                        ? 'bg-gradient-to-r from-[#0f6848] to-[#14875e] text-white rounded-tr-none shadow-sm'
                                        : 'bg-white text-slate-800 border border-slate-100 shadow-sm rounded-tl-none'
                                        }`}
                                >
                                    {msg.sender === 'user' ? msg.text : (
                                        <>
                                            {renderFormattedText(msg.text)}
                                            <AiSuggestionCards
                                                suggestions={msg.suggestions}
                                                compact
                                                onNavigate={() => setIsOpen(false)}
                                            />
                                            <AiMessageExtras
                                                msg={msg}
                                                compact
                                                onNavigate={() => setIsOpen(false)}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}

                        {messages.length === 1 && !loading && (
                            <div className="pt-2 space-y-1.5">
                                <span className="text-[11px] text-slate-400 font-bold block">اقتراحات سريعة:</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {(QUICK_PROMPTS_BY_LANG[lang] || QUICK_PROMPTS_BY_LANG.ar).map((q, idx) => (
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
