import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    Bot,
    Send,
    AlertCircle,
    Sparkles,
    Check,
    Copy,
    Loader2,
    RotateCcw,
    User,
    Pill,
    ShieldAlert,
    HeartPulse,
    MessageSquare,
    Plus,
    Clock,
    LogIn,
} from 'lucide-react';
import { aiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AiSuggestionCards from '../components/chat/AiSuggestionCards';

const WELCOME_MSG = {
    id: 'welcome',
    sender: 'bot',
    text: 'مرحباً بك في عيادة الصيدلي الذكي 🤖!\nيمكنك سؤالي عن الجرعات المناسبة، التفاعلات الدوائية، البدائل الآمنة، أو النصائح الصيدلانية العامة وسأجيبك فوراً.',
    time: 'الآن',
};

const PROMPT_CATEGORIES = [
    {
        icon: Pill,
        title: 'الجرعات والاستخدام',
        prompt: 'ما هي الجرعة الآمنة للباراسيتامول للبالغين يومياً؟',
    },
    {
        icon: ShieldAlert,
        title: 'التداخلات الدوائية',
        prompt: 'ما هي أهم النصائح لتجنب التفاعلات عند تناول المضادات الحيوية؟',
    },
    {
        icon: HeartPulse,
        title: 'حفظ وتخزين الأدوية',
        prompt: 'ما هي أفضل طريقة لتخزين أدوية الإنسولين في المنزل؟',
    },
];

const formatTime = (isoString) => {
    const date = isoString ? new Date(isoString) : new Date();
    return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
};

const formatDateShort = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('ar-EG', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

let msgSeq = 0;
const nextMsgId = (prefix) => `${prefix}-${++msgSeq}`;

const renderFormattedText = (text) => {
    if (!text) return null;
    const parts = String(text).split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*\n]+\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <strong key={i} className="font-extrabold text-slate-900">
                    {part.slice(2, -2)}
                </strong>
            );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return (
                <code
                    key={i}
                    className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-[#0f6848] font-bold text-xs"
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

export default function AIChat() {
    const { user } = useAuth();
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState([WELCOME_MSG]);
    const [loading, setLoading] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const [chats, setChats] = useState([]);
    const [chatsLoading, setChatsLoading] = useState(false);
    const [activeChatId, setActiveChatId] = useState(null);
    const [loadingChatMessages, setLoadingChatMessages] = useState(false);
    const streamRef = useRef(null);

    const fetchUserChats = useCallback(async () => {
        if (!user) {
            setChats([]);
            return;
        }
        setChatsLoading(true);
        try {
            const res = await aiService.getChats();
            if (res.data?.success) {
                setChats(res.data.chats || []);
            }
        } catch {
            // Silently ignore if unauthorized
        } finally {
            setChatsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchUserChats();
        } else {
            setChats([]);
            setActiveChatId(null);
            setMessages([WELCOME_MSG]);
        }
    }, [user, fetchUserChats]);

    const handleSelectChat = async (chatId) => {
        if (loading || loadingChatMessages || chatId === activeChatId) return;
        setLoadingChatMessages(true);
        try {
            const res = await aiService.getChat(chatId);
            const chat = res.data?.chat;
            if (chat) {
                setActiveChatId(chat.id);
                const mapped = (chat.messages || []).map((m) => ({
                    id: `db-${m.id}`,
                    sender: m.sender,
                    text: m.text,
                    suggestions: m.suggestions || null,
                    time: formatTime(m.created_at),
                }));
                setMessages(mapped.length > 0 ? mapped : [WELCOME_MSG]);
            }
        } catch {
            // Ignore error
        } finally {
            setLoadingChatMessages(false);
        }
    };

    const handleNewChat = () => {
        setActiveChatId(null);
        setMessages([WELCOME_MSG]);
    };

    useEffect(() => {
        if (messages.length > 1 || loading) {
            streamRef.current?.scrollTo({
                top: streamRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [messages, loading]);

    const handleSend = async (e, presetPrompt) => {
        if (e) e.preventDefault();
        const query = (presetPrompt ?? question).trim();
        if (!query || loading) return;

        const userMsg = {
            id: nextMsgId('u'),
            sender: 'user',
            text: query,
            time: formatTime(),
        };

        setMessages((prev) => [...prev, userMsg]);
        if (!presetPrompt) setQuestion('');
        setLoading(true);

        try {
            const res = await aiService.askQuestion(query, user ? activeChatId : null);
            const replyText =
                res.data?.answer ||
                res.data?.reply ||
                res.data?.message ||
                'تم استلام سؤالك بنجاح.';
            setMessages((prev) => [
                ...prev,
                {
                    id: nextMsgId('b'),
                    sender: 'bot',
                    text: replyText,
                    suggestions: res.data?.suggestions || null,
                    time: formatTime(),
                },
            ]);

            if (user && res.data?.chat_id) {
                setActiveChatId(res.data.chat_id);
                fetchUserChats();
            }
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                {
                    id: nextMsgId('err'),
                    sender: 'bot',
                    isError: true,
                    text:
                        err.response?.data?.message ||
                        'عذراً، تعذر الاتصال بالمساعد الذكي حالياً. يرجى المحاولة مرة أخرى.',
                    time: formatTime(),
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (id, text) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="pb-14 bg-transparent min-h-screen">
            {/* Hero Header */}
            <div className="hero-mesh text-white py-10 mb-8 relative overflow-hidden">
                <div className="hero-grid-pattern absolute inset-0 pointer-events-none"></div>
                <div className={`${user ? 'max-w-6xl' : 'max-w-4xl'} mx-auto px-4 sm:px-6 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4`}>
                    <div className="flex items-center gap-4 text-center sm:text-right flex-col sm:flex-row">
                        <div className="w-16 h-16 rounded-3xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-xl">
                            <Bot className="w-9 h-9 text-emerald-200" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-0.5 rounded-full text-[11px] font-bold text-emerald-200 mb-1">
                                <Sparkles className="w-3 h-3 text-amber-300" />
                                <span>مدعوم بالذكاء الاصطناعي الطبي</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold font-almarai text-white m-0">
                                الصيدلي الذكي (AI)
                            </h1>
                        </div>
                    </div>

                    {(messages.length > 1 || activeChatId) && (
                        <button
                            type="button"
                            onClick={handleNewChat}
                            className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-xs font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>محادثة جديدة</span>
                        </button>
                    )}
                </div>
            </div>

            <div className={`${user ? 'max-w-6xl' : 'max-w-4xl'} mx-auto px-4 sm:px-6`}>
                <div className={user ? 'grid grid-cols-1 lg:grid-cols-12 gap-6 items-start' : ''}>
                    {/* User's Saved Chats Sidebar (Logged-in users only) */}
                    {user && (
                        <aside className="lg:col-span-4 lg:sticky lg:top-24 bg-white rounded-3xl shadow-lg border border-slate-100 p-5">
                            <div className="flex items-center justify-between gap-2 pb-3.5 mb-3.5 border-b border-slate-100">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#0f6848] flex items-center justify-center shrink-0">
                                        <MessageSquare className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-extrabold text-slate-800 font-almarai m-0">
                                            محادثاتي السابقة
                                        </h2>
                                        <p className="text-[11px] text-slate-400 m-0">
                                            سجل محادثاتك الخاصة
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleNewChat}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-[#0f6848] text-[#0f6848] hover:text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>جديد</span>
                                </button>
                            </div>

                            {chatsLoading ? (
                                <div className="py-10 flex flex-col items-center justify-center text-slate-400 gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin text-[#0f6848]" />
                                    <span className="text-xs">جاري تحميل محادثاتك...</span>
                                </div>
                            ) : chats.length === 0 ? (
                                <div className="py-8 px-3 text-center text-xs text-slate-400 leading-relaxed">
                                    لا توجد محادثات سابقة بعد. ابدأ بسؤال الصيدلي الذكي وسيتم حفظ المحادثة هنا تلقائياً.
                                </div>
                            ) : (
                                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pl-1">
                                    {chats.map((chat) => {
                                        const isActive = chat.id === activeChatId;
                                        return (
                                            <button
                                                key={chat.id}
                                                type="button"
                                                onClick={() => handleSelectChat(chat.id)}
                                                className={`w-full text-right p-3.5 rounded-2xl border transition-all cursor-pointer ${
                                                    isActive
                                                        ? 'bg-emerald-50/90 border-[#0f6848]/40 shadow-sm'
                                                        : 'bg-slate-50/60 border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                                                }`}
                                            >
                                                <div className="text-xs font-bold text-slate-800 line-clamp-2 mb-2">
                                                    {chat.title}
                                                </div>
                                                <div className="flex items-center justify-between text-[10px] text-slate-400">
                                                    <span className="inline-flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatDateShort(chat.last_message_at || chat.created_at)}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-100 font-bold text-slate-600">
                                                        {chat.messages_count ?? 0} رسالة
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </aside>
                    )}

                    {/* Main Chat Area */}
                    <div className={user ? 'lg:col-span-8' : ''}>
                        {!user && (
                            <div className="mb-4 px-4 py-2.5 rounded-2xl bg-white/85 backdrop-blur-sm border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 shadow-sm">
                                <span>
                                    أنت في <strong>وضع الضيف</strong> — لا يتم حفظ المحادثات. سجل دخولك لحفظ سجل محادثاتك والرجوع إليها.
                                </span>
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0f6848] hover:bg-[#0b5037] text-white font-bold transition-colors shrink-0"
                                >
                                    <LogIn className="w-3.5 h-3.5" />
                                    <span>تسجيل الدخول</span>
                                </Link>
                            </div>
                        )}
                {/* Quick Prompt Cards */}
                {messages.length === 1 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6 animate-fadeInUp">
                        {PROMPT_CATEGORIES.map((item, idx) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleSend(null, item.prompt)}
                                    className="text-right p-4 bg-white rounded-2xl border border-slate-100 hover:border-[#0f6848]/35 hover:shadow-lg transition-all group cursor-pointer"
                                >
                                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#0f6848] flex items-center justify-center mb-2.5 group-hover:bg-[#0f6848] group-hover:text-white transition-colors">
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <h4 className="text-xs font-extrabold text-slate-800 mb-1 font-almarai">
                                        {item.title}
                                    </h4>
                                    <p className="text-[11px] text-slate-500 leading-relaxed m-0 line-clamp-2">
                                        {item.prompt}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Chat Container */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col h-[540px]">
                    {/* Conversation Stream */}
                    <div
                        ref={streamRef}
                        className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50"
                    >
                        {loadingChatMessages && (
                            <div className="py-12 flex items-center justify-center gap-2 text-xs text-slate-500">
                                <Loader2 className="w-4 h-4 animate-spin text-[#0f6848]" />
                                <span>جاري تحميل رسائل المحادثة...</span>
                            </div>
                        )}

                        {!loadingChatMessages && messages.map((msg) => {
                            const isUser = msg.sender === 'user';
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex items-start gap-3 animate-fadeInUp ${
                                        isUser ? 'flex-row' : 'flex-row-reverse'
                                    }`}
                                >
                                    <div
                                        className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                                            isUser
                                                ? 'bg-[#0f6848] text-white'
                                                : 'bg-emerald-100 text-[#0f6848]'
                                        }`}
                                    >
                                        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
                                    </div>

                                    <div className="max-w-[82%] space-y-1">
                                        <div
                                            className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                                                isUser
                                                    ? 'bg-gradient-to-br from-[#0f6848] to-[#14875e] text-white rounded-tr-none'
                                                    : msg.isError
                                                    ? 'bg-rose-50 text-rose-700 border border-rose-200 rounded-tl-none'
                                                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                                            }`}
                                        >
                                            {isUser ? msg.text : renderFormattedText(msg.text)}
                                        </div>

                                        {!isUser && !msg.isError && msg.suggestions && (
                                            <AiSuggestionCards suggestions={msg.suggestions} />
                                        )}

                                        <div
                                            className={`flex items-center gap-3 text-[11px] text-slate-400 px-1 ${
                                                isUser ? 'justify-start' : 'justify-end'
                                            }`}
                                        >
                                            <span>{msg.time}</span>
                                            {!isUser && !msg.isError && msg.id !== 'welcome' && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(msg.id, msg.text)}
                                                    className="inline-flex items-center gap-1 text-slate-400 hover:text-[#0f6848] cursor-pointer"
                                                >
                                                    {copiedId === msg.id ? (
                                                        <>
                                                            <Check className="w-3 h-3 text-emerald-600" />
                                                            <span className="text-emerald-600 font-bold">تم النسخ</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-3 h-3" />
                                                            <span>نسخ</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {loading && (
                            <div className="flex items-start gap-3 flex-row-reverse animate-fadeIn">
                                <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-[#0f6848] flex items-center justify-center shrink-0">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div className="bg-white border border-slate-100 px-5 py-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3 text-xs font-bold text-slate-600">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                    </div>
                                    <span>جاري مراجعة المراجع الصيدلانية وكتابة الإجابة...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Composer */}
                    <form
                        onSubmit={(e) => handleSend(e)}
                        className="p-4 bg-white border-t border-slate-100 flex items-center gap-2.5"
                    >
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            disabled={loading}
                            placeholder="اكتب استفسارك الطبي أو اسم الدواء هنا..."
                            className="flex-1 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        />
                        <button
                            type="submit"
                            disabled={loading || !question.trim()}
                            className="btn-main px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-40 cursor-pointer shrink-0"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>إرسال</span>
                                    <Send className="w-4 h-4 -scale-x-100" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Medical Disclaimer */}
                <div className="mt-4 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                        <strong>تنبيه طبي:</strong> المعلومات المقدمة من المساعد الذكي مخصصة للتثقيف والإرشاد الصيدلاني العام ولا تغني عن الكشف الطبي المباشر في الحالات الطارئة.
                    </span>
                </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
