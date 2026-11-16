import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { patientPortalService } from '../services/api';
import {
    MessageSquare,
    Send,
    Paperclip,
    Stethoscope,
    Calendar,
    FileText,
    Loader2,
    AlertCircle,
    CheckCheck,
    ExternalLink,
} from 'lucide-react';

export default function PatientChats() {
    const { user, loading: authLoading, isDoctor } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const targetDoctorId = searchParams.get('doctor_id');

    const [conversations, setConversations] = useState([]);
    const [eligibleDoctors, setEligibleDoctors] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [selectedConvId, setSelectedConvId] = useState(null);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingList, setLoadingList] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [errorBanner, setErrorBanner] = useState('');
    const [activeTab, setActiveTab] = useState('chats');

    const streamEndRef = useRef(null);

    const loadConversations = useCallback(async (silent = false) => {
        if (!silent) setLoadingList(true);
        try {
            const [chatRes, overviewRes] = await Promise.all([
                patientPortalService.getChats(),
                patientPortalService.getOverview(),
            ]);
            if (chatRes.data?.success) {
                setConversations(chatRes.data.data || []);
                setEligibleDoctors(chatRes.data.eligible_doctors || []);
            }
            if (overviewRes.data?.success) {
                setPrescriptions(overviewRes.data.data?.prescriptions || []);
            }
        } catch (err) {
            if (!silent) {
                setErrorBanner(
                    err.response?.data?.message || 'تعذر تحميل المحادثات الطبية حالياً.'
                );
            }
        } finally {
            if (!silent) setLoadingList(false);
        }
    }, []);

    const loadConversationMessages = useCallback(async (convId, silent = false) => {
        if (!convId) return;
        if (!silent) setLoadingMessages(true);
        try {
            const res = await patientPortalService.getChat(convId);
            if (res.data?.success) {
                setActiveConversation(res.data.data.conversation);
                setMessages(res.data.data.messages || []);
            }
        } catch (err) {
            if (!silent) {
                setErrorBanner(err.response?.data?.message || 'تعذر فتح المحادثة.');
            }
        } finally {
            if (!silent) setLoadingMessages(false);
        }
    }, []);

    useEffect(() => {
        if (!user || isDoctor) return;
        loadConversations();
    }, [user, isDoctor, loadConversations]);

    // Auto-start conversation if ?doctor_id=... is passed
    useEffect(() => {
        if (!user || isDoctor || !targetDoctorId) return;
        let cancelled = false;
        patientPortalService
            .startChatWithDoctor(Number(targetDoctorId))
            .then((res) => {
                if (cancelled) return;
                const conv = res.data?.data;
                if (conv?.id) {
                    setSelectedConvId(conv.id);
                    loadConversations(true);
                    setSearchParams({}, { replace: true });
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setErrorBanner(
                        err.response?.data?.message ||
                            'المحادثة متاحة فقط للمرضى الذين حجزوا موعداً مع هذا الطبيب.'
                    );
                }
            });
        return () => {
            cancelled = true;
        };
    }, [user, isDoctor, targetDoctorId, loadConversations, setSearchParams]);

    useEffect(() => {
        if (selectedConvId) {
            loadConversationMessages(selectedConvId);
        }
    }, [selectedConvId, loadConversationMessages]);

    // Near-real-time polling when conversation is open
    useEffect(() => {
        if (!selectedConvId || activeTab !== 'chats') return;
        const timer = setInterval(() => {
            loadConversationMessages(selectedConvId, true);
            loadConversations(true);
        }, 4000);
        return () => clearInterval(timer);
    }, [selectedConvId, activeTab, loadConversationMessages, loadConversations]);

    useEffect(() => {
        streamEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    if (authLoading) {
        return (
            <div className="py-24 flex justify-center">
                <Loader2 className="w-8 h-8 text-[#0f6848] animate-spin" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: { pathname: '/my-chats' } }} replace />;
    }

    if (isDoctor) {
        return <Navigate to="/doctor/chat" replace />;
    }

    const handleStartWithDoctor = async (doctorId) => {
        setErrorBanner('');
        try {
            const res = await patientPortalService.startChatWithDoctor(doctorId);
            if (res.data?.data?.id) {
                await loadConversations(true);
                setSelectedConvId(res.data.data.id);
            }
        } catch (err) {
            setErrorBanner(err.response?.data?.message || 'تعذر بدء المحادثة.');
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!selectedConvId || sending || (!messageText.trim() && !attachment)) return;

        setSending(true);
        setErrorBanner('');
        try {
            let payload;
            if (attachment) {
                payload = new FormData();
                if (messageText.trim()) payload.append('body', messageText.trim());
                payload.append('attachment', attachment);
            } else {
                payload = { body: messageText.trim() };
            }

            await patientPortalService.sendChatMessage(selectedConvId, payload);
            setMessageText('');
            setAttachment(null);
            await loadConversationMessages(selectedConvId, true);
            await loadConversations(true);
        } catch (err) {
            setErrorBanner(err.response?.data?.message || 'تعذر إرسال الرسالة.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="pb-16 bg-transparent min-h-screen">
            <div className="hero-mesh text-white py-10 mb-8 relative overflow-hidden">
                <div className="hero-grid-pattern absolute inset-0 pointer-events-none"></div>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold font-almarai text-white m-0">
                            بوابة المريض — المحادثات والروشتات الطبية
                        </h1>
                        <p className="text-emerald-100/90 text-xs sm:text-sm mt-1 m-0">
                            تواصل مباشرة مع الأطباء الذين حجزت معهم واطّلع على الروشتات الصادرة لك
                        </p>
                    </div>

                    <div className="flex items-center gap-2 bg-white/10 p-1 rounded-2xl border border-white/20 self-start">
                        <button
                            type="button"
                            onClick={() => setActiveTab('chats')}
                            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                                activeTab === 'chats'
                                    ? 'bg-white text-[#0f6848] shadow-sm'
                                    : 'text-white/90 hover:bg-white/10'
                            }`}
                        >
                            <MessageSquare className="w-4 h-4" />
                            <span>محادثات الأطباء ({conversations.length})</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('prescriptions')}
                            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                                activeTab === 'prescriptions'
                                    ? 'bg-white text-[#0f6848] shadow-sm'
                                    : 'text-white/90 hover:bg-white/10'
                            }`}
                        >
                            <FileText className="w-4 h-4" />
                            <span>روشتاتي ({prescriptions.length})</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {errorBanner && (
                    <div className="mb-5 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorBanner}</span>
                    </div>
                )}

                {activeTab === 'prescriptions' ? (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                        <h2 className="text-lg font-extrabold font-almarai text-slate-900 mb-4">
                            الروشتات الطبية الصادرة لك
                        </h2>
                        {prescriptions.length === 0 ? (
                            <div className="text-center py-16">
                                <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                <p className="text-sm font-bold text-slate-500 m-0">
                                    لا توجد روشتات طبية مسجلة لحسابك حتى الآن.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {prescriptions.map((rx) => (
                                    <div
                                        key={rx.id}
                                        className="p-5 rounded-2xl border border-slate-100 bg-slate-50/70 space-y-3"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div>
                                                <span className="text-xs font-black text-[#0f6848] bg-emerald-50 px-2.5 py-1 rounded-lg">
                                                    {rx.prescription_number}
                                                </span>
                                                <h3 className="text-base font-extrabold text-slate-900 mt-1.5 m-0">
                                                    د. {rx.doctor?.name} — {rx.doctor?.specialty}
                                                </h3>
                                            </div>
                                            <span className="text-xs text-slate-500 font-semibold">
                                                التاريخ: {rx.prescribed_date}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-700 m-0">
                                            <strong>التشخيص:</strong> {rx.diagnosis}
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                            {(rx.items || []).map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="p-3 rounded-xl bg-white border border-slate-200/70 text-xs"
                                                >
                                                    <div className="font-extrabold text-slate-900">
                                                        {item.medicine_name}
                                                    </div>
                                                    <div className="text-slate-600 mt-0.5">
                                                        الجرعة: {item.dosage}
                                                        {item.duration ? ` • المدة: ${item.duration}` : ''}
                                                    </div>
                                                    {item.instructions && (
                                                        <div className="text-slate-400 mt-0.5">
                                                            {item.instructions}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Conversations Sidebar */}
                        <div className="lg:col-span-4 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[580px]">
                            <div className="p-4 border-b border-slate-100">
                                <h2 className="text-sm font-extrabold font-almarai text-slate-900 m-0">
                                    قائمة محادثاتي
                                </h2>
                                <p className="text-[11px] text-slate-400 mt-0.5 m-0">
                                    الأطباء الذين لديك حجز مفعل معهم
                                </p>
                            </div>

                            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                                {loadingList ? (
                                    <div className="p-8 flex justify-center">
                                        <Loader2 className="w-6 h-6 text-[#0f6848] animate-spin" />
                                    </div>
                                ) : conversations.length === 0 && eligibleDoctors.length === 0 ? (
                                    <div className="p-6 text-center">
                                        <Stethoscope className="w-10 h-10 text-slate-200 mx-auto mb-2.5" />
                                        <p className="text-xs font-bold text-slate-600 mb-1">
                                            لا توجد محادثات متاحة بعد
                                        </p>
                                        <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                                            احجز موعداً مع طبيبك المختص لتفعيل المحادثة المباشرة معه.
                                        </p>
                                        <Link
                                            to="/doctors"
                                            className="btn-main px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                                        >
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>تصفح الأطباء واحجز موعداً</span>
                                        </Link>
                                    </div>
                                ) : (
                                    <>
                                        {conversations.map((conv) => {
                                            const active = selectedConvId === conv.id;
                                            return (
                                                <button
                                                    key={conv.id}
                                                    type="button"
                                                    onClick={() => setSelectedConvId(conv.id)}
                                                    className={`w-full text-right p-4 transition-colors flex items-start gap-3 cursor-pointer ${
                                                        active ? 'bg-emerald-50/80' : 'hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#0f6848] font-black text-sm flex items-center justify-center shrink-0">
                                                        {(conv.doctor_name || 'د').charAt(0)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="font-extrabold text-xs text-slate-900 truncate">
                                                                د. {conv.doctor_name}
                                                            </span>
                                                            {conv.unread_count > 0 && (
                                                                <span className="bg-[#0f6848] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                                                    {conv.unread_count}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-[11px] text-emerald-700 font-semibold block">
                                                            {conv.doctor_specialty}
                                                        </span>
                                                        <p className="text-[11px] text-slate-400 truncate mt-1 m-0">
                                                            {conv.last_message_preview || 'ابدأ المحادثة الآن...'}
                                                        </p>
                                                    </div>
                                                </button>
                                            );
                                        })}

                                        {/* Eligible doctors without a conversation started yet */}
                                        {eligibleDoctors
                                            .filter(
                                                (doc) =>
                                                    !conversations.some(
                                                        (c) => Number(c.doctor_id) === Number(doc.id)
                                                    )
                                            )
                                            .map((doc) => (
                                                <div
                                                    key={`elig-${doc.id}`}
                                                    className="p-4 bg-slate-50/50 flex items-center justify-between gap-2"
                                                >
                                                    <div>
                                                        <div className="text-xs font-extrabold text-slate-800">
                                                            د. {doc.name}
                                                        </div>
                                                        <div className="text-[11px] text-slate-500">
                                                            {doc.specialty}
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStartWithDoctor(doc.id)}
                                                        className="px-3 py-1.5 rounded-xl bg-[#0f6848] text-white text-[11px] font-bold cursor-pointer hover:bg-[#0b5239]"
                                                    >
                                                        بدء محادثة
                                                    </button>
                                                </div>
                                            ))}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Chat Window */}
                        <div className="lg:col-span-8 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[580px]">
                            {!selectedConvId ? (
                                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                                    <MessageSquare className="w-14 h-14 text-slate-200 mb-3" />
                                    <h3 className="text-base font-extrabold font-almarai text-slate-800 mb-1">
                                        اختر محادثة للبدء
                                    </h3>
                                    <p className="text-xs text-slate-400 max-w-sm m-0">
                                        اختر أحد أطبائك من القائمة الجانبية لإرسال استفساراتك ومتابعة حالتك الصحية بأمان.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Conversation Header */}
                                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-[#0f6848] text-white font-black text-sm flex items-center justify-center">
                                                {(activeConversation?.doctor?.name || 'د').charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-extrabold text-slate-900 m-0">
                                                    د. {activeConversation?.doctor?.name || '...'}
                                                </h3>
                                                <span className="text-[11px] text-emerald-700 font-semibold">
                                                    {activeConversation?.doctor?.specialty}
                                                </span>
                                            </div>
                                        </div>
                                        {activeConversation?.doctor_id && (
                                            <Link
                                                to={`/doctors/${activeConversation.doctor_id}`}
                                                className="text-xs font-bold text-[#0f6848] hover:underline flex items-center gap-1"
                                            >
                                                <span>ملف الطبيب</span>
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </Link>
                                        )}
                                    </div>

                                    {/* Messages Stream */}
                                    <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-slate-50/40">
                                        {loadingMessages ? (
                                            <div className="py-12 flex justify-center">
                                                <Loader2 className="w-6 h-6 text-[#0f6848] animate-spin" />
                                            </div>
                                        ) : messages.length === 0 ? (
                                            <div className="text-center py-14 text-xs text-slate-400">
                                                لا توجد رسائل سابقة بعد. اكتب رسالتك الأولى للطبيب بالأسفل.
                                            </div>
                                        ) : (
                                            messages.map((msg) => {
                                                const mine = msg.sender_role === 'user';
                                                return (
                                                    <div
                                                        key={msg.id}
                                                        className={`flex ${mine ? 'justify-start' : 'justify-end'}`}
                                                    >
                                                        <div
                                                            className={`max-w-[78%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                                                                mine
                                                                    ? 'bg-[#0f6848] text-white rounded-tr-none'
                                                                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                                                            }`}
                                                        >
                                                            {msg.body && (
                                                                <p className="whitespace-pre-line m-0">{msg.body}</p>
                                                            )}
                                                            {msg.attachment_url && (
                                                                <a
                                                                    href={msg.attachment_url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className={`mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold underline ${
                                                                        mine ? 'text-emerald-100' : 'text-[#0f6848]'
                                                                    }`}
                                                                >
                                                                    <Paperclip className="w-3.5 h-3.5" />
                                                                    <span>{msg.attachment_name || 'عرض المرفق'}</span>
                                                                </a>
                                                            )}
                                                            <div
                                                                className={`mt-1.5 flex items-center gap-1.5 text-[10px] ${
                                                                    mine ? 'text-emerald-200/90' : 'text-slate-400'
                                                                }`}
                                                            >
                                                                <span>
                                                                    {msg.created_at
                                                                        ? new Date(msg.created_at).toLocaleTimeString(
                                                                              'ar-EG',
                                                                              {
                                                                                  hour: '2-digit',
                                                                                  minute: '2-digit',
                                                                              }
                                                                          )
                                                                        : ''}
                                                                </span>
                                                                {mine && msg.is_read && (
                                                                    <CheckCheck className="w-3.5 h-3.5" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                        <div ref={streamEndRef} />
                                    </div>

                                    {/* Composer */}
                                    <form
                                        onSubmit={handleSend}
                                        className="p-3.5 bg-white border-t border-slate-100 space-y-2"
                                    >
                                        {attachment && (
                                            <div className="px-3 py-1.5 bg-emerald-50 text-[#0f6848] rounded-xl text-xs font-bold flex items-center justify-between">
                                                <span className="truncate">📎 {attachment.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setAttachment(null)}
                                                    className="text-rose-600 text-xs font-extrabold cursor-pointer"
                                                >
                                                    إزالة
                                                </button>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <label
                                                title="إرفاق صورة أو تقرير PDF"
                                                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer transition-colors"
                                            >
                                                <Paperclip className="w-4 h-4" />
                                                <input
                                                    type="file"
                                                    accept="image/*,.pdf"
                                                    className="hidden"
                                                    onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                                                />
                                            </label>
                                            <input
                                                type="text"
                                                value={messageText}
                                                onChange={(e) => setMessageText(e.target.value)}
                                                placeholder="اكتب رسالتك الطبية للطبيب..."
                                                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                            />
                                            <button
                                                type="submit"
                                                disabled={sending || (!messageText.trim() && !attachment)}
                                                className="btn-main px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                                            >
                                                {sending ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <span>إرسال</span>
                                                        <Send className="w-3.5 h-3.5 -scale-x-100" />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
