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
  Trash2,
  Stethoscope,
  Globe,
  RefreshCw,
} from 'lucide-react';
import { aiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import AiSuggestionCards from '../components/chat/AiSuggestionCards';
import AiMessageExtras, { RetrievalModeBadge } from '../components/chat/AiMessageExtras';

export const GUEST_AI_TOKEN_KEY = 'saydalety_ai_guest_token';

const buildWelcomeMessage = (lang = 'ar', isAuthenticated = false) => ({
  id: 'welcome',
  sender: 'bot',
  language: lang,
  text:
    lang === 'en'
      ? `Welcome to the **Saydalety AI Pharmacist Assistant** 🤖!\nAsk me in **Arabic or English** about medication uses, side effects, precautions, or verified medical references.${
          isAuthenticated
            ? '\nBecause you are signed in, you can also ask about **your own prescriptions, upcoming appointments, and recorded medications**.'
            : ''
        }`
      : `مرحباً بك في **الصيدلي الذكي لمنصة صيدليتي** 🤖!\nيمكنك سؤالي بالعربية أو الإنجليزية عن الجرعات الإرشادية، التداخلات الدوائية، الأعراض الجانبية، والمعلومات الطبية الموثقة بالمراجع.${
          isAuthenticated
            ? '\nولأنك مسجل الدخول، يمكنك أيضاً الاستفسار عن **روشتاتك الطبية، مواعيدك القادمة، وشرح أدويتك المسجلة**.'
            : ''
        }`,
  time: lang === 'en' ? 'Now' : 'الآن',
});

const FALLBACK_PROMPTS_AR = [
  {
    icon: Pill,
    title: 'الجرعات والاستخدام',
    prompt: 'ما هي الجرعة الآمنة للباراسيتامول للبالغين يومياً وما احتياطاته؟',
  },
  {
    icon: ShieldAlert,
    title: 'المضادات والفيروسات',
    prompt: 'ما الفرق بين المضادات الحيوية ومضادات الفيروسات ومتى تُستخدم؟',
  },
  {
    icon: HeartPulse,
    title: 'حفظ وتخزين الأدوية',
    prompt: 'ما هي الطريقة الصحيحة لحفظ أقلام الإنسولين في المنزل؟',
  },
];

const FALLBACK_PROMPTS_EN = [
  {
    icon: Pill,
    title: 'Uses & Precautions',
    prompt: 'What is Paracetamol used for and what are its daily dose precautions?',
  },
  {
    icon: ShieldAlert,
    title: 'Side Effects',
    prompt: 'What are the common side effects and contraindications of Ibuprofen?',
  },
  {
    icon: HeartPulse,
    title: 'Antibiotics vs Antivirals',
    prompt: 'What is the difference between antibiotics and antivirals?',
  },
];

const PROMPT_ICONS = [Pill, ShieldAlert, HeartPulse, Stethoscope];

const formatTime = (isoString, lang = 'ar') => {
  const date = isoString ? new Date(isoString) : new Date();
  return date.toLocaleTimeString(lang === 'en' ? 'en-US' : 'ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  });
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
  const { lang: globalLang } = useLanguage();
  const [promptLang, setPromptLang] = useState(globalLang);
  const [suggestedPrompts, setSuggestedPrompts] = useState(
    globalLang === 'en' ? FALLBACK_PROMPTS_EN : FALLBACK_PROMPTS_AR
  );
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState(() => [buildWelcomeMessage(globalLang, Boolean(user))]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [chats, setChats] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [loadingChatMessages, setLoadingChatMessages] = useState(false);
  const [deleteTargetChat, setDeleteTargetChat] = useState(null);
  const [deletingChat, setDeletingChat] = useState(false);
  const [sessionNotice, setSessionNotice] = useState(null);

  const streamRef = useRef(null);
  const prevUserIdRef = useRef(user?.id ?? null);

  useEffect(() => {
    setPromptLang(globalLang);
    setSuggestedPrompts(globalLang === 'en' ? FALLBACK_PROMPTS_EN : FALLBACK_PROMPTS_AR);
    setMessages((prev) =>
      prev.length === 1 && prev[0]?.id === 'welcome'
        ? [buildWelcomeMessage(globalLang, Boolean(user))]
        : prev
    );
  }, [globalLang, user]);

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
      // Ignore if unauthenticated
    } finally {
      setChatsLoading(false);
    }
  }, [user]);

  // Fetch contextual suggested questions (Guest vs Authenticated, AR vs EN)
  useEffect(() => {
    let active = true;
    aiService
      .getSuggestedQuestions(promptLang)
      .then((res) => {
        if (!active) return;
        const list = res.data?.suggestions || res.data?.data?.suggestions;
        if (Array.isArray(list) && list.length > 0) {
          setSuggestedPrompts(
            list.map((item, idx) => ({
              icon: PROMPT_ICONS[idx % PROMPT_ICONS.length],
              title: item.title,
              prompt: item.prompt,
              category: item.category,
            }))
          );
        } else {
          setSuggestedPrompts(promptLang === 'en' ? FALLBACK_PROMPTS_EN : FALLBACK_PROMPTS_AR);
        }
      })
      .catch(() => {
        if (active) {
          setSuggestedPrompts(promptLang === 'en' ? FALLBACK_PROMPTS_EN : FALLBACK_PROMPTS_AR);
        }
      });

    return () => {
      active = false;
    };
  }, [promptLang, user]);

  // Enforce BR-03 & BR-04: Never transfer guest session to an authenticated account on login, and clear chat state on auth switch
  useEffect(() => {
    const currentUserId = user?.id ?? null;
    if (prevUserIdRef.current !== currentUserId) {
      const existingGuestToken = sessionStorage.getItem(GUEST_AI_TOKEN_KEY);
      if (existingGuestToken) {
        sessionStorage.removeItem(GUEST_AI_TOKEN_KEY);
        aiService.endGuestSession(existingGuestToken).catch(() => {});
      }
      setActiveChatId(null);
      setSessionNotice(null);
      setMessages([buildWelcomeMessage(promptLang, Boolean(user))]);
      prevUserIdRef.current = currentUserId;
    }

    if (user) {
      fetchUserChats();
    } else {
      setChats([]);
    }
  }, [user, fetchUserChats, promptLang]);

  const handleSelectChat = async (chatId) => {
    if (loading || loadingChatMessages || chatId === activeChatId) return;
    setLoadingChatMessages(true);
    setSessionNotice(null);
    try {
      const res = await aiService.getChat(chatId);
      const chat = res.data?.chat;
      if (chat) {
        setActiveChatId(chat.id);
        const mapped = (chat.messages || []).map((m) => ({
          id: `db-${m.id}`,
          dbMessageId: m.id,
          sender: m.sender,
          text: m.text,
          language: m.language || chat.language || 'ar',
          retrievalMode: m.retrieval_mode || null,
          references: m.references || [],
          suggestions: m.suggestions || null,
          expertAssistance: m.expert_assistance || null,
          isEmergency: Boolean(m.is_emergency),
          userFeedback: m.user_feedback || null,
          time: formatTime(m.created_at, m.language || 'ar'),
        }));
        setMessages(
          mapped.length > 0 ? mapped : [buildWelcomeMessage(chat.language || 'ar', true)]
        );
      }
    } catch (err) {
      setSessionNotice(
        err.response?.data?.message || 'تعذر تحميل هذه المحادثة أو قد تكون حُذفت.'
      );
    } finally {
      setLoadingChatMessages(false);
    }
  };

  const handleNewChat = async () => {
    setActiveChatId(null);
    setSessionNotice(null);
    if (!user) {
      const oldToken = sessionStorage.getItem(GUEST_AI_TOKEN_KEY);
      sessionStorage.removeItem(GUEST_AI_TOKEN_KEY);
      if (oldToken) {
        aiService.endGuestSession(oldToken).catch(() => {});
      }
    }
    setMessages([buildWelcomeMessage(promptLang, Boolean(user))]);
  };

  const handleConfirmDeleteChat = async () => {
    if (!deleteTargetChat || deletingChat) return;
    setDeletingChat(true);
    try {
      const targetId = deleteTargetChat.id;
      await aiService.deleteChat(targetId);
      setChats((prev) => prev.filter((c) => c.id !== targetId));
      if (activeChatId === targetId) {
        setActiveChatId(null);
        setMessages([buildWelcomeMessage(promptLang, Boolean(user))]);
      }
      setDeleteTargetChat(null);
      setSessionNotice('تم حذف المحادثة بأمان (مع الحفاظ التام على سجلاتك الطبية الأصلية).');
      setTimeout(() => setSessionNotice(null), 4000);
    } catch (err) {
      setSessionNotice(err.response?.data?.message || 'تعذر حذف المحادثة حالياً.');
      setDeleteTargetChat(null);
    } finally {
      setDeletingChat(false);
    }
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

    setSessionNotice(null);
    const detectedInputLang = /[a-zA-Z]/.test(query) && !/[\u0600-\u06FF]/.test(query) ? 'en' : 'ar';

    const userMsg = {
      id: nextMsgId('u'),
      sender: 'user',
      text: query,
      language: detectedInputLang,
      time: formatTime(null, detectedInputLang),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!presetPrompt) setQuestion('');
    setLoading(true);

    try {
      const guestToken = !user ? sessionStorage.getItem(GUEST_AI_TOKEN_KEY) : null;
      const res = await aiService.askQuestion(query, user ? activeChatId : null, guestToken);
      const data = res.data || {};
      const replyLang = data.language || detectedInputLang;
      const replyText =
        data.answer || data.reply || data.message || 'تم استلام سؤالك بنجاح.';

      if (!user && data.guest_session_token) {
        sessionStorage.setItem(GUEST_AI_TOKEN_KEY, data.guest_session_token);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: nextMsgId('b'),
          dbMessageId: data.bot_message_id || null,
          sender: 'bot',
          text: replyText,
          language: replyLang,
          retrievalMode: data.retrieval_mode || null,
          references: data.references || [],
          suggestions: data.suggestions || null,
          expertAssistance: data.expert_assistance || null,
          guestRestricted: Boolean(data.guest_restricted),
          isEmergency: Boolean(data.is_emergency),
          time: formatTime(null, replyLang),
        },
      ]);

      if (user && data.chat_id) {
        setActiveChatId(data.chat_id);
        fetchUserChats();
      }
    } catch (err) {
      const status = err.response?.status;
      const errCode = err.response?.data?.code;
      const serverMsg = err.response?.data?.answer || err.response?.data?.message;

      if (status === 401 && errCode === 'GUEST_SESSION_EXPIRED') {
        sessionStorage.removeItem(GUEST_AI_TOKEN_KEY);
        setSessionNotice(
          detectedInputLang === 'en'
            ? 'Your temporary guest session expired. A fresh guest session is ready.'
            : 'انتهت صلاحية جلسة الزائر المؤقتة. يمكنك الآن بدء جلسة جديدة.'
        );
      }

      if (status === 403 && errCode === 'UNAUTHORIZED_RECORD_ACCESS') {
        setMessages((prev) => [
          ...prev,
          {
            id: nextMsgId('sec'),
            sender: 'bot',
            language: detectedInputLang,
            retrievalMode: 'restricted',
            text:
              serverMsg ||
              'غير مصرح بالوصول إلى سجلات مستخدم آخر حفاظاً على خصوصية المرضى.',
            time: formatTime(null, detectedInputLang),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: nextMsgId('err'),
            sender: 'bot',
            isError: true,
            retryQuery: query,
            language: detectedInputLang,
            text:
              serverMsg ||
              (detectedInputLang === 'en'
                ? 'Unable to reach the AI Pharmacist right now. Please try again.'
                : 'عذراً، تعذر الاتصال بالمساعد الذكي حالياً. يرجى المحاولة مرة أخرى.'),
            time: formatTime(null, detectedInputLang),
          },
        ]);
      }
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
        <div
          className={`${
            user ? 'max-w-6xl' : 'max-w-4xl'
          } mx-auto px-4 sm:px-6 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4`}
        >
          <div className="flex items-center gap-4 text-center sm:text-right flex-col sm:flex-row">
            <div className="w-16 h-16 rounded-3xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-xl">
              <Bot className="w-9 h-9 text-emerald-200" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-0.5 rounded-full text-[11px] font-bold text-emerald-200 mb-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>بحث طبي عام موثق + سجلاتك الصحية المصرح بها</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-almarai text-white m-0">
                الصيدلي الذكي (AI Pharmacist)
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const nextLang = promptLang === 'ar' ? 'en' : 'ar';
                setPromptLang(nextLang);
                setSuggestedPrompts(
                  nextLang === 'en' ? FALLBACK_PROMPTS_EN : FALLBACK_PROMPTS_AR
                );
                if (messages.length === 1 && messages[0]?.id === 'welcome') {
                  setMessages([buildWelcomeMessage(nextLang, Boolean(user))]);
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer"
              title="تبديل لغة الاقتراحات / Switch Prompt Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{promptLang === 'ar' ? 'English Prompts' : 'اقتراحات بالعربية'}</span>
            </button>

            {(messages.length > 1 || activeChatId) && (
              <button
                type="button"
                onClick={handleNewChat}
                className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-xs font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{promptLang === 'en' ? 'New Chat' : 'محادثة جديدة'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={`${user ? 'max-w-6xl' : 'max-w-4xl'} mx-auto px-4 sm:px-6`}>
        {sessionNotice && (
          <div className="mb-4 px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-[#0f6848] flex items-center justify-between gap-2">
            <span>{sessionNotice}</span>
            <button
              type="button"
              onClick={() => setSessionNotice(null)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

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
                      محادثاتي المحفوظة
                    </h2>
                    <p className="text-[11px] text-slate-400 m-0">
                      سجل محادثاتك الخاصة المعزولة لحسابك
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
                  لا توجد محادثات محفوظة بعد. ابدأ بطرح سؤالك الطبي أو الشخصي وسيتم حفظ المحادثة تلقائياً هنا.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[470px] overflow-y-auto pl-1">
                  {chats.map((chat) => {
                    const isActive = chat.id === activeChatId;
                    return (
                      <div
                        key={chat.id}
                        className={`group relative rounded-2xl border transition-all ${
                          isActive
                            ? 'bg-emerald-50/90 border-[#0f6848]/40 shadow-sm'
                            : 'bg-slate-50/60 border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectChat(chat.id)}
                          className="w-full text-right p-3.5 pl-10 cursor-pointer"
                        >
                          <div className="text-xs font-extrabold text-slate-800 line-clamp-1 mb-1">
                            {chat.title}
                          </div>
                          {chat.last_message_preview && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 mb-2 m-0">
                              {chat.last_message_preview}
                            </p>
                          )}
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

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTargetChat(chat);
                          }}
                          className="absolute top-3 left-2.5 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="حذف المحادثة"
                          aria-label="حذف المحادثة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </aside>
          )}

          {/* Main Chat Area */}
          <div className={user ? 'lg:col-span-8' : ''}>
            {!user && (
              <div className="mb-4 px-4 py-2.5 rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 shadow-sm">
                <span>
                  أنت في <strong>وضع الزائر المؤقت (Guest)</strong> — يمكنك طرح الأسئلة الطبية العامة بحرية، بينما يتطلب عرض روشتاتك ومواعيدك وحفظ المحادثات تسجيل الدخول.
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

            {/* Suggested Questions Cards */}
            {messages.length === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 animate-fadeInUp">
                {suggestedPrompts.slice(0, 4).map((item, idx) => {
                  const Icon = item.icon || Pill;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(null, item.prompt)}
                      className="text-right p-4 bg-white rounded-2xl border border-slate-100 hover:border-[#0f6848]/35 hover:shadow-lg transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0f6848] flex items-center justify-center group-hover:bg-[#0f6848] group-hover:text-white transition-colors shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-800 font-almarai m-0">
                          {item.title}
                        </h4>
                      </div>
                      <p
                        dir={promptLang === 'en' ? 'ltr' : 'rtl'}
                        className={`text-[11px] text-slate-500 leading-relaxed m-0 line-clamp-2 ${
                          promptLang === 'en' ? 'text-left' : 'text-right'
                        }`}
                      >
                        {item.prompt}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Chat Container */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col h-[560px]">
              {/* Conversation Stream */}
              <div
                ref={streamRef}
                className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50"
              >
                {loadingChatMessages && (
                  <div className="py-12 flex items-center justify-center gap-2 text-xs text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin text-[#0f6848]" />
                    <span>جاري تحميل رسائل المحادثة ومراجعها...</span>
                  </div>
                )}

                {!loadingChatMessages &&
                  messages.map((msg) => {
                    const isUser = msg.sender === 'user';
                    const isEnMsg = msg.language === 'en';
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
                              : msg.isEmergency
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-[#0f6848]'
                          }`}
                        >
                          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
                        </div>

                        <div className="max-w-[85%] space-y-1.5">
                          {!isUser && msg.retrievalMode && (
                            <div className={`flex ${isEnMsg ? 'justify-start' : 'justify-end'}`}>
                              <RetrievalModeBadge mode={msg.retrievalMode} lang={msg.language} />
                            </div>
                          )}

                          <div
                            data-no-i18n="true"
                            dir={isEnMsg ? 'ltr' : 'rtl'}
                            className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                              isEnMsg ? 'text-left' : 'text-right'
                            } ${
                              isUser
                                ? 'bg-gradient-to-br from-[#0f6848] to-[#14875e] text-white rounded-tr-none'
                                : msg.isError
                                ? 'bg-rose-50 text-rose-700 border border-rose-200 rounded-tl-none'
                                : msg.isEmergency
                                ? 'bg-rose-50/90 text-rose-950 border-2 border-rose-300 rounded-tl-none'
                                : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                            }`}
                          >
                            {isUser ? msg.text : renderFormattedText(msg.text)}

                            {msg.isError && msg.retryQuery && (
                              <div className="mt-3 pt-2 border-t border-rose-200/70 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleSend(null, msg.retryQuery)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  <span>{isEnMsg ? 'Retry' : 'إعادة المحاولة'}</span>
                                </button>
                              </div>
                            )}
                          </div>

                          {!isUser && !msg.isError && msg.suggestions && (
                            <AiSuggestionCards suggestions={msg.suggestions} />
                          )}

                          {!isUser && !msg.isError && (
                            <AiMessageExtras
                              msg={msg}
                              onFeedbackSaved={(id, fb) =>
                                setMessages((prev) =>
                                  prev.map((m) => (m.id === id ? { ...m, userFeedback: fb } : m))
                                )
                              }
                            />
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
                                    <span className="text-emerald-600 font-bold">
                                      {isEnMsg ? 'Copied' : 'تم النسخ'}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>{isEnMsg ? 'Copy' : 'نسخ'}</span>
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
                      <span>جاري تصنيف السؤال ومراجعة المصادر المعتمدة...</span>
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
                  placeholder="اسأل بالعربية أو الإنجليزية عن دواء، عرض صحي، أو سجلاتك الطبية..."
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

            {/* Expert Assistance Quick Directory Access + Medical Disclaimer */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-stretch">
              <div className="sm:col-span-7 p-3.5 rounded-2xl bg-amber-50/85 border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  <strong>تنبيه طبي:</strong> الصيدلي الذكي مساعد معلوماتي للتثقيف الصحي ولا يقدم تشخيصاً مستقلاً أو وصفة علاجية بديلة عن الطبيب أو الصيدلي.
                </span>
              </div>

              <div className="sm:col-span-5 p-3.5 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between gap-2 shadow-sm">
                <span className="text-xs font-extrabold text-slate-700">مساعدة متخصصة:</span>
                <div className="flex items-center gap-2">
                  <Link
                    to="/doctors"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0f6848] hover:bg-[#0b5037] text-white text-xs font-bold transition-colors"
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>ابحث عن طبيب</span>
                  </Link>
                  <Link
                    to="/medicines"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#0f6848] border border-emerald-200 text-xs font-bold transition-colors"
                  >
                    <Pill className="w-3.5 h-3.5" />
                    <span>الصيدلية</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secure Conversation Deletion Confirmation Modal */}
      {deleteTargetChat && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scaleIn">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 font-almarai mb-2">
              تأكيد حذف المحادثة
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              هل أنت متأكد من حذف محادثة <strong>«{deleteTargetChat.title}»</strong>؟ سيتم إزالة سجل رسائل هذه المحادثة نهائياً من حسابك، مع التأكيد أن هذا الإجراء <strong>لن يحذف أبداً</strong> أي روشتات طبية أو مواعيد أو سجلات صحية أصلية في حسابك.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={deletingChat}
                onClick={() => setDeleteTargetChat(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={deletingChat}
                onClick={handleConfirmDeleteChat}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                {deletingChat && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>تأكيد الحذف الآمن</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
