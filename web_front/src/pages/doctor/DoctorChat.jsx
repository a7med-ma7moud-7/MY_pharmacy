import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { doctorPortalService } from '../../services/api';
import {
    MessageSquare,
    Send,
    Paperclip,
    Loader2,
    AlertCircle,
    CheckCheck,
    FolderHeart,
} from 'lucide-react';

export default function DoctorChat() {
    const [searchParams, setSearchParams] = useSearchParams();
    const targetPatientUserId = searchParams.get('patient_user_id');
    const targetConvId = searchParams.get('conversation_id');

    const [conversations, setConversations] = useState([]);
    const [selectedConvId, setSelectedConvId] = useState(
        targetConvId ? Number(targetConvId) : null
    );
    const [activeConv, setActiveConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingList, setLoadingList] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [body, setBody] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    const endRef = useRef(null);

    const loadConversations = useCallback(async (silent = false) => {
        if (!silent) setLoadingList(true);
        try {
            const res = await doctorPortalService.getChats();
            if (res.data?.success) {
                setConversations(res.data.data || []);
            }
        } catch (err) {
            if (!silent) setErrorMsg(err.response?.data?.message || 'تعذر تحميل المحادثات.');
        } finally {
            if (!silent) setLoadingList(false);
        }
    }, []);

    const loadMessages = useCallback(async (convId, silent = false) => {
        if (!convId) return;
        if (!silent) setLoadingMessages(true);
        try {
            const res = await doctorPortalService.getChat(convId);
            if (res.data?.success) {
                setActiveConv(res.data.data.conversation);
                setMessages(res.data.data.messages || []);
            }
        } catch (err) {
            if (!silent) setErrorMsg(err.response?.data?.message || 'تعذر فتح المحادثة.');
        } finally {
            if (!silent) setLoadingMessages(false);
        }
    }, []);

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    useEffect(() => {
        if (!targetPatientUserId) return;
        let cancelled = false;
        doctorPortalService
            .startChatWithPatient(Number(targetPatientUserId))
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
                    setErrorMsg(
                        err.response?.data?.message || 'تعذر بدء المحادثة مع هذا المريض.'
                    );
                }
            });
        return () => {
            cancelled = true;
        };
    }, [targetPatientUserId, loadConversations, setSearchParams]);

    useEffect(() => {
        if (selectedConvId) {
            loadMessages(selectedConvId);
        }
    }, [selectedConvId, loadMessages]);

    useEffect(() => {
        if (!selectedConvId) return;
        const timer = setInterval(() => {
            loadMessages(selectedConvId, true);
            loadConversations(true);
        }, 4000);
        return () => clearInterval(timer);
    }, [selectedConvId, loadMessages, loadConversations]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!selectedConvId || sending || (!body.trim() && !attachment)) return;

        setSending(true);
        setErrorMsg('');
        try {
            let payload;
            if (attachment) {
                payload = new FormData();
                if (body.trim()) payload.append('body', body.trim());
                payload.append('attachment', attachment);
            } else {
                payload = { body: body.trim() };
            }

            await doctorPortalService.sendChatMessage(selectedConvId, payload);
            setBody('');
            setAttachment(null);
            await loadMessages(selectedConvId, true);
            await loadConversations(true);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'تعذر إرسال الرسالة.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-4">
            {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Conversations Sidebar */}
                <div className="lg:col-span-4 bg-white/95 rounded-3xl border border-white shadow-xs overflow-hidden flex flex-col h-[600px]">
                    <div className="p-4 border-b border-slate-100">
                        <h2 className="text-sm font-extrabold font-almarai text-slate-900 m-0">
                            محادثات مرضاي ({conversations.length})
                        </h2>
                        <p className="text-[11px] text-slate-400 mt-0.5 m-0">
                            متاحة للمرضى الذين لديهم حجز مفعل معك فقط
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                        {loadingList ? (
                            <div className="py-12 flex justify-center">
                                <Loader2 className="w-6 h-6 text-[#0f6848] animate-spin" />
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="p-8 text-center">
                                <MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                                <p className="text-xs font-bold text-slate-500 mb-1">
                                    لا توجد محادثات بعد
                                </p>
                                <p className="text-[11px] text-slate-400 m-0">
                                    يمكنك بدء محادثة مع أي مريض مسجل من صفحة «مرضاي».
                                </p>
                            </div>
                        ) : (
                            conversations.map((conv) => (
                                <button
                                    key={conv.id}
                                    type="button"
                                    onClick={() => setSelectedConvId(conv.id)}
                                    className={`w-full text-right p-4 transition-colors flex items-start gap-3 cursor-pointer ${
                                        selectedConvId === conv.id
                                            ? 'bg-emerald-50/80'
                                            : 'hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#0f6848] font-black text-sm flex items-center justify-center shrink-0">
                                        {(conv.patient_name || 'م').charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-extrabold text-xs text-slate-900 truncate">
                                                {conv.patient_name}
                                            </span>
                                            {conv.unread_count > 0 && (
                                                <span className="bg-[#0f6848] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                                    {conv.unread_count}
                                                </span>
                                            )}
                                        </div>
                                        {conv.patient_phone && (
                                            <span className="text-[10px] text-slate-400 block" dir="ltr">
                                                {conv.patient_phone}
                                            </span>
                                        )}
                                        <p className="text-[11px] text-slate-500 truncate mt-1 m-0">
                                            {conv.last_message_preview || 'محادثة جديدة'}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Stream */}
                <div className="lg:col-span-8 bg-white/95 rounded-3xl border border-white shadow-xs overflow-hidden flex flex-col h-[600px]">
                    {!selectedConvId ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                            <MessageSquare className="w-14 h-14 text-slate-200 mb-3" />
                            <h3 className="text-base font-extrabold font-almarai text-slate-800 mb-1">
                                اختر مريضاً من القائمة لمتابعة المحادثة
                            </h3>
                            <p className="text-xs text-slate-400 max-w-sm m-0">
                                جميع الرسائل مشفرة ومعزولة تماماً بينك وبين المريض صاحب الحجز.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-extrabold text-slate-900 m-0">
                                        {activeConv?.patient?.name || 'مريض'}
                                    </h3>
                                    <span className="text-[11px] text-slate-500" dir="ltr">
                                        {activeConv?.patient?.phone || ''}
                                    </span>
                                </div>
                                {activeConv?.patient_user_id && (
                                    <Link
                                        to={`/doctor/records/u_${activeConv.patient_user_id}`}
                                        className="px-3 py-1.5 rounded-xl bg-emerald-50 text-[#0f6848] text-xs font-bold inline-flex items-center gap-1.5"
                                    >
                                        <FolderHeart className="w-3.5 h-3.5" />
                                        <span>السجل الطبي للمريض</span>
                                    </Link>
                                )}
                            </div>

                            <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-slate-50/40">
                                {loadingMessages ? (
                                    <div className="py-12 flex justify-center">
                                        <Loader2 className="w-6 h-6 text-[#0f6848] animate-spin" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="text-center py-16 text-xs text-slate-400">
                                        ابدأ المحادثة الطبية بإرسال إرشاداتك أو استفسارك للمريض.
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        const mine = msg.sender_role === 'doctor';
                                        return (
                                            <div
                                                key={msg.id}
                                                className={`flex ${mine ? 'justify-start' : 'justify-end'}`}
                                            >
                                                <div
                                                    className={`max-w-[78%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                                                        mine
                                                            ? 'bg-[#0f6848] text-white rounded-tr-none'
                                                            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
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
                                <div ref={endRef} />
                            </div>

                            <form onSubmit={handleSend} className="p-3.5 bg-white border-t border-slate-100 space-y-2">
                                {attachment && (
                                    <div className="px-3 py-1.5 bg-emerald-50 text-[#0f6848] rounded-xl text-xs font-bold flex items-center justify-between">
                                        <span className="truncate">📎 {attachment.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => setAttachment(null)}
                                            className="text-rose-600 font-extrabold cursor-pointer"
                                        >
                                            إزالة
                                        </button>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <label
                                        title="إرفاق ملف"
                                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
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
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                        placeholder="اكتب ردك الطبي للمريض..."
                                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={sending || (!body.trim() && !attachment)}
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
        </div>
    );
}
