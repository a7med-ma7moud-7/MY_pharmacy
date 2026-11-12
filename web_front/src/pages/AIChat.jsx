import React, { useState, useRef, useEffect } from 'react';
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
} from 'lucide-react';
import { aiService } from '../services/api';

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

const formatTime = () =>
    new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

let msgSeq = 0;
const nextMsgId = (prefix) => `${prefix}-${++msgSeq}`;

export default function AIChat() {
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState([WELCOME_MSG]);
    const [loading, setLoading] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const streamRef = useRef(null);

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
            const res = await aiService.askQuestion(query);
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
                    time: formatTime(),
                },
            ]);
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
        <div className="pb-14 bg-slate-50 min-h-screen">
            {/* Hero Header */}
            <div className="hero-mesh text-white py-10 mb-8 relative overflow-hidden">
                <div className="hero-grid-pattern absolute inset-0 pointer-events-none"></div>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
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

                    {messages.length > 1 && (
                        <button
                            type="button"
                            onClick={() => setMessages([WELCOME_MSG])}
                            className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-xs font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>محادثة جديدة</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6">
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
                        {messages.map((msg) => {
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
                                            {msg.text}
                                        </div>

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
    );
}
